import { NextResponse } from "next/server";
import { getBusyRanges } from "@/lib/ical";
import { staysOverlapBusyRanges } from "@/lib/dates";
import { bookingSchema } from "@/lib/validation";
import { createEnquiry, countRecentEnquiriesByIpHash, updateEmailStatus } from "@/lib/db/enquiries";
import { generateEnquiryToken, hashIp } from "@/lib/token";
import { sendEmail } from "@/lib/email/resend";
import { ownerNotificationEmail, guestAckEmail } from "@/lib/email/templates";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MINUTES = 60;
const HOUSE_NAME = "Къща за гости Гергана";

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

  // Honeypot tripped: pretend success so the bot doesn't retry, but never
  // touch the DB or send anything.
  if (data.company) {
    return NextResponse.json({ ok: true, emailSent: true });
  }

  const ipHash = getClientIpHash(request);

  if (ipHash) {
    const recent = await countRecentEnquiriesByIpHash(ipHash, RATE_LIMIT_WINDOW_MINUTES);
    if (recent >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  // Defense in depth: re-check availability server-side even though the
  // calendar UI already blocks busy dates client-side.
  const { busy, source } = await getBusyRanges();
  if (source === "ical" && staysOverlapBusyRanges(data.checkIn, data.checkOut, busy)) {
    return NextResponse.json({ error: "date_conflict" }, { status: 409 });
  }

  const fromEmail = process.env.GUESTHOUSE_EMAIL_FROM;
  const ownerEmail = process.env.GUESTHOUSE_OWNER_EMAIL;
  const phone = process.env.GUESTHOUSE_PHONE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!fromEmail || !ownerEmail || !phone || !siteUrl) {
    console.error(
      "[booking] missing configuration (GUESTHOUSE_EMAIL_FROM / GUESTHOUSE_OWNER_EMAIL / GUESTHOUSE_PHONE / NEXT_PUBLIC_SITE_URL)"
    );
    return NextResponse.json({ error: "email_not_configured" }, { status: 500 });
  }

  const { raw: rawToken, hash: tokenHash, expiresAt } = generateEnquiryToken();

  // The enquiry is persisted *before* any email is attempted — this is the
  // whole point of phase 3: a Resend outage must never lose the request.
  let enquiry;
  try {
    enquiry = await createEnquiry({
      name: data.name,
      phone: data.phone,
      email: data.email,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      adults: data.adults,
      children: data.children,
      message: data.message,
      locale: data.locale,
      tokenHash,
      tokenExpiresAt: expiresAt,
      ipHash,
    });
  } catch (error) {
    console.error("[booking] failed to persist enquiry:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const confirmUrl = `${siteUrl}/enquiry/respond?token=${rawToken}&a=yes`;
  const declineUrl = `${siteUrl}/enquiry/respond?token=${rawToken}&a=no`;

  const ownerTemplate = ownerNotificationEmail({
    name: data.name,
    phone: data.phone,
    email: data.email,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    adults: data.adults,
    children: data.children,
    message: data.message,
    confirmUrl,
    declineUrl,
  });

  const ownerEmailResult = await sendEmail({
    from: fromEmail,
    to: ownerEmail,
    replyTo: data.email,
    ...ownerTemplate,
  });

  // This is the email that matters for "did the enquiry get lost" — track
  // its outcome on the row regardless of what happens to the guest email.
  await updateEmailStatus(enquiry.id, ownerEmailResult.ok, ownerEmailResult.error ?? null);
  if (!ownerEmailResult.ok) {
    console.error("[booking] owner notification email failed:", ownerEmailResult.error);
  }

  const guestTemplate = guestAckEmail({
    name: data.name,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    locale: data.locale,
    houseName: HOUSE_NAME,
    phone,
    siteUrl,
  });

  const guestEmailResult = await sendEmail({
    from: fromEmail,
    to: data.email,
    replyTo: ownerEmail,
    ...guestTemplate,
  });
  if (!guestEmailResult.ok) {
    console.error("[booking] guest acknowledgement email failed:", guestEmailResult.error);
  }

  return NextResponse.json({
    ok: true,
    emailSent: ownerEmailResult.ok,
    ...(ownerEmailResult.ok ? {} : { phone }),
  });
}

function getClientIpHash(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : request.headers.get("x-real-ip")?.trim();
  return ip ? hashIp(ip) : null;
}
