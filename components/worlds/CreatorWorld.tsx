"use client";

import React, { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Sparkles } from "lucide-react";
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

// Generates a futuristic tech HUD ring texture dynamically
function createTechRadarTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 512);

  const center = 256;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  // Outer boundary circle
  ctx.beginPath();
  ctx.arc(center, center, 240, 0, Math.PI * 2);
  ctx.stroke();

  // Concentric dashed circles
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 12]);
  ctx.beginPath();
  ctx.arc(center, center, 180, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(center, center, 120, 0, Math.PI * 2);
  ctx.stroke();

  // Solid inner circle
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(center, center, 60, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshairs
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(center - 250, center);
  ctx.lineTo(center - 20, center);
  ctx.moveTo(center + 20, center);
  ctx.lineTo(center + 250, center);
  ctx.moveTo(center, center - 250);
  ctx.lineTo(center, center - 20);
  ctx.moveTo(center, center + 20);
  ctx.lineTo(center, center + 250);
  ctx.stroke();

  // Ticks around the edge
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 360; i += 15) {
    const rad = (i * Math.PI) / 180;
    const x1 = center + Math.cos(rad) * 230;
    const y1 = center + Math.sin(rad) * 230;
    const x2 = center + Math.cos(rad) * 240;
    const y2 = center + Math.sin(rad) * 240;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Tech labelling
  ctx.fillStyle = color;
  ctx.font = "bold 12px monospace";
  ctx.fillText("CORE_NET_09", center - 42, center + 4);
  ctx.fillText("000° / N", center - 24, center - 243);
  ctx.fillText("090° / E", center + 215, center + 4);
  ctx.fillText("180° / S", center - 24, center + 250);
  ctx.fillText("270° / W", center - 245, center + 4);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Renders the energy packets traversing the telemetry connections
interface EnergyPacketsProps {
  targetPos: [number, number, number];
  isHovered: boolean;
  color: string;
}

function EnergyPackets({ targetPos, isHovered, color }: EnergyPacketsProps) {
  const packet1 = useRef<THREE.Mesh | null>(null);
  const packet2 = useRef<THREE.Mesh | null>(null);
  const packet3 = useRef<THREE.Mesh | null>(null);

  const speeds = useMemo(() => [
    0.28 + Math.random() * 0.08,
    0.22 + Math.random() * 0.08,
    0.18 + Math.random() * 0.08
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const baseSpeed = isHovered ? 2.5 : 1.0;
    const pRefs = [packet1, packet2, packet3];

    pRefs.forEach((ref, idx) => {
      if (ref.current) {
        // Offset starting times to stagger along the line
        const progress = ((t * speeds[idx] * baseSpeed) + (idx / 3.0)) % 1.0;
        ref.current.position.set(
          targetPos[0] * progress,
          targetPos[1] * progress,
          targetPos[2] * progress
        );

        const scale = (0.5 + Math.sin(t * 10 + idx) * 0.15) * (isHovered ? 1.6 : 1.0);
        ref.current.scale.setScalar(scale);
      }
    });
  });

  return (
    <group>
      <mesh ref={packet1}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={packet2}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={packet3}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// Crystalline Node Mesh
interface NodeMeshProps {
  node: PhilosophyNode;
  isHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: (e: any) => void;
}

function PhilosophyNodeMesh({ node, isHovered, onPointerOver, onPointerOut, onClick }: NodeMeshProps) {
  const crystalRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const scannerRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + node.position[0]; // phase offset
    if (crystalRef.current) {
      crystalRef.current.rotation.x = t * (isHovered ? 1.6 : 0.4);
      crystalRef.current.rotation.y = t * (isHovered ? 2.2 : 0.6);
      crystalRef.current.position.y = Math.sin(t * 1.5) * 0.8;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = -t * (isHovered ? 2.8 : 0.8);
      ringRef.current.rotation.x = t * 0.3;
    }
    if (scannerRef.current) {
      const scanScale = 1.0 + Math.sin(t * 3) * 0.15;
      scannerRef.current.scale.set(scanScale, scanScale, scanScale);
      (scannerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 3) * 0.08;
    }
  });

  return (
    <group position={node.position}>
      {/* Floating Crystal Core */}
      <mesh
        ref={crystalRef}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
        scale={isHovered ? 1.35 : 1.0}
      >
        <dodecahedronGeometry args={[2.5]} />
        <meshStandardMaterial
          color={node.color}
          roughness={0.05}
          metalness={0.95}
          emissive={node.color}
          emissiveIntensity={isHovered ? 1.6 : 0.3}
        />
      </mesh>

      {/* Orbiting Tech Ring */}
      <mesh ref={ringRef} scale={isHovered ? 1.4 : 1.0}>
        <torusGeometry args={[4.2, 0.08, 8, 32]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isHovered ? 0.95 : 0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Scanning Ring Underneath */}
      <mesh ref={scannerRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <ringGeometry args={[4.4, 4.7, 32]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Halo */}
      <mesh scale={2.8}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isHovered ? 0.35 : 0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Node Tag Overlay */}
      <Html distanceFactor={30} center position={[0, 9.5, 0]}>
        <div className="bg-black border-2 border-cyan-400 text-white font-mono text-[18px] py-2 px-5 rounded-md shadow-[0_0_20px_rgba(6,182,212,0.45)] tracking-[0.18em] whitespace-nowrap select-none pointer-events-none uppercase font-bold">
          <span className="text-cyan-400 mr-2">//</span>{node.label}
        </div>
      </Html>
    </group>
  );
}

// Concentric Outer Gyroscopic loops
function QuantumGyroCage() {
  const loop1Ref = useRef<THREE.Group | null>(null);
  const loop2Ref = useRef<THREE.Group | null>(null);
  const loop3Ref = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (loop1Ref.current) {
      loop1Ref.current.rotation.x = t * 0.15;
      loop1Ref.current.rotation.y = t * 0.22;
    }
    if (loop2Ref.current) {
      loop2Ref.current.rotation.y = -t * 0.25;
      loop2Ref.current.rotation.z = t * 0.18;
    }
    if (loop3Ref.current) {
      loop3Ref.current.rotation.x = -t * 0.2;
      loop3Ref.current.rotation.z = -t * 0.28;
    }
  });

  return (
    <group scale={1.25}>
      {/* Loop 1: Inner gyro ring - Cyan */}
      <group ref={loop1Ref}>
        <mesh>
          <torusGeometry args={[14.5, 0.08, 16, 100]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[14.5, 0.04, 8, 50]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Loop 2: Middle gyro ring - Amber */}
      <group ref={loop2Ref}>
        <mesh>
          <torusGeometry args={[16.2, 0.08, 16, 100]} />
          <meshBasicMaterial color="#ff7800" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Loop 3: Outer gyro ring - Purple */}
      <group ref={loop3Ref}>
        <mesh>
          <torusGeometry args={[18.0, 0.08, 16, 100]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Cybernetic DNA Helix Portal Component
function CyberneticDNAHelix() {
  const helixRef = useRef<THREE.Group | null>(null);

  const baseColors = ["#00ffcc", "#ff7800", "#8b5cf6", "#FBBF24"];

  const { points1, points2, rungs } = useMemo(() => {
    const p1: THREE.Vector3[] = [];
    const p2: THREE.Vector3[] = [];
    const lines: THREE.Vector3[] = [];
    const count = 54;
    const height = 45;
    const radius = 6.8;
    const turns = 2.2;

    for (let i = 0; i < count; i++) {
      const pct = i / (count - 1);
      const angle = pct * Math.PI * 2 * turns;
      const y = -height / 2 + pct * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = -Math.cos(angle) * radius;
      const z2 = -Math.sin(angle) * radius;

      const pt1 = new THREE.Vector3(x1, y, z1);
      const pt2 = new THREE.Vector3(x2, y, z2);

      p1.push(pt1);
      p2.push(pt2);

      // Connect Spiral 1 and Spiral 2 with a horizontal rung line
      lines.push(pt1, pt2);
    }

    const geom = new THREE.BufferGeometry().setFromPoints(lines);

    return {
      points1: p1,
      points2: p2,
      rungs: geom
    };
  }, []);

  const codeStrings = useMemo(() => [
    "const core = init()",
    "import { neural } from 'construct'",
    "class DNA extends System",
    "function synthesize(gen)",
    "await link.establish()",
    "0xAB772F99 // ACTIVE",
    "genome.mutate({ fps: 60 })",
    "return new Consciousness()",
    "if (system.clearance === 9)",
    "cognitive.sync(node)",
    "const creator = 'Amey Sawant'",
    "void* memory = alloc(512)",
    "std::vector<QuantumBit> q",
    "interface Soul { id: uuid }",
    "sys.inject(about_context)"
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (helixRef.current) {
      helixRef.current.rotation.y = t * 0.45;
    }
  });

  return (
    <group ref={helixRef}>
      {/* Rungs of the DNA ladder (Lines connecting base pairs) */}
      <lineSegments geometry={rungs}>
        <lineBasicMaterial
          color="#00ffcc"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Spiral 1 Nodes */}
      {points1.map((p, idx) => {
        const color = baseColors[idx % baseColors.length];
        return (
          <mesh key={`p1-${idx}`} position={p}>
            <sphereGeometry args={[0.42, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
        );
      })}

      {/* Spiral 2 Nodes */}
      {points2.map((p, idx) => {
        const color = baseColors[(idx + 2) % baseColors.length]; // Offset matching base color
        return (
          <mesh key={`p2-${idx}`} position={p}>
            <sphereGeometry args={[0.42, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
        );
      })}

      {/* Floating code strings wrapping the helix */}
      {codeStrings.map((str, idx) => {
        const pct = idx / codeStrings.length;
        const angle = pct * Math.PI * 2 * 2.2; // match turns
        const radius = 7.8; // slightly outside nodes
        const y = -22.5 + pct * 45;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Html
            key={`dna-code-${idx}`}
            position={[x, y, z]}
            distanceFactor={30}
            center
          >
            <div className="font-mono text-[7px] text-cyan-400 bg-slate-950/80 border border-cyan-500/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.15)] whitespace-nowrap select-none pointer-events-none tracking-wider animate-pulse">
              {str}
            </div>
          </Html>
        );
      })}

      {/* Central Energy Spine */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 47, 16]} />
        <meshBasicMaterial
          color="#ff5500"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Glow Core Overlay */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 47, 8]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.7}
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
  const disk1Ref = useRef<THREE.Mesh | null>(null);
  const disk2Ref = useRef<THREE.Mesh | null>(null);

  const nodes: PhilosophyNode[] = useMemo(() => [
    {
      label: "IDENTITY",
      title: "WHO I AM",
      text: "A Mumbai-based software architect, creative technologist, and digital explorer. I seek the intersection where mathematical code structures meet human aesthetics.",
      position: [-24.7, 7.8, 6.5],
      color: "#FBBF24"
    },
    {
      label: "CRAFT",
      title: "WHAT I BUILD",
      text: "High-performance reactive interfaces, autonomous agent execution systems, and custom real-time WebGL graphics layers. I make software that feels alive.",
      position: [-11.7, 19.5, -19.5],
      color: "#F59E0B"
    },
    {
      label: "MISSION",
      title: "MY MISSION",
      text: "To bridge the gap between deterministic software and autonomous cognitive entities. I build systems that augment human intelligence and creativity.",
      position: [11.7, 19.5, -19.5],
      color: "#F97316"
    },
    {
      label: "HISTORY",
      title: "MY JOURNEY",
      text: "Began by designing simple scripts, evolved to backend API scaling, and now architecting immersive 3D portals and autonomous agent structures.",
      position: [24.7, 7.8, 6.5],
      color: "#EF4444"
    },
    {
      label: "PURPOSE",
      title: "MY VISION",
      text: "To architect systems that allow everyone to command and create their own personal universes of knowledge and compute. Coding is the ultimate act of creation.",
      position: [0, -5.2, 22.75],
      color: "#FBBF24"
    }
  ], []);

  // Dynamic Tech Radar textures
  const radarCyanTex = useMemo(() => createTechRadarTexture("#00ffcc"), []);
  const radarAmberTex = useMemo(() => createTechRadarTexture("#ff7800"), []);

  // Swirling orange/cyan data particles
  const particles = useMemo(() => {
    const coords = [];
    const colors = [];
    const count = 600;
    const colorCyan = new THREE.Color("#00ffcc");
    const colorOrange = new THREE.Color("#ff7800");

    for (let i = 0; i < count; i++) {
      const radius = 12 + Math.random() * 65;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 45;
      coords.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

      const blendColor = Math.random() > 0.4 ? colorCyan : colorOrange;
      colors.push(blendColor.r, blendColor.g, blendColor.b);
    }
    return {
      pos: new Float32Array(coords),
      col: new Float32Array(colors)
    };
  }, []);

  const posArray = useMemo(() => particles.pos, [particles]);
  const colArray = useMemo(() => particles.col, [particles]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Component rotations
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04;
    }
    if (disk1Ref.current) {
      disk1Ref.current.rotation.z = t * 0.05;
    }
    if (disk2Ref.current) {
      disk2Ref.current.rotation.z = -t * 0.08;
    }
  });

  return (
    <group>
      {/* High Intensity Solar Lighting */}
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={18} distance={250} color="#FF7800" />
      <directionalLight position={[0, 100, 0]} intensity={0.6} color="#FFFBEB" />

      {/* Dynamic Swirling Data Particles */}
      <group ref={groupRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[posArray, 3]} />
            <bufferAttribute attach="attributes-color" args={[colArray, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.65}
            vertexColors
            transparent
            opacity={0.45}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Orbiting Philosophy Nodes */}
        {nodes.map((node) => {
          const isHovered = hoveredNode === node.label;
          return (
            <PhilosophyNodeMesh
              key={node.label}
              node={node}
              isHovered={isHovered}
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
            />
          );
        })}
      </group>

      {/* Laser Connections from center core to the nodes */}
      {nodes.map((node) => {
        const isHovered = hoveredNode === node.label;
        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...node.position)];
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <group key={`connection-${node.label}`}>
            {/* Primary glow line */}
            <line geometry={lineGeom}>
              <lineBasicMaterial
                color={isHovered ? "#00ffcc" : node.color}
                transparent
                opacity={isHovered ? 0.85 : 0.18}
                blending={THREE.AdditiveBlending}
              />
            </line>
            
            {/* Energy flow packets traversing along telemetry lines */}
            <EnergyPackets
              targetPos={node.position}
              isHovered={isHovered}
              color={isHovered ? "#00ffcc" : node.color}
            />
          </group>
        );
      })}

      {/* DNA Helix Core construct at the center */}
      <group>
        <CyberneticDNAHelix />
        
        {/* Orbiting gyroscopic loops enclosing the helix core */}
        <QuantumGyroCage />
      </group>

      {/* Concentric Tech Radar HUD Disks */}
      <group>
        {/* Tech radar disk 1 (Bottom, Cyan) */}
        <mesh ref={disk1Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, -18, 0]}>
          <planeGeometry args={[75, 75]} />
          <meshBasicMaterial
            map={radarCyanTex}
            transparent
            opacity={0.22}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Tech radar disk 2 (Top, Amber, slightly smaller) */}
        <mesh ref={disk2Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, 18, 0]} scale={0.75}>
          <planeGeometry args={[75, 75]} />
          <meshBasicMaterial
            map={radarAmberTex}
            transparent
            opacity={0.16}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Futuristic Cyberpunk HUD Diagnostic Overlay */}
      {selectedNode && (
        <Html center>
          <div className="w-[95vw] md:w-[940px] bg-slate-950 border-2 border-cyan-500/80 p-10 rounded-lg shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col gap-6 font-mono text-white relative select-text z-[100]">
            
            {/* Tech decorative corners */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-sm" />
            
            <span className="absolute top-3 left-4 text-[8px] text-cyan-400/60 tracking-widest uppercase">
              COGNITIVE_NODE_DOCK // LINK_ESTABLISHED
            </span>
            
            {/* Panel Header */}
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-5 mt-2">
              <div>
                <span className="text-[9px] text-cyan-400 font-extrabold tracking-[0.2em] block">
                  // SEC_DOCK_MEMORY
                </span>
                <h3 className="text-lg font-extrabold text-white tracking-widest uppercase mt-0.5">
                  {selectedNode.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  audio.playClickSound();
                  setSelectedNode(null);
                }}
                className="text-[10px] border border-cyan-500/40 text-cyan-400 px-5 py-2 hover:bg-cyan-500/15 hover:text-white rounded transition-all cursor-pointer pointer-events-auto font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              >
                [ DISCONNECT ]
              </button>
            </div>

            {/* Grid Layout */}
            <div className="flex flex-col md:grid md:grid-cols-5 gap-8">
              
              {/* Left Column: Core Text */}
              <div className="md:col-span-3 flex flex-col gap-5">
                <p className="text-[14px] text-neutral-100 leading-relaxed font-sans px-1">
                  {selectedNode.text}
                </p>
                
                <div className="mt-auto pt-2 hidden md:block">
                  <div className="flex items-center gap-2 text-[8px] text-cyan-400/55 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-[spin_4s_linear_infinite]" />
                    <span>SECURE NODE ACCESS DOCKED // DECRYPT OK</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Telemetry & Log stream */}
              <div className="md:col-span-2 flex flex-col gap-5 border-t md:border-t-0 md:border-l border-cyan-500/10 pt-4 md:pt-0 md:pl-6">
                
                {/* Tech stats layout */}
                <div className="flex flex-col gap-2.5 bg-slate-900 border border-cyan-500/10 p-4 rounded font-mono text-[9px] text-neutral-300">
                  <div className="flex justify-between border-b border-cyan-500/5 pb-1.5">
                    <span>SECTOR RANGE</span>
                    <span className="text-cyan-400 font-bold">ALPHA_SEC_{Math.abs(selectedNode.position[0])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INTEGRITY</span>
                    <span className="text-cyan-400 font-bold">99.98% / SYNC</span>
                  </div>
                </div>

                {/* Dynamic visual progress bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[7.5px] text-neutral-400">
                    <span>TRANSMISSION STATUS</span>
                    <span className="text-cyan-400 font-bold">98.2% ONLINE</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 border border-cyan-500/20 rounded-sm overflow-hidden">
                    <div className="h-full bg-cyan-500 animate-[pulse_1.5s_infinite]" style={{ width: "98.2%" }} />
                  </div>
                </div>

                {/* Scrolling logs output console */}
                <div className="bg-slate-950 border border-cyan-500/15 p-3.5 rounded font-mono text-[8px] text-cyan-400/90 leading-relaxed flex flex-col gap-1 select-none h-32 overflow-hidden">
                  <span>&gt; CONNECTING SECURE NEURAL LINK...</span>
                  <span>&gt; DOCK_ID: 0xFD{Math.abs(selectedNode.position[1])}72B</span>
                  <span>&gt; DECRYPTING MEMORY SEGMENTS... SUCCESS</span>
                  <span>&gt; STREAM ACTIVE // LINK NOMINAL</span>
                  <span>&gt; COGNITIVE DOCK SYNC COMPLETE</span>
                  <span className="animate-pulse">&gt; _</span>
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-2 border-t border-cyan-500/10 flex items-center justify-center gap-2 md:hidden">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-[spin_4s_linear_infinite]" />
              <span className="text-[7.5px] text-cyan-400/40 uppercase tracking-widest">
                QUANTUM SYSTEM LINK ACTIVE // SYNCED
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
