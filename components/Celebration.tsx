"use client";
import { useEffect, useRef } from "react";

interface Props {
  show: boolean;
  onDone: () => void;
}

const COLORS = ["#6366f1", "#a855f7", "#22c55e", "#f97316", "#eab308", "#ec4899"];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  life: number;
  rotation: number;
  rotationSpeed: number;
}

export default function Celebration({ show, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      life: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    }));

    let done = false;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.012;
        p.rotation += p.rotationSpeed;
        if (p.life <= 0 || p.y > canvas.height) return;
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      if (alive > 0) {
        frameRef.current = requestAnimationFrame(draw);
      } else if (!done) {
        done = true;
        onDone();
      }
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [show, onDone]);

  if (!show) return null;

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl px-8 py-6 text-center animate-bounce">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-bold text-gray-900 text-lg">All done!</p>
          <p className="text-sm text-gray-500 mt-1">Every deed completed today</p>
        </div>
      </div>
    </>
  );
}
