/**
 * Structured data (JSON-LD) generators
 * ======================================
 * Produces Schema.org structured data for enhanced search engine visibility.
 * These are rendered as <script type="application/ld+json"> in the layout.
 */

import { SITE_CONFIG } from "@/constants";

/**
 * Generates Person schema for the portfolio owner.
 * Helps Google display rich results (knowledge panel, social links, etc.)
 */
export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    jobTitle: SITE_CONFIG.title,
    sameAs: [
      SITE_CONFIG.social.github,
      SITE_CONFIG.social.linkedin,
    ],
    description: SITE_CONFIG.description,
  };
}

/**
 * Generates WebSite schema for sitelinks search box in Google.
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_CONFIG.name} — Portfolio`,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.name,
    },
  };
}
