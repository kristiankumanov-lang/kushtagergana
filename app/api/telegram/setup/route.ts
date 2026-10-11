import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isTelegramConfigured, registerWebhook, telegramApi, webhookUrl } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Manual fallback: (re)points the Telegram bot's webhook at this site.
 * Normally not needed — ensureWebhook() does it automatically on first use.
 * Open /api/telegram/setup while logged in to /admin.
 */
export async function GET() {
  const rawToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = rawToken ? await getSessionUser(rawToken) : null;
  if (!user) return NextResponse.json({ ok: false, error: "Влезте в /admin първо." }, { status: 401 });
  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN не е зададен във Vercel." }, { status: 503 });
  }

  const url = webhookUrl();

  try {
    await registerWebhook();
    const me = await telegramApi<{ username: string }>("getMe", {});
    return NextResponse.json({ ok: true, bot: `@${me.username}`, webhook: url });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Грешка" }, { status: 502 });
  }
}
