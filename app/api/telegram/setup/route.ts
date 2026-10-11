import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { SITE_URL_FALLBACK } from "@/lib/site";
import { isTelegramConfigured, telegramApi, webhookSecret } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * One-time setup: points the Telegram bot's webhook at this site.
 * Open /api/telegram/setup while logged in to /admin (any of the two users).
 * Safe to open again — it just re-registers the same webhook.
 */
export async function GET() {
  const rawToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = rawToken ? await getSessionUser(rawToken) : null;
  if (!user) return NextResponse.json({ ok: false, error: "Влезте в /admin първо." }, { status: 401 });
  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN не е зададен във Vercel." }, { status: 503 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK).replace(/\/$/, "");
  const url = `${siteUrl}/api/telegram/webhook`;

  try {
    await telegramApi("setWebhook", {
      url,
      secret_token: webhookSecret(),
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    });
    const me = await telegramApi<{ username: string }>("getMe", {});
    return NextResponse.json({ ok: true, bot: `@${me.username}`, webhook: url });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Грешка" }, { status: 502 });
  }
}
