"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_HOURS,
} from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    redirect("/admin/login?error=credentials");
  }

  const user = await authenticateUser(username.trim(), password);
  if (!user) redirect("/admin/login?error=credentials");

  const rawToken = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  });
  redirect("/admin");
}
