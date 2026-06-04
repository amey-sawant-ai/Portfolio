"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { audio } from "@/lib/audio";

interface SkillsWorldProps {
  onBack: () => void;
}

// Generates Saturn's gas band texture
function createSaturnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#271203");
  grad.addColorStop(0.15, "#451a03");
  grad.addColorStop(0.32, "#78350f");
  grad.addColorStop(0.48, "#d97706");
  grad.addColorStop(0.55, "#b45309");
  grad.addColorStop(0.72, "#78350f");
  grad.addColorStop(0.88, "#451a03");
  grad.addColorStop(1.0, "#271203");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Render micro atmospheric bands
  for (let i = 0; i < 25; i++) {
    const y = Math.random() * 256;
    const h = Math.random() * 8 + 2;
    ctx.fillStyle = "rgba(251, 191, 36, 0.08)";
    ctx.fillRect(0, y, 512, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generates Saturn's ring texture
function createSaturnRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 8;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 8);

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, "rgba(251, 191, 36, 0.0)");
  grad.addColorStop(0.15, "rgba(245, 158, 11, 0.55)");
  grad.addColorStop(0.44, "rgba(245, 158, 11, 0.7)");
  grad.addColorStop(0.48, "rgba(245, 158, 11, 0.02)"); 
  grad.addColorStop(0.56, "rgba(251, 191, 36, 0.65)");
  grad.addColorStop(1.0, "rgba(251, 191, 36, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 8);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function SkillsWorld({ onBack }: SkillsWorldProps) {
  const saturnRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Group | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);

  const saturnTexture = useMemo(() => createSaturnTexture(), []);
  const ringTexture = useMemo(() => createSaturnRingTexture(), []);

  const skillsList = useMemo(() => [
    { name: "React", r: 35, angle: 0, color: "#60A5FA" },
    { name: "Next.js", r: 35, angle: 1.1, color: "#F3F4F6" },
    { name: "TypeScript", r: 48, angle: 0.5, color: "#3178C6" },
    { name: "Node.js", r: 48, angle: 2.1, color: "#10B981" },
    { name: "Python", r: 60, angle: 1.6, color: "#F59E0B" },
    { name: "Rust", r: 60, angle: 3.3, color: "#EF4444" },
    { name: "Docker", r: 72, angle: 2.7, color: "#3B82F6" },
    { name: "AWS / GCP", r: 72, angle: 4.5, color: "#F97316" },
    { name: "AI Swarms", r: 85, angle: 3.9, color: "#A855F7" },
    { name: "PyTorch", r: 85, angle: 5.4, color: "#EE4C2C" }
  ], []);

  // Neural Connection Constellations
  const networkData = useMemo(() => {
    const coords: THREE.Vector3[] = [];
    
    // Connect each skill to its neighbors to form relationships
    for (let i = 0; i < skillsList.length; i++) {
      const s1 = skillsList[i];
      const p1 = new THREE.Vector3(
        Math.cos(s1.angle) * s1.r,
        (Math.sin(s1.angle * 4) * 4), 
        Math.sin(s1.angle) * s1.r
      );
      
      // Connect to next 2 skills
      for (let j = 1; j <= 2; j++) {
        const s2 = skillsList[(i + j) % skillsList.length];
        const p2 = new THREE.Vector3(
          Math.cos(s2.angle) * s2.r,
          (Math.sin(s2.angle * 4) * 4),
          Math.sin(s2.angle) * s2.r
        );
        coords.push(p1, p2);
      }
    }
    
    const geom = new THREE.BufferGeometry().setFromPoints(coords);
    return geom;
  }, [skillsList]);

  // Orbiting Energy flow particles
  const particles = useMemo(() => {
    const coords = [];
    const count = 300;
    for (let i = 0; i < count; i++) {
      const radius = 30 + Math.random() * 60;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4;
      coords.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
    return new Float32Array(coords);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (saturnRef.current) {
      saturnRef.current.rotation.y = t * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.045; // Orbiting rotation of technology tags
    }
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.12;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 0, 0]} intensity={12} distance={250} color="#FBBF24" />
      <directionalLight position={[20, 80, -20]} intensity={0.4} color="#FFFBEB" />

      {/* Saturn Core Planet Sphere */}
      <mesh ref={saturnRef} scale={1.8}>
        <sphereGeometry args={[14, 64, 64]} />
        <meshStandardMaterial
          map={saturnTexture}
          roughness={0.6}
          metalness={0.15}
          emissive="#d97706"
          emissiveIntensity={0.05}
        />
        
        {/* Volumetric glow overlay */}
        <mesh scale={1.22}>
          <sphereGeometry args={[14, 32, 32]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      </mesh>

      {/* Skills Rings & Nodes Group */}
      <group ref={ringRef}>
        {/* Glowing Neural Network lines */}
        <lineSegments geometry={networkData}>
          <lineBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        {/* Floating tech nodes */}
        {skillsList.map((skill, idx) => {
          const x = Math.cos(skill.angle) * skill.r;
          const z = Math.sin(skill.angle) * skill.r;
          const y = Math.sin(skill.angle * 4) * 4;

          return (
            <group key={idx} position={[x, y, z]}>
              {/* Core Node Dot */}
              <mesh>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshBasicMaterial color={skill.color} />
              </mesh>
              {/* Outer Glow Halo */}
              <mesh scale={2.2}>
                <sphereGeometry args={[1.2, 8, 8]} />
                <meshBasicMaterial
                  color={skill.color}
                  transparent
                  opacity={0.35}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>

              {/* HTML Telemetry label */}
              <Html distanceFactor={28} center position={[0, 4, 0]}>
                <div
                  onPointerOver={() => audio.playHoverSound()}
                  className="bg-black/90 border border-amber-500/30 text-white hover:border-amber-500 hover:text-amber-300 font-mono text-[9px] py-1 px-2.5 rounded shadow-[0_0_12px_rgba(245,158,11,0.2)] tracking-widest whitespace-nowrap cursor-default pointer-events-auto transition-all select-none"
                  style={{ textShadow: `0 0 6px ${skill.color}` }}
                >
                  // {skill.name.toUpperCase()}
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* Orbiting Ring Particles */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.65}
          color="#fbbf24"
          transparent
          opacity={0.45}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 3D Static Rings mock for visual continuity */}
      <mesh rotation={[Math.PI / 2.15, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[26, 95, 64]} />
        <meshBasicMaterial
          map={ringTexture}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
