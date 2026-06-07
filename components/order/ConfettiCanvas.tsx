"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x:      number;
  y:      number;
  vx:     number;
  vy:     number;
  color:  string;
  size:   number;
  angle:  number;
  spin:   number;
  life:   number;    // 0–1, decreasing
  decay:  number;
}

// Rwanda-inspired palette: green, gold, sky, red
const COLORS = [
  "#0f6138", "#147a46", "#44b47c",
  "#f59e0b", "#fbbf24", "#fcd34d",
  "#0284c7", "#38bdf8",
  "#f74530", "#ff6e5e",
  "#ffffff",
];

function createParticle(canvas: HTMLCanvasElement): Particle {
  return {
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height * -0.5,
    vx:    (Math.random() - 0.5) * 6,
    vy:    Math.random() * 3 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#0f6138",
    size:  Math.random() * 8 + 4,
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - 0.5) * 0.3,
    life:  1,
    decay: Math.random() * 0.01 + 0.008,
  };
}

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to viewport
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 150 }, () => createParticle(canvas));
    let raf: number;
    let running = true;

    function draw() {
      if (!running || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;

        p.x     += p.vx;
        p.y     += p.vy;
        p.angle += p.spin;
        p.vy    += 0.06; // gravity
        p.life  -= p.decay;

        if (p.life <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particles.length > 0) {
        raf = requestAnimationFrame(draw);
      }
    }

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
