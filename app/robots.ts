import type { MetadataRoute } from "next";
import { SITE_URL_FALLBACK } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_FALLBACK;

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
