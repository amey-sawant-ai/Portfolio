"use client";

import React, { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Sparkles, Terminal } from "lucide-react";
import { audio } from "@/lib/audio";

interface CreatorWorldProps {
  onBack: () => void;
}

interface PhilosophyNode {
  label: string;
  title: string;
  text: string;
  position: [number, number, number];
  color: string;
}

function SolarStormLoops() {
  const loop1Ref = useRef<THREE.Mesh | null>(null);
  const loop2Ref = useRef<THREE.Mesh | null>(null);
  const loop3Ref = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (loop1Ref.current) {
      loop1Ref.current.rotation.x = t * 0.15;
      loop1Ref.current.rotation.y = t * 0.25;
    }
    if (loop2Ref.current) {
      loop2Ref.current.rotation.y = -t * 0.3;
      loop2Ref.current.rotation.z = t * 0.12;
    }
    if (loop3Ref.current) {
      loop3Ref.current.rotation.x = -t * 0.22;
      loop3Ref.current.rotation.z = -t * 0.18;
    }
  });

  return (
    <group position={[0, 15, -15]} scale={1.2}>
      {/* Loop 1: Inner Solar Flare Loop */}
      <mesh ref={loop1Ref}>
        <torusGeometry args={[13.5, 0.45, 16, 64]} />
        <meshBasicMaterial
          color="#FF7800"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Loop 2: Middle Prominence Loop */}
      <mesh ref={loop2Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[15.0, 0.35, 16, 64]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Loop 3: Outer Coronal Loop */}
      <mesh ref={loop3Ref} rotation={[-Math.PI / 6, 0, Math.PI / 3]}>
        <torusGeometry args={[17.2, 0.25, 16, 64]} />
        <meshBasicMaterial
          color="#EF4444"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function CreatorWorld({ onBack }: CreatorWorldProps) {
  const [selectedNode, setSelectedNode] = useState<PhilosophyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const silhouetteRef = useRef<THREE.Mesh | null>(null);

  const nodes: PhilosophyNode[] = useMemo(() => [
    {
      label: "IDENTITY",
      title: "WHO I AM",
      text: "A Mumbai-based software architect, creative technologist, and digital explorer. I seek the intersection where mathematical code structures meet human aesthetics.",
      position: [-38, 12, 10],
      color: "#FBBF24"
    },
    {
      label: "CRAFT",
      title: "WHAT I BUILD",
      text: "High-performance reactive interfaces, autonomous agent execution systems, and custom real-time WebGL graphics layers. I make software that feels alive.",
      position: [-18, 30, -30],
      color: "#F59E0B"
    },
    {
      label: "MISSION",
      title: "MY MISSION",
      text: "To bridge the gap between deterministic software and autonomous cognitive entities. I build systems that augment human intelligence and creativity.",
      position: [18, 30, -30],
      color: "#F97316"
    },
    {
      label: "HISTORY",
      title: "MY JOURNEY",
      text: "Began by designing simple scripts, evolved to backend API scaling, and now architecting immersive 3D portals and autonomous agent structures.",
      position: [38, 12, 10],
      color: "#EF4444"
    },
    {
      label: "PURPOSE",
      title: "MY VISION",
      text: "To architect systems that allow everyone to command and create their own personal universes of knowledge and compute. Coding is the ultimate act of creation.",
      position: [0, -8, 35],
      color: "#FBBF24"
    }
  ], []);

  // Gold-orange creator silhouette shader material
  const silhouetteMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color("#F59E0B") }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float intensity = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.0);
          gl_FragColor = vec4(glowColor * intensity * 2.2, intensity * 0.95);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  // Swirling solar storm particles
  const particles = useMemo(() => {
    const coords = [];
    const velocities = [];
    const count = 500;
    for (let i = 0; i < count; i++) {
      const radius = 10 + Math.random() * 70;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 55;
      coords.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      velocities.push(0.5 + Math.random() * 1.5);
    }
    return {
      pos: new Float32Array(coords),
      vel: velocities
    };
  }, []);

  const posArray = useMemo(() => new Float32Array(particles.pos), [particles]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Swirling rotation
      groupRef.current.rotation.y = t * 0.04;
    }
    if (silhouetteRef.current) {
      silhouetteRef.current.position.y = 15 + Math.sin(t * 1.2) * 1.5;
    }
  });

  return (
    <group>
      {/* High Intensity Solar Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 15, 0]} intensity={25} distance={300} color="#FF9F1C" />
      <directionalLight position={[0, 100, 0]} intensity={0.8} color="#FFFbeb" />

      {/* Rotating Solar Swirl Group */}
      <group ref={groupRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[posArray, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.75}
            color="#FF6A00"
            transparent
            opacity={0.45}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Orbiting Philosophy Core Nodes */}
        {nodes.map((node, idx) => {
          const isHovered = hoveredNode === node.label;
          
          return (
            <group key={node.label} position={node.position}>
              <mesh
                onPointerOver={() => {
                  setHoveredNode(node.label);
                  audio.playHoverSound();
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  setHoveredNode(null);
                  document.body.style.cursor = "default";
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  audio.playClickSound();
                  setSelectedNode(node);
                }}
                scale={isHovered ? 1.25 : 1.0}
              >
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshStandardMaterial
                  color={node.color}
                  roughness={0.1}
                  metalness={0.9}
                  emissive={node.color}
                  emissiveIntensity={isHovered ? 0.75 : 0.2}
                />
              </mesh>

              {/* Glowing halo */}
              <mesh scale={2.0}>
                <sphereGeometry args={[2.5, 16, 16]} />
                <meshBasicMaterial
                  color={node.color}
                  transparent
                  opacity={isHovered ? 0.45 : 0.12}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>

              {/* Node label projection */}
              <Html distanceFactor={28} center position={[0, 5, 0]}>
                <div className="bg-black/90 border border-amber-500/30 text-white font-mono text-[8.5px] py-1 px-2.5 rounded shadow-[0_0_12px_rgba(245,158,11,0.25)] tracking-widest whitespace-nowrap select-none pointer-events-none uppercase">
                  // {node.label}
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* Creator Portrait Silhouette at Solar Core Center */}
      <mesh ref={silhouetteRef} position={[0, 15, -15]} scale={1.2}>
        <sphereGeometry args={[12, 64, 64]} />
        <primitive object={silhouetteMaterial} attach="material" />
      </mesh>

      {/* Solar storm flare loops orbiting the core */}
      <SolarStormLoops />

      {/* Custom Selected Node Philosophy Frame */}
      {selectedNode && (
        <Html center>
          <div className="w-[85vw] max-w-sm bg-black/90 border border-amber-500 p-6 rounded shadow-[0_0_35px_rgba(245,158,11,0.4)] flex flex-col gap-3 font-mono text-white relative backdrop-blur-xl animate-[pulse_6s_infinite] select-text">
            <span className="absolute top-2 left-2 text-[7px] text-amber-500/50 tracking-wider">CREATOR_CORE_STREAM // LVL_09</span>
            
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3 mt-1">
              <div>
                <span className="text-[9px] text-amber-500 font-extrabold tracking-widest block">// PHILOSOPHY NODE</span>
                <h3 className="text-sm font-bold text-white tracking-widest uppercase mt-0.5">{selectedNode.title}</h3>
              </div>
              <button
                onClick={() => {
                  audio.playClickSound();
                  setSelectedNode(null);
                }}
                className="text-[9px] border border-amber-500/40 text-amber-500 px-3 py-1 hover:bg-amber-500/15 rounded transition-all cursor-pointer pointer-events-auto"
              >
                [ DISCONNECT ]
              </button>
            </div>

            <p className="text-[11px] text-neutral-200 leading-relaxed font-sans mt-1">
              {selectedNode.text}
            </p>

            <div className="pt-2 border-t border-amber-500/10 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span className="text-[7.5px] text-amber-500/40 uppercase tracking-widest">CREATION CORE ACTIVE // WARP STABLE</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
