import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import type { BusyRange } from "./types";

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Booking.com iCal ranges use an exclusive end (checkout day is free).
 * Expands each range into the set of individual *booked night* date keys.
 */
export function expandBusyNights(ranges: BusyRange[]): Set<string> {
  const nights = new Set<string>();
  for (const range of ranges) {
    const start = parseISO(range.start);
    const lastNight = subDays(parseISO(range.end), 1);
    if (lastNight < start) continue;
    for (const day of eachDayOfInterval({ start, end: lastNight })) {
      nights.add(toDateKey(day));
    }
  }
  return nights;
}

/**
 * True when the requested stay [checkIn, checkOut) shares at least one
 * night with an existing busy range.
 */
export function staysOverlapBusyRanges(checkIn: string, checkOut: string, ranges: BusyRange[]): boolean {
  const requestedStart = parseISO(checkIn);
  const requestedEnd = parseISO(checkOut);
  if (requestedEnd <= requestedStart) return true;

  return ranges.some((range) => {
    const busyStart = parseISO(range.start);
    const busyEnd = parseISO(range.end);
    return requestedStart < busyEnd && busyStart < requestedEnd;
  });
}
