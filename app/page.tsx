"use client";

import { useState, useEffect, useRef } from "react";
import { SITE_CONFIG } from "@/constants";
import { CinematicLoader, StoryCanvas } from "@/components";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [coreTemp, setCoreTemp] = useState(25);
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  // Temperature ticker for Stage 4 (Atmospheric Entry)
  useEffect(() => {
    if (isLoading) return;

    if (activeStage === 3) {
      let start = 25;
      const interval = setInterval(() => {
        start += Math.floor(Math.random() * 140) + 75;
        if (start >= 3200) {
          start = 3200;
          clearInterval(interval);
        }
        setCoreTemp(start);
      }, 40);
      return () => clearInterval(interval);
    } else {
      setCoreTemp(25);
    }
  }, [activeStage, isLoading]);

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
        <style>{`
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes cyberGlow {
            0%, 100% { box-shadow: 0 0 5px rgba(0, 229, 255, 0.15), inset 0 0 5px rgba(0, 229, 255, 0.05); }
            50% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.45), inset 0 0 8px rgba(0, 229, 255, 0.15); border-color: rgba(0, 229, 255, 0.5); }
          }
          .hud-scanline {
            animation: scanline 9s linear infinite;
          }
          .cyber-reactor-node:hover {
            animation: cyberGlow 0.6s ease-in-out infinite alternate;
          }
        `}</style>

        {/* Background Visualizer Component */}
        <StoryCanvas activeStage={activeStage} />

        {/* Global Cinematic Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.85)_100%)] z-20 pointer-events-none" />

        {/* Visor Frame HUD corner boundaries */}
        <div className="fixed inset-6 border border-white/5 pointer-events-none z-30 select-none">
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent-glow" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent-glow" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-accent-glow" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent-glow" />
          
          {/* Subtle loop scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full hud-scanline opacity-[0.25]" />
        </div>

        {/* HUD Layout Container - Top Left (Brand Identity) */}
        <div className="fixed top-10 left-10 z-40 font-mono text-[10px] tracking-[0.25em] text-white/50 select-none flex flex-col gap-1">
          <span className="text-glow text-accent-glow font-bold">SYSTEM // AMEY_PORTFOLIO_CORE</span>
          <span className="opacity-45 text-[8px] tracking-widest text-white">SYS_CLEARANCE_LVL: 04 // CONNECTED</span>
        </div>

        {/* HUD Layout Container - Top Right (Active Slide Details) */}
        <div className="fixed top-10 right-10 z-40 font-mono text-[10px] tracking-[0.25em] text-white/50 text-right select-none flex flex-col gap-1">
          <span>COGNITIVE_PHASE: 0{activeStage + 1} / 05</span>
          <span className="text-[8px] text-accent font-bold tracking-widest opacity-85 uppercase">// METEORITE_CORE: STYLIZED</span>
        </div>

        {/* HUD Layout Container - Bottom Left (Navigation Instructions) */}
        <div className="fixed bottom-10 left-10 z-40 font-mono text-[9px] tracking-widest text-white/35 select-none hidden sm:flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>[SWIPE, MOUSE WHEEL OR SPACEBAR TO NAVIGATION CORE]</span>
        </div>

        {/* Right Sidebar Stage Indicators */}
        <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col gap-7 z-40 font-mono text-xs select-none">
          {[
            { id: 0, label: "01 // NEBULA", tag: "SEED" },
            { id: 1, label: "02 // COALESCENCE", tag: "ACC" },
            { id: 2, label: "03 // TRAJECTORY", tag: "VOID" },
            { id: 3, label: "04 // ENTRY", tag: "HEAT" },
            { id: 4, label: "05 // IMPACT", tag: "SITE" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveStage(item.id)}
              className="flex items-center gap-3 text-right justify-end group transition-all duration-300 pointer-events-auto cursor-pointer focus:outline-none"
            >
              <span className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] tracking-widest text-accent-glow ${activeStage === item.id ? "opacity-100 text-accent font-bold" : ""}`}>
                {item.label}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full border border-white/20 transition-all duration-300 ${activeStage === item.id ? "bg-accent-glow border-accent shadow-[0_0_8px_rgba(0,229,255,0.7)] scale-150" : "bg-white/10 group-hover:bg-white/40"}`} />
            </button>
          ))}
        </div>

        {/* ---------------- SLIDE CONTENT OVERLAYS ---------------- */}

        {/* Stage 1: The Nebula */}
        <div 
          className={`absolute inset-0 flex flex-col md:flex-row items-center justify-between px-10 md:px-32 py-24 z-30 transition-all duration-[1000ms] ease-out pointer-events-none gap-10
            ${activeStage === 0 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          {/* Text block */}
          <div className="max-w-xl text-left bg-black/55 border border-white/10 p-7 md:p-9 rounded bg-[#010103]/60 backdrop-blur-md shadow-2xl relative select-text pointer-events-auto md:w-3/5">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/20" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/20" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 01 // THE NEBULA — STELLAR CORE ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-4 font-display uppercase">
              STELLAR SEED
            </h2>
            <div className="text-[13px] text-foreground-muted leading-relaxed font-body mb-5 space-y-3">
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[ORIGIN]</span>
                Mumbai-born. Early curiosity for what happens behind the screen evolved into a passion for software design.
              </p>
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[MISSION]</span>
                Inspired by the web and science fiction, I set out to master the tools that turn code into interactive universes.
              </p>
            </div>
            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3.5 italic py-0.5">
              "Coding wasn’t just programming — it was creation. It was the ability to build entire universes from nothing."
            </div>
          </div>

          {/* Interactive Reactor Core */}
          <div className="flex flex-col items-center justify-center pointer-events-auto md:w-2/5 select-none">
            <div className="font-mono text-[8px] text-white/30 tracking-widest uppercase mb-2">
              // IMAGINATION CORE INTEGRITY
            </div>
            <div className="grid grid-cols-3 gap-2 w-[180px] h-[180px] border border-white/10 p-2 rounded bg-black/45 backdrop-blur relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-accent-glow" />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-accent-glow" />
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-full border border-white/5 rounded flex items-center justify-center transition-all duration-300 bg-white/5 hover:bg-accent-glow/20 hover:scale-105 cursor-crosshair cyber-reactor-node"
                >
                  <div className="w-2 h-2 rounded-full bg-accent-glow/30 border border-accent-glow animate-pulse" />
                </div>
              ))}
            </div>
            <div className="font-mono text-[8px] text-accent-glow tracking-wide mt-2 animate-pulse">
              [ HOVER TO ACCELERATE INDUCTION ]
            </div>
          </div>
        </div>

		{/* Stage 2: Coalescence */}
        <div 
          className={`absolute inset-0 flex items-center justify-center md:justify-start px-10 md:px-32 py-24 z-30 transition-all duration-[1000ms] ease-out pointer-events-none
            ${activeStage === 1 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          <div className="max-w-2xl text-left bg-black/55 border border-white/10 p-7 md:p-9 rounded bg-[#010103]/60 backdrop-blur-md shadow-2xl relative select-text pointer-events-auto">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/20" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/20" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 02 // COALESCENCE — ACCRETION CORE ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-3 font-display uppercase">
              ACCRETION CORE
            </h2>
            <div className="text-[13px] text-foreground-muted leading-relaxed font-body mb-5 space-y-2">
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[COALESCE]</span>
                Consolidated core capabilities across full-stack frameworks, Python, and scalable backend architectures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 font-mono text-[10px]">
              {[
                { name: "FRONTEND ARCHITECTURE", pct: "95%", desc: "Cinematic UI/UX, responsive frames, modern JS modules" },
                { name: "BACKEND & SCALABLE COMPUTE", pct: "90%", desc: "Highly structured API engines, Python, db optimizations" },
                { name: "INTEGRATED AI SYSTEMS", pct: "85%", desc: "Agentic workflow configurations, reasoning models" },
                { name: "DEV-OPS & PIPELINE NETWORKS", pct: "80%", desc: "Automated delivery configurations, secure cloud loops" }
              ].map((skill, idx) => (
                <div key={idx} className="p-3.5 bg-white/5 border border-white/5 rounded transition-all hover:border-accent/40">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-accent-glow tracking-wider">{skill.name}</span>
                    <span className="text-accent">{skill.pct}</span>
                  </div>
                  {/* Animating skill diagnostic bar */}
                  <div className="w-full h-1 bg-white/5 rounded overflow-hidden mt-1.5 mb-1.5 border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-accent-glow rounded transition-all duration-[1500ms] ease-out"
                      style={{ width: activeStage === 1 ? skill.pct : "0%" }}
                    />
                  </div>
                  <div className="text-white/50 text-[8.5px] tracking-wide leading-relaxed">{skill.desc}</div>
                </div>
              ))}
            </div>

            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3 italic py-0.5">
              "Great engineering is not only about writing code — it’s about building experiences that feel alive."
            </div>
          </div>
        </div>

        {/* Stage 3: Trajectory */}
        <div 
          className={`absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-between px-10 md:px-32 py-24 z-30 transition-all duration-[1000ms] ease-out pointer-events-none gap-10
            ${activeStage === 2 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          <div className="max-w-xl text-left bg-black/55 border border-white/10 p-7 md:p-9 rounded bg-[#010103]/60 backdrop-blur-md shadow-2xl relative select-text pointer-events-auto md:w-3/5">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/20" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/20" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 03 // TRAJECTORY — DEEP SPACE FLIGHT ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-4 font-display uppercase">
              DEEP SPACE ORBIT
            </h2>
            <div className="text-[13px] text-foreground-muted leading-relaxed font-body mb-5 space-y-3">
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[TRAJECTORY]</span>
                Moved beyond tutorials to build self-guided, highly visual products. Explored the space where art merges with clean algorithms.
              </p>
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[CHALLENGE]</span>
                Mastered system integration, visual physics, and backend stability without a map.
              </p>
            </div>
            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3.5 italic py-0.5">
              "I learned how to adapt quickly, solve problems independently, and continue building even when things felt overwhelming."
            </div>
          </div>

          {/* Interactive Trajectory Radar Dial */}
          <div className="flex flex-col items-center justify-center pointer-events-auto md:w-2/5 select-none">
            <div className="font-mono text-[8px] text-white/30 tracking-widest uppercase mb-3">
              // TELEMETRY LOCK COMPASS
            </div>
            <div className="w-36 h-36 rounded-full border border-white/10 relative flex items-center justify-center animate-[spin_12s_linear_infinite] bg-black/30 backdrop-blur shadow-xl">
              <span className="absolute inset-0 rounded-full border border-accent-glow/10 animate-pulse" />
              <div className="absolute top-0 w-[1px] h-full bg-accent-glow/20" />
              <div className="absolute left-0 h-[1px] w-full bg-accent-glow/20" />
              <div className="w-28 h-28 rounded-full border border-accent/25 border-dashed" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-glow absolute top-4 left-1/2 -translate-x-1/2 shadow-[0_0_8px_var(--glow-secondary)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent-warm absolute bottom-6 right-1/2 translate-x-1/2 opacity-70" />
            </div>
            <div className="font-mono text-[8px] text-accent-glow mt-3">
              GRID: SECTOR_07B // LOCK_ON: SECURE
            </div>
          </div>
        </div>

        {/* Stage 4: Atmospheric Entry */}
        <div 
          className={`absolute inset-0 flex flex-col md:flex-row items-center justify-between px-10 md:px-32 py-24 z-30 transition-all duration-[1000ms] ease-out pointer-events-none gap-10
            ${activeStage === 3 ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-16 blur-md"}
          `}
        >
          <div className="max-w-xl text-left bg-black/55 border border-white/10 p-7 md:p-9 rounded bg-[#010103]/60 backdrop-blur-md shadow-2xl relative select-text pointer-events-auto md:w-3/5">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/20" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/20" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 04 // ENTRY — ATMOSPHERIC IGNITION ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-4 font-display uppercase">
              BURNING BRIGHT
            </h2>
            <div className="text-[13px] text-foreground-muted leading-relaxed font-body mb-5 space-y-3">
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[ATMOSPHERE]</span>
                Shifted focus to rich, high-fidelity interactive interfaces. Began crafting high-performance, memorable user journeys.
              </p>
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[MILESTONE]</span>
                Merged 3D physics, real-time shaders, and immersive HUD controls into a single digital narrative.
              </p>
            </div>
            <div className="font-mono text-[11px] text-accent border-l-2 border-accent pl-3.5 italic py-0.5">
              "Instead of just making something functional, I started building experiences people could emotionally remember."
            </div>
          </div>

          {/* Core Thermals Dashboard Widget */}
          <div className="flex flex-col items-center justify-start pt-12 md:pt-20 pointer-events-auto md:w-2/5 select-none w-full">
            <div className="w-full max-w-sm border border-white/10 rounded-lg p-5 bg-[#010103]/60 backdrop-blur shadow-2xl font-mono relative">
              <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-accent-warm" />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-accent-warm" />
              
              <div className="flex justify-between text-[9px] text-white/40 mb-2 uppercase tracking-wider">
                <span>CORE THERMALS SCAN</span>
                <span className="text-accent-warm font-bold">{coreTemp}°C</span>
              </div>
              
              <div className="relative w-full h-[8px] bg-white/5 rounded border border-white/10 overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-accent via-accent-warm to-red-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(239,68,68,0.7)] rounded"
                  style={{ width: `${(coreTemp / 3200) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-[7.5px] text-white/50 uppercase tracking-widest">
                <span>STAGE: IGNITION_HEAT</span>
                <span>STATUS: OVERLOAD LIMIT</span>
              </div>
              
              <div className="border-t border-white/5 pt-3 mt-3 text-[7.5px] text-white/40 uppercase tracking-wider flex flex-col gap-1 leading-relaxed">
                <div>&gt; RADAR_TEMP: STABLE_WARP</div>
                <div className={coreTemp >= 2500 ? "text-accent-warm animate-pulse font-bold" : ""}>
                  &gt; CORE STATE: {coreTemp >= 3200 ? "MAX CRITICAL IGNITION OK" : "HEATING CORE MATRIX..."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage 5: Impact & Metamorphosis */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center px-10 py-24 z-30 transition-all duration-[1000ms] ease-out pointer-events-none
            ${activeStage === 4 ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-16 scale-95 blur-md"}
          `}
        >
          <div className="max-w-2xl text-center bg-black/55 border border-white/10 p-7 md:p-9 rounded bg-[#010103]/60 backdrop-blur-md shadow-2xl relative select-text pointer-events-auto">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/20" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/20" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20" />

            <div className="font-mono text-[9px] tracking-widest text-accent-glow mb-1 uppercase">
              [ STAGE 05 // METAMORPHOSIS — LANDING SITE ]
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient text-glow mb-3 font-display uppercase">
              THE IMPACT SITE
            </h2>
            <div className="text-[13px] text-foreground-muted leading-relaxed font-body mb-5 max-w-lg mx-auto space-y-2">
              <p>
                <span className="text-accent-glow font-bold mr-1.5">[METAMORPHOSIS]</span>
                Forging ahead to build premium software that brings together agentic workflows, clean architecture, and cinematic interfaces.
              </p>
            </div>

            <div className="font-mono text-xs text-white tracking-widest uppercase border-y border-white/10 py-3 mb-6 max-w-md mx-auto text-glow text-accent-glow">
              "I want people to see technology not just as tools, but as universes waiting to be created."
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7 font-mono text-[9px] text-left">
              <div className="p-3.5 bg-white/5 rounded border border-white/5 hover:border-accent-glow/30 transition-all">
                <span className="text-accent-glow font-bold block mb-1 uppercase tracking-wider">// ACTIVE FOCUS</span>
                <span className="text-white/60 leading-relaxed">AI-powered applications, interactive 3D panels, scalable systems</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded border border-white/5 hover:border-accent-glow/30 transition-all">
                <span className="text-accent-glow font-bold block mb-1 uppercase tracking-wider">// BRAND VISION</span>
                <span className="text-white/60 leading-relaxed">A strong personal brand driven by creative visual coding</span>
              </div>
              <div className="p-3.5 bg-white/5 rounded border border-white/5 hover:border-accent-glow/30 transition-all">
                <span className="text-accent-glow font-bold block mb-1 uppercase tracking-wider">// LEGACY AIM</span>
                <span className="text-white/60 leading-relaxed">Inspiring others to think bigger and build fearlessly</span>
              </div>
            </div>

            {/* Links and Actions */}
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href={`mailto:${SITE_CONFIG.social.email}`}
                className="group relative px-6 py-2.5 text-xs font-semibold rounded-full bg-foreground text-background transition-all duration-300 hover:scale-105 font-mono overflow-hidden"
              >
                <span className="relative z-10">Initiate Contact</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/20 transition-transform duration-300" />
              </a>
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 text-xs font-semibold rounded-full border border-border/80 text-foreground transition-all duration-300 hover:border-foreground hover:scale-105 hover:bg-white/5 font-mono"
              >
                GitHub Profile
              </a>
              <a
                href={SITE_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 text-xs font-semibold rounded-full border border-border/80 text-foreground transition-all duration-300 hover:border-foreground hover:scale-105 hover:bg-white/5 font-mono"
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
