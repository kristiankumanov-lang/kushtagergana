import "server-only";
import { createHash } from "node:crypto";
import { getSql } from "@/lib/db/client";
import { SITE_URL_FALLBACK } from "@/lib/site";

/**
 * Kitchen Telegram bot.
 *
 * Only one env var is needed: TELEGRAM_BOT_TOKEN. The webhook secret is
 * derived from it, the webhook registers itself on first use, and the chat
 * ids live in the DB (guesthouse.users.telegram_chat_id for the sisters,
 * guesthouse.telegram_admins for observers).
 *
 * Ticket flow:
 *   waiter: "Изпрати поръчка за кухнята"
 *     → kitchen gets the ticket with [👨‍🍳 Приготвя се]
 *   kitchen: 👨‍🍳 Приготвя се
 *     → waiter: "Кухнята прие поръчката", ticket button becomes [✅ Готово]
 *   kitchen: ✅ Готово
 *     → items become 'ready', waiter: "Готово: …"
 *   waiter cancels a line already sent → kitchen: "❌ Отказано: …"
 *
 * Admins get a copy of every ticket (with the same buttons, so they can test
 * the flow themselves) and a "👁 <name> получи: …" copy of every other message.
 *
 * Telegram is best-effort: failures are logged and never break the order
 * flow — the order is already saved in the DB.
 */

type Role = "waiter" | "kitchen";

interface Recipient {
  chatId: number;
  name: string;
}

interface InlineButton {
  text: string;
  callback_data: string;
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

/** Secret Telegram sends back in X-Telegram-Bot-Api-Secret-Token. */
export function webhookSecret(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  return createHash("sha256").update(`gergana-kitchen-webhook:${token}`).digest("hex").slice(0, 48);
}

export function webhookUrl(): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK).replace(/\/$/, "");
  return `${siteUrl}/api/telegram/webhook`;
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

const globalForWebhook = globalThis as unknown as { __gerganaWebhookOk?: boolean };

/**
 * Makes sure Telegram sends button presses to this site. Checked once per
 * server instance; registers (or re-registers) the webhook when it is missing
 * or points elsewhere. Never throws.
 */
export async function ensureWebhook(): Promise<void> {
  if (!isTelegramConfigured() || globalForWebhook.__gerganaWebhookOk) return;
  try {
    const info = await telegramApi<{ url: string }>("getWebhookInfo", {});
    if (info.url !== webhookUrl()) await registerWebhook();
    globalForWebhook.__gerganaWebhookOk = true;
  } catch (error) {
    console.error("ensureWebhook:", error);
  }
}

export async function registerWebhook(): Promise<void> {
  await telegramApi("setWebhook", {
    url: webhookUrl(),
    secret_token: webhookSecret(),
    allowed_updates: ["message", "callback_query"],
  });
}

async function recipientsForRole(role: Role): Promise<Recipient[]> {
  const sql = getSql();
  const rows = await sql<{ chat_id: string; name: string }[]>`
    select telegram_chat_id::text as chat_id, coalesce(display_name, username) as name
    from guesthouse.users
    where role = ${role} and telegram_chat_id is not null
  `;
  return rows.map((row) => ({ chatId: Number(row.chat_id), name: row.name }));
}

async function admins(): Promise<Recipient[]> {
  const sql = getSql();
  const rows = await sql<{ chat_id: string; name: string }[]>`
    select chat_id::text, name from guesthouse.telegram_admins
  `;
  return rows.map((row) => ({ chatId: Number(row.chat_id), name: row.name }));
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
  accepted_at: Date | null;
  ready_at: Date | null;
  lines: TicketLine[];
}

async function loadTicket(ticketId: string): Promise<TicketInfo | null> {
  const sql = getSql();
  const [head] = await sql<Omit<TicketInfo, "lines">[]>`
    select coalesce(rooms.label, tabs.label, 'Гости') as tab_label,
      coalesce(users.display_name, users.username) as sent_by,
      tickets.accepted_at, tickets.ready_at
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

/** The ticket message as it should look in its current state, plus its button. */
function ticketView(ticketId: string, ticket: TicketInfo): { text: string; buttons: InlineButton[][] } {
  const label = escapeHtml(ticket.tab_label);
  const by = ticket.sent_by ? `\n<i>— ${escapeHtml(ticket.sent_by)}</i>` : "";
  if (ticket.ready_at) {
    return { text: `✅ <b>${label}</b> — готово\n${linesText(ticket.lines)}${by}`, buttons: [] };
  }
  if (ticket.accepted_at) {
    return {
      text: `👨‍🍳 <b>${label}</b> — приготвя се\n${linesText(ticket.lines)}${by}`,
      buttons: [[{ text: "✅ Готово", callback_data: `ready:${ticketId}` }]],
    };
  }
  return {
    text: `🍳 <b>${label}</b>\n${linesText(ticket.lines)}${by}`,
    buttons: [[{ text: "👨‍🍳 Приготвя се", callback_data: `accept:${ticketId}` }]],
  };
}

/** Plain notification to everyone with `role`, mirrored to the admins. */
async function notifyRole(role: Role, html: string): Promise<void> {
  const [targets, observers] = await Promise.all([recipientsForRole(role), admins()]);
  const names = targets.map((target) => target.name).join(", ") || (role === "kitchen" ? "кухнята" : "сервитьора");
  await Promise.all([
    ...targets.map((target) =>
      telegramApi("sendMessage", { chat_id: target.chatId, text: html, parse_mode: "HTML" }).catch((error) =>
        console.error(`notify ${role}:`, error),
      ),
    ),
    ...observers
      .filter((observer) => !targets.some((target) => target.chatId === observer.chatId))
      .map((observer) =>
        telegramApi("sendMessage", {
          chat_id: observer.chatId,
          text: `👁 <i>${escapeHtml(names)} получи:</i>\n${html}`,
          parse_mode: "HTML",
        }).catch((error) => console.error("notify admin:", error)),
      ),
  ]);
}

/** Sends a new kitchen ticket to the kitchen and the admins. Never throws. */
export async function notifyKitchenTicket(ticketId: string): Promise<void> {
  if (!isTelegramConfigured()) return;
  try {
    await ensureWebhook();
    const [ticket, kitchen, observers] = await Promise.all([loadTicket(ticketId), recipientsForRole("kitchen"), admins()]);
    if (!ticket || ticket.lines.length === 0) return;
    const view = ticketView(ticketId, ticket);
    const kitchenNames = kitchen.map((k) => k.name).join(", ") || "кухнята";
    const sends = [
      ...kitchen.map((k) => ({ chatId: k.chatId, text: view.text })),
      ...observers
        .filter((observer) => !kitchen.some((k) => k.chatId === observer.chatId))
        .map((observer) => ({
          chatId: observer.chatId,
          text: `👁 <i>${escapeHtml(kitchenNames)} получи:</i>\n${view.text}`,
        })),
    ];
    const sql = getSql();
    await Promise.all(
      sends.map(async (send) => {
        try {
          const message = await telegramApi<{ message_id: number }>("sendMessage", {
            chat_id: send.chatId,
            text: send.text,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: view.buttons },
          });
          await sql`
            insert into guesthouse.kitchen_ticket_messages (ticket_id, chat_id, message_id)
            values (${ticketId}, ${send.chatId}, ${message.message_id})
          `;
        } catch (error) {
          console.error("send ticket:", error);
        }
      }),
    );
  } catch (error) {
    console.error("notifyKitchenTicket:", error);
  }
}

/** Tells the kitchen that a line already sent to them was cancelled. Never throws. */
export async function notifyKitchenCancel(tabLabel: string, itemName: string, quantity: number): Promise<void> {
  if (!isTelegramConfigured()) return;
  try {
    await notifyRole("kitchen", `❌ <b>Отказано</b> — ${escapeHtml(tabLabel)}\n${quantity}× ${escapeHtml(itemName)}`);
  } catch (error) {
    console.error("notifyKitchenCancel:", error);
  }
}

/** Re-renders every Telegram copy of the ticket to its current state. */
async function refreshTicketMessages(ticketId: string, ticket: TicketInfo): Promise<void> {
  const sql = getSql();
  const [copies, observers] = await Promise.all([
    sql<{ chat_id: string; message_id: string }[]>`
      select chat_id::text, message_id::text
      from guesthouse.kitchen_ticket_messages
      where ticket_id = ${ticketId}
    `,
    admins(),
    ]);
  const kitchen = await recipientsForRole("kitchen");
  const kitchenNames = kitchen.map((k) => k.name).join(", ") || "кухнята";
  const view = ticketView(ticketId, ticket);
  await Promise.all(
    copies.map((copy) => {
      const chatId = Number(copy.chat_id);
      const isObserverCopy =
        observers.some((observer) => observer.chatId === chatId) && !kitchen.some((k) => k.chatId === chatId);
      return telegramApi("editMessageText", {
        chat_id: chatId,
        message_id: Number(copy.message_id),
        text: isObserverCopy ? `👁 <i>${escapeHtml(kitchenNames)} получи:</i>\n${view.text}` : view.text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: view.buttons },
      }).catch((error) => console.error("editMessageText:", error));
    }),
  );
}

interface CallbackQuery {
  id: string;
  from: { id: number };
  data?: string;
}

/**
 * Handles 👨‍🍳 Приготвя се and ✅ Готово. Allowed for kitchen users and
 * admins. Both steps are idempotent: a second press (or a stale copy) never
 * re-notifies the waiter. Готово without a prior "Приготвя се" also counts
 * as accepted.
 */
export async function handleTicketCallback(query: CallbackQuery): Promise<void> {
  const match = /^(accept|ready):([0-9a-f-]{36})$/.exec(query.data ?? "");
  if (!match) {
    await telegramApi("answerCallbackQuery", { callback_query_id: query.id });
    return;
  }
  const [, action, ticketId] = match;
  const sql = getSql();

  const [kitchenUser] = await sql<{ id: string }[]>`
    select id from guesthouse.users
    where role = 'kitchen' and telegram_chat_id = ${query.from.id}
    limit 1
  `;
  const [admin] = await sql<{ chat_id: string }[]>`
    select chat_id::text from guesthouse.telegram_admins where chat_id = ${query.from.id}
  `;
  if (!kitchenUser && !admin) {
    await telegramApi("answerCallbackQuery", { callback_query_id: query.id, text: "Нямате права за това." });
    return;
  }
  const actorId = kitchenUser?.id ?? null;

  const changed = await sql.begin(async (tx) => {
    const [ticket] = await tx<{ accepted_at: Date | null; ready_at: Date | null }[]>`
      select accepted_at, ready_at from guesthouse.kitchen_tickets where id = ${ticketId} for update
    `;
    if (!ticket) return "missing" as const;
    if (action === "accept") {
      if (ticket.accepted_at || ticket.ready_at) return "none" as const;
      await tx`
        update guesthouse.kitchen_tickets
        set accepted_at = now(), accepted_by = ${actorId}
        where id = ${ticketId}
      `;
      return "accepted" as const;
    }
    if (ticket.ready_at) return "none" as const;
    await tx`
      update guesthouse.kitchen_tickets
      set ready_at = now(), ready_by = ${actorId},
        accepted_at = coalesce(accepted_at, now()), accepted_by = coalesce(accepted_by, ${actorId})
      where id = ${ticketId}
    `;
    await tx`
      update guesthouse.tab_items
      set status = 'ready', ready_at = now()
      where ticket_id = ${ticketId} and status = 'sent_to_kitchen'
    `;
    return "ready" as const;
  });

  const answers = {
    missing: "Поръчката вече не съществува.",
    none: "Вече е отбелязано.",
    accepted: "Приета 👨‍🍳",
    ready: "Готово ✅",
  } as const;
  await telegramApi("answerCallbackQuery", { callback_query_id: query.id, text: answers[changed] });
  if (changed === "missing") return;

  const ticket = await loadTicket(ticketId);
  if (!ticket) return;
  await refreshTicketMessages(ticketId, ticket);

  if (ticket.lines.length === 0) return;
  const label = escapeHtml(ticket.tab_label);
  if (changed === "accepted") {
    await notifyRole("waiter", `👨‍🍳 <b>Кухнята прие поръчката: ${label}</b>\n${linesText(ticket.lines)}`);
  } else if (changed === "ready") {
    await notifyRole("waiter", `✅ <b>Готово: ${label}</b>\n${linesText(ticket.lines)}`);
  }
}
