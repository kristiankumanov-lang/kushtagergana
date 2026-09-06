"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { destroySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) await destroySession(rawToken);
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: 0,
  });
  redirect("/admin/login");
}
