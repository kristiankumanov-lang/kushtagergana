import "server-only";
import { createHash } from "node:crypto";
import { getSql } from "@/lib/db/client";

/**
 * Kitchen Telegram bot.
 *
 * Only one env var is needed: TELEGRAM_BOT_TOKEN. The webhook secret is
 * derived from the token, so there is nothing else to configure, and the
 * chat ids of the two sisters live in guesthouse.users.telegram_chat_id.
 *
 * Flow:
 *   waiter presses "Изпрати поръчка за кухнята"
 *     → message to every `kitchen` user with a "✅ Готово" button
 *   kitchen presses "✅ Готово"
 *     → items become 'ready', the message is marked done,
 *       and every `waiter` user gets "✅ Готово: стая 22 …"
 *   a line already sent to the kitchen is cancelled
 *     → kitchen gets "❌ Отказано: …"
 *
 * Telegram is best-effort: a failed send is logged and never breaks the
 * order flow — the order is already saved in the DB.
 */

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

/** Secret Telegram sends back in X-Telegram-Bot-Api-Secret-Token. */
export function webhookSecret(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  return createHash("sha256").update(`gergana-kitchen-webhook:${token}`).digest("hex").slice(0, 48);
}

export async function telegramApi<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!json.ok) throw new Error(`Telegram ${method} failed: ${json.description ?? res.status}`);
  return json.result as T;
}

async function chatIdsForRole(role: "waiter" | "kitchen"): Promise<number[]> {
  const sql = getSql();
  const rows = await sql<{ telegram_chat_id: string }[]>`
    select telegram_chat_id::text
    from guesthouse.users
    where role = ${role} and telegram_chat_id is not null
  `;
  return rows.map((row) => Number(row.telegram_chat_id));
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface TicketLine {
  item_name: string;
  quantity: number;
}

interface TicketInfo {
  tab_label: string;
  sent_by: string | null;
  lines: TicketLine[];
}

async function loadTicket(ticketId: string): Promise<TicketInfo | null> {
  const sql = getSql();
  const [head] = await sql<{ tab_label: string; sent_by: string | null }[]>`
    select coalesce(rooms.label, tabs.label, 'Гости') as tab_label, users.username as sent_by
    from guesthouse.kitchen_tickets as tickets
    join guesthouse.tabs as tabs on tabs.id = tickets.tab_id
    left join guesthouse.rooms as rooms on rooms.id = tabs.room_id
    left join guesthouse.users as users on users.id = tickets.sent_by
    where tickets.id = ${ticketId}
  `;
  if (!head) return null;
  const lines = await sql<TicketLine[]>`
    select item_name, sum(quantity)::int as quantity
    from guesthouse.tab_items
    where ticket_id = ${ticketId} and status != 'cancelled'
    group by item_name
    order by min(added_at)
  `;
  return { ...head, lines };
}

function linesText(lines: TicketLine[]): string {
  return lines.map((line) => `${line.quantity}× ${escapeHtml(line.item_name)}`).join("\n");
}

function ticketText(ticket: TicketInfo): string {
  return `🍳 <b>${escapeHtml(ticket.tab_label)}</b>\n${linesText(ticket.lines)}`;
}

/** Sends a new kitchen ticket to every kitchen user. Never throws. */
export async function notifyKitchenTicket(ticketId: string): Promise<void> {
  if (!isTelegramConfigured()) return;
  try {
    const [ticket, chatIds] = await Promise.all([loadTicket(ticketId), chatIdsForRole("kitchen")]);
    if (!ticket || ticket.lines.length === 0) return;
    await Promise.all(
      chatIds.map((chatId) =>
        telegramApi("sendMessage", {
          chat_id: chatId,
          text: ticketText(ticket),
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: [[{ text: "✅ Готово", callback_data: `ready:${ticketId}` }]] },
        }),
      ),
    );
  } catch (error) {
    console.error("notifyKitchenTicket:", error);
  }
}

/** Tells the kitchen that a line already sent to them was cancelled. Never throws. */
export async function notifyKitchenCancel(tabLabel: string, itemName: string, quantity: number): Promise<void> {
  if (!isTelegramConfigured()) return;
  try {
    const chatIds = await chatIdsForRole("kitchen");
    const text = `❌ <b>Отказано</b> — ${escapeHtml(tabLabel)}\n${quantity}× ${escapeHtml(itemName)}`;
    await Promise.all(chatIds.map((chatId) => telegramApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" })));
  } catch (error) {
    console.error("notifyKitchenCancel:", error);
  }
}

interface CallbackQuery {
  id: string;
  from: { id: number };
  data?: string;
  message?: { message_id: number; chat: { id: number } };
}

/**
 * Handles the "✅ Готово" button. Only a chat registered as a kitchen user
 * may mark a ticket ready. Marking is idempotent: pressing twice (or two
 * kitchen phones) only notifies the waiter once.
 */
export async function handleReadyCallback(query: CallbackQuery): Promise<void> {
  const match = /^ready:([0-9a-f-]{36})$/.exec(query.data ?? "");
  if (!match) {
    await telegramApi("answerCallbackQuery", { callback_query_id: query.id });
    return;
  }
  const ticketId = match[1];
  const sql = getSql();

  const [kitchenUser] = await sql<{ id: string }[]>`
    select id from guesthouse.users
    where role = 'kitchen' and telegram_chat_id = ${query.from.id}
    limit 1
  `;
  if (!kitchenUser) {
    await telegramApi("answerCallbackQuery", { callback_query_id: query.id, text: "Нямате права за това." });
    return;
  }

  const firstTime = await sql.begin(async (tx) => {
    const [ticket] = await tx<{ ready_at: Date | null }[]>`
      select ready_at from guesthouse.kitchen_tickets where id = ${ticketId} for update
    `;
    if (!ticket || ticket.ready_at) return false;
    await tx`
      update guesthouse.kitchen_tickets
      set ready_at = now(), ready_by = ${kitchenUser.id}
      where id = ${ticketId}
    `;
    await tx`
      update guesthouse.tab_items
      set status = 'ready', ready_at = now()
      where ticket_id = ${ticketId} and status = 'sent_to_kitchen'
    `;
    return true;
  });

  await telegramApi("answerCallbackQuery", {
    callback_query_id: query.id,
    text: firstTime ? "Отбелязано като готово ✅" : "Вече е отбелязано.",
  });

  const ticket = await loadTicket(ticketId);
  if (!ticket) return;

  if (query.message) {
    await telegramApi("editMessageText", {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: `✅ <b>${escapeHtml(ticket.tab_label)}</b> — готово\n${linesText(ticket.lines)}`,
      parse_mode: "HTML",
    }).catch((error) => console.error("editMessageText:", error));
  }

  if (firstTime && ticket.lines.length > 0) {
    const waiterIds = await chatIdsForRole("waiter");
    const text = `✅ <b>Готово: ${escapeHtml(ticket.tab_label)}</b>\n${linesText(ticket.lines)}`;
    await Promise.all(
      waiterIds.map((chatId) =>
        telegramApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" }).catch((error) =>
          console.error("notify waiter:", error),
        ),
      ),
    );
  }
}
