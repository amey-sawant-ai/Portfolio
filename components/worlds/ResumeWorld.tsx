"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FileText, Download, Award } from "lucide-react";
import { audio } from "@/lib/audio";

interface ResumeWorldProps {
  onBack: () => void;
}

function PrismaticCrystalCluster() {
  const coreRef = useRef<THREE.Group | null>(null);
  const shardRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25;
      coreRef.current.position.y = Math.sin(t * 1.5) * 0.5;
    }
    // Rotate individual shards slightly differently for a dynamic feel
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
      emissive: "#ffffff",
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88,
    });
  }, []);

  const wireframeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#9CA3AF",
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Shard specifications: scale, position offset, rotation offset
  const shards = useMemo(() => [
    { scale: [1, 2.2, 1], pos: [0, 0, 0], rot: [0, 0, 0] }, // Main Central Spire
    { scale: [0.55, 1.4, 0.55], pos: [-2.5, -2, 2.5], rot: [0.2, 0.1, -0.2] }, // Side Shard 1
    { scale: [0.5, 1.2, 0.5], pos: [3, -2.5, 2], rot: [0.25, -0.2, 0.2] }, // Side Shard 2
    { scale: [0.45, 1.3, 0.45], pos: [2.5, -2.2, -2.5], rot: [-0.2, 0.15, 0.15] }, // Side Shard 3
    { scale: [0.6, 1.5, 0.6], pos: [-3, -1.8, -2], rot: [-0.15, -0.15, -0.25] }, // Side Shard 4
  ], []);

  return (
    <group ref={coreRef} position={[0, 12, 0]}>
      {shards.map((spec, i) => (
        <group key={i} position={spec.pos as any} rotation={spec.rot as any}>
          {/* Solid Crystal Shard */}
          <mesh
            ref={(el) => { shardRefs.current[i] = el; }}
            scale={spec.scale as any}
            material={crystalMaterial}
          >
            <octahedronGeometry args={[5]} />
          </mesh>

          {/* Glowing Wireframe Outer shell */}
          <mesh
            scale={[spec.scale[0] * 1.15, spec.scale[1] * 1.12, spec.scale[2] * 1.15]}
            material={wireframeMaterial}
          >
            <octahedronGeometry args={[5]} />
          </mesh>
        </group>
      ))}

      {/* Volumetric energy particle aura rising from crystals */}
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
  const documentsRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0.15;
    }
  }, []);

  const achievements = useMemo(() => [
    { title: "B.E. COMPUTER ENGINEERING", year: "Graduated", desc: "First Class with Distinction" },
    { title: "GCP ASSOCIATE CLOUD ENGINEER", year: "Certified", desc: "Enterprise cloud deployment & scaling" },
    { title: "AI RESEARCH AGENT ENGINE", year: "Published", desc: "Custom multi-agent swarm architecture project" }
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (documentsRef.current) {
      documentsRef.current.rotation.y = t * 0.06; // Orbiting files
    }
  });

  return (
    <group>
      <ambientLight intensity={0.16} />
      <pointLight position={[0, 10, 0]} intensity={14} distance={200} color="#9CA3AF" />
      <directionalLight position={[-15, 60, -15]} intensity={0.4} color="#E5E7EB" />

      {/* Cosmic Library Silver Grid */}
      <gridHelper ref={gridRef} args={[150, 15, "#9CA3AF", "#4B5563"]} position={[0, -6, 0]} />

      {/* Halo Stardust Orbit Rings */}
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

      {/* Central Archivist Crystal Cluster */}
      <PrismaticCrystalCluster />

      {/* Orbiting Documents / Floating Records */}
      <group ref={documentsRef} position={[0, 10, 0]}>
        {achievements.map((ach, idx) => {
          const angle = (idx / achievements.length) * Math.PI * 2;
          const r = 40;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;

          return (
            <group key={idx} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
              {/* Floating Holographic sheet */}
              <mesh>
                <planeGeometry args={[14, 18]} />
                <meshBasicMaterial
                  color="#4B5563"
                  transparent
                  opacity={0.14}
                  side={THREE.DoubleSide}
                />
              </mesh>
              
              {/* Glowing Wireframe Border */}
              <mesh scale={1.01}>
                <planeGeometry args={[14, 18]} />
                <meshBasicMaterial
                  color="#9CA3AF"
                  wireframe
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Document detail HTML Overlay */}
              <Html center distanceFactor={28} position={[0, 0, 0.1]}>
                <div
                  onPointerOver={() => audio.playHoverSound()}
                  className="w-48 text-left p-3 font-mono text-white pointer-events-none select-none"
                >
                  <Award className="w-4 h-4 text-neutral-400 mb-1 animate-pulse" />
                  <span className="text-[7px] text-neutral-400 block tracking-widest">{ach.year} // VERIFIED</span>
                  <h4 className="text-[9.5px] font-bold text-neutral-200 tracking-wider uppercase mt-0.5 leading-tight">{ach.title}</h4>
                  <div className="w-full h-[1px] bg-white/10 my-1" />
                  <p className="text-[8px] text-neutral-400 leading-normal font-sans">{ach.desc}</p>
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* Download Center terminal UI */}
      <Html center distanceFactor={34} position={[0, -2, 28]}>
        <div className="w-[85vw] max-w-sm bg-black/85 border border-neutral-500/40 p-6 md:p-8 rounded shadow-[0_0_30px_rgba(156,163,175,0.25)] flex flex-col items-center gap-4 text-center font-mono text-white relative backdrop-blur-xl">
          <span className="absolute top-2 left-2 text-[7px] text-neutral-500/50 tracking-wider">CREATOR_SPEC_ARCHIVE // LVL_09</span>
          
          <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center relative mt-2">
            <FileText className="w-7 h-7 text-neutral-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-neutral-500/20 border-dashed animate-[spin_20s_linear_infinite]" />
          </div>

          <div>
            <span className="text-[9px] text-neutral-400 font-extrabold tracking-widest block uppercase">// SPECIFICATIONS DUMP</span>
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mt-0.5">RESUME_ARCHIVE_GATEWAY</h3>
          </div>

          <p className="text-[10px] text-neutral-400 leading-relaxed font-sans max-w-xs">
            Download the structured credentials profile database to inspect technical stacks, employment chronology, and project architectures.
          </p>

          <a
            href="/resume.pdf"
            download
            onClick={() => audio.playClickSound()}
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 py-3 rounded font-bold tracking-widest text-[10px] uppercase transition-all hover:scale-103 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)] pointer-events-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD_RESUME_PDF</span>
          </a>
        </div>
      </Html>
    </group>
  );
}
