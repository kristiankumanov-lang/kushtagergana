"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { bg as bgLocale, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { expandBusyNights, toDateKey } from "@/lib/dates";
import type { BusyRange } from "@/lib/types";

interface CalendarProps {
  busy: BusyRange[];
  checkIn: string | null;
  checkOut: string | null;
  onSelect: (checkIn: string | null, checkOut: string | null) => void;
}

const WEEKDAY_LABELS_BG = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const WEEKDAY_LABELS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function Calendar({ busy, checkIn, checkOut, onSelect }: CalendarProps) {
  const { t, locale } = useLanguage();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));

  const busyNights = useMemo(() => expandBusyNights(busy), [busy]);
  const today = startOfDay(new Date());
  const dateLocale = locale === "bg" ? bgLocale : enUS;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  const checkInDate = checkIn ? parseISO(checkIn) : null;
  const checkOutDate = checkOut ? parseISO(checkOut) : null;

  function isBusy(day: Date) {
    return busyNights.has(toDateKey(day));
  }

  function isPast(day: Date) {
    return isBefore(day, today);
  }

  function isInSelectedRange(day: Date) {
    if (!checkInDate || !checkOutDate) return false;
    return isAfter(day, checkInDate) && isBefore(day, checkOutDate);
  }

  function rangeHasConflict(start: Date, end: Date) {
    return eachDayOfInterval({ start, end: addOneDayBack(end) }).some((d) => isBusy(d));
  }

  function addOneDayBack(date: Date) {
    // exclusive end -> last occupied night is the day before checkout
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d;
  }

  function handleClick(day: Date) {
    if (isPast(day) || isBusy(day)) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onSelect(toDateKey(day), null);
      return;
    }

    if (!isAfter(day, checkInDate)) {
      onSelect(toDateKey(day), null);
      return;
    }

    if (rangeHasConflict(checkInDate, day)) {
      onSelect(toDateKey(day), null);
      return;
    }

    onSelect(toDateKey(checkInDate), toDateKey(day));
  }

  const weekdayLabels = locale === "bg" ? WEEKDAY_LABELS_BG : WEEKDAY_LABELS_EN;

  return (
    <div className="rounded-2xl border border-wood-100 bg-parchment p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
          className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-wood-100"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-display text-lg capitalize text-ink sm:text-xl">
          {format(visibleMonth, "LLLL yyyy", { locale: dateLocale })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
          className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-wood-100"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-soft/80">
        {weekdayLabels.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = toDateKey(day);
          const outOfMonth = !isSameMonth(day, visibleMonth);
          const busyDay = isBusy(day);
          const pastDay = isPast(day);
          const disabled = busyDay || pastDay;
          const isCheckIn = checkIn === key;
          const isCheckOut = checkOut === key;
          const inRange = isInSelectedRange(day);

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(day)}
              aria-pressed={isCheckIn || isCheckOut}
              className={[
                "day-cell relative flex items-center justify-center rounded-lg text-sm transition-colors",
                outOfMonth ? "text-ink-soft/30" : isCheckIn || isCheckOut ? "" : "text-ink",
                busyDay && !outOfMonth ? "cursor-not-allowed text-terracotta-500/60 line-through" : "",
                pastDay && !busyDay && !outOfMonth ? "cursor-not-allowed text-ink-soft/30" : "",
                !disabled && !outOfMonth && !(isCheckIn || isCheckOut) ? "hover:bg-forest-100" : "",
                inRange ? "bg-forest-100" : "",
                isCheckIn || isCheckOut ? "bg-accent-500 text-cream hover:bg-accent-500" : "",
                isToday(day) && !isCheckIn && !isCheckOut ? "font-bold text-terracotta-500" : "",
              ].join(" ")}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 border-t border-wood-100 pt-4 text-xs text-ink-soft">
        <Legend swatchClass="bg-parchment border border-wood-300" label={t.booking.calendarLegend.free} />
        <Legend swatchClass="bg-terracotta-100 border border-terracotta-300" label={t.booking.calendarLegend.busy} />
        <Legend swatchClass="bg-accent-500" label={t.booking.calendarLegend.selected} />
      </div>
    </div>
  );
}

function Legend({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-3 rounded ${swatchClass}`} />
      {label}
    </span>
  );
}
