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

function requiredText(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid ${key}`);
  return value.trim();
}

function optionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function validPrice(formData: FormData): string {
  const price = requiredText(formData, "price");
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(price)) throw new Error("Invalid price");
  return price;
}

export async function toggleAvailabilityAction(formData: FormData): Promise<void> {
  await requireSessionUser();
  const id = requiredText(formData, "id");
  const available = requiredText(formData, "available") === "true";
  const sql = getSql();
  await sql`
    update guesthouse.menu_items
    set available = ${available}, updated_at = now()
    where id = ${id}
  `;
  revalidatePath("/admin/menucorrection");
}

export async function updateMenuItemAction(formData: FormData): Promise<void> {
  await requireSessionUser();
  const id = requiredText(formData, "id");
  const name = requiredText(formData, "name");
  const price = validPrice(formData);
  const sql = getSql();
  await sql`
    update guesthouse.menu_items
    set name = ${name}, price = ${price}, updated_at = now()
    where id = ${id}
  `;
  revalidatePath("/admin/menucorrection");
}

export async function addMenuItemAction(formData: FormData): Promise<void> {
  await requireSessionUser();
  const name = requiredText(formData, "name");
  const price = validPrice(formData);
  const category = requiredText(formData, "category");
  const subcategory = requiredText(formData, "subcategory");
  const description = optionalText(formData, "description");
  if (category !== "bar" && category !== "kitchen") throw new Error("Invalid category");

  const sql = getSql();
  await sql`
    insert into guesthouse.menu_items (name, description, price, category, subcategory)
    values (${name}, ${description}, ${price}, ${category}, ${subcategory})
  `;
  revalidatePath("/admin/menucorrection");
}
