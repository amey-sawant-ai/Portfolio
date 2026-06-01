/**
 * Loading UI — Root level
 * ========================
 * Shows a minimal, on-brand loading state while the page streams in.
 * Uses a pulsing cosmic dot animation consistent with the futuristic theme.
 *
 * This is a Server Component by default. It wraps the page in a <Suspense> boundary.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing cosmic loader */}
        <div className="relative flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-accent/20 animate-ping absolute" />
          <div className="h-4 w-4 rounded-full bg-accent" />
        </div>
        <p className="text-sm text-foreground/40 font-body animate-pulse">
          Loading…
        </p>
      </div>
    </div>
  );
}
