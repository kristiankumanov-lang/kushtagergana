"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getSql } from "@/lib/db/client";

async function requireSessionUser() {
  const rawToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = rawToken ? await getSessionUser(rawToken) : null;
  if (!user) redirect("/admin/login");
  return user;
}

function requiredText(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid ${key}`);
  return value.trim();
}

// Room tabs are no longer opened here: entering a room only shows the menu,
// and the tab is created by the first addItemAction (see [tabId]/actions.ts).
// That way walking into a room and leaving without ordering leaves nothing
// behind instead of an empty 0.00 € tab.

export async function createGuestTabAction(formData: FormData): Promise<void> {
  const session = await requireSessionUser();
  const label = requiredText(formData, "label");
  const sql = getSql();
  const [tab] = await sql<{ id: string }[]>`
    insert into guesthouse.tabs (room_id, label, opened_by)
    values (null, ${label}, ${session.id})
    returning id
  `;
  if (!tab) throw new Error("Неуспешно отваряне на сметката.");
  redirect(`/admin/orders/${tab.id}`);
}
