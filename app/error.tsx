"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

/**
 * Error Boundary — Route-level
 * ==============================
 * Catches runtime errors within a route segment and displays a fallback UI.
 * Uses unstable_retry per Next.js 16.x API (see docs/error.md).
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // TODO: Send to error reporting service (e.g., Sentry, LogRocket)
    console.error("[Portfolio Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="text-5xl">⚠️</div>

        <h2 className="text-xl font-semibold font-display text-foreground">
          Something went wrong
        </h2>

        <p className="text-foreground/50 font-body">
          An unexpected error occurred. This has been logged and we&apos;ll look
          into it.
        </p>

        <button
          onClick={() => unstable_retry()}
          className="px-6 py-3 text-sm font-medium rounded-full bg-foreground text-background transition-all duration-300 hover:opacity-90 hover:scale-105 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
