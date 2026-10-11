import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { handleReadyCallback, isTelegramConfigured, telegramApi, webhookSecret } from "@/lib/telegram";

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
      await handleReadyCallback(update.callback_query);
    } else if (update.message?.text?.startsWith("/start")) {
      await telegramApi("sendMessage", {
        chat_id: update.message.chat.id,
        text: "Здравейте! Ботът на Къща Гергана е свързан. Тук ще идват поръчките за кухнята и известията „Готово“.",
      });
    }
  } catch (error) {
    console.error("telegram webhook:", error);
  }

  return NextResponse.json({ ok: true });
}
