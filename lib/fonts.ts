/**
 * Font configuration
 * ==================
 * Centralizes font loading using next/font/google for optimal performance.
 * Fonts are self-hosted automatically by Next.js (no external requests at runtime).
 */

import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

/**
 * Primary display font — Space Grotesk
 * A geometric sans-serif with a futuristic, technical feel.
 * Used for headings, hero text, and navigation.
 */
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * Body font — Inter
 * Clean, highly legible sans-serif optimized for screens.
 * Used for body text, descriptions, and general content.
 */
export const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/**
 * Monospace font — JetBrains Mono
 * Developer-friendly monospace for code snippets and technical details.
 */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

/**
 * Combined CSS variable class string for the <html> element.
 * Applies all three font CSS variables simultaneously.
 */
export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;
