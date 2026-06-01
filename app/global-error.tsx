"use client"; // Error boundaries must be Client Components

/**
 * Global Error Boundary
 * =======================
 * Catches errors that occur in the root layout itself.
 * Must include its own <html> and <body> tags since it replaces the root layout.
 * This is a last-resort fallback.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050510",
          color: "#ededed",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            Something went wrong
          </h2>
          <p style={{ opacity: 0.5, marginBottom: "1.5rem" }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#ededed",
              color: "#050510",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
