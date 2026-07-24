import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getBusyRanges } from "@/lib/ical";
import { staysOverlapBusyRanges } from "@/lib/dates";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;

  // Defense in depth: re-check availability server-side even though the
  // calendar UI already blocks busy dates client-side.
  const { busy, source } = await getBusyRanges();
  if (source === "ical" && staysOverlapBusyRanges(data.checkIn, data.checkOut, busy)) {
    return NextResponse.json({ error: "date_conflict" }, { status: 409 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BOOKING_EMAIL_TO;
  const fromEmail = process.env.BOOKING_EMAIL_FROM;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error("[booking] missing Resend configuration (RESEND_API_KEY / BOOKING_EMAIL_TO / BOOKING_EMAIL_FROM)");
    return NextResponse.json({ error: "email_not_configured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: data.email,
      subject: `Нова заявка за резервация – ${data.checkIn} → ${data.checkOut}`,
      text: buildEmailBody(data),
    });
  } catch (error) {
    console.error("[booking] failed to send email via Resend:", error);
    return NextResponse.json({ error: "email_send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function buildEmailBody(data: {
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  message?: string;
}): string {
  return [
    `Име: ${data.name}`,
    `Телефон: ${data.phone}`,
    `Имейл: ${data.email}`,
    `Настаняване: ${data.checkIn}`,
    `Напускане: ${data.checkOut}`,
    `Възрастни: ${data.adults}`,
    `Деца: ${data.children}`,
    "",
    "Съобщение:",
    data.message?.trim() || "(няма)",
  ].join("\n");
}
