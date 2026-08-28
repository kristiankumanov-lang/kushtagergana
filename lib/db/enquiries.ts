import "server-only";
import { getSql } from "./client";
import type { Locale } from "@/lib/i18n/dictionary";

// postgres.js parses SQL `date`/`timestamptz` columns into JS `Date`
// objects by default — but `EnquiryRecord` below declares them as
// `string` (ISO), because that's what every caller (email templates,
// date-fns `parseISO` on the respond page) actually expects. Casting to
// `::text` in every query below keeps the runtime value honest against
// the declared type instead of silently handing out `Date` objects.
// (Repeated per-query rather than shared as a fragment helper: `sql` and
// the `tx` handle inside `sql.begin` are different, non-interchangeable
// postgres.js types, and composing a typed shared fragment across both
// isn't worth fighting the library's overloaded call-signature types for
// four call sites.)

export type EnquiryStatus = "new" | "confirmed" | "declined";

export interface EnquiryRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  message: string | null;
  locale: Locale;
  status: EnquiryStatus;
  token_hash: string;
  token_expires_at: string;
  token_used_at: string | null;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
  ip_hash: string | null;
}

export interface CreateEnquiryInput {
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  message?: string;
  locale: Locale;
  tokenHash: string;
  tokenExpiresAt: Date;
  ipHash: string | null;
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<EnquiryRecord> {
  const sql = getSql();
  const [row] = await sql<EnquiryRecord[]>`
    insert into guesthouse.enquiries
      (name, phone, email, check_in, check_out, adults, children, message, locale,
       token_hash, token_expires_at, ip_hash)
    values
      (${input.name}, ${input.phone}, ${input.email}, ${input.checkIn}, ${input.checkOut},
       ${input.adults}, ${input.children}, ${input.message ?? null}, ${input.locale},
       ${input.tokenHash}, ${input.tokenExpiresAt}, ${input.ipHash})
    returning
      id, name, phone, email,
      check_in::text as check_in, check_out::text as check_out,
      adults, children, message, locale, status,
      token_hash, token_expires_at::text as token_expires_at,
      token_used_at::text as token_used_at,
      email_sent, email_error, created_at::text as created_at, ip_hash
  `;
  return row;
}

/**
 * Records the outcome of the *owner* notification email (the one carrying
 * the confirm/decline buttons) — that's the send whose failure would
 * otherwise silently lose the enquiry, per the phase-3 brief. The guest
 * acknowledgement email is best-effort and only logged on failure.
 */
export async function updateEmailStatus(id: string, sent: boolean, error: string | null): Promise<void> {
  const sql = getSql();
  await sql`
    update guesthouse.enquiries
    set email_sent = ${sent}, email_error = ${error}
    where id = ${id}
  `;
}

export async function findByTokenHash(tokenHash: string): Promise<EnquiryRecord | null> {
  const sql = getSql();
  const [row] = await sql<EnquiryRecord[]>`
    select
      id, name, phone, email,
      check_in::text as check_in, check_out::text as check_out,
      adults, children, message, locale, status,
      token_hash, token_expires_at::text as token_expires_at,
      token_used_at::text as token_used_at,
      email_sent, email_error, created_at::text as created_at, ip_hash
    from guesthouse.enquiries where token_hash = ${tokenHash} limit 1
  `;
  return row ?? null;
}

export type RespondOutcome =
  | { outcome: "not_found" }
  | { outcome: "expired"; enquiry: EnquiryRecord }
  | { outcome: "already_used"; enquiry: EnquiryRecord }
  | { outcome: "applied"; enquiry: EnquiryRecord };

/**
 * Atomically applies the owner's confirm/decline decision: locks the row,
 * re-checks token_used_at is still null, then sets status + token_used_at.
 * The `for update` lock means a double-click (or a retried request) racing
 * this function sees the row as already used and never double-applies or
 * double-emails.
 */
export async function respondToEnquiry(tokenHash: string, status: "confirmed" | "declined"): Promise<RespondOutcome> {
  const sql = getSql();
  return sql.begin(async (tx) => {
    const [row] = await tx<EnquiryRecord[]>`
      select
        id, name, phone, email,
        check_in::text as check_in, check_out::text as check_out,
        adults, children, message, locale, status,
        token_hash, token_expires_at::text as token_expires_at,
        token_used_at::text as token_used_at,
        email_sent, email_error, created_at::text as created_at, ip_hash
      from guesthouse.enquiries where token_hash = ${tokenHash} for update
    `;
    if (!row) return { outcome: "not_found" as const };
    if (row.token_used_at) return { outcome: "already_used" as const, enquiry: row };
    if (new Date(row.token_expires_at).getTime() < Date.now()) {
      return { outcome: "expired" as const, enquiry: row };
    }

    const [updated] = await tx<EnquiryRecord[]>`
      update guesthouse.enquiries
      set status = ${status}, token_used_at = now()
      where id = ${row.id}
      returning
        id, name, phone, email,
        check_in::text as check_in, check_out::text as check_out,
        adults, children, message, locale, status,
        token_hash, token_expires_at::text as token_expires_at,
        token_used_at::text as token_used_at,
        email_sent, email_error, created_at::text as created_at, ip_hash
    `;
    return { outcome: "applied" as const, enquiry: updated };
  });
}

/** How many enquiries this (hashed) IP has submitted in the last `windowMinutes`. */
export async function countRecentEnquiriesByIpHash(ipHash: string, windowMinutes: number): Promise<number> {
  const sql = getSql();
  const [row] = await sql<{ count: number }[]>`
    select count(*)::int as count
    from guesthouse.enquiries
    where ip_hash = ${ipHash}
      and created_at > now() - make_interval(mins => ${windowMinutes})
  `;
  return row?.count ?? 0;
}
