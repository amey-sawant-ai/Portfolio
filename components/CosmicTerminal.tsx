"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Terminal, X, Send, Play, Cpu, ShieldAlert, Sparkles } from "lucide-react";
import { audio } from "@/lib/audio";
import { PLANET_SPECS } from "./StoryCanvas";

interface CosmicTerminalProps {
  onWarp: (sector: string) => void;
  onClose: () => void;
  currentSection: string;
}

interface LogEntry {
  type: "input" | "output" | "error" | "system";
  text: string;
}

export function CosmicTerminal({ onWarp, onClose, currentSection }: CosmicTerminalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<LogEntry[]>([
    { type: "system", text: "PORTFOLIO_OS CORE COMMAND TELEMETRY V_3.5_FLASH ACTIVE." },
    { type: "system", text: "TYPE 'help' TO VIEW LIST OF COMMANDS REGISTERED IN THIS SHIELD LOG." },
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll terminal history to the bottom on updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = useMemo(() => {
    return {
      help: "Show available commands & descriptions.",
      status: "Get the current system resource stats, orbital levels, and active sections.",
      scan: "Perform a deep-space planetary coordinate analysis of this solar codespace.",
      warp: "Navigate/teleport coordinates: 'warp <planet_name>' (e.g., warp earth, warp mars).",
      creator: "Declassify developer profile logs.",
      logs: "Dump chronology index history segments.",
      clear: "Wipe console display buffer.",
      cls: "Wipe console display buffer."
    };
  }, []);

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    audio.playClickSound();

    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").toLowerCase();

    // Add user input to history
    const updatedHistory: LogEntry[] = [...history, { type: "input", text: `> ${trimmed}` }];

    switch (cmd) {
      case "help":
        updatedHistory.push({ type: "system", text: "--- REGISTERED CORE COMMAND MODULES ---" });
        Object.entries(commands).forEach(([name, desc]) => {
          updatedHistory.push({ type: "output", text: `${name.padEnd(10)} : ${desc}` });
        });
        break;

      case "clear":
      case "cls":
        setHistory([]);
        setInput("");
        return;

      case "status":
        const activeSector = currentSection.toUpperCase();
        updatedHistory.push({ type: "system", text: "--- PORTFOLIO_OS CURRENT SECTOR STATISTICS ---" });
        updatedHistory.push({ type: "output", text: `ACTIVE_SECTOR : ${activeSector === "HOME" ? "SYSTEM_OVERVIEW" : activeSector}` });
        updatedHistory.push({ type: "output", text: "SYSTEMS_LOAD : 42.8% STABLE" });
        updatedHistory.push({ type: "output", text: "COGNITIVE_AI : ONLINE // SWARM_ACTIVE" });
        updatedHistory.push({ type: "output", text: "COSMIC_FILTER : BIQUAD_LOWPASS // 90HZ" });
        updatedHistory.push({ type: "output", text: "SHIELD_GRID   : 100% OPERATIONAL" });
        break;

      case "scan":
        updatedHistory.push({ type: "system", text: "--- INITIATING PLANETARY RADAR SCAN ---" });
        Object.entries(PLANET_SPECS).forEach(([name, spec]) => {
          updatedHistory.push({ 
            type: "output", 
            text: `[PLANET: ${name.toUpperCase()}] Orbit Rad: ${spec.orbitRadius}px | Orbit Speed: ${spec.orbitSpeed} | Primary Color: ${spec.color}` 
          });
        });
        updatedHistory.push({ type: "system", text: "SCAN COMPLETED. ALL OBJECTS STABLE IN ROTATIONAL PATH." });
        break;

      case "creator":
        updatedHistory.push({ type: "system", text: "--- CREATOR DECLASSIFIED DOSSIER ---" });
        updatedHistory.push({ type: "output", text: "NAME      : AMEY SAWANT" });
        updatedHistory.push({ type: "output", text: "LOCATION  : MUMBAI, INDIA" });
        updatedHistory.push({ type: "output", text: "ROLE      : SOFTWARE ARCHITECT & CREATIVE TECHNOLOGIST" });
        updatedHistory.push({ type: "output", text: "PHILOSOPHY: fusing math, code structures, & digital physics." });
        break;

      case "logs":
        updatedHistory.push({ type: "system", text: "--- MISSION HISTORY SEQUENCE DUMPS ---" });
        updatedHistory.push({ type: "output", text: "Log_01: Scaled enterprise database query grids." });
        updatedHistory.push({ type: "output", text: "Log_02: Integrated 3D planetary rendering engines." });
        updatedHistory.push({ type: "output", text: "Log_03: Developed vector Reasoning AI Agent Swarms." });
        break;

      case "warp":
        if (!arg) {
          updatedHistory.push({ type: "error", text: "ERROR: WARP DESTINATION SPECIFIER MISSING. Try 'warp earth', 'warp mars', 'warp saturn', 'warp neptune', 'warp moon', 'warp sun', 'warp home'." });
        } else {
          const destinations: Record<string, string> = {
            earth: "projects",
            projects: "projects",
            mars: "experience",
            experience: "experience",
            saturn: "skills",
            skills: "skills",
            neptune: "contact",
            contact: "contact",
            moon: "resume",
            resume: "resume",
            sun: "about",
            about: "about",
            home: "home",
            system: "home",
            singularity: "easter-egg",
            "easter-egg": "easter-egg"
          };

          if (destinations[arg]) {
            const mappedSection = destinations[arg];
            updatedHistory.push({ type: "system", text: `WARP CORE INITIALIZED. INITIATING WARP TO SECTOR: ${arg.toUpperCase()}...` });
            onWarp(mappedSection);
          } else {
            updatedHistory.push({ type: "error", text: `ERROR: UNABLE TO ESTABLISH GRAVITATIONAL COORDINATES FOR '${arg.toUpperCase()}'. Check destination parameters.` });
          }
        }
        break;

      default:
        updatedHistory.push({ type: "error", text: `ERROR: COMMAND '${cmd.toUpperCase()}' NOT RECOGNIZED. Type 'help' to review catalog.` });
        break;
    }

    setHistory(updatedHistory);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Play light ticking sound for keypresses to feel retro/sci-fi
    if (e.key !== "Enter") {
      audio.playHoverSound();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-28 right-10 z-40 w-full max-w-lg h-[400px] border border-amber-500/30 bg-black/85 backdrop-blur-xl rounded shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col font-mono overflow-hidden pointer-events-auto"
    >
      {/* Title bar */}
      <div className="flex justify-between items-center border-b border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[9px] text-amber-500 tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>COSMIC_CLI_TERMINAL // MU_OS_7.0</span>
        </div>
        <button
          onClick={onClose}
          className="text-amber-500/50 hover:text-white p-1 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Buffer */}
      <div className="flex-1 overflow-y-auto p-4 text-[10px] space-y-2 scrollbar-thin select-text">
        {history.map((entry, idx) => {
          let color = "text-neutral-300";
          if (entry.type === "input") color = "text-amber-400 font-bold";
          else if (entry.type === "system") color = "text-amber-500/70 tracking-widest font-extrabold";
          else if (entry.type === "error") color = "text-red-500 font-semibold";
          
          return (
            <div key={idx} className={`${color} leading-relaxed whitespace-pre-wrap`}>
              {entry.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="border-t border-amber-500/20 bg-black/60 px-4 py-3 flex gap-2 items-center">
        <span className="text-[10px] text-amber-500 font-bold">&gt;_</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent border-none text-[10px] text-white focus:outline-none focus:ring-0 placeholder-amber-500/20 font-mono tracking-widest uppercase"
          placeholder="ENTER TELEMETRY COMMAND..."
          maxLength={60}
        />
        <button
          type="submit"
          className="text-amber-500/60 hover:text-white transition-colors p-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </motion.div>
  );
}
