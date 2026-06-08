/**
 * Loading UI — Root level
 * ========================
 * Shows a minimal, on-brand loading state while the page streams in.
 * Uses animated orbital dots consistent with the cinematic cosmic theme.
 *
 * This is a Server Component by default. It wraps the page in a <Suspense> boundary.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020205]">
      <div className="flex flex-col items-center gap-6">
        {/* Orbital loading animation */}
        <div className="relative flex items-center justify-center w-16 h-16">
          {/* Outer ring */}
          <div
            className="absolute w-16 h-16 rounded-full border border-amber-500/15"
            style={{ animation: "spin 3s linear infinite" }}
          >
            <span
              className="absolute -top-[3px] left-1/2 -ml-[3px] w-1.5 h-1.5 rounded-full bg-amber-400/70"
              style={{ boxShadow: "0 0 8px rgba(245,158,11,0.6)" }}
            />
          </div>
          {/* Inner ring */}
          <div
            className="absolute w-8 h-8 rounded-full border border-amber-500/20"
            style={{ animation: "spin 1.8s linear infinite reverse" }}
          >
            <span
              className="absolute -top-[2px] left-1/2 -ml-[2px] w-1 h-1 rounded-full bg-amber-300/80"
              style={{ boxShadow: "0 0 6px rgba(245,158,11,0.7)" }}
            />
          </div>
          {/* Core dot */}
          <div
            className="w-2 h-2 rounded-full bg-amber-500"
            style={{
              boxShadow: "0 0 10px rgba(245,158,11,0.6), 0 0 20px rgba(245,158,11,0.2)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
        <p
          className="text-[9px] text-neutral-500 font-mono tracking-[0.2em] uppercase"
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          LOADING SECTOR...
        </p>
      </div>
    </div>
  );
}
