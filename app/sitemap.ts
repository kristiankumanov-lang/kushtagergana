import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kushta-gergana.bg";
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
