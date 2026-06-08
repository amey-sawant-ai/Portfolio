/**
 * Site-wide constants for Amey Sawant's Portfolio
 * ================================================
 * Central source of truth for all site metadata, URLs, and configuration.
 * Update these values once — they propagate to metadata, SEO, manifest, etc.
 */

export const SITE_CONFIG = {
  /** Full name displayed in hero, metadata, and structured data */
  name: "Amey Sawant",

  /** Professional title / tagline */
  title: "Full Stack Developer & Creative Technologist",

  /** Site description for SEO and Open Graph */
  description:
    "Explore the interactive 3D portfolio of Amey Sawant, a Full Stack Developer & Creative Technologist showcasing AI integrations, advanced WebGL/Three.js visualizers, and creative software engineering solutions.",

  /** Production domain (without protocol) */
  domain: "ameysawant.in",

  /** Canonical base URL (with protocol, no trailing slash) */
  url: "https://ameysawant.in",

  /** Open Graph locale */
  locale: "en_US",

  /** Primary language */
  language: "en",

  /** Social and contact links */
  social: {
    github: "https://github.com/amey-sawant-ai",
    linkedin: "https://linkedin.com/in/amey-sawant-ai",
    twitter: "@ameysawant",
    email: "amey123sawant@gmail.com",
  },

  /** Theme configuration for the cosmic/futuristic aesthetic */
  theme: {
    /** Primary brand color — deep cosmic blue-violet */
    primaryColor: "#6C3CE1",
    /** Background color — near-black space */
    backgroundColor: "#050510",
    /** Accent color — electric cyan glow */
    accentColor: "#00E5FF",
    /** Theme color for mobile browsers and PWA */
    themeColor: "#050510",
  },

  /** SEO keywords for discoverability */
  keywords: [
    "Amey Sawant",
    "Amey Pradip Sawant",
    "Amey Prakash Sawant",
    "Full Stack Developer",
    "Creative Technologist",
    "Software Engineer",
    "Three.js Portfolio",
    "Next.js Developer",
    "AI Agent Engineer",
    "React Developer",
    "TypeScript Portfolio",
    "WebGL Developer",
    "Creative Software Engineering",
    "Web Audio API",
    "Interactive 3D Portfolio",
  ],
} as const;

/** Navigation items — will grow as sections are added */
export const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Breakpoints matching Tailwind defaults.
 * Useful for JS-side responsive logic (e.g., Three.js camera adjustments).
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
