import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  if (!client) client = new Resend(apiKey);
  return client;
}

export interface SendEmailInput {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

/**
 * Resend's SDK returns `{ data, error }` on API-level failures (invalid
 * sender, rate limit, etc.) instead of throwing — only transport-level
 * failures throw. Both paths must be treated as failure, or a rejected
 * send silently looks like success.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const resend = getClient();
    const { error } = await resend.emails.send({
      from: input.from,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
