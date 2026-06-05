"use client";

import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { audio } from "@/lib/audio";

// Explorable Planet Worlds
import ProjectsWorld from "./worlds/ProjectsWorld";
import SkillsWorld from "./worlds/SkillsWorld";
import ExperienceWorld from "./worlds/ExperienceWorld";
import ContactWorld from "./worlds/ContactWorld";
import ResumeWorld from "./worlds/ResumeWorld";
import CreatorWorld from "./worlds/CreatorWorld";

interface StoryCanvasProps {
  activeSection: string;
  onPlanetClick: (section: string) => void;
  loaderProgress?: number;
  warpMode?: string;
  isDimensionTransition?: boolean;
}

// -------------------------------------------------------------
// 1. DETERMINISTIC SPECS & HELPER UTILITIES
// -------------------------------------------------------------

export const PLANET_SPECS = {
  Earth: { radius: 10.5, orbitRadius: 110, orbitSpeed: 0.065, phase: 0.0, color: "#3B82F6" },
  Mars: { radius: 7.7, orbitRadius: 160, orbitSpeed: 0.045, phase: 1.0, color: "#DC2626" },
  Saturn: { radius: 16.8, orbitRadius: 220, orbitSpeed: 0.03, phase: 2.5, color: "#F59E0B" },
  Neptune: { radius: 14.0, orbitRadius: 290, orbitSpeed: 0.02, phase: 4.0, color: "#06B6D4" },
  Moon: { radius: 3.5, orbitRadius: 70, orbitSpeed: 0.095, phase: 5.0, color: "#9ca3af" }
};

// Generates organic, high-fidelity planet textures procedurally in memory using radial gradients
function createProceduralTexture(type: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  if (type === "earth") {
    // Deep Ocean Base
    ctx.fillStyle = "#0c2340";
    ctx.fillRect(0, 0, 512, 256);

    // Draw organic blended landmasses
    for (let i = 0; i < 45; i++) {
      const cx = Math.random() * 512;
      const cy = 35 + Math.random() * 186;
      const r = Math.random() * 85 + 25;
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "#14532d"); // Forest green land core
      grad.addColorStop(0.45, "#166534"); // Standard land green
      grad.addColorStop(0.75, "#0d9488"); // Coastal teal transition
      grad.addColorStop(1, "rgba(12, 35, 64, 0.0)"); // Soft ocean blend
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add polar ice caps with blurred margins
    const northCap = ctx.createLinearGradient(0, 0, 0, 45);
    northCap.addColorStop(0, "#ffffff");
    northCap.addColorStop(0.7, "rgba(255, 255, 255, 0.9)");
    northCap.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    ctx.fillStyle = northCap;
    ctx.fillRect(0, 0, 512, 45);

    const southCap = ctx.createLinearGradient(0, 211, 0, 256);
    southCap.addColorStop(0, "rgba(255, 255, 255, 0.0)");
    southCap.addColorStop(0.3, "rgba(255, 255, 255, 0.9)");
    southCap.addColorStop(1, "#ffffff");
    ctx.fillStyle = southCap;
    ctx.fillRect(0, 211, 512, 45);
  } 
  else if (type === "saturn") {
    // Banded gas giant base
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

    // Render micro atmospheric bands with low opacity
    for (let i = 0; i < 22; i++) {
      const y = Math.random() * 256;
      const h = Math.random() * 10 + 2;
      ctx.fillStyle = "rgba(251, 191, 36, 0.07)";
      ctx.fillRect(0, y, 512, h);
    }
  } 
  else if (type === "mars") {
    // Deep iron-oxide rust base
    ctx.fillStyle = "#7c2d12";
    ctx.fillRect(0, 0, 512, 256);

    // Layered canyons, sands, and dust storms
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const r = Math.random() * 95 + 20;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "#451a03"); // Dark canyon trenches
      grad.addColorStop(0.35, "#9a3412"); // Desert oxidation
      grad.addColorStop(0.7, "#7c2d12"); // Ambient rust
      grad.addColorStop(1, "rgba(124, 45, 18, 0.0)"); // Soft margin
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // White ice poles
    const capGrad = ctx.createRadialGradient(256, 0, 0, 256, 0, 30);
    capGrad.addColorStop(0, "#ffffff");
    capGrad.addColorStop(0.5, "#fed7aa");
    capGrad.addColorStop(1, "rgba(124, 45, 18, 0.0)");
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.arc(256, 0, 30, 0, Math.PI * 2);
    ctx.fill();
  } 
  else if (type === "neptune") {
    // Gaseous deep blue base
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#082f49");
    grad.addColorStop(0.35, "#0284c7");
    grad.addColorStop(0.65, "#0369a1");
    grad.addColorStop(1.0, "#082f49");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Swirling methane storm spots
    for (let i = 0; i < 15; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const r = Math.random() * 55 + 15;

      const stormGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      stormGrad.addColorStop(0, "rgba(34, 211, 238, 0.22)"); // Cyan storms
      stormGrad.addColorStop(0.5, "rgba(3, 105, 161, 0.08)");
      stormGrad.addColorStop(1, "rgba(8, 47, 73, 0.0)");

      ctx.fillStyle = stormGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  else if (type === "moon") {
    // Solid grey regolith base
    ctx.fillStyle = "#374151";
    ctx.fillRect(0, 0, 512, 256);

    // Draw soft lava seas (Maria)
    for (let i = 0; i < 10; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const r = Math.random() * 120 + 40;

      const seaGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      seaGrad.addColorStop(0, "#1f2937"); // Lava sea core
      seaGrad.addColorStop(0.6, "#374151"); // Sea margins
      seaGrad.addColorStop(1, "rgba(55, 65, 81, 0.0)");

      ctx.fillStyle = seaGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // High-impact craters with ejecta rays
    for (let i = 0; i < 30; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const r = Math.random() * 14 + 3;

      const craterGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      craterGrad.addColorStop(0, "#ffffff"); // Crater peak/center
      craterGrad.addColorStop(0.18, "#9ca3af"); // Crater rim
      craterGrad.addColorStop(0.4, "#4b5563"); // Outer floor
      craterGrad.addColorStop(1, "rgba(55, 65, 81, 0.0)"); // Ejecta halo

      ctx.fillStyle = craterGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generates Saturn's rings with divisions
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

// Generates a soft nebula cloud texture
function createNebulaTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  const color = new THREE.Color(colorHex);
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.25)`);
  grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.07)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generates a soft glow flare for the sun rays
function createSunRayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255, 120, 0, 0.4)");
  grad.addColorStop(0.3, "rgba(255, 60, 0, 0.1)");
  grad.addColorStop(1, "rgba(255, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// -------------------------------------------------------------
// 2. CUSTOM SHADER DEFINITIONS
// -------------------------------------------------------------

const SunShaderMaterial = {
  uniforms: {
    time: { value: 0 },
    glowColor: { value: new THREE.Color("#FF8C00") },
    coreColor: { value: new THREE.Color("#FFF8E7") },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 glowColor;
    uniform vec3 coreColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) ) + i.x + vec3(0.0, i1.x, 1.0) );
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m*m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 g = sin(time * 0.6) * 0.05 + vec3(5.0, 3.0, 1.0);
      vec3 ox = floor(x + 0.5);
      vec3 a1 = h - ox;
      vec3 r = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + a1*a1 );
      vec3 g1 = a0*vec3(x0.x, x12.x, x12.z) + a1*vec3(x0.y, x12.y, x12.w);
      vec3 m1 = g1 * r;
      return 130.0 * dot(m, m1);
    }

    void main() {
      float dotProduct = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
      float rim = 1.0 - dotProduct;
      float glow = pow(rim, 3.0) * 1.5;
      
      float n = snoise(vUv * 5.0 - time * 0.3);
      float n2 = snoise(vUv * 9.0 + time * 0.55) * 0.5;
      float turbulence = (n + n2) * 0.5 + 0.5;
      
      vec3 base = mix(glowColor, coreColor, pow(dotProduct, 1.8));
      vec3 finalColor = base + glowColor * (glow + turbulence * 0.22);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const CreatorShaderMaterial = {
  uniforms: {
    glowColor: { value: new THREE.Color("#FF8C00") },
    opacity: { value: 1.0 }
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
    uniform float opacity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float intensity = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.0);
      gl_FragColor = vec4(glowColor * intensity * 1.8, intensity * 0.95 * opacity);
    }
  `
};

// -------------------------------------------------------------
// 3. SUB-COMPONENTS
// -------------------------------------------------------------

// Trailing meteor during intro loading
function Meteor({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Starts at [-300, 150, -250], impact at [0, 0, 0] at progress = 25
  const pos = useMemo(() => {
    const factor = Math.min(progress / 25, 1.0);
    const start = new THREE.Vector3(-320, 160, -260);
    const end = new THREE.Vector3(0, 0, 0);
    return new THREE.Vector3().lerpVectors(start, end, factor);
  }, [progress]);

  const trailCoords = useMemo(() => {
    const coords = [];
    for (let i = 0; i < 50; i++) {
      coords.push(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 20
      );
    }
    return new Float32Array(coords);
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 2.0;
      meshRef.current.rotation.y = clock.getElapsedTime() * 1.0;
    }
  });

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* Meteor core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Meteor outer glow */}
      <mesh scale={1.8}>
        <sphereGeometry args={[3.2, 8, 8]} />
        <meshBasicMaterial
          color="#FF7800"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Trailing particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailCoords, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.8}
          color="#FF9F1C"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Impact explosion flash
function ImpactFlash({ progress }: { progress: number }) {
  const opacity = useMemo(() => {
    if (progress < 25) return 0;
    if (progress > 32) return 0;
    // Fades out from 1.0 at 25 to 0.0 at 32
    return 1.0 - (progress - 25) / 7;
  }, [progress]);

  if (opacity <= 0) return null;

  return (
    <mesh scale={160}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color="#FFF6E0"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Warp Speed Hyperspace Lines
function WarpLines({ active }: { active: boolean }) {
  const linesRef = useRef<THREE.LineSegments | null>(null);

  const lineData = useMemo(() => {
    const points = [];
    const count = 220;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 450;
      const y = (Math.random() - 0.5) * 450;
      const z = -200 - Math.random() * 500;
      // Start of line
      points.push(new THREE.Vector3(x, y, z));
      // End of line (stretched Z)
      points.push(new THREE.Vector3(x, y, z - 120));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, []);

  useFrame(() => {
    if (linesRef.current && active) {
      linesRef.current.position.z += 22; // Warp speed past camera
      if (linesRef.current.position.z > 500) {
        linesRef.current.position.z = 0; // Loop wrap
      }
    }
  });

  if (!active) return null;

  return (
    <lineSegments ref={linesRef} geometry={lineData}>
      <lineBasicMaterial
        color="#FFB03A"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// Towering Creator silhouette mesh group behind solar system
function CelestialCreator({ opacity = 1.0 }: { opacity?: number }) {
  const groupRef = useRef<THREE.Group | null>(null);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...CreatorShaderMaterial,
      uniforms: {
        glowColor: { value: new THREE.Color("#FF8C00") },
        opacity: { value: opacity }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  useEffect(() => {
    material.uniforms.opacity.value = opacity;
  }, [opacity, material]);

  const stardustData = useMemo(() => {
    const coords = [];
    const colors = [];
    const count = 2800;

    const cHead = new THREE.Color("#fff8e7"); 
    const cArms = new THREE.Color("#f97316"); 

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 25 + Math.random() * 6; // Halo radius
      
      coords.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) + 110, 
        r * Math.sin(phi) * Math.sin(theta) - 130
      );

      const mixC = cHead.clone().lerp(cArms, Math.random());
      colors.push(mixC.r, mixC.g, mixC.b);
    }

    return {
      positions: new Float32Array(coords),
      colors: new Float32Array(colors)
    };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.8) * 1.8;
  });

  return (
    <group ref={groupRef}>
      {/* 3D Head Silhouette */}
      <mesh position={[0, 110, -135]}>
        <sphereGeometry args={[26, 32, 32]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Torso Cylinder */}
      <mesh position={[0, 50, -135]}>
        <cylinderGeometry args={[20, 28, 90, 32]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Shoulders */}
      <mesh position={[-28, 85, -135]}>
        <sphereGeometry args={[14, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[28, 85, -135]}>
        <sphereGeometry args={[14, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Left Arm bending forward */}
      <mesh position={[-90, 65, -80]} rotation={[0.4, 0.4, -0.6]}>
        <cylinderGeometry args={[8, 6, 75, 16]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Right Arm bending forward */}
      <mesh position={[90, 65, -80]} rotation={[0.4, -0.4, 0.6]}>
        <cylinderGeometry args={[8, 6, 75, 16]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Hands representing creation control anchors */}
      <mesh position={[-140, 50, 20]}>
        <sphereGeometry args={[9, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[140, 50, 20]}>
        <sphereGeometry args={[9, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Stardust Halo Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stardustData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[stardustData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.7}
          vertexColors
          transparent
          opacity={0.4 * opacity}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Background Deep Space Nebula Clouds
function CosmicNebula() {
  const meshRef = useRef<THREE.Group | null>(null);

  const clouds = useMemo(() => {
    return [
      { scale: 360, speed: 0.01, z: -190, rot: [0, 0, 0], tex: createNebulaTexture("#7C3AED") }, 
      { scale: 320, speed: -0.007, z: -160, rot: [0, 0, 1.2], tex: createNebulaTexture("#F97316") }, 
      { scale: 280, speed: 0.005, z: -130, rot: [0.8, 0, 0.4], tex: createNebulaTexture("#06B6D4") } 
    ];
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.children.forEach((child, idx) => {
      const cloud = clouds[idx];
      child.rotation.z = t * cloud.speed;
    });
  });

  return (
    <group ref={meshRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={[0, 0, cloud.z]} rotation={cloud.rot as any}>
          <planeGeometry args={[cloud.scale, cloud.scale]} />
          <meshBasicMaterial
            map={cloud.tex}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Rotating Spiral Galaxy in the background
function SpiralGalaxy() {
  const pointsRef = useRef<THREE.Points | null>(null);
  
  const galaxyData = useMemo(() => {
    const coords = [];
    const colors = [];
    const count = 2200;
    const arms = 2;
    const cCore = new THREE.Color("#fbcfe8"); 
    const cArm = new THREE.Color("#8b5cf6"); 
    
    for (let i = 0; i < count; i++) {
      const armIdx = i % arms;
      const distance = Math.pow(Math.random(), 2.0) * 160 + 10;
      const angle = (distance * 0.05) + (armIdx * Math.PI) + (Math.random() - 0.5) * 0.25;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = (Math.random() - 0.5) * 10 * (1.0 - distance / 160);
      
      coords.push(x + 150, y - 80, z - 170); 
      
      const color = cCore.clone().lerp(cArm, distance / 160);
      colors.push(color.r, color.g, color.b);
    }
    
    return {
      positions: new Float32Array(coords),
      colors: new Float32Array(colors)
    };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[galaxyData.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[galaxyData.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.55}
        vertexColors
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Particle Cosmic Starfield with warp scale capability
function Starfield({ warp, warpMode = "normal" }: { warp: boolean; warpMode?: string }) {
  const farStars = useMemo(() => {
    const coords = [];
    const count = 7000;
    for (let i = 0; i < count; i++) {
      const radius = 400 + Math.random() * 600;
      const theta = Math.random() * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      coords.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
    return new Float32Array(coords);
  }, []);

  const nearStars = useMemo(() => {
    const coords = [];
    const count = 1200;
    for (let i = 0; i < count; i++) {
      const radius = 200 + Math.random() * 200;
      const theta = Math.random() * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      coords.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
    return new Float32Array(coords);
  }, []);

  const farRef = useRef<THREE.Points | null>(null);
  const nearRef = useRef<THREE.Points | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (farRef.current) {
      farRef.current.rotation.y = t * 0.0012;
      // Stretches star meshes during warp transitions
      farRef.current.scale.z = warp ? 3.5 : 1.0;
    }
    if (nearRef.current) {
      nearRef.current.rotation.y = t * 0.004;
      nearRef.current.scale.z = warp ? 5.0 : 1.0;
    }
  });

  const farColor = warpMode === "hologram" ? "#00FFCC" : warpMode === "synthwave" ? "#FF00FF" : "#e0e7ff";
  const nearColor = warpMode === "hologram" ? "#a7f3d0" : warpMode === "synthwave" ? "#fbcfe8" : "#ffedd5";

  return (
    <group>
      <Points ref={farRef} positions={farStars} stride={3}>
        <PointMaterial
          size={0.45}
          color={farColor}
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
      <Points ref={nearRef} positions={nearStars} stride={3}>
        <PointMaterial
          size={0.8}
          color={nearColor}
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

// Glowing Orbit Line Indicators
function OrbitRing({ radius, color = "#FF9F1C", active, opacity = 1.0, warpMode = "normal" }: { radius: number; color?: string; active?: boolean; opacity?: number; warpMode?: string }) {
  const ring = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 120; i++) {
      const angle = (i / 120) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const ringColor = warpMode === "hologram" ? "#00FFCC" : warpMode === "synthwave" ? "#FF00FF" : color;
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(ringColor),
      opacity: (active ? 0.55 : 0.14) * opacity, 
      transparent: true
    });
    return new THREE.Line(geometry, material);
  }, [radius, color, active, opacity, warpMode]);

  return <primitive object={ring} />;
}

// Detailed Asteroid Belt
function AsteroidBelt({ opacity = 1.0 }: { opacity?: number }) {
  const beltRef = useRef<THREE.Points | null>(null);

  const beltData = useMemo(() => {
    const coords = [];
    const count = 450;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.08;
      const dist = 188 + Math.random() * 22;
      const y = (Math.random() - 0.5) * 6; 
      coords.push(
        Math.cos(angle) * dist,
        y,
        Math.sin(angle) * dist
      );
    }
    return new Float32Array(coords);
  }, []);

  useFrame(({ clock }) => {
    if (beltRef.current) {
      beltRef.current.rotation.y = clock.getElapsedTime() * 0.007; 
    }
  });

  return (
    <Points ref={beltRef} positions={beltData} stride={3}>
      <PointMaterial
        size={0.65}
        color="#a16207" 
        transparent
        opacity={0.35 * opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

// Glowing Solar Wind particles flowing outward
function SolarWind({ warp, opacity = 1.0 }: { warp: boolean; opacity?: number }) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const count = 180;

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        pos: new THREE.Vector3(0, 0, 0),
        dir: new THREE.Vector3(
          Math.random() - 0.5,
          (Math.random() - 0.5) * 0.18, 
          Math.random() - 0.5
        ).normalize(),
        speed: 0.65 + Math.random() * 0.75,
        age: Math.random() * 110
      });
    }
    return data;
  }, []);

  const posArray = useMemo(() => new Float32Array(count * 3), []);

  useFrame(() => {
    if (!pointsRef.current) return;
    
    particles.forEach((p, idx) => {
      // Speeds up solar radiation wind during warping
      const currentSpeed = p.speed * (warp ? 5.5 : 1.0);
      p.pos.addScaledVector(p.dir, currentSpeed);
      p.age += warp ? 4.0 : 1.0;
      
      if (p.pos.length() > 270 || p.age > 110) {
        p.pos.set(0, 0, 0);
        p.age = 0;
        p.speed = 0.65 + Math.random() * 0.75;
      }
      
      posArray[idx * 3] = p.pos.x;
      posArray[idx * 3 + 1] = p.pos.y;
      posArray[idx * 3 + 2] = p.pos.z;
    });
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posArray, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        color="#fbbf24"
        transparent
        opacity={0.3 * opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Dynamic comets
function ShootingComet() {
  const cometRef = useRef<THREE.Mesh | null>(null);
  
  const trajectory = useMemo(() => {
    return {
      start: new THREE.Vector3(-350, 120, -180),
      end: new THREE.Vector3(350, -100, -80),
      speed: 2.8,
      current: new THREE.Vector3(-350, 120, -180)
    };
  }, []);

  useFrame(() => {
    if (!cometRef.current) return;
    
    const direction = new THREE.Vector3().subVectors(trajectory.end, trajectory.start).normalize();
    trajectory.current.addScaledVector(direction, trajectory.speed);
    cometRef.current.position.copy(trajectory.current);
    
    if (trajectory.current.x > trajectory.end.x) {
      trajectory.current.copy(trajectory.start);
      trajectory.start.set(-350, 80 + Math.random() * 100, -200 - Math.random() * 100);
      trajectory.end.set(350, -60 - Math.random() * 80, -80 + Math.random() * 60);
      trajectory.speed = 2.4 + Math.random() * 1.2;
    }
  });

  return (
    <mesh ref={cometRef}>
      <sphereGeometry args={[0.7, 8, 8]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Planet Glow atmosphere
function PlanetGlow({ radius, color, opacity = 1.0 }: { radius: number; color: string; opacity?: number }) {
  return (
    <mesh scale={1.25}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.18 * opacity}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Orbiting particles around each planet
function PlanetParticles({ radius, color }: { radius: number; color: string }) {
  const pointsRef = useRef<THREE.Points | null>(null);
  
  const particles = useMemo(() => {
    const coords = [];
    const count = 50;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.15;
      const r = radius * (1.35 + Math.random() * 0.35); 
      const y = (Math.random() - 0.5) * radius * 0.25;
      coords.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    }
    return new Float32Array(coords);
  }, [radius]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color={color}
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Planet Node component
interface PlanetProps {
  name: string;
  role: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
  texturePattern?: string; 
  onClick: () => void;
  hoverScale?: number;
  onHoverChange: (hovered: boolean) => void;
  expansionFactor?: number;
  warpMode?: string;
}

function Planet({ name, role, radius, orbitRadius, orbitSpeed, color, texturePattern, onClick, hoverScale = 1.25, onHoverChange, expansionFactor = 1.0, warpMode = "normal" }: PlanetProps) {
  const planetRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const [hovered, setHovered] = useState(false);

  const planetTexture = useMemo(() => createProceduralTexture(texturePattern || ""), [texturePattern]);
  const cloudsTexture = useMemo(() => createCloudsTexture(), []);
  const saturnRingTex = useMemo(() => createSaturnRingTexture(), []);

  // Generates procedural cloud texture
  function createCloudsTexture(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    for (let i = 0; i < 30; i++) {
      const cx = Math.random() * 512;
      const cy = 20 + Math.random() * 216;
      const r = Math.random() * 40 + 15;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  useFrame(({ clock }) => {
    if (!planetRef.current) return;
    const time = clock.getElapsedTime();
    
    const spec = (PLANET_SPECS as any)[name];
    const phase = spec ? spec.phase : 0.0;
    
    // Position scales dynamically with system birth expansion
    const currentRadius = orbitRadius * expansionFactor;
    const theta = phase + time * orbitSpeed;
    const x = Math.cos(theta) * currentRadius;
    const z = Math.sin(theta) * currentRadius;
    
    planetRef.current.position.set(x, 0, z);
    planetRef.current.rotation.y += hovered ? 0.03 : 0.007;

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += hovered ? 0.045 : 0.011;
      cloudsRef.current.rotation.x += 0.002;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHoverChange(true);
    document.body.style.cursor = "pointer";
    audio.playHoverSound();
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHoverChange(false);
    document.body.style.cursor = "default";
  };

  const handleMeshClick = (e: any) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group>
      <mesh
        ref={planetRef}
        onClick={handleMeshClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={(hovered ? hoverScale : 1.0) * Math.min(expansionFactor * 2.0, 1.0)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        {warpMode === "normal" ? (
          <meshStandardMaterial
            map={planetTexture}
            roughness={0.65}
            metalness={0.15}
            emissive={new THREE.Color(color)}
            emissiveIntensity={hovered ? 0.12 : 0.01}
          />
        ) : (
          <meshBasicMaterial
            color={warpMode === "hologram" ? "#00FFCC" : "#FF00FF"}
            wireframe={true}
            transparent
            opacity={hovered ? 0.9 : 0.4}
          />
        )}

        {/* Dynamic Atmosphere clouds */}
        {warpMode === "normal" && (texturePattern === "earth" || texturePattern === "neptune") && (
          <mesh ref={cloudsRef} scale={1.015}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial
              alphaMap={cloudsTexture}
              transparent
              color="#ffffff"
              opacity={0.35}
              blending={THREE.NormalBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Saturn Rings */}
        {texturePattern === "saturn" && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[radius * 1.5, radius * 2.3, 64]} />
            {warpMode === "normal" ? (
              <meshStandardMaterial
                map={saturnRingTex}
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            ) : (
              <meshBasicMaterial
                color={warpMode === "hologram" ? "#00FFCC" : "#FF00FF"}
                wireframe={true}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            )}
          </mesh>
        )}

        {/* Volumetric glow */}
        <PlanetGlow radius={radius} color={color} opacity={expansionFactor} />

        {/* Stardust particles */}
        <PlanetParticles radius={radius} color={color} />

        {/* 3D Telemetry Hover Card */}
        {hovered && expansionFactor >= 0.9 && (
          <Html distanceFactor={32} position={[0, radius * 1.9, 0]}>
            <div className="bg-black/90 border border-amber-500/40 text-[9px] font-mono text-white p-3 rounded shadow-[0_0_15px_rgba(245,158,11,0.25)] flex flex-col gap-1.5 w-44 pointer-events-none select-none tracking-widest whitespace-nowrap z-50">
              <span className="text-amber-500 font-extrabold">// {name.toUpperCase()}_SECTOR</span>
              <span className="text-[10px] text-white font-bold tracking-widest uppercase">{role}</span>
              <span className="text-[7px] text-neutral-400">RAD: {radius} // DIST: {orbitRadius}</span>
              <div className="w-full h-[1px] bg-white/10 my-0.5" />
              <span className="text-[7.5px] text-neutral-300 animate-pulse">[ CHOOSE_DESTINATION ]</span>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 4. MAIN GSAP CAMERA DIRECTOR
// -------------------------------------------------------------

function CameraDirector({ activeSection, currentWorld }: { activeSection: string; currentWorld: string }) {
  const { camera } = useThree();
  const transitionRef = useRef<{ tStart: number; active: boolean; targetSection: string }>({ tStart: 0, active: false, targetSection: "" });

  useEffect(() => {
    transitionRef.current = { tStart: Date.now(), active: true, targetSection: activeSection };
  }, [activeSection]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    
    // 1. Render World Internal Frame
    if (currentWorld !== "home") {
      if (currentWorld !== "experience") {
        let targetPos = new THREE.Vector3(0, 20, 85);
        if (currentWorld === "skills") targetPos.set(0, 45, 110);
        if (currentWorld === "about") targetPos.set(0, 5, 80);
        
        camera.position.lerp(targetPos, 0.1);
        camera.lookAt(new THREE.Vector3(0, currentWorld === "about" ? 5 : 12, 0));
      }
      return;
    }

    // 2. Render Solar System & Warping
    const transition = transitionRef.current;
    if (transition.active) {
      const duration = 1200;
      const factor = Math.min((Date.now() - transition.tStart) / duration, 1.0);
      
      if (transition.targetSection === "home") {
        // Return back to standard overview
        const targetPos = new THREE.Vector3(0, 70, 450);
        camera.position.lerp(targetPos, 0.08);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        if (factor >= 1.0) transition.active = false;
      } else {
        // Zooming in towards target planet coordinates
        let targetPos = new THREE.Vector3(0, 0, 0);
        
        if (transition.targetSection === "about") {
          targetPos.set(0, 0, 45); // Sun core
        } else {
          const spec = (PLANET_SPECS as any)[
            transition.targetSection === "projects" ? "Earth" :
            transition.targetSection === "skills" ? "Saturn" :
            transition.targetSection === "experience" ? "Mars" :
            transition.targetSection === "contact" ? "Neptune" : "Moon"
          ];
          if (spec) {
            const theta = spec.phase + elapsed * spec.orbitSpeed;
            const px = Math.cos(theta) * spec.orbitRadius;
            const pz = Math.sin(theta) * spec.orbitRadius;
            // Align camera right in front of target orbiting coordinate
            targetPos.set(px * 0.94, 2, pz * 0.94);
          }
        }
        camera.position.lerp(targetPos, 0.08);
        
        if (transition.targetSection !== "about") {
          camera.lookAt(targetPos);
        } else {
          camera.lookAt(new THREE.Vector3(0, 0, 0));
        }

        if (factor >= 1.0) transition.active = false;
      }
    } else {
      // Normal overview drift
      const t = clock.getElapsedTime();
      const overviewPos = new THREE.Vector3(
        Math.sin(t * 0.15) * 12,
        70 + Math.cos(t * 0.12) * 8,
        450
      );
      camera.position.lerp(overviewPos, 0.05);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  });

  return null;
}

// -------------------------------------------------------------
// 4.5 3D SUN MODEL
// -------------------------------------------------------------

interface SunModelProps {
  onClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: (e: any) => void;
  expansionFactor: number;
  warpMode?: string;
}

function SunModel({ onClick, onPointerOver, onPointerOut, expansionFactor, warpMode = "normal" }: SunModelProps) {
  const { scene } = useGLTF("/models/sun.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (warpMode === "normal") {
            mat.emissive = new THREE.Color("#FF7800");
            mat.emissiveIntensity = 2.5;
            mat.roughness = 0.4;
            mat.metalness = 0.2;
            mat.wireframe = false;
          } else {
            mat.wireframe = true;
            mat.emissive = new THREE.Color(warpMode === "hologram" ? "#00FFCC" : "#FF00FF");
            mat.emissiveIntensity = 3.5;
          }
        }
      }
    });
  }, [clonedScene, warpMode]);

  const localRef = useRef<THREE.Group | null>(null);
  useFrame(({ clock }) => {
    if (localRef.current) {
      localRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={localRef}>
      <primitive
        object={clonedScene}
        scale={[35, 35, 35]}
      />
      {/* Invisible raycast click target shell */}
      <mesh
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[38, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 5. MAIN SCENE CANVAS
// -------------------------------------------------------------

export function StoryCanvas({ activeSection, onPlanetClick, loaderProgress = 100, warpMode = "normal", isDimensionTransition = false }: StoryCanvasProps) {
  const [currentWorld, setCurrentWorld] = useState("home");
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [sunHovered, setSunHovered] = useState(false);

  const sunGroupRef = useRef<THREE.Group | null>(null);
  const sunMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const sunRayRef1 = useRef<THREE.Mesh | null>(null);
  const sunRayRef2 = useRef<THREE.Mesh | null>(null);
  const sunRayTex = useMemo(() => createSunRayTexture(), []);

  // Delay mounting of actual worlds until camera finishes warp zoom
  useEffect(() => {
    if (activeSection === "home") {
      setCurrentWorld("home");
    } else {
      const timer = setTimeout(() => {
        setCurrentWorld(activeSection);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  // Universe Story state modifiers
  const isMeteorPhase = loaderProgress < 25;
  const isExplosionPhase = loaderProgress >= 25 && loaderProgress < 30;
  const isSunIgnitePhase = loaderProgress >= 25;
  
  const expansionFactor = useMemo(() => {
    if (loaderProgress < 50) return 0;
    return Math.min((loaderProgress - 50) / 25, 1.0);
  }, [loaderProgress]);

  const creatorOpacity = useMemo(() => {
    if (loaderProgress < 75) return 0;
    return Math.min((loaderProgress - 75) / 15, 1.0);
  }, [loaderProgress]);

  // Warp speed flags
  const isWarping = (activeSection !== "home" && currentWorld === "home") || isDimensionTransition;

  const ShaderTimeUpdater = () => {
    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      
      if (sunMatRef.current && isSunIgnitePhase) {
        sunMatRef.current.uniforms.time.value = t;
        
        // Sun breathing animation scale & pulse
        const igniteScale = loaderProgress < 50 
          ? (loaderProgress - 25) / 25 
          : 1.0;
        
        const glowPulse = (1.0 + Math.sin(t * 1.8) * 0.15) * igniteScale;
        sunMatRef.current.uniforms.glowColor.value.set(
          new THREE.Color("#FF8C00").clone().multiplyScalar(glowPulse)
        );
      }
      
      if (sunRayRef1.current) sunRayRef1.current.rotation.z = t * (isWarping ? 0.25 : 0.035);
      if (sunRayRef2.current) sunRayRef2.current.rotation.z = -t * (isWarping ? 0.15 : 0.02);

      if (sunGroupRef.current && isSunIgnitePhase) {
        const baseScale = loaderProgress < 50 ? (loaderProgress - 25) / 25 : 1.0;
        const breathingScale = baseScale * (1.0 + Math.sin(t * 1.5) * 0.03);
        sunGroupRef.current.scale.set(breathingScale, breathingScale, breathingScale);
      }
    });
    return null;
  };

  const handleSunPointerOver = (e: any) => {
    if (loaderProgress < 90) return;
    e.stopPropagation();
    setSunHovered(true);
    document.body.style.cursor = "pointer";
    audio.playHoverSound();
  };

  const handleSunPointerOut = () => {
    setSunHovered(false);
    document.body.style.cursor = "default";
  };

  const handleBack = () => {
    audio.playWarpOutSound();
    onPlanetClick("home");
  };

  return (
    <div className="absolute inset-0 z-10 w-full h-full pointer-events-auto bg-[#020205]">
      <Canvas
        camera={{ position: [0, 80, 450], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#020205"));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        {/* Cinematic light system */}
        <ambientLight intensity={0.03} />
        {isSunIgnitePhase && (
          <pointLight position={[0, 0, 0]} intensity={22} distance={900} decay={1.0} color="#FFD580" />
        )}
        <directionalLight position={[0, 100, -80]} intensity={0.3} color="#D8B4FE" />

        {/* Global deep space elements */}
        <Starfield warp={isWarping} warpMode={warpMode} />
        {!isMeteorPhase && <CosmicNebula />}
        {!isMeteorPhase && <SpiralGalaxy />}
        <WarpLines active={isWarping} />

        {/* CONDITIONAL RENDER: 3D Explorable World Internals */}
        {currentWorld === "projects" && <ProjectsWorld onBack={handleBack} />}
        {currentWorld === "skills" && <SkillsWorld onBack={handleBack} />}
        {currentWorld === "experience" && <ExperienceWorld onBack={handleBack} />}
        {currentWorld === "contact" && <ContactWorld onBack={handleBack} />}
        {currentWorld === "resume" && <ResumeWorld onBack={handleBack} />}
        {currentWorld === "about" && <CreatorWorld onBack={handleBack} />}

        {/* CONDITIONAL RENDER: Solar System Overview (including transition warping) */}
        {currentWorld === "home" && (
          <>
            {/* Story loading sequence nodes */}
            {isMeteorPhase && <Meteor progress={loaderProgress} />}
            {isExplosionPhase && <ImpactFlash progress={loaderProgress} />}

            {/* Orbiting Navigation Planets */}
            {expansionFactor > 0 && (
              <>
                {/* Orbit path rings */}
                <OrbitRing radius={110} color="#3B82F6" active={hoveredPlanet === "Earth"} opacity={expansionFactor} warpMode={warpMode} /> 
                <OrbitRing radius={160} color="#DC2626" active={hoveredPlanet === "Mars"} opacity={expansionFactor} warpMode={warpMode} /> 
                <OrbitRing radius={220} color="#D97706" active={hoveredPlanet === "Saturn"} opacity={expansionFactor} warpMode={warpMode} /> 
                <OrbitRing radius={290} color="#0891B2" active={hoveredPlanet === "Neptune"} opacity={expansionFactor} warpMode={warpMode} /> 
                <OrbitRing radius={70} color="#9ca3af" active={hoveredPlanet === "Moon"} opacity={expansionFactor} warpMode={warpMode} /> 

                {/* Earth (Projects) */}
                <Planet
                  name="Earth"
                  role="Projects"
                  radius={10.5} 
                  orbitRadius={110}
                  orbitSpeed={0.065}
                  color="#3B82F6"
                  texturePattern="earth"
                  onClick={() => onPlanetClick("projects")}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Earth" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                />

                {/* Mars (Experience) */}
                <Planet
                  name="Mars"
                  role="Experience"
                  radius={7.7} 
                  orbitRadius={160}
                  orbitSpeed={0.045}
                  color="#DC2626"
                  texturePattern="mars"
                  onClick={() => onPlanetClick("experience")}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Mars" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                />

                {/* Saturn (Skills) */}
                <Planet
                  name="Saturn"
                  role="Skills"
                  radius={16.8} 
                  orbitRadius={220}
                  orbitSpeed={0.03}
                  color="#F59E0B"
                  texturePattern="saturn"
                  onClick={() => onPlanetClick("skills")}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Saturn" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                />

                {/* Neptune (Contact) */}
                <Planet
                  name="Neptune"
                  role="Contact"
                  radius={14.0} 
                  orbitRadius={290}
                  orbitSpeed={0.02}
                  color="#06B6D4"
                  texturePattern="neptune"
                  onClick={() => onPlanetClick("contact")}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Neptune" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                />

                {/* Moon (Resume) */}
                <Planet
                  name="Moon"
                  role="Resume"
                  radius={3.5} 
                  orbitRadius={70} 
                  orbitSpeed={0.095}
                  color="#9ca3af"
                  texturePattern="moon"
                  onClick={() => onPlanetClick("resume")}
                  hoverScale={1.35}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Moon" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                />
              </>
            )}

            {/* Background elements */}
            {loaderProgress >= 70 && <AsteroidBelt opacity={expansionFactor} />}
            {loaderProgress >= 40 && <SolarWind warp={isWarping} opacity={expansionFactor} />}
            {loaderProgress >= 80 && <ShootingComet />}
            {loaderProgress >= 75 && <CelestialCreator opacity={creatorOpacity} />}

            {/* Sun Core */}
            {isSunIgnitePhase && (
              <group ref={sunGroupRef}>
                <Suspense fallback={
                  <mesh>
                    <sphereGeometry args={[34.8, 32, 32]} />
                    <meshBasicMaterial color={warpMode === "hologram" ? "#00FFCC" : warpMode === "synthwave" ? "#FF00FF" : "#FF7800"} transparent opacity={0.65} />
                  </mesh>
                }>
                  <SunModel
                    onClick={() => loaderProgress >= 90 && onPlanetClick("about")}
                    onPointerOver={handleSunPointerOver}
                    onPointerOut={handleSunPointerOut}
                    expansionFactor={expansionFactor}
                    warpMode={warpMode}
                  />
                </Suspense>
                
                {/* Volumetric outer solar atmosphere glow */}
                <mesh scale={1.12}>
                  <sphereGeometry args={[35, 32, 32]} />
                  <meshBasicMaterial
                    color={warpMode === "hologram" ? "#00FFCC" : warpMode === "synthwave" ? "#FF00FF" : "#FF6A00"}
                    transparent
                    opacity={0.25 * expansionFactor}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                  />
                </mesh>

                {/* Volumetric Sun Ray 1 */}
                <mesh ref={sunRayRef1} position={[0, 0, 2]}>
                  <planeGeometry args={[130, 130]} />
                  <meshBasicMaterial
                    map={sunRayTex}
                    transparent
                    opacity={expansionFactor}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>

                {/* Volumetric Sun Ray 2 */}
                <mesh ref={sunRayRef2} position={[0, 0, -2]}>
                  <planeGeometry args={[150, 150]} />
                  <meshBasicMaterial
                    map={sunRayTex}
                    transparent
                    opacity={0.8 * expansionFactor}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>

                {/* Sun Hover Detail Overlay */}
                {sunHovered && expansionFactor >= 0.9 && (
                  <Html distanceFactor={35} position={[0, 48, 0]}>
                    <div className="bg-black/90 border border-amber-500 text-center text-white p-4 rounded shadow-[0_0_20px_rgba(245,158,11,0.4)] flex flex-col gap-1.5 w-52 pointer-events-none select-none tracking-widest font-mono z-50">
                      <span className="text-amber-500 font-extrabold text-[9px] tracking-[0.2em]">// SOLAR_CORE</span>
                      <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em] mt-0.5">AMEY SAWANT</h3>
                      <div className="w-full h-[1px] bg-amber-500/30 my-1" />
                      <div className="text-[8px] text-neutral-300 flex flex-col gap-0.5 tracking-wider uppercase">
                        <span>Developer</span>
                        <span>AI Explorer</span>
                        <span>Universe Creator</span>
                      </div>
                    </div>
                  </Html>
                )}
              </group>
            )}
          </>
        )}

        <CameraDirector activeSection={activeSection} currentWorld={currentWorld} />
        <ShaderTimeUpdater />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/sun.glb");
