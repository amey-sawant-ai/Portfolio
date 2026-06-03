import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * =======================
 * Optimized for a portfolio with future Three.js / React Three Fiber integration.
 *
 * Key decisions:
 * - React strict mode ON for catching issues early
 * - Image optimization configured for Vercel deployment
 * - Turbopack (default in Next.js 16) with custom loader rules
 * - Security and caching headers for performance
 */
const nextConfig: NextConfig = {
  /* React strict mode — catches common bugs during development */
  reactStrictMode: true,

  /* Turbopack configuration (Next.js 16 default bundler) */
  turbopack: {
    rules: {
      /* Handle GLSL shader files (for future custom Three.js shaders) */
      "*.glsl": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },

  /* Vercel handles image optimization automatically */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  /* Headers for security and performance */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        /* Force correct MIME type for videos under nosniff header policy */
        source: "/images/:path*.mp4",
        headers: [
          {
            key: "Content-Type",
            value: "video/mp4",
          },
        ],
      },
      {
        /* Cache 3D models and textures aggressively */
        source: "/models/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/textures/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
