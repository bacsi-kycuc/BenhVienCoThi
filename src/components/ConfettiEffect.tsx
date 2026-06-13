import React, { useEffect, useRef } from "react";

interface ConfettiEffectProps {
  active: boolean;
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

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initial bursts
    const createParticle = (x: number, y: number, angle: number, speedMultiplier = 1): Particle => {
      const angleRad = (angle * Math.PI) / 180;
      const speed = (Math.random() * 8 + 6) * speedMultiplier;
      const size = Math.random() * 6 + 4; // Not too big, elegant
      const shapes: Particle["shape"][] = ["circle", "square", "triangle", "heart", "sparkle"];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      return {
        x,
        y,
        size,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape,
        vx: Math.cos(angleRad) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angleRad) * speed - (Math.random() * 4 + 2), // upward bias
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        fadeSpeed: Math.random() * 0.008 + 0.005,
      };
    };

    // Spawn 140 particles from dual sources: bottom-left and bottom-right corners
    const spawnExplosion = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Fountain from bottom-left
      for (let i = 0; i < 65; i++) {
        // angle: -65 to -25 degrees
        const angle = -65 + Math.random() * 40;
        particles.push(createParticle(0, height - 20, angle, 1.4));
      }

      // Fountain from bottom-right
      for (let i = 0; i < 65; i++) {
        // angle: -155 to -115 degrees
        const angle = -155 + Math.random() * 40;
        particles.push(createParticle(width, height - 20, angle, 1.4));
      }

      // Quick central ring burst for extra depth
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * 360;
        particles.push(createParticle(width / 2, height / 2, angle, 0.8));
      }
    };

    spawnExplosion();

    // Game loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity - realistic speed
        p.vx *= 0.985; // drag/air resistance
        p.vy *= 0.985;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.fadeSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;

        // Draw shape
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "square") {
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else if (p.shape === "triangle") {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "heart") {
          // Beautiful heart shape
          ctx.beginPath();
          const d = p.size * 1.1;
          ctx.moveTo(0, d / 4);
          ctx.bezierCurveTo(-d / 2, -d / 2, -d, -d / 4, -d, d / 4);
          ctx.bezierCurveTo(-d, d * 0.7, 0, d * 1.25, 0, d * 1.25);
          ctx.bezierCurveTo(0, d * 1.25, d, d * 0.7, d, d * 0.4);
          ctx.bezierCurveTo(d, -d / 4, d / 2, -d / 2, 0, d / 4);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "sparkle") {
          // Shiny star sparkle
          ctx.beginPath();
          const s = p.size * 1.3;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // Filter out faded/out-of-bound particles
      particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 50);

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      id="confetti-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-[99999]"
    />
  );
};
