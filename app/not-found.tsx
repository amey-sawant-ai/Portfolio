import Link from "next/link";

/**
 * 404 Not Found Page
 * ===================
 * Displayed when a user navigates to a route that doesn't exist.
 * Styled to match the cosmic theme while remaining minimal.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        {/* Glowing 404 number */}
        <h1 className="text-8xl font-bold font-display text-accent/80 tracking-tighter">
          404
        </h1>

        <h2 className="text-xl font-semibold font-display text-foreground">
          Lost in Space
        </h2>

        <p className="text-foreground/50 font-body">
          The page you&apos;re looking for has drifted into the void.
          Let&apos;s navigate you back to known coordinates.
        </p>

        <Link
          href="/"
          className="px-6 py-3 text-sm font-medium rounded-full bg-foreground text-background transition-all duration-300 hover:opacity-90 hover:scale-105"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
