"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Volume2, VolumeX, Maximize2, Radio, Activity, ArrowLeft } from "lucide-react";
import { CinematicLoader } from "@/components";
import { audio } from "@/lib/audio";

// Dynamically import Three.js StoryCanvas to disable Next.js SSR
const StoryCanvas = dynamic(
  () => import("@/components/StoryCanvas").then((mod) => mod.StoryCanvas),
  { ssr: false }
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const [isMuted, setIsMuted] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ ra: "0000", dec: "0000" });
  const [mounted, setMounted] = useState(false);
  const [narratorSubtitle, setNarratorSubtitle] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track active section to trigger deep space narrative subtitles & SpeechSynthesis
  useEffect(() => {
    if (activeSection === "home") {
      setNarratorSubtitle("");
      return;
    }

    const narrationScript: Record<string, string> = {
      about: "I create worlds through code.",
      projects: "These are the worlds I have built.",
      skills: "The tools used to shape this universe.",
      experience: "Every world begins with a journey.",
      contact: "Open a communication channel.",
      resume: "The records of this universe.",
      "easter-egg": "CRITICAL ERROR: Warp core singularity initialized."
    };

    const text = narrationScript[activeSection] || "";
    setNarratorSubtitle(text);

    if (text) {
      audio.speakNarrative(text);
    }
  }, [activeSection]);

  // Track mouse coordinates to simulate astronomical RA/DEC coordinates on the HUD
  useEffect(() => {
    if (isLoading) return;

    const handleMouseMove = (e: MouseEvent) => {
      const raVal = Math.round((e.clientX / window.innerWidth) * 3600)
        .toString()
        .padStart(4, "0");
      const decVal = Math.round((e.clientY / window.innerHeight) * 1800)
        .toString()
        .padStart(4, "0");
      setMouseCoords({ ra: raVal, dec: decVal });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLoading]);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  const handlePlanetClick = (section: string) => {
    audio.playWarpSound();
    setActiveSection(section);
  };

  const handleBackToHome = () => {
    audio.playWarpOutSound();
    setActiveSection("home");
  };

  const handleToggleMute = () => {
    const newMuted = audio.toggleMute();
    setIsMuted(newMuted);
  };

  // Prevent SSR Hydration errors
  if (!mounted) {
    return <div className="min-h-screen bg-[#020205]" />;
  }

  // Get segment indicators for top-right HUD based on current planet
  const getSectionDetails = () => {
    switch (activeSection) {
      case "about":
        return { phase: "01 // SOLAR_CORE", name: "THE CREATOR" };
      case "projects":
        return { phase: "02 // EARTH_ORBIT", name: "PROJECTS WORLD" };
      case "skills":
        return { phase: "03 // SATURN_RINGS", name: "SKILLS WORLD" };
      case "experience":
        return { phase: "04 // MARS_CRATER", name: "EXPERIENCE WORLD" };
      case "contact":
        return { phase: "05 // NEPTUNE_VOID", name: "CONTACT WORLD" };
      case "resume":
        return { phase: "06 // LUNAR_FIELD", name: "RESUME WORLD" };
      case "easter-egg":
        return { phase: "99 // SINGULARITY", name: "WARP CORE" };
      default:
        return { phase: "00 // CODESPACE", name: "SYSTEM OVERVIEW" };
    }
  };

  const hudDetails = getSectionDetails();

  return (
    <>
      {/* 1. Cinematic Universe Loading Screen */}
      {isLoading && (
        <CinematicLoader
          onComplete={handleLoaderComplete}
          onProgressChange={setLoaderProgress}
        />
      )}

      {/* 2. Main Space Cinematic Application */}
      <main
        className={`relative min-h-screen w-full bg-[#020205] overflow-hidden select-none font-mono transition-opacity duration-1000 ease-out
          ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}
        `}
      >
        {/* Ambient background vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] z-20 pointer-events-none" />

        {/* Global HUD Cybernetic Frame Corners */}
        <div className="fixed inset-6 border border-white/5 pointer-events-none z-20 select-none">
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-500/30" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-500/30" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-amber-500/30" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-500/30" />
          
          {/* Loop horizontal scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/3 to-transparent h-[12px] w-full animate-[scanline_10s_linear_infinite] opacity-[0.2]" />
        </div>

        {/* HUD: Top-Left Brand Logo Info */}
        <div className="fixed top-10 left-10 z-35 flex flex-col gap-0.5 select-none text-left">
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-white text-glow-amber">
            AMEY_SAWANT // CREATOR_CORE
          </span>
          <span className="text-[7.5px] text-neutral-500 tracking-wider">
            SYS_SEC_CLEARANCE: LVL_09 // MU_IN_99
          </span>
        </div>

        {/* HUD: Top-Right Sector Tracking Info */}
        <div className="fixed top-10 right-10 z-35 flex flex-col gap-0.5 select-none text-right">
          <span className="text-[9.5px] font-bold text-amber-500 tracking-widest">
            {hudDetails.phase}
          </span>
          <span className="text-[7.5px] text-neutral-400 tracking-widest uppercase">
            // SECTOR: {hudDetails.name}
          </span>
        </div>

        {/* HUD: Bottom-Left Interactive Controls (Audio Toggle & Grid Readout) */}
        <div className="fixed bottom-10 left-10 z-35 flex items-center gap-6 select-none pointer-events-auto">
          {/* Audio toggle button */}
          <button
            onClick={handleToggleMute}
            className="p-2.5 rounded-full border border-white/10 hover:border-amber-500/40 text-neutral-400 hover:text-amber-400 bg-black/40 backdrop-blur transition-all cursor-pointer shadow-glow-hover"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <div className="flex flex-col gap-0.5 text-left font-mono">
            <span className="text-[8px] text-neutral-400 tracking-widest flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
              TELEMETRY: ACTIVE
            </span>
            <span className="text-[7.5px] text-neutral-500 tracking-wide">
              RA: {mouseCoords.ra} / DEC: {mouseCoords.dec}
            </span>
          </div>
        </div>

        {/* HUD: Bottom-Right Controls (Navigation Helpers & Active Sector Back Button) */}
        <div className="fixed bottom-10 right-10 z-35 flex items-center gap-4 select-none pointer-events-auto">
          {activeSection !== "home" ? (
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 px-5 py-2 border border-amber-500/40 text-amber-400 hover:text-white bg-amber-500/5 hover:bg-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer font-bold tracking-widest text-[9px] uppercase rounded"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN_TO_SYSTEM</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-[8px] text-neutral-400 tracking-wider">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-ping" />
              <span>[ CLICK PLANETS TO ENTER 3D EXPLORABLE DIMENSIONS ]</span>
            </div>
          )}
        </div>

        {/* HUD: Bottom-Center Creator Voice Subtitles */}
        {activeSection !== "home" && narratorSubtitle && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-35 max-w-xl text-center select-none pointer-events-none">
            <div className="bg-black/90 border border-amber-500/25 px-8 py-3 rounded shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-md">
              <span className="text-[7px] text-amber-500 font-extrabold tracking-[0.25em] block mb-1">
                // CREATOR_NARRATION
              </span>
              <p className="text-[10px] text-white tracking-[0.12em] uppercase leading-relaxed font-mono animate-pulse">
                &ldquo;{narratorSubtitle}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* 3. Three.js / React Three Fiber Scene Component */}
        <StoryCanvas
          activeSection={activeSection}
          onPlanetClick={handlePlanetClick}
          loaderProgress={loaderProgress}
        />
      </main>

      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .text-glow-amber {
          text-shadow: 0 0 8px rgba(245, 158, 11, 0.4), 0 0 20px rgba(245, 158, 11, 0.15);
        }
        .shadow-glow-hover:hover {
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
        }
        /* Custom scrollbar for HUD panels */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.25);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.45);
        }
      `}</style>
    </>
  );
}
