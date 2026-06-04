"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  Send, 
  Mail, 
  Terminal, 
  Cpu, 
  Layers, 
  Globe, 
  Activity, 
  Sparkles,
  FileText,
  Radio,
  FileCode
} from "lucide-react";

// Local SVG brand icons to avoid Lucide resolution differences
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { SITE_CONFIG } from "@/constants/site";

interface SectionOverlayProps {
  activeSection: string;
  onBack: () => void;
}

// 1. ABOUT ME (SUN)
function AboutOverlay({ onBack }: { onBack: () => void }) {
  const stats = [
    { label: "FRONTEND INFRASTRUCTURE", value: 95, color: "from-amber-500 to-orange-600" },
    { label: "BACKEND COMPUTE & RUST", value: 90, color: "from-orange-500 to-red-600" },
    { label: "AI AGENTS & REASONING", value: 85, color: "from-yellow-400 to-amber-600" },
    { label: "DEV-OPS & PIPELINE SYSTEMS", value: 80, color: "from-yellow-500 to-orange-500" },
  ];

  const milestones = [
    { year: "2024 - PRESENT", title: "Creative Technologist & AI Engineer", desc: "Crafting real-time WebGL platforms, custom GLSL shaders, and autonomous agent swarms." },
    { year: "2022 - 2024", title: "Senior Full-Stack Developer", desc: "Scaled enterprise API clusters and designed immersive frontend designs for dynamic data platforms." },
    { year: "2020 - 2022", title: "Software Engineer", desc: "Engineered scalable cloud architecture and automated CI/CD pipelines on Google Cloud." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-y-0 left-0 w-full md:w-[650px] p-8 md:p-12 flex flex-col justify-center bg-black/40 backdrop-blur-xl border-r border-white/10 z-30 select-text"
    >
      {/* Corner Brackets */}
      <span className="absolute top-4 left-4 w-4 h-4 border-t border-l border-amber-500/50" />
      <span className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-amber-500/50" />
      <span className="absolute top-4 right-4 w-4 h-4 border-t border-r border-amber-500/50" />
      <span className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-amber-500/50" />

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-amber-500/80 hover:text-amber-400 transition-colors mb-8 group pointer-events-auto w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        [ RETURN_TO_SYSTEM ]
      </button>

      <div className="overflow-y-auto pr-2 scrollbar-thin">
        <span className="font-mono text-[9px] tracking-widest text-amber-500 uppercase block mb-1">
          // CREATOR IDENTITY OVERLAY
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 uppercase font-mono">
          AMEY SAWANT
        </h2>
        
        <p className="text-sm text-neutral-300 leading-relaxed font-sans mb-8">
          <span className="text-amber-500 font-bold font-mono mr-1.5">[ORIGIN]</span>
          Born in Mumbai. Early curiosity for what happens behind the screen evolved into a passion for software design and digital physics. I build high-performance web applications and agentic AI systems that fuse elegant design with robust engineering.
        </p>

        {/* Stats Grid */}
        <div className="mb-10 space-y-4">
          <span className="font-mono text-[10px] tracking-wider text-neutral-400 block mb-2">// CAPABILITY MATRIX</span>
          {stats.map((stat, i) => (
            <div key={i} className="font-mono text-[10px]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-neutral-300 tracking-wider">{stat.label}</span>
                <span className="text-amber-500">{stat.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded border border-white/10 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${stat.color} rounded shadow-[0_0_8px_rgba(245,158,11,0.6)]`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <span className="font-mono text-[10px] tracking-wider text-neutral-400 block">// CHRONOLOGICAL FEED</span>
          {milestones.map((milestone, i) => (
            <div key={i} className="flex gap-4 relative pl-3.5 border-l border-amber-500/20">
              <span className="absolute -left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              <div className="space-y-1 text-left">
                <span className="font-mono text-[9px] text-amber-500 tracking-widest block font-bold">{milestone.year}</span>
                <h4 className="text-sm font-semibold text-white font-mono uppercase">{milestone.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// 2. PROJECTS (EARTH)
interface Project {
  title: string;
  desc: string;
  tech: string[];
  github?: string;
  live?: string;
  role: string;
}

function ProjectsOverlay({ onBack }: { onBack: () => void }) {
  const [activeProj, setActiveProj] = useState(0);

  const projects: Project[] = [
    {
      title: "ASTRAEUS AI",
      desc: "Autonomous multi-agent orchestration framework. Features localized vector reasoning swarms that cooperate on complex analytical pipelines with deterministic validation nodes.",
      tech: ["Next.js", "FastAPI", "LangGraph", "PyTorch", "Tailwind CSS"],
      github: SITE_CONFIG.social.github,
      role: "Lead Architect"
    },
    {
      title: "CHRONOS 3D MAPPER",
      desc: "Interactive space telemetry tracker plotting near-Earth orbital coordinates. Uses GPU-accelerated vertex shaders to compute complex gravitation simulation bounds dynamically.",
      tech: ["Three.js", "React Three Fiber", "GLSL Shaders", "Web Workers"],
      github: SITE_CONFIG.social.github,
      live: SITE_CONFIG.url,
      role: "3D Engineer"
    },
    {
      title: "HELIOS DATA MATRIX",
      desc: "Sub-millisecond data ingestion gateway handling distributed telemetry pipelines. Built to withstand sudden high-throughput spikes with consistent caching layers.",
      tech: ["Rust", "gRPC / Protobuf", "Redis", "Google Cloud Storage"],
      github: SITE_CONFIG.social.github,
      role: "Backend Architect"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12 z-30 select-text bg-black/30 backdrop-blur-md"
    >
      <div className="w-full max-w-5xl h-[85vh] bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-6 md:p-10 flex flex-col md:flex-row gap-8 relative overflow-hidden">
        <span className="absolute top-4 left-4 w-4 h-4 border-t border-l border-blue-500/50" />
        <span className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-blue-500/50" />
        <span className="absolute top-4 right-4 w-4 h-4 border-t border-r border-blue-500/50" />
        <span className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-blue-500/50" />

        {/* Project List Column */}
        <div className="w-full md:w-2/5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-blue-500/80 hover:text-blue-400 transition-colors mb-6 group pointer-events-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              [ LEAVE_ORBIT ]
            </button>
            <span className="font-mono text-[9px] tracking-widest text-blue-500 uppercase block mb-1">
              // ACTIVE PROJECTS SYSTEM
            </span>
            <h3 className="text-2xl font-bold tracking-wider text-white mb-6 uppercase font-mono">
              PROJECTS DOCK
            </h3>

            {/* List Selection */}
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveProj(idx)}
                  className={`w-full text-left p-4 rounded border transition-all duration-300 font-mono text-xs flex justify-between items-center group pointer-events-auto
                    ${activeProj === idx 
                      ? "bg-blue-950/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                      : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/20 hover:text-neutral-200"
                    }
                  `}
                >
                  <span>0{idx+1} // {proj.title}</span>
                  <Activity className={`w-3.5 h-3.5 ${activeProj === idx ? "text-blue-400 animate-pulse" : "opacity-0 group-hover:opacity-40"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block font-mono text-[8px] text-neutral-500 tracking-wider leading-relaxed pt-6">
            TELEMETRY NODE: SECURE_CORE_04<br />
            ORBITAL STATUS: TERRESTRIAL_ANCHOR<br />
            LOCATION: EARTH_FRAME
          </div>
        </div>

        {/* Detailed Review Column */}
        <div className="w-full md:w-3/5 flex flex-col justify-between pt-2 md:pt-0 md:pl-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProj}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-white/10 pb-4">
                  <div className="font-mono text-glow">
                    <span className="text-[10px] text-blue-500 uppercase tracking-widest block font-bold">// SYSTEM NODE</span>
                    <h4 className="text-xl font-bold text-white tracking-widest uppercase">{projects[activeProj].title}</h4>
                  </div>
                  <span className="font-mono text-[9px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {projects[activeProj].role}
                  </span>
                </div>

                {/* Holographic Wireframe Widget */}
                <div className="h-32 border border-white/5 bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
                  <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse" />
                  <FileCode className="w-12 h-12 text-blue-500/40 relative z-10 animate-bounce" />
                  <span className="absolute bottom-2 right-3 font-mono text-[8px] text-blue-500/50 tracking-wider">SYS_VISUALIZER_MOCK</span>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed font-sans mb-8">
                  {projects[activeProj].desc}
                </p>

                {/* Tech Stack Icons */}
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {projects[activeProj].tech.map((t, idx) => (
                    <span 
                      key={idx}
                      className="font-mono text-[9px] tracking-wide text-neutral-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:border-blue-500/30 hover:text-white transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {projects[activeProj].github && (
                  <a
                    href={projects[activeProj].github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded border border-white/10 font-mono text-xs text-white bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all hover:scale-105 pointer-events-auto"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>SOURCE_CODE</span>
                  </a>
                )}
                {projects[activeProj].live && (
                  <a
                    href={projects[activeProj].live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded bg-blue-600 text-white font-mono text-xs hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] pointer-events-auto"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>LIVE_LAUNCH</span>
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// 3. SKILLS (SATURN)
function SkillsOverlay({ onBack }: { onBack: () => void }) {
  const skillCategories = [
    {
      title: "UI & INTERACTION",
      skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "Three.js / R3F", "GSAP / Framer Motion", "WebGL & GLSL Shaders"]
    },
    {
      title: "ARCHITECTURE & COMPUTE",
      skills: ["Node.js / Express", "Python / FastAPI", "Rust (Systems API)", "gRPC / Protobuf", "PostgreSQL", "MongoDB"]
    },
    {
      title: "AGENTIC AI & DEV-OPS",
      skills: ["LangGraph / LangChain", "Reasoning & LLM Fine-Tuning", "Docker & Kubernetes", "CI/CD Workflows", "GCP / AWS Infrastructure", "Prometheus & Grafana"]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-0 bottom-0 w-full p-8 md:p-12 bg-gradient-to-t from-black/85 via-black/75 to-transparent border-t border-white/10 z-30 select-text h-[70vh] flex flex-col justify-end"
    >
      <div className="max-w-6xl mx-auto w-full overflow-y-auto pr-2 scrollbar-thin">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-amber-500 uppercase block mb-1">
              // COGNITIVE CAPABILITIES ARRAY
            </span>
            <h2 className="text-2xl font-bold tracking-wider text-white font-mono uppercase">
              SKILLS RING SYSTEM
            </h2>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-amber-500/80 hover:text-amber-400 transition-colors group pointer-events-auto border border-amber-500/20 px-4 py-2 rounded bg-amber-500/5"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            [ CLOSE_ORBITAL ]
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {skillCategories.map((category, idx) => (
            <div key={idx} className="p-6 bg-black/60 border border-white/5 rounded-lg relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/30 group-hover:border-amber-500/60" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/30 group-hover:border-amber-500/60" />
              
              <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
                {idx === 0 ? <Layers className="w-4 h-4 text-amber-500" /> : idx === 1 ? <Cpu className="w-4 h-4 text-amber-500" /> : <Terminal className="w-4 h-4 text-amber-500" />}
                <h4 className="font-mono text-xs font-bold text-white tracking-widest">{category.title}</h4>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {category.skills.map((skill, sIdx) => (
                  <div 
                    key={sIdx}
                    className="font-mono text-[11px] text-neutral-300 flex items-center gap-2 p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// 4. EXPERIENCE (MARS)
function ExperienceOverlay({ onBack }: { onBack: () => void }) {
  const experiences = [
    {
      role: "CREATIVE TECHNOLOGIST",
      company: "SELF-EMPLOYED",
      period: "2024 - PRESENT",
      desc: "Developed point-cloud visualizers, custom vertex displacement shaders, and autonomous AI agents. Architected Next.js microservices with distributed serverless pipelines.",
      logs: ["SYSTEMS LOADED: agentic_swarm_engine.py", "RENDERER: WebGL_corona_sun_shader.glsl", "BANDWIDTH LIMIT: 99.8% STABLE"]
    },
    {
      role: "SENIOR FULL-STACK DEVELOPER",
      company: "AI LABS INC",
      period: "2022 - 2024",
      desc: "Supervised dynamic system transitions on client-facing applications. Reduced dashboard loading lags by 45% via cache structuring, DB indexes, and asynchronous worker queues.",
      logs: ["DATABASES: PostgreSQL, MongoDB clusters", "LATENCY OUT: < 12ms", "TEAM RATINGS: OUTSTANDING_LEADERSHIP"]
    },
    {
      role: "SOFTWARE ENGINEER",
      company: "INFOTECH NETWORKS",
      period: "2020 - 2022",
      desc: "Configured microservice APIs, containerized deployment systems (Docker), and optimized CI/CD hooks on Google Cloud Platform to maintain automated build loops.",
      logs: ["CONTAINERS: Kubernetes cluster scaled x10", "DOCKER STATUS: OPTIMIZED", "CLOUD: Google Cloud Platform / AWS"]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-y-0 right-0 w-full md:w-[650px] p-8 md:p-12 flex flex-col justify-center bg-black/40 backdrop-blur-xl border-l border-white/10 z-30 select-text"
    >
      <span className="absolute top-4 left-4 w-4 h-4 border-t border-l border-red-500/50" />
      <span className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-red-500/50" />
      <span className="absolute top-4 right-4 w-4 h-4 border-t border-r border-red-500/50" />
      <span className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-red-500/50" />

      <button 
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-red-500/80 hover:text-red-400 transition-colors mb-8 group pointer-events-auto w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        [ DEPART_RED_PLANET ]
      </button>

      <div className="overflow-y-auto pr-2 scrollbar-thin">
        <span className="font-mono text-[9px] tracking-widest text-red-500 uppercase block mb-1">
          // CREATOR CHRONOLOGY LOGS
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-6 uppercase font-mono">
          MISSION LOGS
        </h2>

        <div className="space-y-8">
          {experiences.map((exp, idx) => (
            <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
              <span className="absolute top-0 right-0 font-mono text-[7px] text-neutral-500 tracking-widest group-hover:text-red-500/60 p-2">LOG_ID_0{idx+1}</span>
              
              <div className="font-mono text-[9px] text-red-400 font-bold tracking-widest mb-1">{exp.period}</div>
              <h4 className="text-sm font-semibold text-white font-mono uppercase">{exp.role}</h4>
              <h5 className="text-[11px] font-mono text-neutral-400 mb-3 tracking-wide">{exp.company}</h5>
              
              <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-4">{exp.desc}</p>
              
              {/* Telemetry Output Log */}
              <div className="bg-[#020205] border border-white/10 p-3 rounded font-mono text-[8px] text-red-500/80 space-y-1">
                {exp.logs.map((log, lIdx) => (
                  <div key={lIdx} className="flex gap-1.5">
                    <span>&gt;</span>
                    <span className="tracking-wide">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// 5. CONTACT (NEPTUNE)
function ContactOverlay({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus("sending");
    // Simulate API transmit
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12 z-30 select-text bg-black/35 backdrop-blur-md"
    >
      <div className="w-full max-w-xl bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg p-6 md:p-10 relative overflow-hidden">
        <span className="absolute top-4 left-4 w-4 h-4 border-t border-l border-cyan-500/50" />
        <span className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-cyan-500/50" />
        <span className="absolute top-4 right-4 w-4 h-4 border-t border-r border-cyan-500/50" />
        <span className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-cyan-500/50" />

        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group pointer-events-auto w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          [ DEPART_DEEP_BLUE ]
        </button>

        <span className="font-mono text-[9px] tracking-widest text-cyan-400 uppercase block mb-1">
          // COMMS TRANSMISSION LINK
        </span>
        <h2 className="text-2xl font-bold tracking-wider text-white font-mono mb-4 uppercase">
          INITIATE BEACON
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-8">
          Send a transmission frequency from any sector. Signal waves will pass through deep space and relay directly to my terminal.
        </p>

        {status === "success" ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-cyan-500/30 bg-cyan-950/20 p-6 rounded text-center font-mono text-xs space-y-4"
          >
            <Radio className="w-8 h-8 text-cyan-400 animate-ping mx-auto mb-2" />
            <h4 className="font-bold text-white uppercase tracking-widest">// SIGNAL SENT SUCCESSFULLY</h4>
            <p className="text-neutral-400 text-[10px]">Frequency packet transmitted. System awaiting return connection.</p>
            <button 
              onClick={() => setStatus("idle")} 
              className="px-4 py-2 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors pointer-events-auto"
            >
              [ RE-OPEN TRANSMITTER ]
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1.5 uppercase">// EMITTER_NAME</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={status === "sending"}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-400 pointer-events-auto transition-colors disabled:opacity-50"
                placeholder="Enter identity..."
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1.5 uppercase">// EMITTER_FREQUENCY_EMAIL</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={status === "sending"}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-400 pointer-events-auto transition-colors disabled:opacity-50"
                placeholder="Enter return frequency..."
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1.5 uppercase">// PAYLOAD_MESSAGE</label>
              <textarea 
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={status === "sending"}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-400 pointer-events-auto transition-colors resize-none disabled:opacity-50"
                placeholder="Write data packets..."
              />
            </div>

            <button 
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded font-bold tracking-widest uppercase transition-all hover:scale-102 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] pointer-events-auto disabled:opacity-50"
            >
              <Send className="w-4 h-4 animate-pulse" />
              <span>{status === "sending" ? "TRANSMITTING DATA..." : "TRANSMIT MESSAGE"}</span>
            </button>
          </form>
        )}

        {/* Alternate Frequencies */}
        <div className="mt-8 border-t border-white/5 pt-6 flex justify-center gap-6 pointer-events-auto">
          <a href={SITE_CONFIG.social.github} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-cyan-400 transition-colors">
            <GithubIcon className="w-5 h-5" />
          </a>
          <a href={SITE_CONFIG.social.linkedin} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-cyan-400 transition-colors">
            <LinkedinIcon className="w-5 h-5" />
          </a>
          <a href={`mailto:${SITE_CONFIG.social.email}`} className="text-neutral-400 hover:text-cyan-400 transition-colors">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// 6. RESUME (MOON)
function ResumeOverlay({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12 z-30 select-text bg-black/40 backdrop-blur-md"
    >
      <div className="w-full max-w-lg bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg p-6 md:p-10 relative overflow-hidden text-center">
        <span className="absolute top-4 left-4 w-4 h-4 border-t border-l border-neutral-500/50" />
        <span className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-neutral-500/50" />
        <span className="absolute top-4 right-4 w-4 h-4 border-t border-r border-neutral-500/50" />
        <span className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-neutral-500/50" />

        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-neutral-400 hover:text-white transition-colors mb-6 group pointer-events-auto w-fit mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          [ EXIT_LUNAR_GRAVITY ]
        </button>

        <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-1">
          // CREATOR SPECIFICATION ARCHIVE
        </span>
        <h2 className="text-2xl font-bold tracking-wider text-white font-mono mb-6 uppercase">
          RESUME PROTOCOL
        </h2>

        {/* Resume Icon/Frame */}
        <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 mx-auto flex items-center justify-center mb-6 relative">
          <FileText className="w-10 h-10 text-neutral-400 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-neutral-500/20 border-dashed animate-[spin_20s_linear_infinite]" />
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-8 max-w-sm mx-auto">
          Download the latest document file outlining developer stacks, project metrics, system operations, and corporate history credentials.
        </p>

        <a 
          href="/resume.pdf"
          download
          className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 px-6 py-3.5 rounded font-mono text-xs font-bold tracking-widest uppercase transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] pointer-events-auto"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD_RESUME_PDF</span>
        </a>
      </div>
    </motion.div>
  );
}

// 7. EASTER EGG (BLACK HOLE)
function EasterEggOverlay({ onBack }: { onBack: () => void }) {
  const codeDumps = [
    "SYS_OVERRIDE: INITIALIZE GRAVITATIONAL_SINGULARITY...",
    "MASS: 1.2 x 10^30 KG // RADIUS: CRITICAL",
    "EVENT_HORIZON: DETECTED // ESCAPE_VELOCITY: > c",
    "WARNING: QUANTUM INFORMATION HOLOGRAPHIC REDUCTION ACTIVE",
    "RE-ROUTING MATRIX ENGINE BOUNDS...",
    "CONGRATULATIONS. YOU FOUND THE SECRETS OF THE COSMIC CREATOR."
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12 z-30 select-text bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl border border-red-500/20 bg-black/80 p-8 rounded font-mono text-[10px] text-red-500/80 space-y-4 relative shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/50" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/50" />

        <div className="flex justify-between items-center border-b border-red-500/20 pb-3 mb-2">
          <span className="font-bold tracking-widest text-red-500 flex items-center gap-1.5 uppercase animate-pulse">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            CRITICAL SYSTEM WARP ERROR
          </span>
          <button 
            onClick={onBack}
            className="text-[9px] border border-red-500/40 text-red-500 px-3 py-1 hover:bg-red-500/10 rounded transition-colors pointer-events-auto"
          >
            [ DISCONNECT ]
          </button>
        </div>

        <div className="space-y-1.5 text-left leading-relaxed">
          {codeDumps.map((line, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.3 }}
              className="flex gap-2"
            >
              <span>&gt;</span>
              <span>{line}</span>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t border-red-500/10 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
          <span className="text-[8px] text-red-500/40 uppercase tracking-widest">WORMHOLE STABLE // WARP MATRIX ACTIVE</span>
        </div>
      </div>
    </motion.div>
  );
}

export function SectionOverlays({ activeSection, onBack }: SectionOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      {activeSection === "about" && (
        <AboutOverlay key="about" onBack={onBack} />
      )}
      {activeSection === "projects" && (
        <ProjectsOverlay key="projects" onBack={onBack} />
      )}
      {activeSection === "skills" && (
        <SkillsOverlay key="skills" onBack={onBack} />
      )}
      {activeSection === "experience" && (
        <ExperienceOverlay key="experience" onBack={onBack} />
      )}
      {activeSection === "contact" && (
        <ContactOverlay key="contact" onBack={onBack} />
      )}
      {activeSection === "resume" && (
        <ResumeOverlay key="resume" onBack={onBack} />
      )}
      {activeSection === "easter-egg" && (
        <EasterEggOverlay key="easter-egg" onBack={onBack} />
      )}
    </AnimatePresence>
  );
}
