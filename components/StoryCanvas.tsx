"use client";

import { useEffect, useRef } from "react";

interface StoryCanvasProps {
  activeStage: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
}

export function StoryCanvas({ activeStage }: StoryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStageRef = useRef(activeStage);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    activeStageRef.current = activeStage;
  }, [activeStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for parallax and reticle details
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Setup 3D Rock Vertices & Connections
    const points: Point3D[] = [];
    const latCount = 10;
    const lonCount = 12;
    // Generate procedural low-poly asteroid shape
    for (let i = 0; i <= latCount; i++) {
      const lat = (i / latCount) * Math.PI;
      for (let j = 0; j < lonCount; j++) {
        const lon = (j / lonCount) * Math.PI * 2;
        
        // Add random displacement noise to make the rock rough/rocky
        const distortion = 1 + Math.sin(lat * 3) * Math.cos(lon * 4) * 0.22 + Math.cos(lat * 5 + lon * 2) * 0.08;
        const r = 85 * distortion;
        
        const x = r * Math.sin(lat) * Math.cos(lon);
        const y = r * Math.sin(lat) * Math.sin(lon);
        const z = r * Math.cos(lat);
        points.push({ x, y, z, baseRadius: r });
      }
    }

    const connections: [number, number][] = [];
    for (let i = 0; i < latCount; i++) {
      for (let j = 0; j < lonCount; j++) {
        const idx = i * lonCount + j;
        const nextLatIdx = (i + 1) * lonCount + j;
        const nextLonIdx = i * lonCount + ((j + 1) % lonCount);
        
        if (nextLatIdx < points.length) {
          connections.push([idx, nextLatIdx]);
        }
        connections.push([idx, nextLonIdx]);
      }
    }

    // Initialize 300 background stars for the zoom/warp effect
    const stars: Star[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * 1000,
        size: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.6 + 0.1,
      });
    }

    // Initialize nebulae gas layers
    const nebulas = [
      { x: width * 0.3, y: height * 0.4, r: Math.min(width, height) * 0.6, color: "rgba(108, 60, 225, 0.04)" },
      { x: width * 0.7, y: height * 0.6, r: Math.min(width, height) * 0.5, color: "rgba(0, 229, 255, 0.03)" },
    ];

    // Core variables that interpolate between stages
    let currentCoreScale = 0;
    let targetCoreScale = 0;
    let warpSpeed = 0.5;
    let targetWarpSpeed = 0.5;
    let fireAlpha = 0;
    let targetFireAlpha = 0;
    let impactScale = 0;
    let shockwaveRadius = 0;

    let rockAngleX = 0;
    let rockAngleY = 0;
    let rockAngleZ = 0;

    let fireParticles: Particle[] = [];
    let nebulaAngle = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      nebulas[0].x = width * 0.3; nebulas[0].y = height * 0.4; nebulas[0].r = Math.min(width, height) * 0.6;
      nebulas[1].x = width * 0.7; nebulas[1].y = height * 0.6; nebulas[1].r = Math.min(width, height) * 0.5;
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    const animate = () => {
      const stage = activeStageRef.current;

      // Stage Target Parameters Easing
      if (stage === 0) {
        targetCoreScale = 0;
        targetWarpSpeed = 0.4;
        targetFireAlpha = 0;
      } else if (stage === 1) {
        targetCoreScale = 0.75;
        targetWarpSpeed = 0.6;
        targetFireAlpha = 0;
      } else if (stage === 2) {
        targetCoreScale = 0.95;
        targetWarpSpeed = 16.0; // Warp Speed!
        targetFireAlpha = 0;
      } else if (stage === 3) {
        targetCoreScale = 1.05;
        targetWarpSpeed = 2.5;
        targetFireAlpha = 1.0; // Flaming Meteorite!
      } else if (stage === 4) {
        targetCoreScale = 0.65; // Embedded, slightly smaller
        targetWarpSpeed = 0.2;
        targetFireAlpha = 0;
      }

      // Smooth Easing Interpolation
      currentCoreScale += (targetCoreScale - currentCoreScale) * 0.065;
      warpSpeed += (targetWarpSpeed - warpSpeed) * 0.05;
      fireAlpha += (targetFireAlpha - fireAlpha) * 0.08;

      // Handle Impact Pulse Trigger
      if (stage === 4) {
        if (impactScale < 1.0) impactScale += 0.08;
        shockwaveRadius += (Math.max(width, height) * 1.1 - shockwaveRadius) * 0.04;
      } else {
        impactScale = 0;
        shockwaveRadius = 0;
      }

      // Smooth Mouse Parallax
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 1. Draw Space Backdrop
      ctx.fillStyle = "#020206";
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Nebulae Clouds (rotating slightly)
      nebulaAngle += 0.0006;
      ctx.save();
      nebulas.forEach((n, idx) => {
        const pulse = 1 + Math.sin(nebulaAngle + idx) * 0.06;
        const nx = n.x + mouse.x * 0.15;
        const ny = n.y + mouse.y * 0.15;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r * pulse);
        grad.addColorStop(0, n.color);
        grad.addColorStop(0.6, n.color.replace(/[\d.]+\)$/, "0.01)"));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, n.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 3. Draw Stars
      // Stage 2 (Trajectory) draws streaked horizontal stars. Others draw dots/mild drifts.
      ctx.save();
      stars.forEach((star) => {
        if (stage === 2) {
          // Horizontal streak layout
          star.x -= warpSpeed * 1.5;
          if (star.x < -width / 2) {
            star.x = width / 2;
            star.y = Math.random() * height - height / 2;
            star.z = 1000;
          }
          const sx = star.x + width / 2 + mouse.x * 0.1;
          const sy = star.y + height / 2 + mouse.y * 0.1;
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity * 0.8})`;
          ctx.lineWidth = star.size * 0.85;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - warpSpeed * 2.8, sy);
          ctx.stroke();
        } else {
          // Slow standard drift
          star.z -= warpSpeed * 0.25;
          if (star.z <= 0) {
            star.z = 1000;
            star.x = Math.random() * width - width / 2;
            star.y = Math.random() * height - height / 2;
          }
          const k = 120 / star.z;
          const sx = star.x * k + width / 2 + mouse.x * (k * 0.2);
          const sy = star.y * k + height / 2 + mouse.y * (k * 0.2);

          if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
            const size = star.size * k * 0.65;
            ctx.fillStyle = `rgba(224, 242, 254, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(0.3, Math.min(size, 2.5)), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.restore();

      // 4. Draw Atmospheric Entry Flame Particles (Stage 3)
      if (fireAlpha > 0.05) {
        // Spawn fire particles relative to center of screen
        const fx = width / 2 + mouse.x;
        const fy = height / 2 + mouse.y;

        if (Math.random() < 0.85 * fireAlpha) {
          // Sparks and flame trails flying back (towards top-right)
          const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.45; // angle of streak
          const speed = Math.random() * 8 + 4;
          const life = Math.random() * 25 + 15;
          
          const colors = [
            "rgba(255, 60, 0, ",
            "rgba(255, 140, 0, ",
            "rgba(255, 200, 0, ",
            "rgba(220, 30, 0, ",
          ];

          fireParticles.push({
            x: fx + (Math.random() - 0.5) * 60,
            y: fy + (Math.random() - 0.5) * 60,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 5 + 2,
            alpha: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            life,
            maxLife: life
          });
        }

        // Draw and update fire particles
        fireParticles = fireParticles.filter((p) => {
          p.x += p.vx;
          p.y -= p.vy; // flying up-right
          p.life--;
          p.alpha = (p.life / p.maxLife) * fireAlpha;

          ctx.save();
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.shadowColor = p.color.replace(/,$/, ")");
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          return p.life > 0;
        });
      }

      // 5. Draw 3D Asteroid Rock Core (Stages 1, 2, 3, 4)
      if (currentCoreScale > 0.02) {
        ctx.save();

        // Asteroid core spins
        if (stage !== 4) {
          rockAngleX += 0.003;
          rockAngleY += 0.0055;
          rockAngleZ += 0.002;
        } else {
          // Stationary in impact
          rockAngleX = 0.4;
          rockAngleY = 0.6;
          rockAngleZ = 0.2;
        }

        // Set center position
        let rockCenterX = width / 2 + mouse.x;
        let rockCenterY = height / 2 + mouse.y;

        if (stage === 4) {
          // Embed rock slightly offset to match bottom layout
          rockCenterX = width / 2 + mouse.x;
          rockCenterY = height * 0.45 + mouse.y;
        }

        const projectedPoints: { x: number; y: number; z: number }[] = [];
        const scale = currentCoreScale;

        // Apply 3D matrix math on asteroid core
        points.forEach((p) => {
          let px = p.x * scale;
          let py = p.y * scale;
          let pz = p.z * scale;

          // Rotate Z
          let tempX = px * Math.cos(rockAngleZ) - py * Math.sin(rockAngleZ);
          let tempY = px * Math.sin(rockAngleZ) + py * Math.cos(rockAngleZ);
          px = tempX;
          py = tempY;

          // Rotate Y
          tempX = px * Math.cos(rockAngleY) - pz * Math.sin(rockAngleY);
          let tempZ = px * Math.sin(rockAngleY) + pz * Math.cos(rockAngleY);
          px = tempX;
          pz = tempZ;

          // Rotate X
          tempY = py * Math.cos(rockAngleX) - pz * Math.sin(rockAngleX);
          tempZ = py * Math.sin(rockAngleX) + pz * Math.cos(rockAngleX);
          py = tempY;
          pz = tempZ;

          const perspective = 400 / (400 + pz);
          const sx = rockCenterX + px * perspective;
          const sy = rockCenterY + py * perspective;

          projectedPoints.push({ x: sx, y: sy, z: pz });
        });

        // Determine glow / outline colors based on phase
        let coreColor = `rgba(136, 136, 160, ${0.15 * currentCoreScale})`;
        let wireColor = `rgba(136, 136, 160, ${0.45 * currentCoreScale})`;
        let glowColor = "rgba(108, 60, 225, 0.4)";
        let glowBlurVal = 4;

        if (stage === 3) {
          // Highly heated core
          coreColor = `rgba(255, 90, 0, ${0.25 * fireAlpha})`;
          wireColor = `rgba(255, 140, 0, ${0.75 * fireAlpha})`;
          glowColor = "rgba(255, 80, 0, 0.75)";
          glowBlurVal = 14;
        } else if (stage === 4) {
          // Metamorphosis - cyber grid cyan
          coreColor = `rgba(0, 229, 255, ${0.08 * currentCoreScale})`;
          wireColor = `rgba(0, 229, 255, ${0.55 * currentCoreScale})`;
          glowColor = "rgba(0, 229, 255, 0.55)";
          glowBlurVal = 8;
        }

        // Draw connections
        ctx.strokeStyle = wireColor;
        ctx.lineWidth = 0.55;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowBlurVal;

        ctx.beginPath();
        connections.forEach(([p1, p2]) => {
          const pt1 = projectedPoints[p1];
          const pt2 = projectedPoints[p2];
          if (pt1 && pt2) {
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
          }
        });
        ctx.stroke();

        // Draw glowing intersection points
        ctx.fillStyle = wireColor;
        ctx.shadowBlur = 0; // disable glow for points to keep performance high
        projectedPoints.forEach((pt, idx) => {
          if (idx % 3 === 0) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.z < 0 ? 1.6 : 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        ctx.restore();
      }

      // 6. Draw Impact Shockwave & Cybernetic Circuit Grid (Stage 4)
      if (stage === 4 && shockwaveRadius > 0.05) {
        ctx.save();
        const ix = width / 2 + mouse.x;
        const iy = height * 0.45 + mouse.y;

        // Shockwave expansion ring
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.38 * (1.0 - Math.min(1.0, shockwaveRadius / (Math.max(width, height) * 1.1)))})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(0, 229, 255, 0.4)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ix, iy, shockwaveRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw digital circuit vectors radiating outwards
        ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
        ctx.lineWidth = 0.75;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        
        // Draw grid lines pointing out from impact point
        const segmentCount = 12;
        for (let i = 0; i < segmentCount; i++) {
          const angle = (i / segmentCount) * Math.PI * 2 + nebulaAngle * 0.2;
          const r1 = 120;
          const r2 = 380;
          
          const x1 = ix + Math.cos(angle) * r1;
          const y1 = iy + Math.sin(angle) * r1;
          
          // bent line (circuit board trace style)
          const bendAngle = angle + 0.35;
          const x2 = x1 + Math.cos(bendAngle) * 80;
          const y2 = y1 + Math.sin(bendAngle) * 80;
          
          const x3 = x2 + Math.cos(angle) * (r2 - r1 - 80);
          const y3 = y2 + Math.sin(angle) * (r2 - r1 - 80);

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          
          // Draw small diagnostic node dot at end
          ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
          ctx.beginPath();
          ctx.arc(x3, y3, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.stroke();

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none transition-opacity duration-1000 z-10"
    />
  );
}
