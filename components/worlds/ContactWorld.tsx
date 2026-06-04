"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Send, Radio, Mail } from "lucide-react";
import { audio } from "@/lib/audio";
import { SITE_CONFIG } from "@/constants/site";

interface ContactWorldProps {
  onBack: () => void;
}

interface StationProps {
  beamPulse: boolean;
}

function SatelliteStation({ beamPulse }: StationProps) {
  const coreRef = useRef<THREE.Mesh | null>(null);
  const dishRef = useRef<THREE.Group | null>(null);
  const ringRef1 = useRef<THREE.Mesh | null>(null);
  const ringRef2 = useRef<THREE.Mesh | null>(null);
  const panelsGroupRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.15;
    }
    if (dishRef.current) {
      dishRef.current.rotation.y = -t * 0.1;
      dishRef.current.rotation.x = (Math.PI / 6) + Math.sin(t * 0.4) * 0.08;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.22;
      ringRef1.current.rotation.y = t * 0.08;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = -t * 0.35;
      ringRef2.current.rotation.z = t * 0.15;
    }
    if (panelsGroupRef.current) {
      panelsGroupRef.current.rotation.y = t * 0.25;
    }
  });

  return (
    <group position={[0, 15, -40]}>
      {/* Central Spherical Core Structure */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshStandardMaterial
          color="#0891B2"
          roughness={0.08}
          metalness={0.95}
          emissive="#06B6D4"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Volumetric Wireframe Core Grid */}
      <mesh scale={1.08}>
        <sphereGeometry args={[7, 16, 16]} />
        <meshBasicMaterial
          color="#22D3EE"
          wireframe
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting Ring 1 */}
      <mesh ref={ringRef1} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[14, 0.35, 16, 64]} />
        <meshStandardMaterial color="#0891B2" emissive="#06B6D4" emissiveIntensity={0.15} />
      </mesh>

      {/* Orbiting Ring 2 */}
      <mesh ref={ringRef2} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[17, 0.25, 16, 64]} />
        <meshStandardMaterial color="#0891B2" emissive="#06B6D4" emissiveIntensity={0.1} />
      </mesh>

      {/* Top Comms Dish Structure (Double-Layered Radar Dish) */}
      <group ref={dishRef} position={[0, 10, 0]}>
        {/* Support Spire Pillar */}
        <mesh position={[0, -5, 0]}>
          <cylinderGeometry args={[0.8, 1.2, 10, 16]} />
          <meshStandardMaterial color="#0E7490" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Inner Solid Dish Mesh */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[10, 3, 32, 1, true]} />
          <meshStandardMaterial
            color="#0891B2"
            metalness={0.9}
            roughness={0.15}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Outer Wireframe Overlay Dish */}
        <mesh scale={1.03} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[10, 3, 32, 1, true]} />
          <meshBasicMaterial
            color="#22D3EE"
            wireframe
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Center Transceiver Needle */}
        <mesh position={[0, 0, 3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.35, 8, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Orbiting Solar Grid Panels */}
      <group ref={panelsGroupRef}>
        {/* Panel 1 */}
        <group position={[-24, 0, 0]} rotation={[0.2, 0, 0]}>
          {/* Support Arm */}
          <mesh position={[7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 14, 8]} />
            <meshStandardMaterial color="#0E7490" metalness={0.8} />
          </mesh>
          {/* Solar Panel Mesh */}
          <mesh>
            <boxGeometry args={[10, 4, 0.25]} />
            <meshStandardMaterial
              color="#023e8a"
              emissive="#0096c7"
              emissiveIntensity={0.25}
              roughness={0.05}
              metalness={0.9}
            />
          </mesh>
          <mesh scale={1.03}>
            <boxGeometry args={[10, 4, 0.25]} />
            <meshBasicMaterial
              color="#00f5ff"
              wireframe
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>

        {/* Panel 2 */}
        <group position={[24, 0, 0]} rotation={[-0.2, 0, 0]}>
          {/* Support Arm */}
          <mesh position={[-7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 14, 8]} />
            <meshStandardMaterial color="#0E7490" metalness={0.8} />
          </mesh>
          {/* Solar Panel Mesh */}
          <mesh>
            <boxGeometry args={[10, 4, 0.25]} />
            <meshStandardMaterial
              color="#023e8a"
              emissive="#0096c7"
              emissiveIntensity={0.25}
              roughness={0.05}
              metalness={0.9}
            />
          </mesh>
          <mesh scale={1.03}>
            <boxGeometry args={[10, 4, 0.25]} />
            <meshBasicMaterial
              color="#00f5ff"
              wireframe
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </group>

      {/* Vertical Data Emission Beam */}
      <mesh position={[0, 100, 0]}>
        <cylinderGeometry args={[1.5, 3.5, 200, 32, 1, true]} />
        <meshBasicMaterial
          color="#22D3EE"
          transparent
          opacity={beamPulse ? 0.95 : 0.22}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Beam Core Light */}
      {beamPulse && (
        <pointLight position={[0, 10, 0]} intensity={25} distance={150} color="#22D3EE" />
      )}
    </group>
  );
}

export default function ContactWorld({ onBack }: ContactWorldProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [beamPulse, setBeamPulse] = useState(false);
  
  const gridRef = useRef<THREE.GridHelper | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.LineBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0.2;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("sending");
    setBeamPulse(true);
    audio.playClickSound();

    setTimeout(() => {
      setStatus("success");
      setBeamPulse(false);
      setFormData({ name: "", email: "", message: "" });
    }, 2200);
  };

  const handlePointerOver = () => {
    audio.playHoverSound();
  };

  return (
    <group>
      <ambientLight intensity={0.14} />
      <pointLight position={[0, 40, 0]} intensity={10} distance={200} color="#06B6D4" />
      <directionalLight position={[-30, 80, -30]} intensity={0.5} color="#0891B2" />

      {/* Cybernetic Blue Radar Grid */}
      <gridHelper ref={gridRef} args={[160, 16, "#0891B2", "#0E7490"]} position={[0, -6, 0]} />

      {/* 3D Communication Station Core */}
      <SatelliteStation beamPulse={beamPulse} />

      {/* Holographic Signal Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 250 }, () => [
                  (Math.random() - 0.5) * 160,
                  Math.random() * 90 - 10,
                  (Math.random() - 0.5) * 160
                ]).flat()
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.6}
          color="#06B6D4"
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Holographic Interactive Contact Transmitter HUD */}
      <Html center distanceFactor={34} position={[0, 6, 12]}>
        <div className="w-[85vw] max-w-md bg-black/85 border border-cyan-500/40 p-6 md:p-8 rounded shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col gap-4 font-mono text-white relative backdrop-blur-xl">
          <span className="absolute top-2 left-2 text-[7px] text-cyan-500/50 tracking-wider">COMMS_LINK_TRANSCEIVER // MUMB_SEC</span>
          
          <div className="border-b border-cyan-500/20 pb-3 mt-1 text-left">
            <span className="text-[9px] text-cyan-400 font-extrabold tracking-widest block">// INITIATE BEACON</span>
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mt-0.5">TRANSMIT DATA PACKETS</h3>
          </div>

          {status === "success" ? (
            <div className="border border-cyan-500/30 bg-cyan-950/20 p-5 rounded text-center text-xs space-y-4 py-8">
              <Radio className="w-8 h-8 text-cyan-400 animate-ping mx-auto mb-2" />
              <h4 className="font-bold text-white uppercase tracking-widest">// SIGNAL BEACON FIRED</h4>
              <p className="text-neutral-400 text-[10px] leading-relaxed">Your data coordinates have been relayed across deep space to Amey's console.</p>
              <button
                onClick={() => setStatus("idle")}
                className="px-4 py-2 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors pointer-events-auto cursor-pointer"
              >
                [ TRANSMIT ANOTHER ]
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-[10px] text-left pointer-events-auto">
              <div>
                <label className="text-[8px] text-neutral-400 block mb-1 uppercase">// TRANSMITTER IDENTITY</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                  placeholder="Enter name..."
                />
              </div>
              <div>
                <label className="text-[8px] text-neutral-400 block mb-1 uppercase">// RETURN WAVE FREQUENCY</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                  placeholder="Enter email address..."
                />
              </div>
              <div>
                <label className="text-[8px] text-neutral-400 block mb-1 uppercase">// MESSAGE PAYLOAD</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none disabled:opacity-50"
                  placeholder="Write message content..."
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded font-bold tracking-widest uppercase transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 animate-pulse" />
                <span>{status === "sending" ? "BROADCASTING CODES..." : "TRANSMIT FREQUENCY"}</span>
              </button>
            </form>
          )}

          {/* Social Relays */}
          <div className="border-t border-white/5 pt-4 flex justify-center gap-6 pointer-events-auto">
            <a
              href={SITE_CONFIG.social.github}
              onPointerOver={handlePointerOver}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-cyan-400 transition-colors font-mono text-[9px] flex items-center gap-1"
            >
              <span>GITHUB</span>
            </a>
            <a
              href={SITE_CONFIG.social.linkedin}
              onPointerOver={handlePointerOver}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-cyan-400 transition-colors font-mono text-[9px] flex items-center gap-1"
            >
              <span>LINKEDIN</span>
            </a>
            <a
              href={`mailto:${SITE_CONFIG.social.email}`}
              onPointerOver={handlePointerOver}
              className="text-neutral-400 hover:text-cyan-400 transition-colors font-mono text-[9px] flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>EMAIL</span>
            </a>
          </div>
        </div>
      </Html>
    </group>
  );
}
