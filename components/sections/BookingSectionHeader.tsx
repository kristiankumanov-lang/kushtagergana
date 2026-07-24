"use client";

import { useLanguage } from "@/lib/i18n/context";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function BookingSectionHeader() {
  const { t } = useLanguage();
  return <SectionHeading kicker={t.booking.kicker} heading={t.booking.heading} subheading={t.booking.subheading} />;
}
