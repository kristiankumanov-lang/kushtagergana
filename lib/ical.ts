import ical from "node-ical";
import type { AvailabilityResponse, BusyRange } from "./types";

const REVALIDATE_SECONDS = 60 * 45; // 45 min — inside the requested 30–60 min window

/**
 * Fetches the Booking.com iCal export and returns the booked date ranges.
 * Booking.com's iCal marks the checkout day as free, so `end` here is
 * exclusive — a stay Jul 10–12 blocks nights of the 10th and 11th only.
 */
export async function getBusyRanges(): Promise<AvailabilityResponse> {
  const url = process.env.BOOKING_ICAL_URL;

  if (!url) {
    return { busy: [], source: "unavailable", updatedAt: new Date().toISOString() };
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "guesthouse-raduil-availability-sync/1.0" },
    });

    if (!res.ok) throw new Error(`iCal feed responded ${res.status}`);

    const raw = await res.text();
    const parsed = ical.parseICS(raw);

    const busy: BusyRange[] = Object.values(parsed)
      .filter((entry): entry is ical.VEvent => !!entry && entry.type === "VEVENT")
      .map((event) => ({
        start: toISODate(event.start),
        end: toISODate(event.end ?? event.start),
      }))
      .filter((range) => range.start && range.end);

    return { busy, source: "ical", updatedAt: new Date().toISOString() };
  } catch (error) {
    console.error("[availability] failed to fetch/parse iCal feed:", error);
    return { busy: [], source: "unavailable", updatedAt: new Date().toISOString() };
  }
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
