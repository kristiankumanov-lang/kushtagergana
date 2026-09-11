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

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export async function openRoomTabAction(formData: FormData): Promise<void> {
  const session = await requireSessionUser();
  const roomIdText = requiredText(formData, "roomId");
  const roomId = Number(roomIdText);
  if (!Number.isInteger(roomId)) throw new Error("Invalid roomId");

  const sql = getSql();
  let tabId: string | undefined;
  try {
    const [tab] = await sql<{ id: string }[]>`
      insert into guesthouse.tabs (room_id, opened_by)
      values (${roomId}, ${session.id})
      returning id
    `;
    tabId = tab?.id;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const [existingTab] = await sql<{ id: string }[]>`
      select id from guesthouse.tabs
      where room_id = ${roomId} and status = 'open'
      limit 1
    `;
    tabId = existingTab?.id;
  }

  if (!tabId) throw new Error("Неуспешно отваряне на сметката.");
  redirect(`/admin/orders/${tabId}`);
}

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
