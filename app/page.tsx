"use client";

import { useState, useEffect, useRef } from "react";
import { SITE_CONFIG } from "@/constants";
import { CinematicLoader, StoryCanvas } from "@/components";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  // Vertical scroll / touch / keybind controls for cinematic story slides
  useEffect(() => {
    if (isLoading) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current) return;

      isScrollingRef.current = true;
      const direction = e.deltaY > 0 ? 1 : -1;
      setActiveStage((prev) => Math.max(0, Math.min(prev + direction, 4)));

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 950);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current) return;

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        isScrollingRef.current = true;
        setActiveStage((prev) => Math.max(0, Math.min(prev + 1, 4)));
        setTimeout(() => { isScrollingRef.current = false; }, 950);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        isScrollingRef.current = true;
        setActiveStage((prev) => Math.max(0, Math.min(prev - 1, 4)));
        setTimeout(() => { isScrollingRef.current = false; }, 950);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartYRef.current - touchEndY;

      if (Math.abs(diffY) > 40) {
        isScrollingRef.current = true;
        const direction = diffY > 0 ? 1 : -1;
        setActiveStage((prev) => Math.max(0, Math.min(prev + direction, 4)));
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 950);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isLoading]);

  // Prevent server-side rendering issues with client-only features
  if (!mounted) {
    return <div className="min-h-screen bg-[#020206]" />;
  }

  return (
    <>
      {/* Cinematic Cosmic Loader */}
      {isLoading && <CinematicLoader onComplete={handleLoaderComplete} />}

      {/* Main Storytelling Application */}
      <main 
        className={`relative min-h-screen w-full bg-[#020206] overflow-hidden select-none transition-all duration-1000 ease-out
          ${isLoading 
            ? "opacity-0 scale-95 pointer-events-none" 
            : "opacity-100 scale-100 pointer-events-auto"
          }
        `}
      >
        {/* Background Visualizer Component */}
        <StoryCanvas activeStage={activeStage} />

        {/* Global Cinematic Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.85)_100%)] z-20 pointer-events-none" />

        {/* HUD Layout Container - Top Left (Brand Identity) */}
        <div className="fixed top-6 left-6 z-40 font-mono text-[10px] tracking-[0.2em] text-white/40 select-none">
          {SITE_CONFIG.name.toUpperCase()} // PORTFOLIO_V1
        </div>

        {/* HUD Layout Container - Top Right (Active Slide Details) */}
        <div className="fixed top-6 right-6 z-40 font-mono text-[10px] tracking-[0.2em] text-white/40 text-right select-none">
          PHASE: 0{activeStage + 1} / 05 // CORE_STATE: ACTIVE
        </div>

        {/* HUD Layout Container - Bottom Left (Navigation Instructions) */}
        <div className="fixed bottom-6 left-6 z-40 font-mono text-[9px] tracking-widest text-white/30 select-none hidden sm:block">
          [SCROLL WHEEL, SWIPE OR SPACE TO NAVIGATE]
        </div>

        {/* Right Sidebar Stage Indicators */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-40 font-mono text-xs select-none">
          {[
            { id: 0, label: "NEBULA", num: "01" },
            { id: 1, label: "COALESCENCE", num: "02" },
            { id: 2, label: "TRAJECTORY", num: "03" },
            { id: 3, label: "ENTRY", num: "04" },
            { id: 4, label: "IMPACT", num: "05" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveStage(item.id)}
              className="flex items-center gap-3 text-right justify-end group transition-all duration-300 pointer-events-auto cursor-pointer focus:outline-none"
            >
              <span className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] tracking-widest text-accent-glow ${activeStage === item.id ? "opacity-100 text-accent font-bold" : ""}`}>
                {item.label}
              </span>
              <span className={`text-[10px] ${activeStage === item.id ? "text-accent-glow font-bold scale-110" : "text-white/30"}`}>
                {item.num}
              </span>
            </button>
          ))}
        </div>

        {/* ---------------- SLIDE CONTENT OVERLAYS ---------------- */}

        {/* Stage 1: The Nebula */}
        <div 
          className={`absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-24 py-12 z-30 transition-all duration-[1000ms] ease-out pointer-events-none
            ${activeStage === 0 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          <div className="max-w-xl text-left bg-black/45 border border-white/5 p-6 md:p-8 rounded-lg backdrop-blur-md shadow-2xl relative select-text pointer-events-auto">
            {/* Cyber Brackets */}
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/10" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 01 // THE NEBULA — COSMIC ORIGINS ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-4 font-display">
              STELLAR SEED
            </h2>
            <p className="text-[13px] text-foreground-muted leading-relaxed font-body mb-4">
              I grew up in Mumbai, surrounded by technology but always curious about what existed behind the screen. As a kid, I wasn’t just interested in using games or apps — I wanted to understand how entire digital worlds were created. That curiosity slowly became an obsession. Watching futuristic movies, exploring the internet late at night, and discovering how developers could turn imagination into reality became the first spark that pulled me into technology.
            </p>
            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3 italic py-0.5">
              "Coding wasn’t just programming — it was creation. It was the ability to build entire universes from nothing."
            </div>
          </div>
        </div>

        {/* Stage 2: Coalescence */}
        <div 
          className={`absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-24 py-12 z-30 transition-all duration-[1000ms] ease-out pointer-events-none
            ${activeStage === 1 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          <div className="max-w-2xl text-left bg-black/45 border border-white/5 p-6 md:p-8 rounded-lg backdrop-blur-md shadow-2xl relative select-text pointer-events-auto">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/10" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 02 // COALESCENCE — ACCRETION CORE ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-3 font-display">
              ACCRETION CORE
            </h2>
            <p className="text-[13px] text-foreground-muted leading-relaxed font-body mb-5">
              I started building my foundation through web development and gradually expanded into AI, backend systems, and modern software engineering. The first technologies I learned were HTML, CSS, JavaScript, and Python.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 font-mono text-[10px]">
              <div className="p-3 bg-white/5 border border-white/5 rounded transition-all hover:border-accent/40">
                <div className="text-accent-glow font-bold mb-1">// FRONTEND ARCHITECTURE</div>
                <div className="text-white/60">Cinematic UI/UX, responsive frames, modern JS, performance layers</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded transition-all hover:border-accent/40">
                <div className="text-accent-glow font-bold mb-1">// BACKEND & COMPUTE</div>
                <div className="text-white/60">Scalable backend engines, APIs, structural databases, Python routines</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded transition-all hover:border-accent/40">
                <div className="text-accent-glow font-bold mb-1">// AI INTEGRATION</div>
                <div className="text-white/60">Infusing smart pipelines, agentic workflows, dynamic reasoning</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded transition-all hover:border-accent/40">
                <div className="text-accent-glow font-bold mb-1">// DEV-OPS & PIPELINES</div>
                <div className="text-white/60">Automated builds, cloud networks, fast delivery infrastructure</div>
              </div>
            </div>

            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3 italic py-0.5">
              "Great engineering is not only about writing code — it’s about building experiences that feel alive."
            </div>
          </div>
        </div>

        {/* Stage 3: Trajectory */}
        <div 
          className={`absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-24 py-12 z-30 transition-all duration-[1000ms] ease-out pointer-events-none
            ${activeStage === 2 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          <div className="max-w-xl text-left bg-black/45 border border-white/5 p-6 md:p-8 rounded-lg backdrop-blur-md shadow-2xl relative select-text pointer-events-auto">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/10" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 03 // TRAJECTORY — DEEP SPACE FLIGHT ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-4 font-display">
              DEEP SPACE ORBIT
            </h2>
            <p className="text-[13px] text-foreground-muted leading-relaxed font-body mb-4">
              One of the defining parts of my journey has been building projects independently and constantly experimenting with ideas beyond traditional development. Instead of following only tutorials, I started designing original concepts that combined storytelling, visuals, and engineering.
            </p>
            <p className="text-[13px] text-foreground-muted leading-relaxed font-body mb-4">
              The biggest challenge was learning everything without a clear roadmap: balancing aesthetic design with structured development, understanding complex systems, improving consistency, and learning advanced technologies while still growing as a developer.
            </p>
            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3 italic py-0.5">
              "I learned how to adapt quickly, solve problems independently, and continue building even when things felt overwhelming."
            </div>
          </div>
        </div>

        {/* Stage 4: Atmospheric Entry */}
        <div 
          className={`absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-24 py-12 z-30 transition-all duration-[1000ms] ease-out pointer-events-none
            ${activeStage === 3 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          <div className="max-w-xl text-left bg-black/45 border border-white/5 p-6 md:p-8 rounded-lg backdrop-blur-md shadow-2xl relative select-text pointer-events-auto">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/10" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 04 // ENTRY — ATMOSPHERIC IGNITION ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-4 font-display">
              BURNING BRIGHT
            </h2>
            <p className="text-[13px] text-foreground-muted leading-relaxed font-body mb-4">
              One of the moments where I truly “burned bright” was when I began designing cinematic interactive experiences instead of normal websites. I pushed myself beyond standard portfolio design and started thinking like a creator building digital worlds.
            </p>
            <p className="text-[13px] text-foreground-muted leading-relaxed font-body mb-4">
              The universe portfolio concept became a major milestone because it merges 3D systems, storytelling, animation, immersive UI, engineering, and personal identity into a single entity.
            </p>
            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3 italic py-0.5">
              "Instead of just making something functional, I started building experiences people could emotionally remember."
            </div>
          </div>
        </div>

        {/* Stage 5: Impact & Metamorphosis */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center px-6 py-12 z-30 transition-all duration-[1000ms] ease-out pointer-events-none
            ${activeStage === 4 ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-16 scale-95 blur-md"}
          `}
        >
          <div className="max-w-2xl text-center bg-black/45 border border-white/5 p-6 md:p-8 rounded-lg backdrop-blur-md shadow-2xl relative select-text pointer-events-auto">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/10" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 05 // METAMORPHOSIS — LANDING SITE ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-3 font-display">
              THE IMPACT SITE
            </h2>
            <p className="text-[13px] text-foreground-muted leading-relaxed font-body mb-5 max-w-lg mx-auto">
              Right now, I’m building toward becoming a world-class engineer who merges AI, software engineering, cinematic design, and immersive digital experiences into one identity.
            </p>

            <div className="font-mono text-xs text-white tracking-widest uppercase border-y border-white/10 py-3 mb-6 max-w-md mx-auto text-glow text-accent-glow">
              "I want people to see technology not just as tools, but as universes waiting to be created."
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 font-mono text-[9px] text-left">
              <div className="p-3 bg-white/5 rounded border border-white/5">
                <span className="text-accent-glow font-bold block">// ACTIVE FOCUS</span>
                <span className="text-white/60">AI-powered applications, interactive 3D panels, scalable systems</span>
              </div>
              <div className="p-3 bg-white/5 rounded border border-white/5">
                <span className="text-accent-glow font-bold block">// BRAND VISION</span>
                <span className="text-white/60">A strong personal brand driven by creative visual coding</span>
              </div>
              <div className="p-3 bg-white/5 rounded border border-white/5">
                <span className="text-accent-glow font-bold block">// LEGACY AIM</span>
                <span className="text-white/60">Inspiring others to think bigger and build fearlessly</span>
              </div>
            </div>

            {/* Links and Actions */}
            <div className="flex justify-center gap-4">
              <a
                href={`mailto:${SITE_CONFIG.social.email}`}
                className="px-6 py-2.5 text-xs font-semibold rounded-full bg-foreground text-background transition-all duration-300 hover:scale-105 font-mono"
              >
                Initiate Contact
              </a>
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 text-xs font-semibold rounded-full border border-border/80 text-foreground transition-all duration-300 hover:border-foreground hover:scale-105 hover:bg-foreground/5 font-mono"
              >
                GitHub Profile
              </a>
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 text-xs font-semibold rounded-full border border-border/80 text-foreground transition-all duration-300 hover:border-foreground hover:scale-105 hover:bg-foreground/5 font-mono"
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
