"use client";

import { useState, useEffect } from "react";
import { SITE_CONFIG } from "@/constants";
import { CinematicLoader } from "@/components";

/**
 * Home Page
 * ==========
 * Displays the cinematic loading screen on first visit, then reveals 
 * the portfolio foundation with smooth transition.
 */
export default function Home() {
  // Set to false to temporarily disable the loading screen. Change to true to re-enable.
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  // Prevent server-side rendering issues with client-only features
  if (!mounted) {
    return <div className="min-h-screen bg-[#020206]" />;
  }

  return (
    <>
      {/* Cinematic Cosmic Loader */}
      {isLoading && <CinematicLoader onComplete={handleLoaderComplete} />}

      {/* Main Portfolio Content */}
      <main 
        className={`flex flex-col items-center justify-center min-h-screen px-6 transition-all duration-1000 ease-out
          ${isLoading 
            ? "opacity-0 translate-y-8 pointer-events-none" 
            : "opacity-100 translate-y-0"
          }
        `}
      >
        {/* 
          Future: Three.js / React Three Fiber canvas will be positioned here
          as a full-screen background with z-index below the content.
          
          <CosmicBackground />
        */}

        <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-display text-gradient text-glow">
            {SITE_CONFIG.name}
          </h1>

          <p className="text-lg text-foreground-muted sm:text-xl font-body max-w-md">
            {SITE_CONFIG.title}
          </p>

          <p className="text-sm text-foreground/40 max-w-md font-body">
            {SITE_CONFIG.description}
          </p>

          <div className="flex gap-4 mt-6">
            <a
              href={SITE_CONFIG.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-6 py-3 text-sm font-semibold rounded-full bg-foreground text-background transition-all duration-300 hover:scale-105 overflow-hidden font-mono"
            >
              <span className="relative z-10">GitHub</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/20 transition-transform duration-300" />
            </a>
            <a
              href={SITE_CONFIG.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-sm font-semibold rounded-full border border-border/80 text-foreground transition-all duration-300 hover:border-foreground hover:scale-105 hover:bg-foreground/5 font-mono"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
