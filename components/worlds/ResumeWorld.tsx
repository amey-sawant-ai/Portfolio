"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  FileText,
  Download,
  Award,
  Briefcase,
  Cpu,
  GraduationCap,
  Code,
  ShieldCheck,
  Server,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { audio } from "@/lib/audio";

interface ResumeWorldProps {
  onBack: () => void;
}

// Central dynamic crystal cluster that changes color based on the selected tab
function PrismaticCrystalCluster({ activeTab }: { activeTab: number }) {
  const coreRef = useRef<THREE.Group | null>(null);
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);
  const crystalMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      const rotateSpeed = activeTab === 0 ? 0.35 : activeTab === 1 ? 0.15 : activeTab === 2 ? 0.25 : 0.2;
      coreRef.current.rotation.y = t * rotateSpeed;
      coreRef.current.position.y = Math.sin(t * 1.5) * 0.5;
    }
    shardRefs.current.forEach((shard, idx) => {
      if (shard) {
        shard.rotation.y = t * (0.4 + idx * 0.05) * (idx % 2 === 0 ? 1 : -1);
      }
    });
  });

  const crystalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E5E7EB",
      roughness: 0.03,
      metalness: 0.98,
      emissive: "#00E5FF",
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.88,
    });
  }, []);

  useEffect(() => {
    crystalMatRef.current = crystalMaterial;
  }, [crystalMaterial]);

  const tabColor = useMemo(() => {
    switch (activeTab) {
      case 0: return new THREE.Color("#00E5FF"); // Cyan for Skills
      case 1: return new THREE.Color("#FF3D00"); // Red-Orange for Experience
      case 2: return new THREE.Color("#FFD600"); // Gold for Education
      case 3: return new THREE.Color("#FFFFFF"); // Silver-White for Download
      default: return new THREE.Color("#FFFFFF");
    }
  }, [activeTab]);

  useEffect(() => {
    if (crystalMatRef.current) {
      gsap.to(crystalMatRef.current.emissive, {
        r: tabColor.r,
        g: tabColor.g,
        b: tabColor.b,
        duration: 0.6,
        ease: "power2.out"
      });
      gsap.to(crystalMatRef.current, {
        emissiveIntensity: activeTab === 1 ? 0.5 : activeTab === 0 ? 0.45 : activeTab === 2 ? 0.4 : 0.35,
        duration: 0.6
      });
    }
  }, [tabColor, activeTab]);

  const wireframeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#9CA3AF",
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useEffect(() => {
    if (wireframeMaterial) {
      gsap.to(wireframeMaterial.color, {
        r: tabColor.r,
        g: tabColor.g,
        b: tabColor.b,
        duration: 0.6
      });
    }
  }, [tabColor, wireframeMaterial]);

  const shards = useMemo(() => [
    { scale: [1, 2.2, 1], pos: [0, 0, 0], rot: [0, 0, 0] },
    { scale: [0.55, 1.4, 0.55], pos: [-2.5, -2, 2.5], rot: [0.2, 0.1, -0.2] },
    { scale: [0.5, 1.2, 0.5], pos: [3, -2.5, 2], rot: [0.25, -0.2, 0.2] },
    { scale: [0.45, 1.3, 0.45], pos: [2.5, -2.2, -2.5], rot: [-0.2, 0.15, 0.15] },
    { scale: [0.6, 1.5, 0.6], pos: [-3, -1.8, -2], rot: [-0.15, -0.15, -0.25] },
  ], []);

  return (
    <group ref={coreRef} position={[0, 12, 0]}>
      {shards.map((spec, i) => (
        <group key={i} position={spec.pos as any} rotation={spec.rot as any}>
          <mesh
            ref={(el) => { shardRefs.current[i] = el; }}
            scale={spec.scale as any}
            material={crystalMaterial}
          >
            <octahedronGeometry args={[5]} />
          </mesh>

          <mesh
            scale={[spec.scale[0] * 1.15, spec.scale[1] * 1.12, spec.scale[2] * 1.15]}
            material={wireframeMaterial}
          >
            <octahedronGeometry args={[5]} />
          </mesh>
        </group>
      ))}

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 80 }, () => [
                  (Math.random() - 0.5) * 12,
                  (Math.random() - 0.5) * 20,
                  (Math.random() - 0.5) * 12
                ]).flat()
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          color="#E5E7EB"
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function ResumeWorld({ onBack }: ResumeWorldProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeExp, setActiveExp] = useState(0);
  const [skillFilter, setSkillFilter] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);

  const gridRef = useRef<THREE.GridHelper | null>(null);

  const tabs = useMemo(() => [
    { name: "01 // EXPERTISE", icon: Cpu, color: "#00E5FF", glow: "rgba(0,229,255,0.4)" },
    { name: "02 // EXPERIENCE", icon: Briefcase, color: "#FF3D00", glow: "rgba(255,61,0,0.4)" },
    { name: "03 // CREDENTIALS", icon: GraduationCap, color: "#FFD600", glow: "rgba(255,214,0,0.4)" },
    { name: "04 // EXPORT_DATA", icon: FileText, color: "#FFFFFF", glow: "rgba(255,255,255,0.4)" }
  ], []);

  const experiences = useMemo(() => [
    {
      role: "CREATIVE TECHNOLOGIST & AI ENGINEER",
      company: "SELF-EMPLOYED // REMOTE",
      period: "2024 - PRESENT",
      desc: "Architecting immersive WebGL visual platforms, custom vertex shaders, and autonomous AI reasoning swarms. Built Next.js microservices integrated with FastAPI and LangGraph.",
      bullets: [
        "Designed and implemented WebGL point-cloud rendering with custom vertex and fragment shaders (GLSL), achieving 60fps animations of space telemetry.",
        "Created an autonomous multi-agent swarm architecture using LangGraph and FastAPI, automating complex data pipelines with deterministic validation.",
        "Integrated real-time audio synthesizers (Web Audio API) generating procedural ambient waves based on client side telemetry."
      ],
      tech: ["Next.js", "Three.js", "WebGL / GLSL", "FastAPI", "LangGraph", "Docker"],
      logs: ["CORE REASONING SWARM: active_agent_swarm.py", "GLSL COMPILER: WebGL_v2_core_ok", "LATENCY OUT: < 15ms"]
    },
    {
      role: "SENIOR FULL-STACK DEVELOPER",
      company: "AI LABS INC",
      period: "2022 - 2024",
      desc: "Supervised dynamic system transitions on client-facing applications. Reduced dashboard loading lags by 45% via cache structuring, DB indexes, and asynchronous worker queues.",
      bullets: [
        "Led a team of 4 developers in creating immersive web-based data dashboards, rendering real-time IoT feeds and telemetry charts.",
        "Designed PostgreSQL database indexes and optimized complex SQL queries, bringing API response times down by 45%.",
        "Configured Redis cache layers and asynchronous Celery tasks to process long-running analytics jobs in the background."
      ],
      tech: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Redis", "Celery"],
      logs: ["DB POOL COUNT: 85 ACTIVE", "CACHE HIT RATE: 94.2%", "KPI SCORE: OUTSTANDING_LEADERSHIP"]
    },
    {
      role: "SOFTWARE ENGINEER",
      company: "INFOTECH NETWORKS",
      period: "2020 - 2022",
      desc: "Configured microservice APIs, containerized deployment systems (Docker), and optimized CI/CD hooks on Google Cloud Platform to maintain automated build loops.",
      bullets: [
        "Maintained and optimized RESTful APIs built with Node.js and Python (FastAPI), servicing over 50,000 active daily users.",
        "Containerized core microservices using Docker and deployed to Google Kubernetes Engine (GKE) cluster, improving scalability.",
        "Automated CI/CD deployment pipelines using GitHub Actions, cutting manual deployment times from 40 minutes to under 5 minutes."
      ],
      tech: ["Node.js", "FastAPI", "Docker", "Kubernetes", "Google Cloud", "CI/CD", "GitHub Actions"],
      logs: ["CONTAINERS: Kubernetes cluster scaled x10", "DOCKER BUILD: SUCCESS // < 2.5m", "AUDIT STATUS: 100% COMPLIANT"]
    }
  ], []);

  const skillCategories = useMemo(() => [
    {
      title: "UI & INTERACTION",
      icon: Code,
      color: "#00E5FF",
      glow: "rgba(0,229,255,0.35)",
      skills: [
        { name: "React / Next.js", level: 95 },
        { name: "TypeScript / JS", level: 92 },
        { name: "Three.js / R3F", level: 88 },
        { name: "WebGL / GLSL Shaders", level: 85 },
        { name: "GSAP / Framer Motion", level: 90 },
        { name: "Tailwind CSS", level: 95 }
      ]
    },
    {
      title: "ARCHITECTURE & COMPUTE",
      icon: Server,
      color: "#FF3D00",
      glow: "rgba(255,61,0,0.35)",
      skills: [
        { name: "Node.js / Express", level: 90 },
        { name: "Python / FastAPI", level: 88 },
        { name: "Rust (API & Shaders)", level: 78 },
        { name: "gRPC / Protobuf", level: 80 },
        { name: "PostgreSQL / Prisma", level: 85 },
        { name: "MongoDB / Redis", level: 88 }
      ]
    },
    {
      title: "AGENTIC AI & DEV-OPS",
      icon: Cpu,
      color: "#FFD600",
      glow: "rgba(255,214,0,0.35)",
      skills: [
        { name: "LangGraph / LangChain", level: 88 },
        { name: "LLMs / Agent Swarms", level: 85 },
        { name: "Docker / Containers", level: 90 },
        { name: "Kubernetes (GKE)", level: 80 },
        { name: "GCP / AWS Cloud", level: 82 },
        { name: "CI/CD Pipelines", level: 88 }
      ]
    }
  ], []);

  const academics = useMemo(() => [
    {
      type: "degree",
      title: "B.E. COMPUTER ENGINEERING",
      institution: "UNIVERSITY OF MUMBAI",
      year: "2016 - 2020",
      grade: "First Class with Distinction",
      details: "Focused on Distributed Systems, Cloud Architecture, and Machine Learning algorithms. Completed capstone project on multi-agent navigation optimization."
    },
    {
      type: "certification",
      title: "GCP ASSOCIATE CLOUD ENGINEER",
      institution: "GOOGLE CLOUD",
      year: "Issued 2023",
      grade: "Credential ID: 99482-GCP",
      details: "Validated engineering competency in deploying cloud storage assets, load balancing, containerizing apps with Kubernetes (GKE), and secure IAM role delegation."
    },
    {
      type: "publication",
      title: "AI AGENT SWARM ARCHITECTURE",
      institution: "RESEARCH & DEVELOPMENT",
      year: "Published 2024",
      grade: "Status: Verified Open-Source",
      details: "Published an analytical thesis detailing cooperative multi-agent task execution graphs. Showcases state management with LangGraph and FastAPI pipeline routing."
    }
  ], []);

  const tabColor = useMemo(() => {
    switch (activeTab) {
      case 0: return new THREE.Color("#00E5FF");
      case 1: return new THREE.Color("#FF3D00");
      case 2: return new THREE.Color("#FFD600");
      case 3: return new THREE.Color("#FFFFFF");
      default: return new THREE.Color("#FFFFFF");
    }
  }, [activeTab]);

  useEffect(() => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0.15;
      gsap.to(mat.color, {
        r: tabColor.r,
        g: tabColor.g,
        b: tabColor.b,
        duration: 0.8
      });
    }
  }, [tabColor]);

  const filteredCategories = useMemo(() => {
    if (!skillFilter.trim()) return skillCategories;
    const filterLower = skillFilter.toLowerCase();

    return skillCategories.map(cat => {
      const skills = cat.skills.filter(s => s.name.toLowerCase().includes(filterLower));
      return { ...cat, skills };
    }).filter(cat => cat.skills.length > 0);
  }, [skillFilter, skillCategories]);

  const handleDownloadClick = (e: any) => {
    e.preventDefault();
    audio.playClickSound();

    setDownloadProgress(1);
    let prog = 1;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 8) + 4;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = "/resume.pdf";
          link.download = "Amey_Sawant_Resume.pdf";
          link.click();

          setTimeout(() => setDownloadProgress(0), 1000);
        }, 300);
      }
      setDownloadProgress(prog);
    }, 60);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <span className="text-[9.5px] text-cyan-400 font-bold tracking-widest block font-mono">// MATRIX: LEVEL_INDICATORS</span>
                <h4 className="text-sm font-bold text-white tracking-widest uppercase">CAPABILITY SPECTRUM</h4>
              </div>
              <div className="relative pointer-events-auto">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  placeholder="Filter credentials..."
                  className="bg-white/5 border border-white/10 rounded pl-8 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500 w-full sm:w-44 font-mono pointer-events-auto"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredCategories.map((cat, idx) => (
                <div key={idx} className="bg-white/[0.01] border border-white/5 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                    <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                    <span className="text-[11px] font-bold text-white tracking-wider font-mono">{cat.title}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                    {cat.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-neutral-300">{skill.name}</span>
                          <span style={{ color: cat.color }}>{skill.level}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${skill.level}%`,
                              backgroundColor: cat.color,
                              boxShadow: `0 0 6px ${cat.glow}`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <div className="text-center py-10 font-mono text-[11px] text-neutral-500 uppercase">
                  No matching systems found in matrix
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="pb-3 border-b border-white/5">
              <span className="text-[9.5px] text-orange-500 font-bold tracking-widest block font-mono">// MISSION_LOG_ARCHIVES</span>
              <h4 className="text-sm font-bold text-white tracking-widest uppercase">CHRONOLOGICAL ROADMAP</h4>
            </div>

            <div className="relative pl-4 border-l border-white/10 space-y-4 py-1">
              {experiences.map((exp, idx) => {
                const isSelected = activeExp === idx;
                return (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full border transition-all duration-300
                        ${isSelected
                          ? "bg-[#FF3D00] border-orange-400 scale-125 shadow-[0_0_8px_rgba(255,61,0,0.8)]"
                          : "bg-neutral-800 border-neutral-600 group-hover:border-neutral-400"
                        }
                      `}
                    />

                    <div
                      onClick={() => {
                        audio.playClickSound();
                        setActiveExp(isSelected ? -1 : idx);
                      }}
                      className={`p-4 rounded-md border text-left cursor-pointer transition-all duration-300 pointer-events-auto select-none
                        ${isSelected
                          ? "bg-orange-950/10 border-orange-500/30 shadow-[0_0_15px_rgba(255,61,0,0.05)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                        }
                      `}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-2">
                        <div>
                          <span className="text-[9.5px] text-[#FF3D00] tracking-wider font-mono font-bold uppercase">{exp.period}</span>
                          <h4 className="text-[12px] font-bold text-white tracking-wider font-mono mt-0.5">{exp.role}</h4>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono font-bold">{exp.company}</span>
                      </div>

                      <p className="text-[11.5px] text-neutral-400 font-sans leading-relaxed">
                        {exp.desc}
                      </p>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-3 pt-3 border-t border-white/5 space-y-3"
                          >
                            <ul className="space-y-1.5">
                              {exp.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-[11.5px] text-neutral-300 leading-relaxed font-sans flex gap-2 items-start">
                                  <span className="text-[#FF3D00] mt-1 shrink-0">▪</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="flex flex-wrap gap-1.5">
                              {exp.tech.map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] bg-white/5 border border-white/10 text-neutral-300 px-2 py-0.5 rounded font-mono"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            <div className="bg-black border border-white/10 p-2.5 rounded font-mono text-[9.5px] text-orange-500/80 space-y-1">
                              <span className="text-neutral-500 tracking-wider block border-b border-white/5 pb-1 mb-1">// SYSTEM DIAGNOSTICS</span>
                              {exp.logs.map((log, lIdx) => (
                                <div key={lIdx} className="flex gap-1.5">
                                  <span>&gt;</span>
                                  <span className="tracking-wide">{log}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="pb-3 border-b border-white/5">
              <span className="text-[9.5px] text-yellow-500 font-bold tracking-widest block font-mono">// SECURE_CREDENTIAL_LINK</span>
              <h4 className="text-sm font-bold text-white tracking-widest uppercase">CREDENTIAL REGISTRY</h4>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {academics.map((item, idx) => (
                <div key={idx} className="bg-white/[0.01] border border-white/5 p-4 rounded-md relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
                  <span className="absolute top-0 right-0 font-mono text-[8.5px] text-neutral-500 tracking-widest p-2 uppercase group-hover:text-yellow-500/50">
                    ID_0{idx + 1} // VERIFIED
                  </span>

                  <div className="flex items-center gap-2 mb-2">
                    {item.type === "degree" ? (
                      <Award className="w-4 h-4 text-yellow-500" />
                    ) : item.type === "certification" ? (
                      <ShieldCheck className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-[10px] text-yellow-500 tracking-wider font-mono font-bold uppercase">{item.year}</span>
                  </div>

                  <h4 className="text-[12px] font-bold text-white tracking-wider font-mono">{item.title}</h4>
                  <h5 className="text-[11px] text-neutral-400 tracking-wide font-mono mt-0.5">{item.institution}</h5>

                  <div className="w-full h-[1px] bg-white/5 my-2.5" />

                  <p className="text-[11.5px] text-neutral-400 font-sans leading-relaxed mb-1.5">
                    {item.details}
                  </p>

                  <span className="text-[10px] text-neutral-500 font-mono italic block">
                    Result/Focus: {item.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="h-full flex flex-col justify-center items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative mb-4">
              <FileText className="w-7 h-7 text-neutral-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-neutral-500/20 border-dashed animate-[spin_20s_linear_infinite]" />
            </div>

            <div>
              <span className="text-[9.5px] text-neutral-400 font-extrabold tracking-widest block uppercase">// SPECIFICATIONS DUMP</span>
              <h3 className="text-sm font-bold text-white tracking-widest uppercase mt-0.5">RESUME_ARCHIVE_GATEWAY</h3>
            </div>

            <div className="my-5 bg-white/[0.01] border border-white/5 rounded-md p-4 w-full max-w-md font-mono text-[11px] text-left space-y-1.5">
              <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
                <span className="text-neutral-500">METADATA_KEY</span>
                <span className="text-neutral-500">VAL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">FILENAME:</span>
                <span className="text-white">Amey_Sawant_Resume.pdf</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">FILESIZE:</span>
                <span className="text-white">184.52 KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">HASH_SHA256:</span>
                <span className="text-white truncate max-w-[180px]">7dfb210abefc10123dfacdb02931</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">INTEGRITY_CHECK:</span>
                <span className="text-green-400">VERIFIED // PASS</span>
              </div>
            </div>

            {downloadProgress > 0 ? (
              <div className="w-full max-w-md space-y-2 font-mono">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>{downloadProgress < 100 ? "COMPILING SYSTEM SECTORS..." : "COMPILE COMPLETE!"}</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-out"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <span className="text-[9px] text-neutral-500 block uppercase">
                  {downloadProgress < 30 ? "Initializing extraction buffer..." :
                    downloadProgress < 60 ? "Formatting credentials matrix..." :
                      downloadProgress < 90 ? "Compressing system specifications..." :
                        "Releasing download lock..."}
                </span>
              </div>
            ) : (
              <button
                onClick={handleDownloadClick}
                className="w-full max-w-md inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 py-3.5 rounded font-bold tracking-widest text-[11.5px] uppercase transition-all hover:scale-103 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)] pointer-events-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXTRACT SPECIFICATIONS PDF</span>
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <group>
      <ambientLight intensity={0.16} />
      <pointLight position={[0, 10, 0]} intensity={14} distance={200} color="#9CA3AF" />
      <directionalLight position={[-15, 60, -15]} intensity={0.4} color="#E5E7EB" />

      <gridHelper ref={gridRef} args={[150, 15, "#9CA3AF", "#4B5563"]} position={[0, -6, 0]} />

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 200 }, () => {
                  const angle = Math.random() * Math.PI * 2;
                  const r = 35 + Math.random() * 25;
                  const y = (Math.random() - 0.5) * 5;
                  return [Math.cos(angle) * r, y, Math.sin(angle) * r];
                }).flat()
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.6}
          color="#9CA3AF"
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <PrismaticCrystalCluster activeTab={activeTab} />

      {/* Main Interactive HUD Console (centered in 2D pixels for maximum clarity and size) */}
      <Html center position={[0, 12, 0]}>
        <div className="w-[100vw] md:w-[825px] h-[550px] max-h-[85vh] bg-black/20 border border-neutral-800 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.85)] flex flex-col font-mono text-white relative backdrop-blur-xl overflow-hidden pointer-events-auto select-text">

          {/* Top cyber bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              <span className="text-[9.5px] text-neutral-500 tracking-wider">CREATOR_CREDENTIALS_DB // SEC_LUNAR_6</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] text-neutral-400 font-bold uppercase">// SYS_STATUS:</span>
              <span className="text-[9.5px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded tracking-widest animate-pulse">INTEGRITY_SECURE</span>
            </div>
          </div>

          {/* Sub-header title */}
          <div className="px-5 py-4 border-b border-white/5 shrink-0 flex items-center justify-between bg-white/[0.01]">
            <div>
              <span className="text-[9px] text-neutral-400 tracking-widest block uppercase">// SYSTEM DATA RETRIEVAL</span>
              <h3 className="text-sm font-extrabold tracking-widest uppercase mt-0.5 text-glow-amber text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-400" />
                AMEY SAWANT — RESUME PROTOCOL
              </h3>
            </div>
            <span className="text-[10px] text-neutral-500">REV: 2026.06.07</span>
          </div>

          <div className="flex flex-col md:flex-row flex-1 min-h-0">
            {/* Sidebar navigation */}
            <div className="w-full md:w-44 border-b md:border-b-0 md:border-r border-white/5 flex flex-row md:flex-col p-3 md:p-4 gap-2 bg-black/40 overflow-x-auto md:overflow-x-visible shrink-0 scrollbar-thin">
              <span className="hidden md:block text-[8px] text-neutral-500 tracking-widest uppercase mb-1.5 px-2 font-bold">// SECTORS</span>
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      audio.playClickSound();
                      setActiveTab(idx);
                    }}
                    onMouseEnter={() => audio.playHoverSound()}
                    className={`text-left px-3 py-2.5 rounded border font-mono text-[10px] md:text-[11px] tracking-wider flex items-center gap-2 transition-all duration-300 pointer-events-auto whitespace-nowrap md:w-full
                      ${isActive
                        ? `bg-white/5 text-white`
                        : "bg-transparent border-transparent text-neutral-400 hover:bg-white/[0.02] hover:text-neutral-200"
                      }
                    `}
                    style={isActive ? { borderColor: tab.color, color: tab.color, boxShadow: `0 0 10px ${tab.glow}` } : {}}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? tab.color : undefined }} />
                    <span>{tab.name.replace("0" + (idx + 1) + " // ", "")}</span>
                  </button>
                );
              })}
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col p-4 md:p-5 min-h-0 bg-black/20">
              <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
