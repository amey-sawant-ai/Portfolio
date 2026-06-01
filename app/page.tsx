import { SITE_CONFIG } from "@/constants";

/**
 * Home Page
 * ==========
 * Minimal placeholder — preserves structure while the foundation is set up.
 * The actual hero section, 3D scene, and portfolio sections will be built later.
 */
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* 
        Future: Three.js / React Three Fiber canvas will be positioned here
        as a full-screen background with z-index below the content.
        
        <CosmicBackground />
      */}

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-display">
          {SITE_CONFIG.name}
        </h1>

        <p className="text-lg text-foreground/60 sm:text-xl font-body">
          {SITE_CONFIG.title}
        </p>

        <p className="text-sm text-foreground/40 max-w-md font-body">
          {SITE_CONFIG.description}
        </p>

        <div className="flex gap-4 mt-4">
          <a
            href={SITE_CONFIG.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-sm font-medium rounded-full bg-foreground text-background transition-all duration-300 hover:opacity-90 hover:scale-105"
          >
            GitHub
          </a>
          <a
            href={SITE_CONFIG.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-sm font-medium rounded-full border border-foreground/20 transition-all duration-300 hover:border-foreground/50 hover:scale-105"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </main>
  );
}
