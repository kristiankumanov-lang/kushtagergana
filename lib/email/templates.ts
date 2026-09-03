import type { Locale } from "@/lib/i18n/dictionary";
import { formatDisplayDate } from "@/lib/dates";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface OwnerNotificationEmailInput {
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  message?: string;
  confirmUrl: string;
  declineUrl: string;
}

export interface GuestAckEmailInput {
  name: string;
  checkIn: string;
  checkOut: string;
  locale: Locale;
  houseName: string;
  phone: string;
  siteUrl: string;
}

export type GuestDecisionEmailInput = GuestAckEmailInput;

const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function emailCard(content: string): string {
  return `<div style="margin:0;padding:24px 12px;background:#faf4e9;color:#2b2420;font-family:${fontFamily};line-height:1.6"><div style="max-width:520px;margin:0 auto">${content}</div></div>`;
}

function signatureHtml(input: GuestAckEmailInput): string {
  const houseName = escapeHtml(input.houseName);
  const phone = escapeHtml(input.phone);
  const siteUrl = escapeHtml(input.siteUrl);

  return `<div style="margin-top:28px;padding-top:18px;border-top:1px solid #55483c;color:#55483c"><strong style="color:#2b2420">${houseName}</strong><br>${phone}<br><a href="${siteUrl}" style="color:#4a7c59;text-decoration:underline">${siteUrl}</a></div>`;
}

function signatureText(input: GuestAckEmailInput): string {
  return `${input.houseName}\n${input.phone}\n${input.siteUrl}`;
}

/** Renders a list of paragraphs into matching HTML/text bodies — the
 * shared shape behind every guest-facing email below. `\n` inside a single
 * paragraph (e.g. a "Поздрави,\n{houseName}" sign-off) is preserved via
 * `white-space:pre-line` in HTML and passes through as-is in text. */
function paragraphBody(paragraphs: string[]): { html: string; text: string } {
  const html = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;color:#2b2420;font-size:16px;white-space:pre-line">${escapeHtml(p)}</p>`,
    )
    .join("");
  return { html, text: paragraphs.join("\n\n") };
}

export function ownerNotificationEmail(input: OwnerNotificationEmailInput): EmailContent {
  const checkIn = formatDisplayDate(input.checkIn);
  const checkOut = formatDisplayDate(input.checkOut);
  const message = input.message?.trim() || "(няма)";
  const rows = [
    ["Име", input.name],
    ["Телефон", input.phone],
    ["Имейл", input.email],
    ["Настаняване", checkIn],
    ["Напускане", checkOut],
    ["Възрастни", String(input.adults)],
    ["Деца", String(input.children)],
    ["Съобщение", message],
  ];
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 14px 6px 0;vertical-align:top;color:#55483c;font-weight:600">${label}</td><td style="padding:6px 0;vertical-align:top;color:#2b2420;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const textDetails = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const confirmUrl = escapeHtml(input.confirmUrl);
  const declineUrl = escapeHtml(input.declineUrl);

  return {
    subject: `Ново запитване — ${checkIn} до ${checkOut}`,
    html: emailCard(
      `<h1 style="margin:0 0 18px;color:#2b2420;font-size:24px;line-height:1.3">Ново запитване</h1><table role="presentation" style="width:100%;border-collapse:collapse;font-family:${fontFamily};font-size:16px"><tbody>${htmlRows}</tbody></table><p style="margin:24px 0 14px;color:#55483c;font-size:14px">Отваря страница с детайлите — потвърждението става там, не автоматично при отваряне.</p><div><a href="${confirmUrl}" style="display:inline-block;margin:0 10px 10px 0;padding:12px 24px;border-radius:999px;background:#4a7c59;color:#ffffff;font-family:sans-serif;font-weight:600;text-decoration:none">✅ Потвърди наличност</a><a href="${declineUrl}" style="display:inline-block;margin:0 0 10px;padding:12px 24px;border-radius:999px;background:#7c4a2c;color:#ffffff;font-family:sans-serif;font-weight:600;text-decoration:none">❌ Няма наличност</a></div>`,
    ),
    text: `${textDetails}\n\nОтваря страница с детайлите — потвърждението става там, не автоматично при отваряне.\n\n✅ Потвърди наличност\n${input.confirmUrl}\n\n❌ Няма наличност\n${input.declineUrl}`,
  };
}

export function guestAckEmail(input: GuestAckEmailInput): EmailContent {
  const isBg = input.locale === "bg";
  const checkIn = formatDisplayDate(input.checkIn);
  const checkOut = formatDisplayDate(input.checkOut);

  const paragraphs = isBg
    ? [
        `Здравейте ${input.name},`,
        `получихме вашето запитване за периода ${checkIn} – ${checkOut}.`,
        `Ще се свържем с вас възможно най-скоро.`,
        `Поздрави,\n${input.houseName}`,
      ]
    : [
        `Hello ${input.name},`,
        `we received your enquiry for the period ${checkIn} – ${checkOut}.`,
        `We'll get back to you as soon as possible.`,
        `Best regards,\n${input.houseName}`,
      ];
  const { html, text } = paragraphBody(paragraphs);

  return {
    subject: isBg ? "Получихме вашето запитване" : "We received your enquiry",
    html: emailCard(`${html}${signatureHtml(input)}`),
    text: `${text}\n\n${signatureText(input)}`,
  };
}

export function guestConfirmedEmail(input: GuestDecisionEmailInput): EmailContent {
  const isBg = input.locale === "bg";
  const checkIn = formatDisplayDate(input.checkIn);
  const checkOut = formatDisplayDate(input.checkOut);

  const paragraphs = isBg
    ? [
        `Здравейте ${input.name},`,
        `за периода ${checkIn} – ${checkOut} имаме свободни места.`,
        `Ще се свържем с вас по телефона за уточняване на подробностите и потвърждение на резервацията. В случай, че не успеете да вдигнете, моля върнете обаждане при първа възможност.`,
        `Ако не успеем да се свържем с вас до края на деня, запитването отпада и датите остават свободни за други гости.`,
        `Поздрави,\n${input.houseName}`,
      ]
    : [
        `Hello ${input.name},`,
        `we have availability for the period ${checkIn} – ${checkOut}.`,
        `We'll call you to confirm the details and finalize the booking. If you miss our call, please call us back as soon as you can.`,
        `If we're unable to reach you by the end of the day, the enquiry will lapse and the dates will remain open to other guests.`,
        `Best regards,\n${input.houseName}`,
      ];
  const { html, text } = paragraphBody(paragraphs);

  return {
    subject: isBg ? `Датите са свободни — ${input.houseName}` : `Your dates are available — ${input.houseName}`,
    html: emailCard(`${html}${signatureHtml(input)}`),
    text: `${text}\n\n${signatureText(input)}`,
  };
}

export function guestDeclinedEmail(input: GuestDecisionEmailInput): EmailContent {
  const isBg = input.locale === "bg";
  const checkIn = formatDisplayDate(input.checkIn);
  const checkOut = formatDisplayDate(input.checkOut);

  const paragraphs = isBg
    ? [
        `Здравейте ${input.name},`,
        `за съжаление периодът ${checkIn} – ${checkOut} вече е зает.`,
        `Ще се радваме да ви посрещнем в други дати – просто отговорете на този имейл с нов период и ще проверим наличността.`,
        `Поздрави,\n${input.houseName}`,
      ]
    : [
        `Hello ${input.name},`,
        `unfortunately the period ${checkIn} – ${checkOut} is already booked.`,
        `We'd love to host you on different dates – just reply to this email with a new period and we'll check availability.`,
        `Best regards,\n${input.houseName}`,
      ];
  const { html, text } = paragraphBody(paragraphs);

  return {
    subject: isBg
      ? `За съжаление датите са заети — ${input.houseName}`
      : `Unfortunately those dates are booked — ${input.houseName}`,
    html: emailCard(`${html}${signatureHtml(input)}`),
    text: `${text}\n\n${signatureText(input)}`,
  };
}
