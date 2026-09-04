"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { staysOverlapBusyRanges } from "@/lib/dates";
import { bookingSchema } from "@/lib/validation";
import type { AvailabilityResponse } from "@/lib/types";
import { Calendar } from "./Calendar";

interface BookingWidgetProps {
  initialAvailability: AvailabilityResponse;
}

type SubmitState = "idle" | "submitting" | "success" | "error" | "rate_limited";

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
  // Honeypot: hidden from real users via CSS. Bots fill every field they
  // find, so a non-empty value here means the submission is a bot.
  const [company, setCompany] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [fallbackPhone, setFallbackPhone] = useState<string | null>(null);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) nextErrors.name = f.required;
    if (!phone.trim() || !phoneRegex.test(phone.trim())) nextErrors.phone = f.invalidPhone;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = f.invalidEmail;
    if (!checkIn) nextErrors.checkIn = f.required;
    if (!checkOut) nextErrors.checkOut = f.required;
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      nextErrors.checkOut = f.invalidDates;
    }
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
      const payload = bookingSchema.parse({
        name,
        phone,
        email,
        checkIn,
        checkOut,
        adults,
        children,
        message,
        locale,
        company,
      });

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
      if (res.status === 429) {
        setSubmitState("rate_limited");
        return;
      }
      if (!res.ok) throw new Error("request_failed");

      const json: { ok: boolean; emailSent?: boolean; phone?: string } = await res.json();
      setFallbackPhone(json.emailSent === false && json.phone ? json.phone : null);
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
        <p className="max-w-md text-ink-soft">
          {fallbackPhone ? f.successTextEmailFailed.replace("{phone}", fallbackPhone) : f.successText}
        </p>
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
          <Field label={f.adults}>
            <input
              type="number"
              min={1}
              max={16}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className={inputClass(false)}
            />
          </Field>
          <Field label={f.children}>
            <input
              type="number"
              min={0}
              max={10}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className={inputClass(false)}
            />
          </Field>
        </div>

        <Field label={f.message}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={f.messagePlaceholder}
            rows={4}
            className={inputClass(false)}
          />
        </Field>

        {/* Honeypot — invisible to sighted users, off the tab order, never
            autofilled. A filled value means the submission is a bot. */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            Company
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>

        {submitState === "error" && !errors.checkOut && (
          <p className="flex items-center gap-2 text-sm text-terracotta-700">
            <XCircle className="size-4" /> {f.errorText}
          </p>
        )}

        {submitState === "rate_limited" && (
          <p className="flex items-center gap-2 text-sm text-terracotta-700">
            <XCircle className="size-4" /> {f.rateLimited}
          </p>
        )}

        <button
          type="submit"
          disabled={submitState === "submitting"}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-accent-600 px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-accent-600 disabled:opacity-60"
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
