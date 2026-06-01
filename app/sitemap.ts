import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants";

/**
 * sitemap.ts — XML sitemap generation
 * =====================================
 * Generates /sitemap.xml automatically from route data.
 * Add new pages here as portfolio sections grow.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_CONFIG.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    // Future pages — uncomment as they are created:
    // {
    //   url: `${SITE_CONFIG.url}/projects`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${SITE_CONFIG.url}/about`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.7,
    // },
    // {
    //   url: `${SITE_CONFIG.url}/contact`,
    //   lastModified: now,
    //   changeFrequency: "yearly",
    //   priority: 0.5,
    // },
  ];
}
