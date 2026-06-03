"use client";

import { useEffect, useRef, useState } from "react";

interface CinematicLoaderProps {
  onComplete: () => void;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0: background (tiny), 1: mid, 2: close, 3: bright (with lens flares)
}

interface NebulaCloud {
  x: number;
  y: number;
  radius: number;
  color1: string;
  color2: string;
  angle: number;
  speed: number;
  pulsePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hudTime, setHudTime] = useState("");
  const [viewportDim, setViewportDim] = useState("1920x1080");
  const animationFrameRef = useRef<number | null>(null);
  
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const mouseRawRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isOver: false });
  const coordsRef = useRef<HTMLDivElement | null>(null);
  const isEnteredRef = useRef(isEntered);
  const isExitingRef = useRef(isExiting);

  useEffect(() => {
    isEnteredRef.current = isEntered;
  }, [isEntered]);

  useEffect(() => {
    isExitingRef.current = isExiting;
  }, [isExiting]);

  const triggerExit = () => {
    if (isExitingRef.current) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHudTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Parallax target
      mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) * 0.08;
      mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) * 0.08;

      // Raw target for Reticle
      mouseRawRef.current.targetX = e.clientX;
      mouseRawRef.current.targetY = e.clientY;
      mouseRawRef.current.isOver = true;

      if (coordsRef.current) {
        coordsRef.current.innerText = `RA: ${e.clientX.toString().padStart(4, "0")} / DEC: ${e.clientY.toString().padStart(4, "0")}`;
      }
    };

    const handleMouseLeave = () => {
      mouseRawRef.current.isOver = false;
    };

    const handleMouseEnter = () => {
      mouseRawRef.current.isOver = true;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggerExit();
      }
    };

    const handleResize = () => {
      setViewportDim(`${window.innerWidth}x${window.innerHeight}`);
    };

    handleResize();
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setIsEntered(true);
    }, 100);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 10000; // 10 seconds to reach 100%
    let animationFrameId: number;

    const updateProgress = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      
      setProgress(currentProgress);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const getLoadingMessage = (p: number) => {
    if (p < 20) return "INITIALIZING QUANTUM SYSTEMS...";
    if (p < 40) return "CONNECTING TO DEEP SPACE TELEMETRY...";
    if (p < 60) return "MAPPING ASTEROID CORE DENSITY...";
    if (p < 80) return "ALIGNING GRAVITATIONAL VECTOR...";
    return "LOADING PORTFOLIO EXPERIENCE...";
  };

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars: Star[] = [];
    const nebulas: NebulaCloud[] = [];
    let shootingStars: ShootingStar[] = [];

    let gyroAngleX = 0;
    let gyroAngleY = 0;
    let gyroAngleZ = 0;
    let exitScale = 1.0;
    let exitAlpha = 1.0;

    // Stellar color temperatures
    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(224, 242, 254, ",
      "rgba(254, 243, 199, ",
      "rgba(254, 226, 226, ",
      "rgba(243, 232, 255, ",
    ];

    // Initialize stars with 4 layers for massive depth
    const totalStars = Math.floor((width * height) / 3000);
    const maxStarsCount = Math.max(250, Math.min(totalStars, 750));

    for (let i = 0; i < maxStarsCount; i++) {
      const rand = Math.random();
      let layer = 0;
      let size = Math.random() * 0.3 + 0.15;
      let opacityBase = Math.random() * 0.35 + 0.05;

      if (rand >= 0.55 && rand < 0.83) {
        layer = 1;
        size = Math.random() * 0.6 + 0.45;
        opacityBase = Math.random() * 0.5 + 0.15;
      } else if (rand >= 0.83 && rand < 0.96) {
        layer = 2;
        size = Math.random() * 0.8 + 1.05;
        opacityBase = Math.random() * 0.65 + 0.3;
      } else if (rand >= 0.96) {
        layer = 3;
        size = Math.random() * 1.2 + 1.85;
        opacityBase = Math.random() * 0.3 + 0.65;
      }

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        opacity: opacityBase,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleSpeed: 0.003 + Math.random() * 0.015 + (layer * 0.004),
        twinklePhase: Math.random() * Math.PI * 2,
        layer,
      });
    }

    // Initialize 4 shifting nebulae
    const baseRadius = Math.min(width, height);
    nebulas.push(
      {
        x: width * 0.25,
        y: height * 0.35,
        radius: baseRadius * 0.7,
        color1: "rgba(108, 60, 225, 0.035)",
        color2: "rgba(0, 0, 0, 0)",
        angle: Math.random() * Math.PI * 2,
        speed: 0.0003,
        pulsePhase: 0,
      },
      {
        x: width * 0.75,
        y: height * 0.65,
        radius: baseRadius * 0.6,
        color1: "rgba(255, 87, 20, 0.025)",
        color2: "rgba(0, 0, 0, 0)",
        angle: Math.random() * Math.PI * 2,
        speed: 0.0004,
        pulsePhase: Math.PI * 0.5,
      },
      {
        x: width * 0.45,
        y: height * 0.75,
        radius: baseRadius * 0.65,
        color1: "rgba(0, 229, 255, 0.02)",
        color2: "rgba(0, 0, 0, 0)",
        angle: Math.random() * Math.PI * 2,
        speed: 0.0002,
        pulsePhase: Math.PI,
      },
      {
        x: width * 0.8,
        y: height * 0.25,
        radius: baseRadius * 0.5,
        color1: "rgba(236, 72, 153, 0.015)",
        color2: "rgba(0, 0, 0, 0)",
        angle: Math.random() * Math.PI * 2,
        speed: 0.0005,
        pulsePhase: Math.PI * 1.5,
      }
    );

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      const r = Math.min(width, height);
      nebulas[0].x = width * 0.25; nebulas[0].y = height * 0.35; nebulas[0].radius = r * 0.7;
      nebulas[1].x = width * 0.75; nebulas[1].y = height * 0.65; nebulas[1].radius = r * 0.6;
      nebulas[2].x = width * 0.45; nebulas[2].y = height * 0.75; nebulas[2].radius = r * 0.65;
      nebulas[3].x = width * 0.8; nebulas[3].y = height * 0.25; nebulas[3].radius = r * 0.5;

      stars.forEach((star) => {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      });
    };

    window.addEventListener("resize", handleResize);

    // Helper to draw projected 3D circles/gyro rings
    const draw3DRing = (
      radius: number,
      color: string,
      rotationX: number,
      rotationY: number,
      rotationZ: number,
      dotsCount: number = 60
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.55;
      ctx.shadowColor = color;
      ctx.shadowBlur = 3;
      ctx.beginPath();

      const points: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i <= dotsCount; i++) {
        const theta = (i / dotsCount) * Math.PI * 2;
        let px = radius * Math.cos(theta);
        let py = radius * Math.sin(theta);
        let pz = 0;

        // 3D rotations
        // Around Z
        let tempX = px * Math.cos(rotationZ) - py * Math.sin(rotationZ);
        let tempY = px * Math.sin(rotationZ) + py * Math.cos(rotationZ);
        px = tempX;
        py = tempY;

        // Around Y
        tempX = px * Math.cos(rotationY) - pz * Math.sin(rotationY);
        let tempZ = px * Math.sin(rotationY) + pz * Math.cos(rotationY);
        px = tempX;
        pz = tempZ;

        // Around X
        tempY = py * Math.cos(rotationX) - pz * Math.sin(rotationX);
        tempZ = py * Math.sin(rotationX) + pz * Math.cos(rotationX);
        py = tempY;
        pz = tempZ;

        points.push({ x: px, y: py, z: pz });
      }

      const centerX = width / 2;
      const centerY = height / 2;

      points.forEach((p, idx) => {
        const perspective = 350 / (350 + p.z);
        const sx = centerX + p.x * perspective;
        const sy = centerY + p.y * perspective;

        if (idx === 0) {
          ctx.moveTo(sx, sy);
        } else {
          ctx.lineTo(sx, sy);
        }
      });
      ctx.stroke();

      points.forEach((p, idx) => {
        if (idx % 4 === 0) {
          const perspective = 350 / (350 + p.z);
          const sx = centerX + p.x * perspective;
          const sy = centerY + p.y * perspective;
          const dotSize = (p.z < 0 ? 1.6 : 0.8) * perspective;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();
    };

    // Helper to draw a spinning orbital node on a 3D ring
    const drawRingNode = (
      radius: number,
      color: string,
      rx: number,
      ry: number,
      rz: number,
      speedMultiplier: number
    ) => {
      const theta = (Date.now() * 0.001 * speedMultiplier) % (Math.PI * 2);
      let px = radius * Math.cos(theta);
      let py = radius * Math.sin(theta);
      let pz = 0;

      // Rotations
      let tempX = px * Math.cos(rz) - py * Math.sin(rz);
      let tempY = px * Math.sin(rz) + py * Math.cos(rz);
      px = tempX;
      py = tempY;

      tempX = px * Math.cos(ry) - pz * Math.sin(ry);
      let tempZ = px * Math.sin(ry) + pz * Math.cos(ry);
      px = tempX;
      pz = tempZ;

      py = py * Math.cos(rx) - pz * Math.sin(rx);
      pz = py * Math.sin(rx) + pz * Math.cos(rx);

      const centerX = width / 2;
      const centerY = height / 2;
      const perspective = 350 / (350 + pz);
      const sx = centerX + px * perspective;
      const sy = centerY + py * perspective;

      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 * perspective, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Helper to draw the perspective grid floor
    const drawPerspectiveGrid = () => {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.035 * exitAlpha})`;
      ctx.lineWidth = 0.55;
      
      const horizon = height * 0.72;
      const step = 28;
      const mouseShiftX = mouseRef.current.x * 0.65;
      const mouseShiftY = mouseRef.current.y * 0.25;
      
      const vpX = width / 2 + mouseShiftX;
      const vpY = horizon - 110 + mouseShiftY;
      
      ctx.beginPath();
      const lineCount = 36;
      for (let i = 0; i <= lineCount; i++) {
        const angle = Math.PI * (i / lineCount);
        const destX = vpX + Math.cos(angle) * width * 2;
        const destY = vpY + Math.sin(angle) * height * 2;
        if (destY > horizon) {
          ctx.moveTo(vpX, vpY);
          ctx.lineTo(destX, destY);
        }
      }
      
      for (let y = horizon; y < height; y += step) {
        const factor = (y - horizon) / (height - horizon);
        const screenY = horizon + Math.pow(factor, 1.6) * (height - horizon);
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
      }
      
      ctx.stroke();
      ctx.restore();
    };

    // Helper to draw target reticle following mouse raw coords
    const drawReticle = () => {
      if (!mouseRawRef.current.isOver || isExitingRef.current) return;
      
      const rx = mouseRawRef.current.x;
      const ry = mouseRawRef.current.y;
      const size = 16;
      
      ctx.save();
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.35 * exitAlpha})`;
      ctx.lineWidth = 0.75;
      ctx.shadowColor = "rgba(0, 229, 255, 0.35)";
      ctx.shadowBlur = 3;
      
      // Center locking dot
      ctx.fillStyle = `rgba(0, 229, 255, ${0.65 * exitAlpha})`;
      ctx.beginPath();
      ctx.arc(rx, ry, 1.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Brackets
      // Top Left
      ctx.beginPath();
      ctx.moveTo(rx - size, ry - size + 4);
      ctx.lineTo(rx - size, ry - size);
      ctx.lineTo(rx - size + 4, ry - size);
      ctx.stroke();
      
      // Top Right
      ctx.beginPath();
      ctx.moveTo(rx + size, ry - size + 4);
      ctx.lineTo(rx + size, ry - size);
      ctx.lineTo(rx + size - 4, ry - size);
      ctx.stroke();
      
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(rx - size, ry + size - 4);
      ctx.lineTo(rx - size, ry + size);
      ctx.lineTo(rx - size + 4, ry + size);
      ctx.stroke();
      
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(rx + size, ry + size - 4);
      ctx.lineTo(rx + size, ry + size);
      ctx.lineTo(rx + size - 4, ry + size);
      ctx.stroke();
      
      // Rotating dash rings
      const reticleAngle = (Date.now() / 600) % (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.6, reticleAngle, reticleAngle + Math.PI * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.6, reticleAngle + Math.PI, reticleAngle + Math.PI * 1.4);
      ctx.stroke();
      
      ctx.restore();
    };

    // Animation Loop
    const animate = () => {
      ctx.fillStyle = "#010103";
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse easing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      mouseRawRef.current.x += (mouseRawRef.current.targetX - mouseRawRef.current.x) * 0.1;
      mouseRawRef.current.y += (mouseRawRef.current.targetY - mouseRawRef.current.y) * 0.1;

      // Draw perspective grid floor
      drawPerspectiveGrid();

      // 1. Draw Nebula gas layers (reacting to mouse parallax)
      nebulas.forEach((n) => {
        n.pulsePhase += 0.0015;
        const pulse = 1 + Math.sin(n.pulsePhase) * 0.12;

        n.angle += n.speed;
        const dx = n.x + mouseRef.current.x * 0.04;
        const dy = n.y + mouseRef.current.y * 0.04;

        const grad = ctx.createRadialGradient(
          dx, dy, 0,
          dx, dy, n.radius * pulse
        );
        grad.addColorStop(0, n.color1);
        grad.addColorStop(0.5, n.color1.replace(/[\d.]+\)$/, "0.01)"));
        grad.addColorStop(1, n.color2);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dx, dy, n.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Stars (4-Layer with Mouse Parallax & Twinkling)
      stars.forEach((star) => {
        const speedFactor = 0.008 + (star.layer * 0.024);
        star.x += 0.6 * speedFactor;
        star.y -= 0.3 * speedFactor;

        if (star.x > width) star.x = 0;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        // Apply mouse coordinates parallax (closer layers shift more)
        let px = star.x + mouseRef.current.x * (star.layer + 0.5) * 0.18;
        let py = star.y + mouseRef.current.y * (star.layer + 0.5) * 0.18;

        // Wrap around boundaries
        if (px < 0) px = width + (px % width);
        if (px > width) px = px % width;
        if (py < 0) py = height + (py % height);
        if (py > height) py = py % height;

        star.twinklePhase += star.twinkleSpeed;
        const currentOpacity = star.opacity * (0.2 + Math.sin(star.twinklePhase) * 0.8);

        if (star.layer === 3 && currentOpacity > 0.45) {
          ctx.save();
          const glowGrad = ctx.createRadialGradient(
            px, py, 0,
            px, py, star.size * 4.5
          );
          glowGrad.addColorStop(0, `${star.color}${currentOpacity * 0.35})`);
          glowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(px, py, star.size * 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `${star.color}${currentOpacity * 0.45})`;
          ctx.lineWidth = 0.45;
          ctx.beginPath();
          ctx.moveTo(px - star.size * 2.5, py);
          ctx.lineTo(px + star.size * 2.5, py);
          ctx.moveTo(px, py - star.size * 2.5);
          ctx.lineTo(px, py + star.size * 2.5);
          ctx.stroke();
          ctx.restore();
        }

        ctx.fillStyle = `${star.color}${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Update and draw shooting stars (comets)
      if (shootingStars.length < 2 && Math.random() < 0.007) {
        shootingStars.push({
          x: Math.random() * width * 0.7,
          y: Math.random() * height * 0.4,
          length: Math.random() * 90 + 40,
          speed: Math.random() * 11 + 9,
          angle: (Math.PI / 6) + (Math.random() * 0.15),
          opacity: 1.0,
        });
      }

      shootingStars = shootingStars.filter((comet) => {
        comet.x += Math.cos(comet.angle) * comet.speed;
        comet.y += Math.sin(comet.angle) * comet.speed;
        comet.opacity -= 0.022;

        if (comet.opacity <= 0 || comet.x > width || comet.y > height) {
          return false;
        }

        const tailX = comet.x - Math.cos(comet.angle) * comet.length;
        const tailY = comet.y - Math.sin(comet.angle) * comet.length;

        const cometGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
        cometGrad.addColorStop(0, `rgba(255, 255, 255, ${comet.opacity})`);
        cometGrad.addColorStop(0.15, `rgba(255, 175, 40, ${comet.opacity * 0.75})`);
        cometGrad.addColorStop(1, "rgba(255, 87, 20, 0)");

        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        return true;
      });

      // 4. Update and draw 3D Gyroscope (Central Orbit Rings)
      if (isEnteredRef.current && exitAlpha > 0) {
        gyroAngleX += 0.003;
        gyroAngleY += 0.005;
        gyroAngleZ += 0.007;

        if (isExitingRef.current) {
          exitScale += 0.012;
          exitAlpha -= 0.018;
          if (exitAlpha < 0) exitAlpha = 0;
        }

        const mx = mouseRef.current.x * 0.003;
        const my = mouseRef.current.y * 0.003;

        // Outer Ring (Violet)
        draw3DRing(
          160 * exitScale,
          `rgba(108, 60, 225, ${0.28 * exitAlpha})`,
          gyroAngleX + my,
          gyroAngleY + mx,
          0,
          60
        );

        // Outer Ring Node
        drawRingNode(
          160 * exitScale,
          `rgba(108, 60, 225, ${0.95 * exitAlpha})`,
          gyroAngleX + my,
          gyroAngleY + mx,
          0,
          0.85
        );

        // Middle Ring (Cyan)
        draw3DRing(
          120 * exitScale,
          `rgba(0, 229, 255, ${0.33 * exitAlpha})`,
          0,
          gyroAngleY + mx,
          gyroAngleZ + my,
          50
        );

        // Middle Ring Node
        drawRingNode(
          120 * exitScale,
          `rgba(0, 229, 255, ${0.95 * exitAlpha})`,
          0,
          gyroAngleY + mx,
          gyroAngleZ + my,
          -1.2
        );

        // Inner Ring (Coral Red)
        draw3DRing(
          80 * exitScale,
          `rgba(255, 107, 107, ${0.25 * exitAlpha})`,
          gyroAngleX + my,
          0,
          gyroAngleZ + mx,
          40
        );

        // Inner Ring Node
        drawRingNode(
          80 * exitScale,
          `rgba(255, 107, 107, ${0.95 * exitAlpha})`,
          gyroAngleX + my,
          0,
          gyroAngleZ + mx,
          1.5
        );

        // Central core star glow
        ctx.save();
        const centerX = width / 2;
        const centerY = height / 2;
        const coreGrad = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, 15 * exitScale
        );
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * exitAlpha})`);
        coreGrad.addColorStop(0.3, `rgba(0, 229, 255, ${0.5 * exitAlpha})`);
        coreGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15 * exitScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Reticle at current cursor position
      drawReticle();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Start transition timing (5.5s of starry space, then 2.0s fade out)
    const exitTimer = setTimeout(() => {
      triggerExit();
    }, 10500);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(exitTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#010103] transition-opacity ease-out duration-1000
        ${isExiting ? "opacity-0 pointer-events-none duration-[2000ms]" : "opacity-100 pointer-events-auto"}
      `}
    >
      <style>{`
        @keyframes hudPulse {
          0% { transform: scaleY(0.2); }
          100% { transform: scaleY(1.15); }
        }
      `}</style>

      {/* Background Starry Space Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD Layout Container - Top Left */}
      <div 
        className={`absolute top-6 left-6 flex flex-col gap-1 z-30 font-mono select-none transition-all duration-[1500ms] ease-out
          ${isExiting ? "opacity-0 -translate-x-6 blur-sm" : "opacity-100 translate-x-0"}
        `}
      >
        <div className="flex items-center gap-2 text-white/40 text-[10px] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          AMEY_SYS // CL-V.8.2
        </div>
        <div className="text-glow text-accent-glow text-xl font-bold tracking-wider">
          {hudTime || "00:00:00"}
        </div>
        <div className="text-[9px] text-foreground-muted tracking-wide flex flex-col gap-0.5 mt-0.5">
          <span>HOST: SECURE_CORE_NODE</span>
          <span>NET: STABLE // LATENCY: 12ms</span>
          <span>SYSTEM_STATE: DECRYPT_ACTIVE</span>
        </div>
        
        {/* Animated signal visualizer */}
        <div className="flex items-end gap-[3px] h-4 mt-2">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-[2px] bg-accent-glow/50 rounded-full"
              style={{
                animation: `hudPulse ${0.4 + i * 0.12}s ease-in-out infinite alternate`,
                transformOrigin: "bottom",
                height: "100%"
              }}
            />
          ))}
        </div>
      </div>

      {/* HUD Layout Container - Top Right */}
      <div 
        className={`absolute top-6 right-6 flex flex-col items-end gap-1 z-30 font-mono select-none transition-all duration-[1500ms] ease-out
          ${isExiting ? "opacity-0 translate-x-6 blur-sm" : "opacity-100 translate-x-0"}
        `}
      >
        <div className="text-white/40 text-[10px] tracking-widest uppercase flex items-center gap-1.5">
          COORDINATES SCAN
          <span className="w-1.5 h-1.5 rounded-full bg-accent-glow animate-ping" />
        </div>
        <div ref={coordsRef} className="text-glow text-accent text-sm font-bold tracking-wider">
          RA: 0000 / DEC: 0000
        </div>
        <div className="text-[9px] text-foreground-muted text-right tracking-wide flex flex-col gap-0.5 mt-0.5">
          <span>GRID_LOC: SECTOR_07B</span>
          <span>VIEWPORT: {viewportDim}</span>
          <span>RADAR: RUNNING</span>
        </div>
      </div>

      {/* HUD Layout Container - Bottom Left (Dynamic Telemetry Logs) */}
      <div 
        className={`absolute bottom-[8%] left-6 flex flex-col gap-1 z-30 font-mono select-none transition-all duration-[1500ms] ease-out max-w-[280px]
          ${isExiting ? "opacity-0 -translate-x-6 blur-sm" : "opacity-100 translate-x-0"}
        `}
      >
        <div className="text-white/40 text-[10px] tracking-widest uppercase mb-1">
          DIAGNOSTIC LOGS:
        </div>
        <div className="text-[9px] text-foreground-muted/70 tracking-wide flex flex-col gap-1 select-none">
          <div className="transition-all duration-300 opacity-80">
            &gt; SYSTEM BOOT SEQUENCE: OK
          </div>
          <div className={`transition-all duration-300 ${progress >= 20 ? "opacity-100 text-accent-glow" : "opacity-0 h-0 overflow-hidden"}`}>
            &gt; TELEMETRY LINK ESTABLISHED
          </div>
          <div className={`transition-all duration-300 ${progress >= 40 ? "opacity-100 text-accent-glow" : "opacity-0 h-0 overflow-hidden"}`}>
            &gt; SPINNING UP QUANTUM MATRIX...
          </div>
          <div className={`transition-all duration-300 ${progress >= 60 ? "opacity-100 text-accent-glow" : "opacity-0 h-0 overflow-hidden"}`}>
            &gt; GRAVITATIONAL ARRAYS ALIGNED
          </div>
          <div className={`transition-all duration-300 ${progress >= 80 ? "opacity-100 text-accent" : "opacity-0 h-0 overflow-hidden"}`}>
            &gt; DEPLOYING APPLICATION STACKS
          </div>
          <div className={`transition-all duration-300 ${progress >= 100 ? "opacity-100 text-white font-bold" : "opacity-0 h-0 overflow-hidden"}`}>
            &gt; SYSTEM READY.
          </div>
        </div>
      </div>

      {/* HUD Layout Container - Bottom Right (Skip Button) */}
      <div 
        className={`absolute bottom-[8%] right-6 z-30 font-mono transition-all duration-[1500ms] ease-out
          ${isExiting ? "opacity-0 translate-x-6 blur-sm" : "opacity-100 translate-x-0"}
        `}
      >
        <button
          onClick={triggerExit}
          className="group relative flex items-center justify-center px-4 py-2 text-[10px] tracking-widest uppercase font-bold text-white/50 border border-white/10 rounded bg-[#010103]/40 backdrop-blur-md transition-all duration-300 hover:border-accent hover:text-accent-glow hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] pointer-events-auto cursor-pointer"
        >
          {/* Cybernetic border corners on hover */}
          <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          SKIP DEPLOYMENT
          <span className="ml-2 text-[8px] text-white/30 group-hover:text-accent-glow transition-colors px-1 py-0.5 bg-white/5 rounded border border-white/5">ESC</span>
        </button>
      </div>

      {/* Futuristic HUD Loading Experience Overlay (Center Bottom) */}
      <div 
        className={`absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 font-mono select-none transition-all ease-out
          ${isExiting ? "opacity-0 translate-y-4 blur-sm duration-[2000ms]" : "opacity-100 translate-y-0 duration-1000"}
        `}
      >
        {/* Progress percentage with scanline text effect */}
        <div className="text-glow text-accent-glow text-3xl font-bold tracking-widest relative">
          <span className="opacity-40 text-xs mr-2 uppercase text-white/50 tracking-normal">SYSTEM STATUS:</span>
          {String(progress).padStart(3, "0")}%
        </div>

        {/* Minimalist Tech Loading Bar */}
        <div className="relative w-[280px] h-[3px] bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-accent via-accent-glow to-white rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,229,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tech Data Subtext */}
        <div className="text-[10px] text-foreground-muted text-center tracking-[0.2em] uppercase max-w-[320px] h-[15px] flex items-center justify-center animate-pulse">
          {getLoadingMessage(progress)}
        </div>
      </div>

      {/* Dynamic atmospheric ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-25"
        style={{
          background: "radial-gradient(circle at 35% 45%, rgba(108, 60, 225, 0.15) 0%, rgba(255, 87, 20, 0.05) 50%, transparent 100%)",
        }}
      />

      {/* Cinematic dark vignetting overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
    </div>
  );
}
