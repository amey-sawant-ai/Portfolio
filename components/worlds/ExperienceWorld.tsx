"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { audio } from "@/lib/audio";

interface ExperienceWorldProps {
  onBack: () => void;
}

interface Milestone {
  year: string;
  role: string;
  company: string;
  desc: string;
  position: [number, number, number];
  logs: string[];
}

interface GatewayProps {
  isActive: boolean;
  color: string;
}

function ChronologicalGateway({ isActive, color }: GatewayProps) {
  const outerRingRef = useRef<THREE.Mesh | null>(null);
  const gearRef = useRef<THREE.Group | null>(null);
  const innerRingRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.05;
    }
    if (gearRef.current) {
      gearRef.current.rotation.z = -t * 0.22;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.55;
      innerRingRef.current.rotation.x = Math.sin(t * 0.8) * 0.12;
    }
  });

  const mainColor = isActive ? "#EF4444" : "#7F1D1D";
  const neonColor = isActive ? "#FCA5A5" : "#991B1B";

  // Programmatically build chronological gear teeth on a ring
  const teeth = useMemo(() => {
    const count = 16;
    const items = [];
    const radius = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      items.push(
        <mesh key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
          <boxGeometry args={[1.2, 1.2, 0.6]} />
          <meshStandardMaterial
            color={mainColor}
            roughness={0.2}
            metalness={0.9}
            emissive={new THREE.Color(mainColor)}
            emissiveIntensity={isActive ? 0.35 : 0.05}
          />
        </mesh>
      );
    }
    return items;
  }, [mainColor, isActive]);

  return (
    <group>
      {/* Thick outer structural torus ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[12, 0.65, 32, 64]} />
        <meshStandardMaterial
          color={mainColor}
          roughness={0.15}
          metalness={0.9}
          emissive={new THREE.Color(mainColor)}
          emissiveIntensity={isActive ? 0.55 : 0.1}
          transparent
          opacity={isActive ? 0.95 : 0.4}
        />
      </mesh>

      {/* Gears with chronological teeth */}
      <group ref={gearRef}>
        {teeth}
        {/* Inner Gear Connective Ring */}
        <mesh>
          <torusGeometry args={[11.2, 0.25, 16, 64]} />
          <meshStandardMaterial
            color={mainColor}
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={isActive ? 0.9 : 0.3}
          />
        </mesh>
      </group>

      {/* Inner Neon Energy Tracking Ring */}
      <mesh ref={innerRingRef} position={[0, 0, 0]}>
        <torusGeometry args={[10.2, 0.18, 16, 64]} />
        <meshBasicMaterial
          color={neonColor}
          transparent
          opacity={isActive ? 0.95 : 0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sub-glow Outer Ring Structure */}
      <mesh rotation={[0, 0, Math.PI / 4]} scale={1.12}>
        <torusGeometry args={[12.8, 0.12, 8, 4]} />
        <meshBasicMaterial
          color="#EF4444"
          transparent
          opacity={isActive ? 0.5 : 0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function ExperienceWorld({ onBack }: ExperienceWorldProps) {
  const { camera } = useThree();
  const [currentIdx, setCurrentIdx] = useState(3); // Start at newest (2026)
  const groupRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0.25;
    }
  }, []);

  const milestones: Milestone[] = useMemo(() => [
    {
      year: "2023",
      role: "Junior Software Engineer",
      company: "INFOTECH NETWORKS",
      desc: "Configured microservice APIs, containerized deployment systems (Docker), and optimized CI/CD hooks on Google Cloud Platform to maintain automated build loops.",
      position: [0, 0, 150],
      logs: [
        "CONTAINERS: Docker status optimized",
        "CI/CD: Build pipelines accelerated",
        "CLOUD: GCP compute bounds stabilized"
      ]
    },
    {
      year: "2024",
      role: "Software Developer",
      company: "AI LABS INC",
      desc: "Supervised dynamic system transitions on client-facing applications. Reduced dashboard loading lags by 45% via cache structuring, DB indexes, and asynchronous worker queues.",
      position: [0, 0, 70],
      logs: [
        "DATABASES: PostgreSQL / MongoDB indexing",
        "LATENCY OUT: < 12ms network roundtrip",
        "CACHING: Redis cache clustering deployed"
      ]
    },
    {
      year: "2025",
      role: "Senior AI Engineer",
      company: "AI SYSTEMS CORP",
      desc: "Crafted real-time autonomous reasoning agents using LangGraph and vector index search pipelines. Optimized local inference loops and fine-tuned models.",
      position: [0, 0, -10],
      logs: [
        "MODELS: Llama / Qwen fine-tuning complete",
        "AGENTS: Swarm orchestration active",
        "VECTOR INDEX: Sub-ms retrieval verified"
      ]
    },
    {
      year: "2026",
      role: "Creative Technologist",
      company: "UNIVERSE ARCHITECT",
      desc: "Architected point-cloud rendering layouts, customized GLSL shaders, and autonomous AI agents. Fusing interactive WebGL physics with modern frontend architectures.",
      position: [0, 0, -90],
      logs: [
        "SYSTEMS LOADED: agentic_swarm_engine.py",
        "RENDERER: WebGL_corona_sun_shader.glsl",
        "BANDWIDTH LIMIT: 99.8% STABLE"
      ]
    }
  ], []);

  // Animate camera position when index changes
  useEffect(() => {
    const targetMilestone = milestones[currentIdx];
    
    // Position camera right in front of the active gateway looking down the canyon
    gsap.to(camera.position, {
      x: targetMilestone.position[0],
      y: targetMilestone.position[1] + 4,
      z: targetMilestone.position[2] + 40,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(
          new THREE.Vector3(
            targetMilestone.position[0],
            targetMilestone.position[1] + 2,
            targetMilestone.position[2] - 30
          )
        );
      }
    });
  }, [currentIdx, camera, milestones]);

  const handleNext = () => {
    if (currentIdx < milestones.length - 1) {
      audio.playClickSound();
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      audio.playClickSound();
      setCurrentIdx((prev) => prev - 1);
    }
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 30, -50]} intensity={10} distance={300} color="#EF4444" />
      <directionalLight position={[10, 50, 10]} intensity={0.4} color="#FCA5A5" />

      {/* Red Canyon Floor Grid */}
      <gridHelper ref={gridRef} args={[200, 20, "#DC2626", "#991B1B"]} position={[0, -2, 0]} />

      {/* Timeline Canyon Path Line */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 300 }, () => [
                  (Math.random() - 0.5) * 40,
                  Math.random() * 20 - 2,
                  (Math.random() - 0.5) * 300
                ]).flat()
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.55}
          color="#EF4444"
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Gateways & Milestones */}
      {milestones.map((ms, idx) => {
        const isActive = idx === currentIdx;
        
        return (
          <group key={ms.year} position={ms.position}>
            <ChronologicalGateway isActive={isActive} color="#EF4444" />

            {/* Glowing portal entrance mist */}
            <mesh position={[0, 0, -1]}>
              <cylinderGeometry args={[12, 12, 0.5, 32, 1, true]} />
              <meshBasicMaterial
                color="#DC2626"
                transparent
                opacity={isActive ? 0.08 : 0.01}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Holographic Log Info Overlay next to each gateway */}
            {isActive && (
              <Html center distanceFactor={28} position={[-18, 5, 0]}>
                <div className="bg-black/90 border border-red-500/40 p-6 rounded shadow-[0_0_25px_rgba(239,68,68,0.3)] flex flex-col gap-3 w-80 font-mono text-white text-left select-text relative backdrop-blur-xl">
                  <span className="absolute top-2 right-2 text-[7px] text-red-500/40 font-bold tracking-widest uppercase">SYS_LOG_GATEWAY: 0{idx+1}</span>
                  
                  <div>
                    <span className="text-[9px] text-red-400 font-extrabold tracking-widest block">{ms.year} // SYSTEM ENGAGED</span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">{ms.role}</h4>
                    <span className="text-[8px] text-neutral-400 font-semibold tracking-wide uppercase">{ms.company}</span>
                  </div>

                  <p className="text-[10px] text-neutral-300 leading-relaxed font-sans mt-0.5">
                    {ms.desc}
                  </p>

                  <div className="bg-[#020205] border border-white/5 p-3 rounded font-mono text-[7.5px] text-red-500/80 space-y-1">
                    {ms.logs.map((log, lIdx) => (
                      <div key={lIdx} className="flex gap-1.5">
                        <span>&gt;</span>
                        <span className="tracking-wider">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Navigation Controls in 3D Space */}
      <Html center position={[0, -4, 250]}>
        <div className="flex gap-6 select-none pointer-events-auto mt-[42vh]">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-6 py-2.5 border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white rounded font-bold tracking-widest text-[9px] uppercase transition-all disabled:opacity-30 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(239,68,68,0.35)] cursor-pointer"
          >
            &lt; TRAVEL BACKWARD
          </button>
          <button
            onClick={handleNext}
            disabled={currentIdx === milestones.length - 1}
            className="px-6 py-2.5 border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white rounded font-bold tracking-widest text-[9px] uppercase transition-all disabled:opacity-30 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(239,68,68,0.35)] cursor-pointer"
          >
            TRAVEL FORWARD &gt;
          </button>
        </div>
      </Html>
    </group>
  );
}
