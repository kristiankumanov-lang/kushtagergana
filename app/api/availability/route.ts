import { NextResponse } from "next/server";
import { getBusyRanges } from "@/lib/ical";

// ISR-style caching handled inside getBusyRanges() via fetch's `next.revalidate`.
export const revalidate = 2700; // 45 min

export async function GET() {
  const data = await getBusyRanges();
  return NextResponse.json(data);
}
