"use client";

import { useEffect, useRef } from "react";

interface FireProps {
  amount: number;
  active: boolean;
  onComplete?: () => void;
}

export default function FireAnimation({ amount, active, onComplete }: FireProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Create fire particles
    for (let i = 0; i < 60; i++) {
      particles.current.push({
        x: w / 2 + (Math.random() - 0.5) * 80,
        y: h * 0.6,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 4 - 2,
        size: Math.random() * 6 + 2,
        life: 1,
        decay: Math.random() * 0.02 + 0.008,
        color: Math.random() > 0.5 ? "#f97316" : Math.random() > 0.5 ? "#ef4444" : "#fbbf24",
      });
    }

    // Coin particles falling
    for (let i = 0; i < 15; i++) {
      particles.current.push({
        x: w / 2 + (Math.random() - 0.5) * 120,
        y: -20 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 8 + 4,
        life: 1,
        decay: 0.005,
        type: "coin",
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    let frameId: number;
    let elapsed = 0;

    function animate() {
      ctx.clearRect(0, 0, w, h);
      elapsed++;

      // Draw amount text burning
      const burnProgress = Math.min(elapsed / 120, 1);
      ctx.save();
      ctx.font = `bold ${32 + burnProgress * 8}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(239, 68, 68, ${1 - burnProgress * 0.7})`;
      ctx.fillText(`-₹${amount}`, w / 2, h * 0.45);

      if (burnProgress < 1) {
        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = `rgba(239, 68, 68, ${0.7 - burnProgress * 0.5})`;
        ctx.fillText("BURNED FOREVER", w / 2, h * 0.45 + 25);
      }
      ctx.restore();

      // Update and draw particles
      particles.current = particles.current.filter((p) => {
        p.life -= p.decay;
        if (p.life <= 0) return false;

        if (p.type === "coin") {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;
          p.rotation += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = `rgba(251, 191, 36, ${p.life})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(245, 158, 11, ${p.life})`;
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("₹", 0, p.size * 0.35);
          ctx.restore();
        } else {
          p.x += p.vx + (Math.random() - 0.5) * 1;
          p.y += p.vy;
          p.vy -= 0.03;
          p.size *= 0.98;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(")", `, ${p.life})`).replace("rgb", "rgba").replace("#", "");

          // Convert hex to rgba
          const hex = p.color;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.life})`;
          ctx.fill();

          // Glow
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        return true;
      });

      if (particles.current.length > 0 && elapsed < 180) {
        frameId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [active, amount, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        className="w-[400px] h-[400px] max-w-[90vw]"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
