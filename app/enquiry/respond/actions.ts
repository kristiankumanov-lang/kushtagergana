"use server";

import { revalidatePath } from "next/cache";
import { findByTokenHash, respondToEnquiry, type EnquiryStatus } from "@/lib/db/enquiries";
import { hashEnquiryToken } from "@/lib/token";
import { sendEmail } from "@/lib/email/resend";
import { guestConfirmedEmail, guestDeclinedEmail } from "@/lib/email/templates";
import type { Locale } from "@/lib/i18n/dictionary";

const HOUSE_NAME = "Къща за гости Гергана";

export interface EnquiryView {
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  message: string | null;
  locale: Locale;
}

export type RespondPageState =
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "already_used"; status: Exclude<EnquiryStatus, "new">; respondedAt: string; enquiry: EnquiryView }
  | { kind: "pending"; action: "yes" | "no" | null; enquiry: EnquiryView };

/**
 * Read-only lookup used by the page's GET render. Never mutates — email
 * clients and antivirus scanners that "open" the link on arrival must not
 * be able to trigger a confirm/decline this way.
 */
export async function loadEnquiryForToken(rawToken: string | undefined, action: string | undefined): Promise<RespondPageState> {
  if (!rawToken) return { kind: "invalid" };

  const tokenHash = hashEnquiryToken(rawToken);
  const enquiry = await findByTokenHash(tokenHash);
  if (!enquiry) return { kind: "invalid" };

  const view: EnquiryView = {
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    checkIn: enquiry.check_in,
    checkOut: enquiry.check_out,
    adults: enquiry.adults,
    children: enquiry.children,
    message: enquiry.message,
    locale: enquiry.locale,
  };

  if (enquiry.token_used_at) {
    return {
      kind: "already_used",
      status: enquiry.status === "new" ? "confirmed" : enquiry.status,
      respondedAt: enquiry.token_used_at,
      enquiry: view,
    };
  }

  if (new Date(enquiry.token_expires_at).getTime() < Date.now()) {
    return { kind: "expired" };
  }

  const safeAction = action === "yes" || action === "no" ? action : null;
  return { kind: "pending", action: safeAction, enquiry: view };
}

/**
 * The only code path that mutates. Bound to a <form action> as
 * confirmEnquiry.bind(null, rawToken, "yes" | "no") — forms always POST,
 * so this can never run off a GET/prefetch.
 *
 * Returns void (rather than a result object) to match React's plain
 * `<form action>` typing (`(formData: FormData) => void | Promise<void>`);
 * the page re-derives its state from `loadEnquiryForToken` after
 * `revalidatePath` anyway, so there's nothing for a caller to do with a
 * return value. Failure paths are logged instead.
 */
export async function confirmEnquiry(rawToken: string, action: "yes" | "no"): Promise<void> {
  const tokenHash = hashEnquiryToken(rawToken);
  const status = action === "yes" ? "confirmed" : "declined";

  const outcome = await respondToEnquiry(tokenHash, status);

  if (outcome.outcome === "not_found") {
    console.error("[enquiry-respond] confirmEnquiry called with an unknown token");
    return;
  }
  if (outcome.outcome === "expired") {
    console.error("[enquiry-respond] confirmEnquiry called with an expired token");
    return;
  }

  // "already_used" (double-click / retry) falls through intentionally:
  // no second email, just re-render the same confirmation view.
  if (outcome.outcome === "applied") {
    await notifyGuest(outcome.enquiry.email, outcome.enquiry.name, outcome.enquiry.check_in, outcome.enquiry.check_out, outcome.enquiry.locale, status);
  }

  revalidatePath("/enquiry/respond");
}

async function notifyGuest(
  email: string,
  name: string,
  checkIn: string,
  checkOut: string,
  locale: Locale,
  status: "confirmed" | "declined"
) {
  const fromEmail = process.env.GUESTHOUSE_EMAIL_FROM;
  const ownerEmail = process.env.GUESTHOUSE_OWNER_EMAIL;
  const phone = process.env.GUESTHOUSE_PHONE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!fromEmail || !ownerEmail || !phone || !siteUrl) {
    console.error("[enquiry-respond] missing email configuration; skipped guest notification");
    return;
  }

  const templateInput = { name, checkIn, checkOut, locale, houseName: HOUSE_NAME, phone, siteUrl };
  const template = status === "confirmed" ? guestConfirmedEmail(templateInput) : guestDeclinedEmail(templateInput);

  const result = await sendEmail({ from: fromEmail, to: email, replyTo: ownerEmail, ...template });
  if (!result.ok) {
    console.error("[enquiry-respond] failed to send guest decision email:", result.error);
  }
}
