"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Terminal, Radio } from "lucide-react";
import { audio } from "@/lib/audio";

interface CinematicLoaderProps {
  onComplete: () => void;
  onProgressChange?: (progress: number) => void;
}

export function CinematicLoader({ onComplete, onProgressChange }: CinematicLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("CALIBRATING SPACE TELEMETRY...");
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Progress counter (0% to 100% in 4.5 seconds)
    const duration = 4500;
    const intervalTime = 45;
    const increment = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        const boundedNext = Math.min(next, 100);
        if (next >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return boundedNext;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  // Safely propagate progress change to parent in a useEffect (post-render)
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress);
    }
  }, [progress, onProgressChange]);

  // Update status messages as progress ticks up
  useEffect(() => {
    if (progress < 25) {
      setStatusText("ALIGNING GRAVITATIONAL FIELDS...");
    } else if (progress < 50) {
      setStatusText("FORMING SOLAR COALESCENCE...");
    } else if (progress < 75) {
      setStatusText("IGNITING CENTRAL STAR CORE...");
    } else if (progress < 100) {
      setStatusText("GENERATING ORBITAL TRAJECTORIES...");
    } else {
      setStatusText("SYSTEM STANDBY: SECTOR READY.");
    }
  }, [progress]);

  const handleInitiate = () => {
    audio.startAmbientHum();
    audio.playClickSound();
    setIsFading(true);
    
    // Smooth transition fade-out duration
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isFading ? 0 : 1 }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
      className={`fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-between p-12 select-none font-mono
        ${isFading ? "pointer-events-none" : "pointer-events-auto"}
      `}
    >
      {/* Sci-fi HUD visor corners */}
      <div className="absolute inset-8 border border-white/5 pointer-events-none">
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-500/40" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-500/40" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-amber-500/40" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-500/40" />
      </div>

      {/* Header Info */}
      <div className="w-full flex justify-between text-[8px] text-white/30 tracking-[0.25em] z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-500/60 animate-pulse" />
          <span>PORTFOLIO_OS // V_3.5_FLASH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-amber-500/60 animate-pulse" />
          <span>COSMIC_LINK: ACTIVE</span>
        </div>
      </div>

      {/* Center Message */}
      <div className="flex flex-col items-center justify-center max-w-lg text-center z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="relative"
        >
          {/* Subtle gold radial background glow */}
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] blur-xl pointer-events-none" />
          
          <h1 className="text-xl md:text-2xl font-extrabold tracking-[0.3em] text-white uppercase text-glow-amber">
            CREATION TAKES TIME.
          </h1>
        </motion.div>

        {/* Enter Button vs Progress Bar */}
        <div className="h-16 flex items-center justify-center min-w-[280px]">
          {isReady ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInitiate}
              className="px-8 py-3.5 rounded border border-amber-500/50 bg-amber-500/5 text-amber-400 hover:text-white hover:bg-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer font-bold tracking-widest text-[10px] uppercase flex items-center gap-2 pointer-events-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:text-white animate-spin" />
              <span>INITIATE CREATIVE CYCLE</span>
            </motion.button>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              {/* Glowing progress slider bar */}
              <div className="w-64 h-[4px] bg-white/5 border border-white/10 rounded overflow-hidden relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] text-neutral-400 tracking-wider">
                {Math.round(progress)}% SECURE // {statusText}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer System Details */}
      <div className="w-full text-center text-[7px] text-neutral-500 tracking-[0.2em] font-mono z-10 uppercase">
        © 2026 AMEY SAWANT. ALL SYSTEM RIGHTS CONFIGURED. Sector: Mumbai_G205_In
      </div>
    </motion.div>
  );
}
