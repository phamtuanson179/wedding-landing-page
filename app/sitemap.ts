import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl, siteConfig } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: getSiteUrl(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...siteConfig.sections.map((section, index) => ({
      url: absoluteUrl(section.path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: Math.max(0.5, 0.9 - index * 0.05),
    })),
  ];
}
