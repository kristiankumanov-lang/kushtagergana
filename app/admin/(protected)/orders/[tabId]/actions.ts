"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getSql } from "@/lib/db/client";

async function requireSessionUser() {
  const rawToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = rawToken ? await getSessionUser(rawToken) : null;
  if (!user) redirect("/admin/login");
  return user;
}

function requiredId(value: string, name: string) {
  if (!value.trim()) throw new Error(`Invalid ${name}`);
  return value;
}

/**
 * Adds an item to a tab and returns the tab id.
 *
 * - tabId set: adds to that open tab (as before).
 * - tabId null + roomId: the room has no tab yet — the open tab is created
 *   here, in the same transaction as the first item. Opening a room and
 *   leaving without ordering therefore never creates an empty 0.00 € tab.
 *   If the other sister opened the room's tab in the meantime, the item goes
 *   into that tab (one open tab per room is enforced by tabs_one_open_per_room).
 *
 * Bar items are served by the waitress herself and never go through the
 * kitchen, so they are stored as 'ready' straight away. Only kitchen items
 * start as 'added' and wait for "Изпрати поръчка за кухнята".
 */
export async function addItemAction(
  tabId: string | null,
  roomId: number | null,
  menuItemId: string,
  quantity: number,
): Promise<string> {
  const session = await requireSessionUser();
  requiredId(menuItemId, "menuItemId");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Невалидно количество.");
  if (tabId === null && (roomId === null || !Number.isInteger(roomId))) throw new Error("Invalid roomId");

  const resultTabId = await getSql().begin(async (tx) => {
    const [item] = await tx<{ id: string; name: string; price: string; category: "bar" | "kitchen" }[]>`
      select id, name, price::text as price, category
      from guesthouse.menu_items
      where id = ${menuItemId} and available = true
    `;
    if (!item) throw new Error("Артикулът вече не е наличен.");

    let targetTabId: string;
    if (tabId !== null) {
      requiredId(tabId, "tabId");
      const [tab] = await tx<{ status: "open" | "paid" }[]>`
        select status from guesthouse.tabs where id = ${tabId} for update
      `;
      if (!tab) throw new Error("Сметката не е намерена.");
      if (tab.status !== "open") throw new Error("Тази сметка вече е затворена.");
      targetTabId = tabId;
    } else {
      const [room] = await tx<{ id: number }[]>`
        select id from guesthouse.rooms where id = ${roomId} and active = true
      `;
      if (!room) throw new Error("Стаята не е намерена.");
      await tx`
        insert into guesthouse.tabs (room_id, opened_by)
        values (${roomId}, ${session.id})
        on conflict (room_id) where status = 'open' do nothing
      `;
      const [tab] = await tx<{ id: string }[]>`
        select id from guesthouse.tabs
        where room_id = ${roomId} and status = 'open'
        for update
      `;
      if (!tab) throw new Error("Неуспешно отваряне на сметката.");
      targetTabId = tab.id;
    }

    const isBar = item.category === "bar";
    await tx`
      insert into guesthouse.tab_items
        (tab_id, menu_item_id, item_name, item_price, quantity, added_by, status, ready_at)
      values
        (${targetTabId}, ${item.id}, ${item.name}, ${item.price}, ${quantity}, ${session.id},
         ${isBar ? "ready" : "added"}, case when ${isBar}::boolean then now() end)
    `;
    return targetTabId;
  });

  revalidatePath(`/admin/orders/${resultTabId}`);
  revalidatePath("/admin/orders");
  return resultTabId;
}

/**
 * Cancels a line. If that leaves a ROOM tab with nothing but cancelled lines,
 * the tab is removed altogether (lines first — tab_items.tab_id has no
 * cascade), so the room goes back to "no tab" instead of showing an open
 * 0.00 € tab. Guest tabs ("маса 1", …) are opened explicitly by name and are
 * left as they are. Returns the room id when the tab was removed, so the
 * board can move back to the empty room screen.
 */
export async function cancelTabItemAction(tabItemId: string): Promise<{ removedRoomId: number | null }> {
  const session = await requireSessionUser();
  requiredId(tabItemId, "tabItemId");
  const sql = getSql();
  const { tabId, removedRoomId } = await sql.begin(async (tx) => {
    const [item] = await tx<{ tab_id: string; status: string; tab_status: string; category: string | null }[]>`
      select tab_items.tab_id, tab_items.status, tabs.status as tab_status, menu_items.category
      from guesthouse.tab_items as tab_items
      join guesthouse.tabs as tabs on tabs.id = tab_items.tab_id
      left join guesthouse.menu_items as menu_items on menu_items.id = tab_items.menu_item_id
      where tab_items.id = ${tabItemId}
      for update of tab_items
    `;
    if (!item) throw new Error("Редът не е намерен.");
    if (item.tab_status !== "open") throw new Error("Тази сметка вече е затворена.");
    const cancellable =
      item.status === "added" ||
      item.status === "sent_to_kitchen" ||
      (item.status === "ready" && item.category === "bar");
    if (!cancellable) throw new Error("Този ред вече не може да бъде отменен.");
    await tx`
      update guesthouse.tab_items
      set status = 'cancelled', cancelled_by = ${session.id}, cancelled_at = now()
      where id = ${tabItemId}
    `;

    const [tab] = await tx<{ room_id: number | null; live_items: number }[]>`
      select tabs.room_id,
        (select count(*)::int from guesthouse.tab_items
          where tab_id = tabs.id and status != 'cancelled') as live_items
      from guesthouse.tabs as tabs
      where tabs.id = ${item.tab_id}
      for update
    `;
    if (tab && tab.room_id !== null && tab.live_items === 0) {
      await tx`delete from guesthouse.tab_items where tab_id = ${item.tab_id}`;
      await tx`delete from guesthouse.tabs where id = ${item.tab_id} and status = 'open'`;
      return { tabId: item.tab_id, removedRoomId: tab.room_id };
    }
    return { tabId: item.tab_id, removedRoomId: null };
  });
  revalidatePath(`/admin/orders/${tabId}`);
  revalidatePath("/admin/orders");
  return { removedRoomId };
}

export async function sendToKitchenAction(tabId: string): Promise<void> {
  await requireSessionUser();
  requiredId(tabId, "tabId");
  const sql = getSql();
  await sql.begin(async (tx) => {
    const [tab] = await tx<{ status: string }[]>`
      select status from guesthouse.tabs where id = ${tabId} for update
    `;
    if (!tab) throw new Error("Сметката не е намерена.");
    if (tab.status !== "open") throw new Error("Тази сметка вече е затворена.");
    await tx`
      update guesthouse.tab_items
      set status = 'sent_to_kitchen'
      where tab_id = ${tabId} and status = 'added'
    `;
  });
  revalidatePath(`/admin/orders/${tabId}`);
}

export async function payTabAction(tabId: string): Promise<void> {
  const session = await requireSessionUser();
  requiredId(tabId, "tabId");
  const sql = getSql();
  await sql.begin(async (tx) => {
    const [tab] = await tx<{ status: string }[]>`
      select status from guesthouse.tabs where id = ${tabId} for update
    `;
    if (!tab) throw new Error("Сметката не е намерена.");
    if (tab.status !== "open") throw new Error("Тази сметка вече е затворена.");
    const [sum] = await tx<{ total: string }[]>`
      select coalesce(sum(item_price * quantity)
        filter (where status != 'cancelled'), 0)::text as total
      from guesthouse.tab_items
      where tab_id = ${tabId}
    `;
    await tx`
      update guesthouse.tabs
      set status = 'paid', closed_by = ${session.id}, closed_at = now(), closed_total = ${sum.total}
      where id = ${tabId}
    `;
  });
  revalidatePath(`/admin/orders/${tabId}`);
  revalidatePath("/admin/orders");
}
