export interface BusyRange {
  /** ISO date string, inclusive */
  start: string;
  /** ISO date string, exclusive (Booking.com iCal convention: checkout day is free) */
  end: string;
}

export interface AvailabilityResponse {
  busy: BusyRange[];
  source: "ical" | "unavailable";
  updatedAt: string;
}

export interface BookingRequestPayload {
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  message?: string;
  locale: "bg" | "en";
}
