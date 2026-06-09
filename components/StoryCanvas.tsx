"use client";

import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Html, useTexture } from "@react-three/drei";
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
  Mercury: { radius: 4.8, orbitRadius: 55, orbitSpeed: 0.095, phase: 1.2, color: "#9E9E9E" },
  Venus: { radius: 9.5, orbitRadius: 85, orbitSpeed: 0.075, phase: 2.8, color: "#E6C280" },
  Earth: { radius: 10.5, orbitRadius: 115, orbitSpeed: 0.065, phase: 0.0, color: "#3B82F6" },
  Mars: { radius: 7.7, orbitRadius: 150, orbitSpeed: 0.05, phase: 1.8, color: "#DC2626" },
  Jupiter: { radius: 22.0, orbitRadius: 225, orbitSpeed: 0.035, phase: 3.2, color: "#D4A373" },
  Saturn: { radius: 16.8, orbitRadius: 295, orbitSpeed: 0.025, phase: 2.2, color: "#F59E0B" },
  Uranus: { radius: 13.5, orbitRadius: 360, orbitSpeed: 0.018, phase: 0.5, color: "#A0E0E0" },
  Neptune: { radius: 14.0, orbitRadius: 425, orbitSpeed: 0.012, phase: 4.5, color: "#06B6D4" },
  Moon: { radius: 3.5, orbitRadius: 70, orbitSpeed: 0.095, phase: 5.0, color: "#9ca3af" }
};

// Maps planet type identifiers to their texture file paths in /public/planets/
const TEXTURE_PATHS: Record<string, string> = {
  mercury: "/planets/mercury/2k_mercury.jpg",
  venus: "/planets/venus/2k_venus.jpg",
  earth: "/planets/earth/2k_earth_daymap.jpg",
  mars: "/planets/mars/2k_mars.jpg",
  jupiter: "/planets/jupiter/2k_jupiter.jpg",
  saturn: "/planets/saturn/2k_saturn.jpg",
  uranus: "/planets/uranus/2k_uranus.jpg",
  neptune: "/planets/neptune/2k_neptune.jpg",
  moon: "/planets/moon/2k_moon.jpg",
  sun: "/planets/sun/2k_sun.jpg",
};

// Additional texture paths for enhanced rendering
const EARTH_CLOUDS_PATH = "/planets/earth/2k_earth_clouds.png";
const EARTH_NORMAL_PATH = "/planets/earth/2k_earth_normal.jpg";
const EARTH_ROUGHNESS_PATH = "/planets/earth/2k_earth_roughness.jpg";
const SATURN_RING_PATH = "/planets/saturn/2k_saturn_ring.png";
const SUN_TEXTURE_PATH = "/planets/sun/2k_sun.jpg";
const STARFIELD_TEXTURE_PATH = "/planets/sun/StarsMap_2500x1250.jpg";

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

// Particle Cosmic Starfield with warp scale capability and twinkling
function Starfield({ warp, warpMode = "normal" }: { warp: boolean; warpMode?: string }) {
  // Helper to generate star coordinates in spherical shells
  const generateStars = (count: number, minRadius: number, deltaRadius: number) => {
    const coords = [];
    for (let i = 0; i < count; i++) {
      const radius = minRadius + Math.random() * deltaRadius;
      const theta = Math.random() * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      coords.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
    return new Float32Array(coords);
  };

  const farStarsA = useMemo(() => generateStars(3500, 400, 600), []);
  const farStarsB = useMemo(() => generateStars(3500, 400, 600), []);
  const nearStarsA = useMemo(() => generateStars(400, 200, 200), []);
  const nearStarsB = useMemo(() => generateStars(400, 200, 200), []);
  const nearStarsC = useMemo(() => generateStars(400, 200, 200), []);

  const farRefA = useRef<THREE.Points | null>(null);
  const farRefB = useRef<THREE.Points | null>(null);
  const nearRefA = useRef<THREE.Points | null>(null);
  const nearRefB = useRef<THREE.Points | null>(null);
  const nearRefC = useRef<THREE.Points | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Rotate, scale, and modulate opacity of far stars
    if (farRefA.current) {
      farRefA.current.rotation.y = t * 0.0012;
      farRefA.current.scale.z = warp ? 3.5 : 1.0;
      const mat = farRefA.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = (0.35 + Math.sin(t * 1.5) * 0.15) * (warp ? 0.2 : 1.0);
      }
    }
    if (farRefB.current) {
      farRefB.current.rotation.y = -t * 0.0008;
      farRefB.current.scale.z = warp ? 3.5 : 1.0;
      const mat = farRefB.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = (0.35 + Math.sin(t * 0.9 + 2.0) * 0.15) * (warp ? 0.2 : 1.0);
      }
    }

    // 2. Rotate, scale, and modulate opacity of near stars (twinkle)
    if (nearRefA.current) {
      nearRefA.current.rotation.y = t * 0.004;
      nearRefA.current.scale.z = warp ? 5.0 : 1.0;
      const mat = nearRefA.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = (0.6 + Math.sin(t * 2.5) * 0.25) * (warp ? 0.2 : 1.0);
      }
    }
    if (nearRefB.current) {
      nearRefB.current.rotation.y = -t * 0.003;
      nearRefB.current.scale.z = warp ? 5.0 : 1.0;
      const mat = nearRefB.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = (0.6 + Math.sin(t * 1.8 + 1.2) * 0.25) * (warp ? 0.2 : 1.0);
      }
    }
    if (nearRefC.current) {
      nearRefC.current.rotation.y = t * 0.002;
      nearRefC.current.scale.z = warp ? 5.0 : 1.0;
      const mat = nearRefC.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.opacity = (0.6 + Math.sin(t * 1.0 + 2.8) * 0.25) * (warp ? 0.2 : 1.0);
      }
    }
  });

  const farColor = warpMode === "hologram" ? "#00FFCC" : warpMode === "synthwave" ? "#FF00FF" : "#e0e7ff";
  const nearColor = warpMode === "hologram" ? "#a7f3d0" : warpMode === "synthwave" ? "#fbcfe8" : "#ffedd5";

  // Load the real starfield texture for a photorealistic background sphere
  const starfieldTexture = useTexture(STARFIELD_TEXTURE_PATH);

  return (
    <group>
      {/* Photorealistic deep space background sphere */}
      <mesh>
        <sphereGeometry args={[1200, 64, 32]} />
        <meshBasicMaterial
          map={starfieldTexture}
          side={THREE.BackSide}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* Particle star layers for depth and warp effects */}
      <Points ref={farRefA} positions={farStarsA} stride={3}>
        <PointMaterial
          size={0.45}
          color={farColor}
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
      <Points ref={farRefB} positions={farStarsB} stride={3}>
        <PointMaterial
          size={0.35}
          color={farColor}
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
      <Points ref={nearRefA} positions={nearStarsA} stride={3}>
        <PointMaterial
          size={0.8}
          color={nearColor}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <Points ref={nearRefB} positions={nearStarsB} stride={3}>
        <PointMaterial
          size={0.65}
          color={nearColor}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <Points ref={nearRefC} positions={nearStarsC} stride={3}>
        <PointMaterial
          size={0.9}
          color={nearColor}
          transparent
          opacity={0.7}
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
  const lineRef = useRef<THREE.Line | null>(null);

  const ring = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const angle = (i / 120) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const ringColor = warpMode === "hologram" ? "#00FFCC" : warpMode === "synthwave" ? "#FF00FF" : color;
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(ringColor),
      opacity: (active ? 0.55 : 0.14) * opacity,
      transparent: true
    });
    return new THREE.Line(geometry, material);
  }, [radius, color, warpMode]);

  useFrame(() => {
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      if (mat) {
        const targetOpacity = (active ? 0.55 : 0.14) * opacity;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
      }
    }
  });

  return <primitive ref={lineRef} object={ring} />;
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

// Helper to generate a random trajectory that starts and ends completely outside the visible screen bounds
function getRandomCometTrajectory() {
  // Pick a random side to start from
  // 0: Left, 1: Right, 2: Top, 3: Bottom
  const startSide = Math.floor(Math.random() * 4);
  
  // Choose random coordinates for depth (Z), keeping it in visible bounds
  const startZ = -300 - Math.random() * 200;
  const endZ = -300 - Math.random() * 200;
  
  let startX = 0, startY = 0;
  let endX = 0, endY = 0;
  
  if (startSide === 0) {
    // Starts far Left, goes to Right
    startX = -480;
    startY = (Math.random() - 0.5) * 300 + 80;
    
    endX = 480;
    endY = (Math.random() - 0.5) * 300 - 80;
  } else if (startSide === 1) {
    // Starts far Right, goes to Left
    startX = 480;
    startY = (Math.random() - 0.5) * 300 + 80;
    
    endX = -480;
    endY = (Math.random() - 0.5) * 300 - 80;
  } else if (startSide === 2) {
    // Starts far Top, goes to Bottom
    startX = (Math.random() - 0.5) * 600;
    startY = 320;
    
    endX = (Math.random() - 0.5) * 600;
    endY = -320;
  } else {
    // Starts far Bottom, goes to Top
    startX = (Math.random() - 0.5) * 600;
    startY = -320;
    
    endX = (Math.random() - 0.5) * 600;
    endY = 320;
  }
  
  return {
    start: new THREE.Vector3(startX, startY, startZ),
    end: new THREE.Vector3(endX, endY, endZ),
    speed: 2.2 + Math.random() * 1.8
  };
}

// Dynamic comets with particle trails
function ShootingComet() {
  const cometRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);

  const trajectory = useMemo(() => {
    const t = getRandomCometTrajectory();
    return {
      start: t.start,
      end: t.end,
      speed: t.speed,
      current: t.start.clone()
    };
  }, []);

  const count = 40;
  const maxLife = 50;

  // Stagger particles across their lifetime initially
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        pos: new THREE.Vector3().copy(trajectory.start),
        vel: new THREE.Vector3(),
        age: Math.random() * maxLife,
        life: maxLife + Math.random() * 15,
      });
    }
    return data;
  }, [trajectory.start]);

  const posArray = useMemo(() => new Float32Array(count * 3), []);
  const colorArray = useMemo(() => new Float32Array(count * 3), []);

  useFrame(() => {
    const comet = cometRef.current;
    if (!comet || !pointsRef.current) return;

    // 1. Move Comet Head
    const direction = new THREE.Vector3().subVectors(trajectory.end, trajectory.start).normalize();
    trajectory.current.addScaledVector(direction, trajectory.speed);
    comet.position.copy(trajectory.current);

    const oppositeDir = direction.clone().multiplyScalar(-1);

    // 2. Update Trail Particles
    particles.forEach((p, idx) => {
      p.age += 1;
      
      // Move particles along velocity
      p.pos.add(p.vel);

      // Reset dead particles
      if (p.age >= p.life) {
        p.age = 0;
        p.life = maxLife + Math.random() * 15;
        p.pos.copy(comet.position);
        
        // Spawn offset
        p.pos.x += (Math.random() - 0.5) * 1.2;
        p.pos.y += (Math.random() - 0.5) * 1.2;
        p.pos.z += (Math.random() - 0.5) * 1.2;

        // Velocity opposite to comet movement direction with dispersion
        p.vel.copy(oppositeDir).multiplyScalar(trajectory.speed * 0.25 + Math.random() * 0.1);
        p.vel.x += (Math.random() - 0.5) * 0.15;
        p.vel.y += (Math.random() - 0.5) * 0.15;
        p.vel.z += (Math.random() - 0.5) * 0.15;
      }

      // Write position buffer
      posArray[idx * 3] = p.pos.x;
      posArray[idx * 3 + 1] = p.pos.y;
      posArray[idx * 3 + 2] = p.pos.z;

      // Color/Opacity transition
      // ice-blue (#e0f2fe) -> cosmic orange (#f97316)
      const ratio = p.age / p.life;
      const opacity = Math.max(0, 1.0 - ratio);

      const r = THREE.MathUtils.lerp(0.88, 0.98, ratio) * opacity;
      const g = THREE.MathUtils.lerp(0.95, 0.45, ratio) * opacity;
      const b = THREE.MathUtils.lerp(1.00, 0.09, ratio) * opacity;

      colorArray[idx * 3] = r;
      colorArray[idx * 3 + 1] = g;
      colorArray[idx * 3 + 2] = b;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;

    // Check if we reached or passed the end point
    const distanceToStart = trajectory.current.distanceTo(trajectory.start);
    const totalDistance = trajectory.end.distanceTo(trajectory.start);

    if (distanceToStart >= totalDistance) {
      // Reached the end! Generate a new random trajectory
      const nextTrajectory = getRandomCometTrajectory();
      trajectory.start.copy(nextTrajectory.start);
      trajectory.end.copy(nextTrajectory.end);
      trajectory.speed = nextTrajectory.speed;
      trajectory.current.copy(nextTrajectory.start);

      // Relocate all particles immediately to avoid long stretch lines
      particles.forEach((p) => {
        p.pos.copy(trajectory.start);
        p.age = Math.random() * p.life;
        p.vel.set(0, 0, 0);
      });
    }
  });

  return (
    <group>
      {/* Comet Head */}
      <mesh ref={cometRef}>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Comet Particle Trail */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posArray, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.9}
          vertexColors
          transparent
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
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
  isInteractive?: boolean;
}

function Planet({ name, role, radius, orbitRadius, orbitSpeed, color, texturePattern, onClick, hoverScale = 1.25, onHoverChange, expansionFactor = 1.0, warpMode = "normal", isInteractive = true }: PlanetProps) {
  const planetRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const ringGeoRef = useRef<THREE.RingGeometry | null>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth animation refs
  const scaleVal = useRef(1.0);
  const emissiveVal = useRef(0.18);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    if (hovered) {
      const timer = setTimeout(() => setCardVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setCardVisible(false);
    }
  }, [hovered]);

  // Load real texture from public/planets/ directory
  const texturePath = TEXTURE_PATHS[texturePattern || ""] || TEXTURE_PATHS.earth;
  const planetTexture = useTexture(texturePath);

  // Load cloud texture for Earth/Neptune
  const cloudsTexture = useTexture(EARTH_CLOUDS_PATH);

  // Load Earth normal and roughness maps
  const earthNormalMap = useTexture(EARTH_NORMAL_PATH);
  const earthRoughnessMap = useTexture(EARTH_ROUGHNESS_PATH);

  // Load high-resolution Saturn ring texture
  const saturnRingTex = useTexture(SATURN_RING_PATH);

  useEffect(() => {
    if (planetTexture) {
      planetTexture.colorSpace = THREE.SRGBColorSpace;
      planetTexture.needsUpdate = true;
    }
  }, [planetTexture]);

  useEffect(() => {
    if (earthNormalMap) {
      earthNormalMap.colorSpace = THREE.NoColorSpace;
      earthNormalMap.needsUpdate = true;
    }
    if (earthRoughnessMap) {
      earthRoughnessMap.colorSpace = THREE.NoColorSpace;
      earthRoughnessMap.needsUpdate = true;
    }
  }, [earthNormalMap, earthRoughnessMap]);

  useEffect(() => {
    if (saturnRingTex) {
      saturnRingTex.colorSpace = THREE.SRGBColorSpace;
      saturnRingTex.wrapS = THREE.RepeatWrapping;
      saturnRingTex.wrapT = THREE.RepeatWrapping;
      saturnRingTex.needsUpdate = true;
    }
  }, [saturnRingTex]);

  // Rewrite UV coordinates for Saturn's ringGeometry to map it radially
  useEffect(() => {
    if (ringGeoRef.current && texturePattern === "saturn") {
      const geometry = ringGeoRef.current;
      const pos = geometry.attributes.position;
      const uv = geometry.attributes.uv;

      const v3 = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        
        let angle = Math.atan2(v3.y, v3.x);
        if (angle < 0) angle += Math.PI * 2;
        const u = angle / (Math.PI * 2);

        const dist = v3.length();
        const innerRadius = radius * 1.5;
        const outerRadius = radius * 2.3;
        const v = (dist - innerRadius) / (outerRadius - innerRadius);

        // Map radial distance to X of texture, and angle to Y of texture
        uv.setXY(i, v, u);
      }
      uv.needsUpdate = true;
    }
  }, [radius, texturePattern, saturnRingTex]);

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

    // Eased scale transition
    const targetScale = hovered ? hoverScale : 1.0;
    scaleVal.current = THREE.MathUtils.lerp(scaleVal.current, targetScale, 0.08);
    const expansionScale = Math.min(expansionFactor * 2.0, 1.0);
    planetRef.current.scale.setScalar(scaleVal.current * expansionScale);

    planetRef.current.rotation.y += hovered ? 0.03 : 0.007;

    // Eased emissive glow transition
    const mat = planetRef.current.material as THREE.MeshStandardMaterial;
    if (mat && warpMode === "normal") {
      const targetEmissive = hovered ? 0.35 : 0.18;
      emissiveVal.current = THREE.MathUtils.lerp(emissiveVal.current, targetEmissive, 0.08);
      mat.emissiveIntensity = emissiveVal.current;
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += hovered ? 0.045 : 0.011;
      cloudsRef.current.rotation.x += 0.002;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHoverChange(true);
    if (isInteractive) {
      document.body.style.cursor = "pointer";
      audio.playHoverSound();
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHoverChange(false);
    if (isInteractive) {
      document.body.style.cursor = "default";
    }
  };

  const handleMeshClick = (e: any) => {
    e.stopPropagation();
    if (isInteractive) {
      onClick();
    }
  };

  return (
    <group>
      <mesh
        ref={planetRef}
        onClick={handleMeshClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[radius, 32, 32]} />
        {warpMode === "normal" ? (
          <meshStandardMaterial
            map={planetTexture}
            normalMap={texturePattern === "earth" ? earthNormalMap : undefined}
            normalScale={texturePattern === "earth" ? new THREE.Vector2(1.2, 1.2) : undefined}
            roughnessMap={texturePattern === "earth" ? earthRoughnessMap : undefined}
            roughness={texturePattern === "earth" ? 1.0 : 0.65}
            metalness={texturePattern === "earth" ? 0.05 : 0.15}
            emissive={new THREE.Color("#ffffff")}
            emissiveMap={planetTexture}
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
          <mesh ref={cloudsRef} scale={1.015} castShadow receiveShadow>
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
          <mesh rotation={[Math.PI / 2.3, 0, 0]} castShadow receiveShadow>
            <ringGeometry ref={ringGeoRef} args={[radius * 1.5, radius * 2.3, 64]} />
            {warpMode === "normal" ? (
              <meshStandardMaterial
                map={saturnRingTex}
                transparent
                opacity={0.85}
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

        {/* Uranus Rings */}
        {texturePattern === "uranus" && (
          <mesh rotation={[Math.PI / 2.5, 0.2, 0.1]} castShadow receiveShadow>
            <ringGeometry args={[radius * 1.3, radius * 1.8, 64]} />
            {warpMode === "normal" ? (
              <meshStandardMaterial
                color="#8bebeb"
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
              />
            ) : (
              <meshBasicMaterial
                color={warpMode === "hologram" ? "#00FFCC" : "#FF00FF"}
                wireframe={true}
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            )}
          </mesh>
        )}

        {/* Volumetric glow (removed to keep textures clear) */}

        {/* Stardust particles */}
        <PlanetParticles radius={radius} color={color} />

        {/* 3D Telemetry Hover Card */}
        {hovered && expansionFactor >= 0.9 && (
          <Html distanceFactor={300} position={[0, radius * 1.9, 0]}>
            <div className={`bg-black/90 border border-amber-500/40 text-[11px] font-mono text-white p-4 rounded shadow-[0_0_20px_rgba(245,158,11,0.25)] flex flex-col gap-2 w-56 pointer-events-none select-none tracking-widest whitespace-nowrap z-50 transition-all duration-300 ease-out transform ${
              cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}>
              <span className="text-amber-500 font-extrabold">// {name.toUpperCase()}_SECTOR</span>
              <span className="text-[13px] text-white font-bold tracking-widest uppercase">{role}</span>
              <span className="text-[9.5px] text-neutral-400">RAD: {radius} // DIST: {orbitRadius}</span>
              <div className="w-full h-[1px] bg-white/10 my-0.5" />
              <span className="text-[10px] text-neutral-300 animate-pulse">
                {isInteractive ? "[ CHOOSE_DESTINATION ]" : "[ ACCESS_RESTRICTED ]"}
              </span>
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
  const currentSectionRef = useRef(activeSection);
  const prevSectionRef = useRef("");

  const transitionRef = useRef<{ tStart: number; active: boolean; targetSection: string; isFirstFrame: boolean }>({
    tStart: 0,
    active: false,
    targetSection: "",
    isFirstFrame: false
  });

  useEffect(() => {
    prevSectionRef.current = currentSectionRef.current;
    currentSectionRef.current = activeSection;

    transitionRef.current = {
      tStart: Date.now(),
      active: true,
      targetSection: activeSection,
      isFirstFrame: true
    };
  }, [activeSection]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // 1. Render World Internal Frame
    if (currentWorld !== "home") {
      if (currentWorld !== "experience") {
        let targetPos = new THREE.Vector3(0, 20, 85);
        if (currentWorld === "skills") targetPos.set(0, 45, 110);
        if (currentWorld === "about") targetPos.set(0, 0, 80);

        camera.position.lerp(targetPos, 0.1);
        camera.lookAt(new THREE.Vector3(0, currentWorld === "about" ? 0 : 12, 0));
      }
      return;
    }

    // 2. Render Solar System & Warping
    const transition = transitionRef.current;
    if (transition.active) {
      const duration = 1200;
      const factor = Math.min((Date.now() - transition.tStart) / duration, 1.0);

      if (transition.targetSection === "home") {
        // Snap camera to leaving planet coordinates on first frame of return transition
        if (transition.isFirstFrame) {
          transition.isFirstFrame = false;

          const leavingSection = prevSectionRef.current;
          if (leavingSection && leavingSection !== "home") {
            let snapPos = new THREE.Vector3(0, 0, 0);
            if (leavingSection === "about") {
              snapPos.set(0, 0, 85);
            } else {
              const spec = (PLANET_SPECS as any)[
                leavingSection === "projects" ? "Earth" :
                  leavingSection === "skills" ? "Saturn" :
                    leavingSection === "experience" ? "Mars" :
                      leavingSection === "contact" ? "Neptune" : "Moon"
              ];
              if (spec) {
                const theta = spec.phase + elapsed * spec.orbitSpeed;
                const px = Math.cos(theta) * spec.orbitRadius;
                const pz = Math.sin(theta) * spec.orbitRadius;
                const radialDir = new THREE.Vector3(px, 0, pz).normalize();
                const cameraDistance = spec.radius === 16.8 ? (spec.radius * 2.3 + 15) : (spec.radius + 28);
                snapPos.copy(radialDir).multiplyScalar(spec.orbitRadius - cameraDistance);
                snapPos.y = 8;
              }
            }
            camera.position.copy(snapPos);
          }
        }
        // Return back to standard overview
        const targetPos = new THREE.Vector3(0, 110, 650);
        camera.position.lerp(targetPos, 0.08);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Pull-back slightly narrows FOV for depth, then restores
        const fovOffset = Math.sin(factor * Math.PI) * 10;
        camera.fov = 45 - fovOffset;
        camera.updateProjectionMatrix();

        if (factor >= 1.0) {
          transition.active = false;
          camera.fov = 45;
          camera.updateProjectionMatrix();
        }
      } else {
        // Zooming in towards target planet coordinates
        let targetPos = new THREE.Vector3(0, 0, 0);
        let targetLookAt = new THREE.Vector3(0, 0, 0);

        if (transition.targetSection === "about") {
          targetPos.set(0, 0, 85); // Zoom into Sun core (radius 34.8)
          targetLookAt.set(0, 0, 0);
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
            
            // Calculate a safe camera distance that never clips the planet body or rings
            const radialDir = new THREE.Vector3(px, 0, pz).normalize();
            const cameraDistance = spec.radius === 16.8 ? (spec.radius * 2.3 + 15) : (spec.radius + 28);
            
            // Align camera slightly above the orbital plane
            targetPos.copy(radialDir).multiplyScalar(spec.orbitRadius - cameraDistance);
            targetPos.y = 8;
            
            // Look directly at the planet's moving coordinates
            targetLookAt.set(px, 0, pz);
          }
        }
        
        // Eased interpolation towards moving planet
        camera.position.lerp(targetPos, 0.08);
        camera.lookAt(targetLookAt);

        // FOV speed stretch effect
        const fovOffset = Math.sin(factor * Math.PI) * 15;
        camera.fov = 45 + fovOffset;
        camera.updateProjectionMatrix();

        if (factor >= 1.0) {
          transition.active = false;
          camera.fov = 45;
          camera.updateProjectionMatrix();
        }
      }
    } else {
      // Normal overview drift
      const t = clock.getElapsedTime();
      const overviewPos = new THREE.Vector3(
        Math.sin(t * 0.15) * 12,
        110 + Math.cos(t * 0.12) * 8,
        650
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
  const sunTexture = useTexture(SUN_TEXTURE_PATH);

  useEffect(() => {
    if (sunTexture) {
      sunTexture.colorSpace = THREE.SRGBColorSpace;
      sunTexture.needsUpdate = true;
    }
  }, [sunTexture]);

  const localRef = useRef<THREE.Group | null>(null);
  useFrame(({ clock }) => {
    if (localRef.current) {
      localRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={localRef}>
      <mesh
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[34.8, 64, 64]} />
        {warpMode === "normal" ? (
          <meshStandardMaterial
            map={sunTexture}
            color="#ffffff"
            emissive="#ffffff"
            emissiveMap={sunTexture}
            emissiveIntensity={1.2}
            roughness={0.5}
            metalness={0.1}
          />
        ) : (
          <meshBasicMaterial
            color={warpMode === "hologram" ? "#00FFCC" : "#FF00FF"}
            wireframe={true}
            transparent
            opacity={0.8}
          />
        )}
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
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 120, 650], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#020205"));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        {/* Cinematic light system */}
        <ambientLight intensity={0.015} />
        {isSunIgnitePhase && (
          <pointLight
            position={[0, 0, 0]}
            intensity={24}
            distance={950}
            decay={1.0}
            color="#FFD580"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0005}
          />
        )}
        <directionalLight position={[0, 100, -80]} intensity={0.25} color="#D8B4FE" />
        <directionalLight position={[0, -100, 80]} intensity={0.15} color="#3B82F6" />

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
                <OrbitRing radius={55} color="#9E9E9E" active={hoveredPlanet === "Mercury"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={85} color="#E6C280" active={hoveredPlanet === "Venus"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={115} color="#3B82F6" active={hoveredPlanet === "Earth"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={150} color="#DC2626" active={hoveredPlanet === "Mars"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={225} color="#D4A373" active={hoveredPlanet === "Jupiter"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={295} color="#F59E0B" active={hoveredPlanet === "Saturn"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={360} color="#A0E0E0" active={hoveredPlanet === "Uranus"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={425} color="#06B6D4" active={hoveredPlanet === "Neptune"} opacity={expansionFactor} warpMode={warpMode} />
                <OrbitRing radius={70} color="#9ca3af" active={hoveredPlanet === "Moon"} opacity={expansionFactor} warpMode={warpMode} />

                {/* Mercury (Decorative) */}
                <Planet
                  name="Mercury"
                  role="System Monitor"
                  radius={4.8}
                  orbitRadius={55}
                  orbitSpeed={0.095}
                  color="#9E9E9E"
                  texturePattern="mercury"
                  onClick={() => {}}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Mercury" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                  isInteractive={false}
                />

                {/* Venus (Decorative) */}
                <Planet
                  name="Venus"
                  role="Atmosphere Cache"
                  radius={9.5}
                  orbitRadius={85}
                  orbitSpeed={0.075}
                  color="#E6C280"
                  texturePattern="venus"
                  onClick={() => {}}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Venus" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                  isInteractive={false}
                />

                {/* Earth (Projects) */}
                <Planet
                  name="Earth"
                  role="Projects"
                  radius={10.5}
                  orbitRadius={115}
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
                  orbitRadius={150}
                  orbitSpeed={0.05}
                  color="#DC2626"
                  texturePattern="mars"
                  onClick={() => onPlanetClick("experience")}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Mars" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                />

                {/* Jupiter (Decorative) */}
                <Planet
                  name="Jupiter"
                  role="Mainframe Host"
                  radius={22.0}
                  orbitRadius={225}
                  orbitSpeed={0.035}
                  color="#D4A373"
                  texturePattern="jupiter"
                  onClick={() => {}}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Jupiter" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                  isInteractive={false}
                />

                {/* Saturn (Skills) */}
                <Planet
                  name="Saturn"
                  role="Skills"
                  radius={16.8}
                  orbitRadius={295}
                  orbitSpeed={0.025}
                  color="#F59E0B"
                  texturePattern="saturn"
                  onClick={() => onPlanetClick("skills")}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Saturn" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                />

                {/* Uranus (Decorative) */}
                <Planet
                  name="Uranus"
                  role="Cold Storage"
                  radius={13.5}
                  orbitRadius={360}
                  orbitSpeed={0.018}
                  color="#A0E0E0"
                  texturePattern="uranus"
                  onClick={() => {}}
                  onHoverChange={(h) => setHoveredPlanet(h ? "Uranus" : null)}
                  expansionFactor={expansionFactor}
                  warpMode={warpMode}
                  isInteractive={false}
                />

                {/* Neptune (Contact) */}
                <Planet
                  name="Neptune"
                  role="Contact"
                  radius={14.0}
                  orbitRadius={425}
                  orbitSpeed={0.012}
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
                  <Html distanceFactor={300} position={[0, 48, 0]}>
                    <div className="bg-black/95 border border-amber-500 text-center text-white p-4.5 rounded shadow-[0_0_20px_rgba(245,158,11,0.4)] flex flex-col gap-2 w-56 pointer-events-none select-none tracking-widest font-mono z-50">
                      <span className="text-amber-500 font-extrabold text-[10px] tracking-[0.2em]">// SOLAR_CORE</span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em] mt-0.5">AMEY SAWANT</h3>
                      <div className="w-full h-[1px] bg-amber-500/30 my-1" />
                      <div className="text-[9.5px] text-neutral-300 flex flex-col gap-1 tracking-wider uppercase">
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



// Preload all planet & environment textures
useTexture.preload(SUN_TEXTURE_PATH);
useTexture.preload(STARFIELD_TEXTURE_PATH);
useTexture.preload(EARTH_CLOUDS_PATH);
useTexture.preload(EARTH_NORMAL_PATH);
useTexture.preload(EARTH_ROUGHNESS_PATH);
useTexture.preload(SATURN_RING_PATH);
Object.values(TEXTURE_PATHS).forEach((path) => useTexture.preload(path));
