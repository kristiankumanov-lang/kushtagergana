import type { Locale } from "@/lib/i18n/dictionary";

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

export function ownerNotificationEmail(input: OwnerNotificationEmailInput): EmailContent {
  const message = input.message?.trim() || "(няма)";
  const rows = [
    ["Име", input.name],
    ["Телефон", input.phone],
    ["Имейл", input.email],
    ["Настаняване", input.checkIn],
    ["Напускане", input.checkOut],
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
    subject: `Ново запитване — ${input.checkIn} до ${input.checkOut}`,
    html: emailCard(
      `<h1 style="margin:0 0 18px;color:#2b2420;font-size:24px;line-height:1.3">Ново запитване</h1><table role="presentation" style="width:100%;border-collapse:collapse;font-family:${fontFamily};font-size:16px"><tbody>${htmlRows}</tbody></table><p style="margin:24px 0 14px;color:#55483c;font-size:14px">Отваря страница с детайлите — потвърждението става там, не автоматично при отваряне.</p><div><a href="${confirmUrl}" style="display:inline-block;margin:0 10px 10px 0;padding:12px 24px;border-radius:999px;background:#4a7c59;color:#ffffff;font-family:sans-serif;font-weight:600;text-decoration:none">✅ Потвърди наличност</a><a href="${declineUrl}" style="display:inline-block;margin:0 0 10px;padding:12px 24px;border-radius:999px;background:#7c4a2c;color:#ffffff;font-family:sans-serif;font-weight:600;text-decoration:none">❌ Няма наличност</a></div>`,
    ),
    text: `${textDetails}\n\nОтваря страница с детайлите — потвърждението става там, не автоматично при отваряне.\n\n✅ Потвърди наличност\n${input.confirmUrl}\n\n❌ Няма наличност\n${input.declineUrl}`,
  };
}

export function guestAckEmail(input: GuestAckEmailInput): EmailContent {
  const isBg = input.locale === "bg";
  const greeting = isBg
    ? `Здравейте ${input.name}, получихме вашето запитване за периода ${input.checkIn} – ${input.checkOut}. Ще се свържем с вас възможно най-скоро.`
    : `Hello ${input.name}, we received your enquiry for the period ${input.checkIn} – ${input.checkOut}. We'll get back to you as soon as possible.`;

  return {
    subject: isBg ? "Получихме вашето запитване" : "We received your enquiry",
    html: emailCard(`<p style="margin:0;color:#2b2420;font-size:16px">${escapeHtml(greeting)}</p>${signatureHtml(input)}`),
    text: `${greeting}\n\n${signatureText(input)}`,
  };
}

export function guestConfirmedEmail(input: GuestDecisionEmailInput): EmailContent {
  const isBg = input.locale === "bg";
  const body = isBg
    ? `Здравейте ${input.name}, периодът ${input.checkIn}–${input.checkOut} е свободен. Домакините ще се свържат с вас с подробностите. Ако не успеете да се свържете с нас, обадете се на ${input.phone}.`
    : `Hello ${input.name}, the period ${input.checkIn}–${input.checkOut} is available. The hosts will reach out with the details. If you cannot get in touch with us, please call ${input.phone}.`;

  return {
    subject: isBg ? `Датите са свободни — ${input.houseName}` : `Your dates are available — ${input.houseName}`,
    html: emailCard(`<p style="margin:0;color:#2b2420;font-size:16px">${escapeHtml(body)}</p>${signatureHtml(input)}`),
    text: `${body}\n\n${signatureText(input)}`,
  };
}

export function guestDeclinedEmail(input: GuestDecisionEmailInput): EmailContent {
  const isBg = input.locale === "bg";
  const body = isBg
    ? `Здравейте ${input.name}, съжаляваме, но периодът ${input.checkIn}–${input.checkOut} за съжаление е зает. Можете просто да отговорите на този имейл и да ни предложите други дати.`
    : `Hello ${input.name}, we're sorry, but the period ${input.checkIn}–${input.checkOut} is unfortunately booked. You can simply reply to this email and suggest other dates.`;

  return {
    subject: isBg
      ? `За съжаление датите са заети — ${input.houseName}`
      : `Unfortunately those dates are booked — ${input.houseName}`,
    html: emailCard(`<p style="margin:0;color:#2b2420;font-size:16px">${escapeHtml(body)}</p>${signatureHtml(input)}`),
    text: `${body}\n\n${signatureText(input)}`,
  };
}
