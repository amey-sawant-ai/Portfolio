"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { audio } from "@/lib/audio";
import { SITE_CONFIG } from "@/constants/site";

interface ProjectsWorldProps {
  onBack: () => void;
}

interface ProjectData {
  id: string;
  title: string;
  role: string;
  desc: string;
  tech: string[];
  github?: string;
  live?: string;
  position: [number, number, number];
  color: string;
}

interface SpireProps {
  color: string;
  isHovered: boolean;
  onClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
  id: string;
}

function SleekSpireTower({ color, isHovered, onClick, onPointerOver, onPointerOut, id }: SpireProps) {
  const coreRef = useRef<THREE.Mesh | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const cageRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + (id === "astraeus" ? 0 : id === "chronos" ? 2 : 4);
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.y = -t * 0.8;
      ring1Ref.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 1.2;
      ring2Ref.current.rotation.z = Math.cos(t * 0.5) * 0.25;
    }
    if (cageRef.current) {
      cageRef.current.rotation.y = t * 0.2;
    }
  });

  const scale = isHovered ? 1.15 : 1.0;

  return (
    <group
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      scale={[scale, scale, scale]}
    >
      {/* Central Spire Cone Needle */}
      <mesh ref={coreRef} position={[0, 4, 0]}>
        <coneGeometry args={[3.5, 26, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.05}
          metalness={0.95}
          emissive={new THREE.Color(color)}
          emissiveIntensity={isHovered ? 0.7 : 0.15}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Spire Base Support */}
      <mesh position={[0, -8, 0]}>
        <cylinderGeometry args={[5, 6.5, 4, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Floating Outer Orbit Ring 1 (Lower) */}
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <torusGeometry args={[9, 0.45, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(color)}
          emissiveIntensity={isHovered ? 0.9 : 0.35}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Floating Outer Orbit Ring 2 (Upper) */}
      <mesh ref={ring2Ref} position={[0, 8, 0]}>
        <torusGeometry args={[6.5, 0.3, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(color)}
          emissiveIntensity={isHovered ? 0.9 : 0.35}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Concentric Wireframe Outer cage */}
      <mesh ref={cageRef} position={[0, 4, 0]} scale={1.08}>
        <sphereGeometry args={[14, 12, 12]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={isHovered ? 0.55 : 0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function ProjectsWorld({ onBack }: ProjectsWorldProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProjectData | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0.18;
    }
  }, []);

  const projects: ProjectData[] = useMemo(() => [
    {
      id: "astraeus",
      title: "ASTRAEUS AI",
      role: "Lead Architect",
      desc: "Autonomous multi-agent orchestration framework. Features localized vector reasoning swarms that cooperate on complex analytical pipelines with deterministic validation nodes.",
      tech: ["Next.js", "FastAPI", "LangGraph", "PyTorch"],
      github: SITE_CONFIG.social.github,
      position: [-35, 12, -20],
      color: "#3B82F6"
    },
    {
      id: "chronos",
      title: "CHRONOS 3D MAPPER",
      role: "3D Engineer",
      desc: "Interactive space telemetry tracker plotting near-Earth orbital coordinates. Uses GPU-accelerated vertex shaders to compute complex gravitation simulation bounds dynamically.",
      tech: ["Three.js", "R3F", "GLSL Shaders", "Web Workers"],
      github: SITE_CONFIG.social.github,
      live: SITE_CONFIG.url,
      position: [0, 20, 25],
      color: "#F59E0B"
    },
    {
      id: "helios",
      title: "HELIOS DATA MATRIX",
      role: "Backend Architect",
      desc: "Sub-millisecond data ingestion gateway handling distributed telemetry pipelines. Built to withstand sudden high-throughput spikes with consistent caching layers.",
      tech: ["Rust", "gRPC / Protobuf", "Redis", "Google Cloud Storage"],
      github: SITE_CONFIG.social.github,
      position: [35, 15, -20],
      color: "#EC4899"
    }
  ], []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle drift for the entire platform
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Volumetric atmosphere fog glow inside the Earth dimension */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 50, 0]} intensity={8} distance={200} color="#3B82F6" />
      <directionalLight position={[-50, 100, 50]} intensity={0.5} color="#60A5FA" />

      {/* Cyber Grid Platform */}
      <gridHelper ref={gridRef} args={[180, 18, "#2563EB", "#1D4ED8"]} position={[0, -5, 0]} />
      
      {/* Outer Orbit Particles in Projects World */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 450 }, () => [
                  (Math.random() - 0.5) * 200,
                  Math.random() * 80 - 20,
                  (Math.random() - 0.5) * 200
                ]).flat()
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.65}
          color="#3B82F6"
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Rendering Project Buildings */}
      {projects.map((proj) => {
        const isHovered = hoveredNode === proj.id;
        const isSelected = selectedNode?.id === proj.id;

        const handlePointerOver = (e: any) => {
          e.stopPropagation();
          setHoveredNode(proj.id);
          document.body.style.cursor = "pointer";
          audio.playHoverSound();
        };

        const handlePointerOut = () => {
          setHoveredNode(null);
          document.body.style.cursor = "default";
        };

        const handleClick = (e: any) => {
          e.stopPropagation();
          audio.playClickSound();
          setSelectedNode(proj);
        };

        return (
          <group key={proj.id} position={proj.position}>
            {/* Holographic light beam from bottom */}
            <mesh position={[0, -10, 0]}>
              <cylinderGeometry args={[4, 8, 30, 16, 1, true]} />
              <meshBasicMaterial
                color={proj.color}
                transparent
                opacity={isHovered ? 0.28 : 0.08}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Skyscrapers / Structures */}
            <SleekSpireTower
              color={proj.color}
              isHovered={isHovered}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
              id={proj.id}
            />

            {/* 3D Telemetry Hover label */}
            {isHovered && !selectedNode && (
              <Html distanceFactor={30} position={[0, 18, 0]}>
                <div className="bg-black/90 border border-blue-500 p-4 rounded shadow-[0_0_20px_rgba(59,130,246,0.35)] flex flex-col gap-1 w-56 font-mono text-[9px] text-white pointer-events-none select-none tracking-widest leading-relaxed">
                  <span className="text-blue-500 font-extrabold">// SYSTEM_NODE_ACTIVE</span>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{proj.title}</h4>
                  <span className="text-[7.5px] text-neutral-400">ROLE: {proj.role}</span>
                  <div className="w-full h-[1px] bg-white/10 my-1" />
                  <div className="flex flex-wrap gap-1">
                    {proj.tech.map((t) => (
                      <span key={t} className="bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[6.5px] rounded text-blue-300">{t}</span>
                    ))}
                  </div>
                  <div className="w-full h-[1px] bg-white/10 my-1" />
                  <span className="text-[7.5px] text-blue-400 animate-pulse">[ CLICK TO ACCESS DATA ]</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Selected Project Full Screen Holographic HUD Interface */}
      {selectedNode && (
        <Html center>
          <div className="w-[85vw] max-w-lg bg-black/85 border border-blue-500 p-6 md:p-8 rounded shadow-[0_0_35px_rgba(37,99,235,0.45)] flex flex-col gap-4 font-mono text-white relative backdrop-blur-xl animate-[pulse_6s_infinite]">
            <span className="absolute top-2 left-2 text-[7px] text-blue-500/60 tracking-wider">PROJECT_SYS_DOCK // LEVEL_09</span>
            
            <div className="flex justify-between items-center border-b border-blue-500/20 pb-3 mt-1">
              <div>
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">// PROJECT TRANSMISSION</span>
                <h3 className="text-lg font-extrabold text-white tracking-widest uppercase mt-0.5">{selectedNode.title}</h3>
              </div>
              <button
                onClick={() => {
                  audio.playClickSound();
                  setSelectedNode(null);
                }}
                className="text-[9px] border border-blue-500/40 text-blue-400 px-3 py-1 hover:bg-blue-500/15 rounded transition-all cursor-pointer"
              >
                [ CLOSE_COMM ]
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans mt-1">
              {selectedNode.desc}
            </p>

            <div>
              <span className="text-[8px] text-neutral-400 uppercase tracking-widest block mb-2">// CAPABILITY Badges</span>
              <div className="flex flex-wrap gap-2">
                {selectedNode.tech.map((t) => (
                  <span key={t} className="bg-blue-950/30 border border-blue-500/25 px-2.5 py-1 text-[8px] rounded text-blue-300 tracking-wide font-mono uppercase">{t}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              {selectedNode.github && (
                <a
                  href={selectedNode.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border border-blue-500/40 text-blue-400 hover:text-white hover:bg-blue-500/10 text-[10px] tracking-wider uppercase font-bold py-2.5 rounded transition-all"
                >
                  SOURCE_CODE
                </a>
              )}
              {selectedNode.live && (
                <a
                  href={selectedNode.live}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] tracking-wider uppercase font-bold py-2.5 rounded transition-all shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                >
                  LIVE_LAUNCH
                </a>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
