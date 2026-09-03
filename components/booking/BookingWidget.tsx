"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { staysOverlapBusyRanges } from "@/lib/dates";
import type { AvailabilityResponse, BookingRequestPayload } from "@/lib/types";
import { Calendar } from "./Calendar";

interface BookingWidgetProps {
  initialAvailability: AvailabilityResponse;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

export function BookingWidget({ initialAvailability }: BookingWidgetProps) {
  const { t, locale } = useLanguage();
  const f = t.booking.form;

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) nextErrors.name = f.required;
    else if (name.trim().length > 100) nextErrors.name = f.nameTooLong;
    if (!phone.trim() || !phoneRegex.test(phone.trim())) nextErrors.phone = f.invalidPhone;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = f.invalidEmail;
    if (!checkIn || Number.isNaN(Date.parse(checkIn))) nextErrors.checkIn = f.required;
    if (!checkOut || Number.isNaN(Date.parse(checkOut))) nextErrors.checkOut = f.required;
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      nextErrors.checkOut = f.invalidDates;
    }
    // Matches bookingSchema's z.coerce.number().int().min(1).max(16) /
    // .min(0).max(10) — the form has noValidate, so the <input min/max>
    // attributes are decorative only and never actually block submission.
    if (!Number.isInteger(adults) || adults < 1 || adults > 16) nextErrors.adults = f.invalidGuests;
    if (!Number.isInteger(children) || children < 0 || children > 10) nextErrors.children = f.invalidGuests;
    if (message.trim().length > 1000) nextErrors.message = f.messageTooLong;
    if (
      checkIn &&
      checkOut &&
      initialAvailability.source === "ical" &&
      staysOverlapBusyRanges(checkIn, checkOut, initialAvailability.busy)
    ) {
      nextErrors.checkOut = f.dateConflict;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !checkIn || !checkOut) return;

    setSubmitState("submitting");
    try {
      // Built as a plain object rather than parsed through the (zod-based)
      // bookingSchema here — validate() above already gates submission, and
      // the API route re-validates with the same schema server-side anyway.
      // Keeping zod out of this client component keeps it out of the
      // client bundle entirely (it's a real dependency only in route.ts).
      const payload: BookingRequestPayload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        checkIn,
        checkOut,
        adults,
        children,
        message: message.trim(),
        locale,
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setErrors((prev) => ({ ...prev, checkOut: f.dateConflict }));
        setSubmitState("error");
        return;
      }
      if (!res.ok) throw new Error("request_failed");

      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-forest-300 bg-forest-100 p-10 text-center">
        <CheckCircle2 className="size-12 text-forest-700" />
        <h3 className="font-display text-2xl text-forest-900">{f.successTitle}</h3>
        <p className="max-w-md text-ink-soft">{f.successText}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        {initialAvailability.source === "unavailable" && (
          <p className="mb-4 rounded-lg bg-terracotta-100 px-4 py-3 text-sm text-terracotta-700">
            {t.booking.calendarFallback}
          </p>
        )}
        <Calendar
          busy={initialAvailability.busy}
          checkIn={checkIn}
          checkOut={checkOut}
          onSelect={(ci, co) => {
            setCheckIn(ci);
            setCheckOut(co);
            setErrors((prev) => ({ ...prev, checkIn: "", checkOut: "" }));
          }}
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ReadonlyDateField label={f.checkIn} value={checkIn} error={errors.checkIn} />
          <ReadonlyDateField label={f.checkOut} value={checkOut} error={errors.checkOut} />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label={f.name} error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass(!!errors.name)}
            autoComplete="name"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={f.phone} error={errors.phone}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass(!!errors.phone)}
              autoComplete="tel"
            />
          </Field>
          <Field label={f.email} error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass(!!errors.email)}
              autoComplete="email"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={f.adults} error={errors.adults}>
            <input
              type="number"
              min={1}
              max={16}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className={inputClass(!!errors.adults)}
            />
          </Field>
          <Field label={f.children} error={errors.children}>
            <input
              type="number"
              min={0}
              max={10}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className={inputClass(!!errors.children)}
            />
          </Field>
        </div>

        <Field label={f.message} error={errors.message}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={f.messagePlaceholder}
            rows={4}
            className={inputClass(!!errors.message)}
          />
        </Field>

        {submitState === "error" && !errors.checkOut && (
          <p className="flex items-center gap-2 text-sm text-terracotta-700">
            <XCircle className="size-4" /> {f.errorText}
          </p>
        )}

        <button
          type="submit"
          disabled={submitState === "submitting"}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-accent-600 disabled:opacity-60"
        >
          {submitState === "submitting" && <Loader2 className="size-4 animate-spin" />}
          {submitState === "submitting" ? f.submitting : f.submit}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      {children}
      {error && <span className="text-xs text-terracotta-700">{error}</span>}
    </label>
  );
}

function ReadonlyDateField({
  label,
  value,
  error,
}: {
  label: string;
  value: string | null;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <div
        className={`rounded-lg border px-3.5 py-2.5 text-ink ${
          error ? "border-terracotta-500" : "border-wood-100"
        } bg-parchment`}
      >
        {value ?? "–"}
      </div>
      {error && <span className="text-xs text-terracotta-700">{error}</span>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `rounded-lg border px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-forest-500 ${
    hasError ? "border-terracotta-500" : "border-wood-100"
  } bg-parchment`;
}
