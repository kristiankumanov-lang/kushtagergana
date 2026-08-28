import { format, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import {
  confirmEnquiry,
  loadEnquiryForToken,
  type EnquiryView,
  type RespondPageState,
} from "./actions";
import { SubmitButton } from "./SubmitButton";

const cardClass = "rounded-2xl border border-wood-100 bg-parchment p-8 sm:p-10";

function displayDate(value: string) {
  return format(parseISO(value), "d MMMM yyyy", { locale: bg });
}

function EnquirySummary({ enquiry, full = false }: { enquiry: EnquiryView; full?: boolean }) {
  const message = enquiry.message?.trim();

  return (
    <dl className="mt-8 grid gap-4 border-t border-wood-100 pt-6 text-sm sm:grid-cols-2">
      <Detail label="Име" value={enquiry.name} />
      <Detail
        label="Телефон"
        value={<a className="hover:text-terracotta-700" href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>}
      />
      <Detail label="Настаняване" value={displayDate(enquiry.checkIn)} />
      <Detail label="Напускане" value={displayDate(enquiry.checkOut)} />
      {full && (
        <>
          <Detail
            label="Имейл"
            value={<a className="break-all hover:text-terracotta-700" href={`mailto:${enquiry.email}`}>{enquiry.email}</a>}
          />
          <Detail label="Гости" value={`${enquiry.adults} възрастни, ${enquiry.children} деца`} />
          <div className="sm:col-span-2">
            <Detail label="Съобщение" value={message || "(няма съобщение)"} />
          </div>
        </>
      )}
    </dl>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="mt-1 text-ink-soft">{value}</dd>
    </div>
  );
}

function DecisionForm({ token, action, secondary = false }: { token: string; action: "yes" | "no"; secondary?: boolean }) {
  const isConfirm = action === "yes";
  const formAction = confirmEnquiry.bind(null, token, action);
  const label = secondary
    ? isConfirm ? "Всъщност има свободни дати →" : "Всъщност няма свободни дати →"
    : isConfirm ? "✅ Потвърди наличност" : "❌ Няма наличност";

  return (
    <form action={formAction}>
      {secondary ? (
        <button type="submit" className="text-sm font-semibold text-terracotta-700 underline-offset-4 hover:underline">
          {label}
        </button>
      ) : (
        <SubmitButton label={label} variant={isConfirm ? "confirm" : "decline"} />
      )}
    </form>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; a?: string }>;
}) {
  const { token, a } = await searchParams;
  const state: RespondPageState = await loadEnquiryForToken(token, a);

  return (
    <Container>
      <div className="mx-auto max-w-xl py-16 sm:py-24">
        {state.kind === "invalid" && (
          <div className={cardClass}>
            <AlertCircle className="mb-5 size-10 text-ink-soft" />
            <h1 className="font-display text-2xl text-ink sm:text-3xl">Линкът не е валиден</h1>
            <p className="mt-3 text-ink-soft">Този линк не съществува или вече не е активен.</p>
          </div>
        )}

        {state.kind === "expired" && (
          <div className={cardClass}>
            <Clock className="mb-5 size-10 text-terracotta-700" />
            <h1 className="font-display text-2xl text-ink sm:text-3xl">Линкът е изтекъл</h1>
            <p className="mt-3 text-ink-soft">Линкът за отговор е валиден 30 дни. Моля, свържете се директно с госта.</p>
          </div>
        )}

        {state.kind === "already_used" && <UsedState state={state} />}

        {state.kind === "pending" && token && (
          <div className={cardClass}>
            <h1 className="font-display text-2xl text-ink sm:text-3xl">Запитване за престой</h1>
            <p className="mt-3 text-ink-soft">Прегледайте данните и отбележете дали има свободни дати.</p>
            <EnquirySummary enquiry={state.enquiry} full />
            <div className="mt-8 border-t border-wood-100 pt-6">
              {state.action === null ? (
                <div className="flex flex-wrap gap-3">
                  <DecisionForm token={token} action="yes" />
                  <DecisionForm token={token} action="no" />
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4">
                  <DecisionForm token={token} action={state.action} />
                  <DecisionForm token={token} action={state.action === "yes" ? "no" : "yes"} secondary />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

function UsedState({ state }: { state: Extract<RespondPageState, { kind: "already_used" }> }) {
  const confirmed = state.status === "confirmed";
  const Icon = confirmed ? CheckCircle2 : XCircle;
  const accentClass = confirmed
    ? "border-forest-300 bg-forest-100 text-forest-700"
    : "border-terracotta-300 bg-terracotta-100 text-terracotta-700";

  return (
    <div className={`${cardClass} ${accentClass}`}>
      <Icon className="mb-5 size-12" />
      <h1 className="font-display text-2xl sm:text-3xl">{confirmed ? "Потвърдено" : "Отказано"}</h1>
      <p className="mt-3">Отговорено на {format(parseISO(state.respondedAt), "d MMMM yyyy, HH:mm", { locale: bg })}.</p>
      <EnquirySummary enquiry={state.enquiry} />
      <p className="mt-6 font-semibold">Гостът е уведомен по имейл.</p>
    </div>
  );
}
