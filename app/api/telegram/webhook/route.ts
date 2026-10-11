import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db/client";
import { handleTicketCallback, isTelegramConfigured, telegramApi, webhookSecret } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function secretMatches(received: string | null): boolean {
  if (!received) return false;
  const expected = Buffer.from(webhookSecret());
  const actual = Buffer.from(received);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

interface TelegramUpdate {
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { message_id: number; chat: { id: number } };
  };
  message?: { chat: { id: number }; text?: string };
}

/** Greets known people by role; tells anyone else their chat id. */
async function replyToStart(chatId: number) {
  const sql = getSql();
  const [user] = await sql<{ name: string; role: string }[]>`
    select coalesce(display_name, username) as name, role
    from guesthouse.users where telegram_chat_id = ${chatId}
  `;
  const [admin] = await sql<{ name: string }[]>`
    select name from guesthouse.telegram_admins where chat_id = ${chatId}
  `;
  let text: string;
  if (user?.role === "kitchen") {
    text = `Здравей, ${user.name}! Тук ще идват поръчките за кухнята. Натискай „👨‍🍳 Приготвя се“, когато започнеш, и „✅ Готово“, когато е готово.`;
  } else if (user) {
    text = `Здравей, ${user.name}! Тук ще идват известия, когато кухнята приеме поръчка и когато е готова.`;
  } else if (admin) {
    text = `Здравей, ${admin.name}! Ще получаваш копие от всичко, което ботът праща, и можеш да натискаш бутоните на кухнята за тест.`;
  } else {
    text = `Ботът на Къща Гергана. Вашият Telegram ID е ${chatId} — изпратете го на администратора, за да ви добави.`;
  }
  await telegramApi("sendMessage", { chat_id: chatId, text });
}

/**
 * Telegram webhook for the kitchen bot. Telegram calls this with the secret
 * set by /api/telegram/setup; anything without it is rejected.
 * Always answers 200 once authenticated so Telegram doesn't retry forever.
 */
export async function POST(request: Request) {
  if (!isTelegramConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    if (update.callback_query) {
      await handleTicketCallback(update.callback_query);
    } else if (update.message?.text?.startsWith("/start")) {
      await replyToStart(update.message.chat.id);
    }
  } catch (error) {
    console.error("telegram webhook:", error);
  }

  return NextResponse.json({ ok: true });
}
