import type { MetadataRoute } from "next";
import { SITE_URL_FALLBACK } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_FALLBACK;
  const bgUrl = `${siteUrl}/`;
  const enUrl = `${siteUrl}/en`;

  const languages = { bg: bgUrl, en: enUrl, "x-default": bgUrl };

  return [
    {
      url: bgUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: enUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
  ];
}
