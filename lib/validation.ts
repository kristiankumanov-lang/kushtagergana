import { z } from "zod";

// Loose but real-world phone validation: digits, spaces, +, -, parens, 7-15 digits total.
const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

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
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

export type BookingInput = z.infer<typeof bookingSchema>;
