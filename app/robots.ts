import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants";

/**
 * robots.ts — Search engine crawler configuration
 * =================================================
 * Tells search engines which pages to index and where to find the sitemap.
 * This file is automatically served at /robots.txt by Next.js.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
