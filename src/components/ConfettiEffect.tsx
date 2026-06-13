import React, { useEffect, useRef, useState } from "react";

interface ConfettiEffectProps {
  active?: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "heart" | "sparkle";
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  fadeSpeed: number;
}

const COLORS = [
  "#FF6B8B", // Rose-pink
  "#FFB3C1", // Pastel pink
  "#FFE169", // Gentle golden yellow
  "#48CAE4", // Soft cyan
  "#90E0EF", // Baby blue
  "#B5179E", // Playful magenta
  "#A55166", // Cozy maroon-rose
  "#C77DFF", // Lavender
];

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasActiveParticles, setHasActiveParticles] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create a particle
    const createParticle = (x: number, y: number, angle: number, speedMultiplier = 1): Particle => {
      const angleRad = (angle * Math.PI) / 180;
      const speed = (Math.random() * 8 + 6) * speedMultiplier;
      const size = Math.random() * 6 + 4;
      const shapes: Particle["shape"][] = ["circle", "square", "triangle", "heart", "sparkle"];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      return {
        x,
        y,
        size,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape,
        vx: Math.cos(angleRad) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angleRad) * speed - (Math.random() * 4 + 2),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        fadeSpeed: Math.random() * 0.008 + 0.005,
      };
    };

    // Spawn dual fountain particles
    const spawnExplosion = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const newParticles: Particle[] = [];

      // Fountain from bottom-left
      for (let i = 0; i < 75; i++) {
        const angle = -65 + Math.random() * 40;
        newParticles.push(createParticle(0, height - 20, angle, 1.5));
      }

      // Fountain from bottom-right
      for (let i = 0; i < 75; i++) {
        const angle = -155 + Math.random() * 40;
        newParticles.push(createParticle(width, height - 20, angle, 1.5));
      }

      // Quick central ring burst
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * 360;
        newParticles.push(createParticle(width / 2, height / 2, angle, 0.9));
      }

      particlesRef.current = [...particlesRef.current, ...newParticles];
      setHasActiveParticles(true);

      // Start animation loop if not already running
      if (!animationFrameRef.current) {
        animate();
      }
    };

    // Game loop
    const animate = () => {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;
      const currentCtx = currentCanvas.getContext("2d");
      if (!currentCtx) return;

      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);

      let activeParticles = particlesRef.current;

      activeParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.985; // air resistance
        p.vy *= 0.985;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.fadeSpeed;

        currentCtx.save();
        currentCtx.translate(p.x, p.y);
        currentCtx.rotate((p.rotation * Math.PI) / 180);
        currentCtx.globalAlpha = Math.max(0, p.opacity);
        currentCtx.fillStyle = p.color;
        currentCtx.strokeStyle = p.color;
        currentCtx.lineWidth = 1;

        if (p.shape === "circle") {
          currentCtx.beginPath();
          currentCtx.arc(0, 0, p.size, 0, Math.PI * 2);
          currentCtx.fill();
        } else if (p.shape === "square") {
          currentCtx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else if (p.shape === "triangle") {
          currentCtx.beginPath();
          currentCtx.moveTo(0, -p.size);
          currentCtx.lineTo(p.size, p.size);
          currentCtx.lineTo(-p.size, p.size);
          currentCtx.closePath();
          currentCtx.fill();
        } else if (p.shape === "heart") {
          currentCtx.beginPath();
          const d = p.size * 1.1;
          currentCtx.moveTo(0, d / 4);
          currentCtx.bezierCurveTo(-d / 2, -d / 2, -d, -d / 4, -d, d / 4);
          currentCtx.bezierCurveTo(-d, d * 0.7, 0, d * 1.25, 0, d * 1.25);
          currentCtx.bezierCurveTo(0, d * 1.25, d, d * 0.7, d, d * 0.4);
          currentCtx.bezierCurveTo(d, -d / 4, d / 2, -d / 2, 0, d / 4);
          currentCtx.closePath();
          currentCtx.fill();
        } else if (p.shape === "sparkle") {
          currentCtx.beginPath();
          const s = p.size * 1.3;
          currentCtx.moveTo(0, -s);
          currentCtx.quadraticCurveTo(0, 0, s, 0);
          currentCtx.quadraticCurveTo(0, 0, 0, s);
          currentCtx.quadraticCurveTo(0, 0, -s, 0);
          currentCtx.quadraticCurveTo(0, 0, 0, -s);
          currentCtx.closePath();
          currentCtx.fill();
        }

        currentCtx.restore();
      });

      // Filter
      particlesRef.current = activeParticles.filter(
        p => p.opacity > 0 && p.y < currentCanvas.height + 50
      );

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setHasActiveParticles(false);
        animationFrameRef.current = null;
        if (onComplete) onComplete();
      }
    };

    // Listen to custom celebrate-confetti window event for instant execution
    const handleCelebrateEvent = () => {
      spawnExplosion();
    };

    window.addEventListener("celebrate-confetti", handleCelebrateEvent);

    // Also listen to the active prop if provided for backwards compatibility
    if (active) {
      spawnExplosion();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("celebrate-confetti", handleCelebrateEvent);
    };
  }, [active, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      id="confetti-canvas"
      className={`fixed inset-0 w-full h-full pointer-events-none z-[99999] transition-opacity duration-300 ${
        hasActiveParticles ? "opacity-100" : "opacity-0"
      }`}
    />
  );
};
