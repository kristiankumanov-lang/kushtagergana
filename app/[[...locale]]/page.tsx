import { resolveLocale } from "@/lib/i18n/routing";
import { getLodgingBusinessJsonLd } from "@/lib/jsonld";
import { HomeSections } from "@/components/sections/HomeSections";

export const revalidate = 2700; // keep availability data in sync with the iCal cache window

export default async function Page({
  params,
}: {
  params: Promise<{ locale?: string[] }>;
}) {
  const locale = resolveLocale((await params).locale);
  const jsonLd = getLodgingBusinessJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeSections />
    </>
  );
}
