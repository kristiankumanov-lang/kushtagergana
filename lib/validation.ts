import { z } from "zod";
import { format } from "date-fns";

// Loose but real-world phone validation: digits, spaces, +, -, parens, 7-15 digits total.
const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export const bookingSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().regex(phoneRegex),
    email: z.string().trim().email(),
    checkIn: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "invalid date"),
    checkOut: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "invalid date"),
    adults: z.coerce.number().int().min(1).max(16),
    children: z.coerce.number().int().min(0).max(10),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
    locale: z.enum(["bg", "en"]).default("bg"),
    // Honeypot: hidden from real users via CSS, bots fill every field they see.
    // Must stay empty; a non-empty value is treated as a bot submission.
    company: z.string().max(200).optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  })
  .refine((data) => data.checkIn >= todayKey(), {
    message: "checkIn must not be in the past",
    path: ["checkIn"],
  });

export type BookingInput = z.infer<typeof bookingSchema>;
