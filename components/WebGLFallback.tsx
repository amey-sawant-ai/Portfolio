"use client";

/**
 * WebGLFallback
 * ==============
 * A pure CSS/Framer Motion fallback experience shown when the browser
 * cannot create a WebGL context (e.g. no GPU, software rendering disabled).
 *
 * Provides a fully navigable portfolio with animated cosmic backgrounds,
 * keeping the same section navigation as the 3D canvas experience.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import {
  Globe,
  Cpu,
  Briefcase,
  Mail,
  FileText,
  User,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { SectionOverlays } from "./SectionOverlays";

interface WebGLFallbackProps {
  activeSection: string;
  onPlanetClick: (section: string) => void;
}

/* ── Section metadata for navigation planets ── */
const SECTIONS = [
  { id: "about",      label: "THE CREATOR",  icon: User,       color: "#FF8C00", orbitDelay: 0 },
  { id: "projects",   label: "PROJECTS",     icon: Globe,      color: "#3B82F6", orbitDelay: 0.4 },
  { id: "skills",     label: "SKILLS",       icon: Cpu,        color: "#F59E0B", orbitDelay: 0.8 },
  { id: "experience", label: "EXPERIENCE",   icon: Briefcase,  color: "#DC2626", orbitDelay: 1.2 },
  { id: "contact",    label: "CONTACT",      icon: Mail,       color: "#06B6D4", orbitDelay: 1.6 },
  { id: "resume",     label: "RESUME",       icon: FileText,   color: "#9ca3af", orbitDelay: 2.0 },
];

/* ── Animated star dot for the background ── */
function Star({ index }: { index: number }) {
  const style = useMemo(() => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 0.5;
    const dur = Math.random() * 5 + 3;
    const delay = Math.random() * 4;
    return { x, y, size, dur, delay };
  }, []);

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        left: `${style.x}%`,
        top: `${style.y}%`,
        width: style.size,
        height: style.size,
      }}
      animate={{ opacity: [0.15, 0.7, 0.15] }}
      transition={{
        duration: style.dur,
        repeat: Infinity,
        delay: style.delay,
        ease: "easeInOut",
      }}
    />
  );
}

export function WebGLFallback({ activeSection, onPlanetClick }: WebGLFallbackProps) {
  const isHome = activeSection === "home";

  return (
    <div className="absolute inset-0 z-10 w-full h-full bg-[#020205] overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 120 }).map((_, i) => (
          <Star key={i} index={i} />
        ))}
      </div>

      {/* Radial ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.04) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(108,60,225,0.03) 0%, transparent 40%)",
        }}
      />

      {/* WebGL unavailable notice */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-full backdrop-blur-sm">
          <AlertTriangle className="w-3 h-3 text-amber-500/60" />
          <span className="text-[8px] text-amber-500/60 tracking-widest font-mono uppercase">
            WebGL Unavailable — 2D Fallback Mode Active
          </span>
        </div>
      </div>

      {/* ── HOME: Solar System Navigation ── */}
      <AnimatePresence mode="wait">
        {isHome ? (
          <motion.div
            key="home-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            {/* Central sun */}
            <motion.div
              className="relative mb-12"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="w-20 h-20 rounded-full relative z-10"
                style={{
                  background:
                    "radial-gradient(circle at 40% 35%, #fbbf24, #f59e0b, #d97706)",
                  boxShadow:
                    "0 0 30px rgba(245,158,11,0.6), 0 0 60px rgba(245,158,11,0.3), 0 0 120px rgba(245,158,11,0.1)",
                }}
              />
              <motion.div
                className="absolute -inset-6 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            {/* Planet nav grid */}
            <div className="grid grid-cols-3 gap-5 max-w-lg">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: section.orbitDelay, duration: 0.5 }}
                    whileHover={{
                      scale: 1.08,
                      boxShadow: `0 0 25px ${section.color}40`,
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onPlanetClick(section.id)}
                    className="flex flex-col items-center gap-3 p-5 rounded-lg border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-amber-500/30 transition-colors cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: `${section.color}15`,
                        boxShadow: `0 0 15px ${section.color}20`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5 transition-colors"
                        style={{ color: section.color }}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className="text-[9px] font-bold tracking-[0.2em] uppercase"
                        style={{ color: section.color }}
                      >
                        {section.label}
                      </span>
                      <span className="text-[7px] text-neutral-600 tracking-widest uppercase">
                        // ENTER SECTOR
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Instruction text */}
            <motion.div
              className="mt-10 flex items-center gap-2"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500/50" />
              <span className="text-[8px] text-neutral-500 tracking-[0.2em] uppercase font-mono">
                Select a sector to explore
              </span>
            </motion.div>
          </motion.div>
        ) : (
          <SectionOverlays
            activeSection={activeSection}
            onBack={() => onPlanetClick("home")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
