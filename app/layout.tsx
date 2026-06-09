import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { SITE_CONFIG } from "@/constants";
import { generatePersonSchema, generateWebsiteSchema } from "@/lib/structured-data";
import "./globals.css";

/**
 * Viewport configuration
 * =======================
 * Separated from metadata per Next.js App Router convention.
 * Sets theme color for mobile browser chrome to match cosmic dark theme.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE_CONFIG.theme.backgroundColor },
    { media: "(prefers-color-scheme: dark)", color: SITE_CONFIG.theme.backgroundColor },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Root metadata with title template
 * ===================================
 * Title template appends " | Amey Sawant" to all child page titles.
 * Open Graph, Twitter, and robots are configured for maximum discoverability.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.title}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },

  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],

  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: `${SITE_CONFIG.name} — Portfolio`,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.title}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} Portfolio — Full Stack Developer & Creative Technologist`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.title}`,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.social.twitter,
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: SITE_CONFIG.url,
  },

  category: "technology",
};

/**
 * Root Layout
 * ============
 * The outermost layout wrapping all pages.
 * - Applies font CSS variables to <html>
 * - Sets lang attribute for accessibility
 * - Injects JSON-LD structured data
 * - Provides smooth scrolling via CSS class
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={SITE_CONFIG.language}
      className={`${fontVariables} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured data for SEO — Person + WebSite schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generatePersonSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/*
          Future: Page transition wrapper will go here.
          When Framer Motion is added, wrap {children} with <AnimatePresence>
          and a <PageTransition> component for cinematic route transitions.
        */}
        {children}
      </body>
    </html>
  );
}
