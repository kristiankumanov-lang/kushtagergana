import "server-only";
import { createHash, randomBytes } from "node:crypto";

export const ENQUIRY_TOKEN_TTL_DAYS = 30;

export interface EnquiryToken {
  /** Goes only into the email link. Never logged, stored, or returned from an API. */
  raw: string;
  /** SHA-256 hex digest — this is what's persisted and looked up. */
  hash: string;
  expiresAt: Date;
}

export function generateEnquiryToken(): EnquiryToken {
  const raw = randomBytes(32).toString("base64url");
  return {
    raw,
    hash: hashEnquiryToken(raw),
    expiresAt: new Date(Date.now() + ENQUIRY_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  };
}

export function hashEnquiryToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Rate-limit / audit key for a request IP. Not a security secret — just
 * pseudonymization so we don't retain raw IPs (GDPR) while keeping a stable
 * grouping key. No salt: the IPv4/IPv6 space is large enough that an
 * unsalted hash is fine for this "how many recently" use case.
 */
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}
