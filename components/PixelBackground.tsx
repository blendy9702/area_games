"use client";

import { useEffect, useRef } from "react";

export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pixels: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      alpha: number;
      speed: number;
    }> = [];

    const colors = [
      "#4f46e5",
      "#7c3aed",
      "#2563eb",
      "#0891b2",
      "#f59e0b",
      "#dc2626",
    ];

    for (let i = 0; i < 60; i++) {
      pixels.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.floor(Math.random() * 3 + 1) * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.05,
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    let frame = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pixels.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -p.size) p.y = canvas.height + p.size;
        const flicker = Math.sin(frame * 0.05 + p.x) * 0.1;
        ctx.globalAlpha = Math.max(0, p.alpha + flicker);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      ctx.globalAlpha = 1;
      frame++;
      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
    />
  );
}
