"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Radio, Zap } from "lucide-react";
import { audio } from "@/lib/audio";

interface CinematicLoaderProps {
  onComplete: () => void;
  onProgressChange?: (progress: number) => void;
}

/* ─── Orbital Particle Dot ────────────────────────────────────────────── */
function OrbitalParticle({
  radius,
  duration,
  delay,
  size,
  color,
}: {
  radius: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}`,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
      // Place particle on orbit using CSS transform-origin offset
      // We offset the transform origin to place it on the orbital ring
    >
      <motion.div
        style={{
          position: "absolute",
          top: -radius,
          left: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 ${size * 4}px ${color}`,
        }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
    </motion.div>
  );
}

/* ─── Floating Ambient Particle ───────────────────────────────────────── */
function FloatingParticle({ index }: { index: number }) {
  const style = useMemo(() => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 1;
    const dur = Math.random() * 4 + 3;
    const delay = Math.random() * 3;
    return { x, y, size, dur, delay };
  }, []);

  return (
    <motion.div
      className="absolute rounded-full bg-amber-500/30"
      style={{
        left: `${style.x}%`,
        top: `${style.y}%`,
        width: style.size,
        height: style.size,
      }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [0, -30, -60],
        scale: [0.5, 1.2, 0],
      }}
      transition={{
        duration: style.dur,
        repeat: Infinity,
        delay: style.delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Status Messages ─────────────────────────────────────────────────── */
const STATUS_MESSAGES = [
  { threshold: 0, text: "CALIBRATING SPACE TELEMETRY..." },
  { threshold: 15, text: "ALIGNING GRAVITATIONAL FIELDS..." },
  { threshold: 30, text: "FORMING SOLAR COALESCENCE..." },
  { threshold: 50, text: "IGNITING CENTRAL STAR CORE..." },
  { threshold: 70, text: "GENERATING ORBITAL TRAJECTORIES..." },
  { threshold: 85, text: "STABILIZING WARP MATRIX..." },
  { threshold: 100, text: "SYSTEM STANDBY: SECTOR READY." },
];

export function CinematicLoader({ onComplete, onProgressChange }: CinematicLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [showWarpFlash, setShowWarpFlash] = useState(false);

  // Typewriter runs entirely outside React state to avoid render cascades.
  // We write directly to the DOM via a ref.
  const typewriterSpanRef = useRef<HTMLSpanElement | null>(null);
  const typewriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStatusRef = useRef("");

  // Resolve the current status message from progress thresholds
  const statusText = useMemo(() => {
    let text = STATUS_MESSAGES[0].text;
    for (const msg of STATUS_MESSAGES) {
      if (progress >= msg.threshold) text = msg.text;
    }
    return text;
  }, [progress]);

  // Typewriter effect — writes directly to DOM, zero React re-renders
  useEffect(() => {
    if (statusText === lastStatusRef.current) return;
    lastStatusRef.current = statusText;

    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }

    const span = typewriterSpanRef.current;
    if (!span) return;

    span.textContent = "";
    let i = 0;
    typewriterIntervalRef.current = setInterval(() => {
      i++;
      span.textContent = statusText.slice(0, i);
      if (i >= statusText.length) {
        if (typewriterIntervalRef.current) {
          clearInterval(typewriterIntervalRef.current);
          typewriterIntervalRef.current = null;
        }
      }
    }, 25);

    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
    };
  }, [statusText]);

  // Progress counter (0% to 100% in ~4.5 seconds)
  // Uses a ref for the callback to avoid re-render cascades with the parent.
  const onProgressChangeRef = useRef(onProgressChange);
  onProgressChangeRef.current = onProgressChange;

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const duration = 4500;
    const intervalTime = 40;
    const increment = 100 / (duration / intervalTime);
    let current = 0;

    progressIntervalRef.current = setInterval(() => {
      current = Math.min(current + increment, 100);
      setProgress(current);

      // Propagate to parent via ref (avoids effect-based cascade)
      onProgressChangeRef.current?.(current);

      if (current >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  // Detect completion separately — pure reaction to progress state
  useEffect(() => {
    if (progress >= 100 && !isReady) {
      setIsReady(true);
    }
  }, [progress, isReady]);

  const handleInitiate = useCallback(() => {
    audio.startAmbientHum();
    audio.playClickSound();
    setShowWarpFlash(true);

    setTimeout(() => {
      setIsFading(true);
    }, 400);

    setTimeout(() => {
      onComplete();
    }, 2200);
  }, [onComplete]);

  // Number of ambient particles
  const particleCount = 40;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isFading ? 0 : 1 }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
      className={`fixed inset-0 z-50 bg-[#020205] flex flex-col items-center justify-between select-none font-mono overflow-hidden
        ${isFading ? "pointer-events-none" : "pointer-events-auto"}
      `}
    >
      {/* ── Warp Flash Overlay ── */}
      <AnimatePresence>
        {showWarpFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 0] }}
            transition={{ duration: 1.5, times: [0, 0.1, 0.3, 1] }}
            className="absolute inset-0 z-50 bg-amber-500/20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.05) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Ambient Floating Particles ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: particleCount }).map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}
      </div>

      {/* ── Subtle Radial Background ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.03) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(108,60,225,0.02) 0%, transparent 40%)",
        }}
      />

      {/* ── HUD Visor Corners ── */}
      <div className="absolute inset-8 border border-white/[0.03] pointer-events-none z-10">
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500/30" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500/30" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500/30" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500/30" />

        {/* Corner accent dots */}
        <span className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-amber-500/40" />
        <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-amber-500/40" />
        <span className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-amber-500/40" />
        <span className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-amber-500/40" />
      </div>

      {/* ── Header Info Bar ── */}
      <div className="w-full flex justify-between items-center text-[8px] text-white/25 tracking-[0.25em] z-20 px-12 pt-12">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-500/50 animate-pulse" />
          <span>PORTFOLIO_OS // V_3.5_FLASH</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {/* Animated signal bars */}
            {[1, 2, 3, 4].map((bar) => (
              <motion.div
                key={bar}
                className="w-[2px] bg-amber-500/40 rounded-full"
                style={{ height: bar * 3 + 2 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: bar * 0.15,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-500/50 animate-pulse" />
            <span>COSMIC_LINK: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CENTER PIECE — Orbital Ring System + Core Star
          ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center z-20 w-full max-w-2xl">
        {/* Orbital Ring System */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Glow backdrop */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 280,
              height: 280,
              background:
                "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Outer Ring */}
          <motion.div
            className="absolute border border-amber-500/10 rounded-full"
            style={{ width: 240, height: 240 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {/* Ring particles */}
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/60"
              style={{
                top: -3,
                left: "50%",
                marginLeft: -3,
                boxShadow: "0 0 8px rgba(245,158,11,0.6)",
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-1 h-1 rounded-full bg-amber-300/40"
              style={{
                bottom: -2,
                left: "50%",
                marginLeft: -2,
                boxShadow: "0 0 6px rgba(245,158,11,0.4)",
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
          </motion.div>

          {/* Middle Ring */}
          <motion.div
            className="absolute border border-amber-500/15 rounded-full"
            style={{ width: 170, height: 170 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-amber-300/70"
              style={{
                top: -4,
                left: "50%",
                marginLeft: -4,
                boxShadow: "0 0 12px rgba(245,158,11,0.7)",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-1 h-1 rounded-full bg-amber-200/50"
              style={{
                left: -2,
                top: "50%",
                marginTop: -2,
                boxShadow: "0 0 8px rgba(245,158,11,0.5)",
              }}
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
            />
          </motion.div>

          {/* Inner Ring */}
          <motion.div
            className="absolute border border-amber-500/20 rounded-full"
            style={{ width: 100, height: 100 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-200/80"
              style={{
                top: -3,
                left: "50%",
                marginLeft: -3,
                boxShadow: "0 0 10px rgba(245,158,11,0.8)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* ── Central Star Core ── */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ scale: isReady ? [1, 1.15, 1] : 1 }}
            transition={{
              duration: 1.5,
              repeat: isReady ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            {/* Core glow layers */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 60,
                height: 60,
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 40,
                height: 40,
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 60%)",
                filter: "blur(6px)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Solid star core */}
            <motion.div
              className="w-5 h-5 rounded-full relative z-10"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, #fbbf24, #f59e0b, #d97706)",
                boxShadow:
                  "0 0 15px rgba(245,158,11,0.8), 0 0 30px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.15)",
              }}
              animate={{
                boxShadow: isReady
                  ? [
                      "0 0 15px rgba(245,158,11,0.8), 0 0 30px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.15)",
                      "0 0 25px rgba(245,158,11,1), 0 0 50px rgba(245,158,11,0.6), 0 0 80px rgba(245,158,11,0.3)",
                      "0 0 15px rgba(245,158,11,0.8), 0 0 30px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.15)",
                    ]
                  : undefined,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Circular progress arc around the outer ring */}
          <svg
            className="absolute"
            width="260"
            height="260"
            viewBox="0 0 260 260"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Track */}
            <circle
              cx="130"
              cy="130"
              r="125"
              fill="none"
              stroke="rgba(245,158,11,0.05)"
              strokeWidth="1.5"
            />
            {/* Progress arc */}
            <motion.circle
              cx="130"
              cy="130"
              r="125"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 125}
              strokeDashoffset={2 * Math.PI * 125 * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 0.15s ease-out" }}
            />
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative text-center mb-8"
        >
          <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)] blur-lg pointer-events-none" />
          <h1 className="text-lg md:text-xl font-extrabold tracking-[0.35em] text-white uppercase text-glow-amber">
            CREATION TAKES TIME.
          </h1>
          <p className="text-[9px] text-neutral-500 tracking-[0.2em] mt-2 uppercase">
            Preparing your cosmic experience
          </p>
        </motion.div>

        {/* ── Progress / Enter Button ── */}
        <div className="h-20 flex items-center justify-center min-w-[320px]">
          <AnimatePresence mode="wait">
            {isReady ? (
              <motion.button
                key="enter-btn"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2 }}
                whileHover={{
                  scale: 1.06,
                  boxShadow:
                    "0 0 30px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.15)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={handleInitiate}
                className="relative px-10 py-4 rounded-md border border-amber-500/40 bg-amber-500/5 text-amber-400 hover:text-white hover:bg-amber-500/90 transition-colors cursor-pointer font-bold tracking-[0.2em] text-[10px] uppercase flex items-center gap-3 pointer-events-auto overflow-hidden group"
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <Zap className="w-4 h-4 relative z-10" />
                <span className="relative z-10">INITIATE CREATIVE CYCLE</span>
                <Sparkles className="w-4 h-4 relative z-10 animate-pulse" />
              </motion.button>
            ) : (
              <motion.div
                key="progress-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center gap-4"
              >
                {/* Progress bar container */}
                <div className="relative w-72">
                  {/* Track */}
                  <div className="w-full h-[3px] bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                    {/* Fill */}
                    <motion.div
                      className="h-full rounded-full relative"
                      style={{
                        width: `${progress}%`,
                        background:
                          "linear-gradient(90deg, #92400e, #d97706, #f59e0b, #fbbf24)",
                        transition: "width 0.15s ease-out",
                      }}
                    >
                      {/* Glowing tip */}
                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{
                          background: "#fbbf24",
                          boxShadow:
                            "0 0 8px rgba(251,191,36,0.9), 0 0 20px rgba(245,158,11,0.5)",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Percentage readout */}
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-amber-500/70 tracking-widest font-bold">
                      {Math.round(progress).toString().padStart(3, "0")}%
                    </span>
                    <span className="text-[8px] text-neutral-500 tracking-wider">
                      SECURE
                    </span>
                  </div>
                </div>

                {/* Typewriter status text */}
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-1 h-1 rounded-full bg-amber-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <span className="text-[9px] text-neutral-400 tracking-wider font-mono">
                    <span ref={typewriterSpanRef} />
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-amber-500"
                    >
                      █
                    </motion.span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="w-full flex justify-between items-center px-12 pb-12 z-20">
        <div className="text-[7px] text-neutral-600 tracking-[0.15em] font-mono uppercase">
          © 2026 AMEY SAWANT
        </div>
        <div className="flex items-center gap-3 text-[7px] text-neutral-600 tracking-[0.15em] font-mono uppercase">
          <span>ALL SYSTEM RIGHTS CONFIGURED</span>
          <span className="text-amber-500/30">•</span>
          <span>Sector: Mumbai_G205_In</span>
        </div>
      </div>
    </motion.div>
  );
}
