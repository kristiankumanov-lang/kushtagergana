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

export async function addItemAction(tabId: string, menuItemId: string, quantity: number): Promise<void> {
  const session = await requireSessionUser();
  requiredId(tabId, "tabId");
  requiredId(menuItemId, "menuItemId");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Невалидно количество.");

  const sql = getSql();
  await sql.begin(async (tx) => {
    const [tab] = await tx<{ status: "open" | "paid" }[]>`
      select status from guesthouse.tabs where id = ${tabId} for update
    `;
    if (!tab) throw new Error("Сметката не е намерена.");
    if (tab.status !== "open") throw new Error("Тази сметка вече е затворена.");

    const [item] = await tx<{ id: string; name: string; price: string }[]>`
      select id, name, price::text as price
      from guesthouse.menu_items
      where id = ${menuItemId} and available = true
    `;
    if (!item) throw new Error("Артикулът вече не е наличен.");

    await tx`
      insert into guesthouse.tab_items
        (tab_id, menu_item_id, item_name, item_price, quantity, added_by, status)
      values
        (${tabId}, ${item.id}, ${item.name}, ${item.price}, ${quantity}, ${session.id}, 'added')
    `;
  });
  revalidatePath(`/admin/orders/${tabId}`);
}

export async function cancelTabItemAction(tabItemId: string): Promise<void> {
  const session = await requireSessionUser();
  requiredId(tabItemId, "tabItemId");
  const sql = getSql();
  const tabId = await sql.begin(async (tx) => {
    const [item] = await tx<{ tab_id: string; status: string; tab_status: string }[]>`
      select tab_items.tab_id, tab_items.status, tabs.status as tab_status
      from guesthouse.tab_items as tab_items
      join guesthouse.tabs as tabs on tabs.id = tab_items.tab_id
      where tab_items.id = ${tabItemId}
      for update
    `;
    if (!item) throw new Error("Редът не е намерен.");
    if (item.tab_status !== "open") throw new Error("Тази сметка вече е затворена.");
    if (item.status !== "added" && item.status !== "sent_to_kitchen") {
      throw new Error("Този ред вече не може да бъде отменен.");
    }
    await tx`
      update guesthouse.tab_items
      set status = 'cancelled', cancelled_by = ${session.id}, cancelled_at = now()
      where id = ${tabItemId}
    `;
    return item.tab_id;
  });
  revalidatePath(`/admin/orders/${tabId}`);
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
