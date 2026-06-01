import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants";

/**
 * manifest.ts — Web App Manifest (PWA-ready)
 * =============================================
 * Generates /manifest.webmanifest for PWA support and mobile install prompts.
 * Uses the cosmic dark theme colors from SITE_CONFIG.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_CONFIG.name} — Portfolio`,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: SITE_CONFIG.theme.backgroundColor,
    theme_color: SITE_CONFIG.theme.themeColor,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      // Future: Add 192x192 and 512x512 PNG icons for full PWA support
      // {
      //   src: "/icons/icon-192x192.png",
      //   sizes: "192x192",
      //   type: "image/png",
      // },
      // {
      //   src: "/icons/icon-512x512.png",
      //   sizes: "512x512",
      //   type: "image/png",
      // },
    ],
  };
}
