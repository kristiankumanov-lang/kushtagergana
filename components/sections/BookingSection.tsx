import { getBusyRanges } from "@/lib/ical";
import { Container } from "@/components/ui/Container";
import { BookingSectionHeader } from "./BookingSectionHeader";
import { BookingWidget } from "@/components/booking/BookingWidget";

export async function BookingSection() {
  const availability = await getBusyRanges();

  return (
    <section id="booking" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <Container>
        <BookingSectionHeader />
        <div className="mt-10">
          <BookingWidget initialAvailability={availability} />
        </div>
      </Container>
    </section>
  );
}
