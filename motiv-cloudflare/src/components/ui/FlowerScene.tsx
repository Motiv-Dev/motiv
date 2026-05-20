"use client";

import { useEffect, useState, useRef } from "react";

interface DayStatus {
  day: number;
  status: string;
}

interface StreakRingProps {
  streak: number;
  totalDays: number;
  failed?: boolean;
  size?: number;
  dailyStatuses?: DayStatus[];
  currentDay?: number;
}

export default function StreakRing({ streak, totalDays, failed, size = 120, dailyStatuses = [], currentDay = 0 }: StreakRingProps) {
  const [animated, setAnimated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = Math.min(streak / Math.max(totalDays, 1), 1);
  const radius = (size - 16) / 2;
  const center = size / 2;
  const strokeWidth = 8;

  // Build status map
  const statusMap = new Map<number, string>();
  for (const ds of dailyStatuses) {
    statusMap.set(ds.day, ds.status);
  }

  // Particle animation
  useEffect(() => {
    setAnimated(true);
    if (!canvasRef.current || failed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number;
    }> = [];

    let frame = 0;
    let animId: number;

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      frame++;

      if (progress > 0 && frame % 12 === 0 && particles.length < 15) {
        const completedDays = Math.min(currentDay, totalDays);
        const angle = -Math.PI / 2 + (2 * Math.PI * (completedDays / totalDays) * (0.5 + Math.random() * 0.5));
        const px = center + radius * Math.cos(angle);
        const py = center + radius * Math.sin(angle);
        particles.push({
          x: px, y: py,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          life: 0, maxLife: 30 + Math.random() * 20,
          size: 1 + Math.random() * 1.5,
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.01;

        const alpha = 1 - p.life / p.maxLife;
        if (alpha <= 0) { particles.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.35})`;
        ctx.fill();
      }

      if (particles.length > 15) particles.splice(0, 5);
      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animId);
  }, [progress, size, center, radius, failed, currentDay, totalDays]);

  // Generate arc segments for each day
  const segmentGap = 0.015; // small gap between segments in radians
  const totalAngle = 2 * Math.PI;
  const segmentAngle = (totalAngle - segmentGap * totalDays) / totalDays;

  function getDayColor(day: number): string {
    const status = statusMap.get(day);
    if (status === "approved") return "#22c55e"; // green
    if (status === "missed") return "#ef4444"; // red
    if (status === "rejected") return "#f59e0b"; // amber
    if (status === "submitted" || status === "pending") return "#f97316"; // orange
    if (day < currentDay) return "#ef4444"; // past no proof = red
    return "#e7e5e4"; // stone-200, upcoming
  }

  const emoji = failed ? "" : progress >= 1 ? "" : progress >= 0.7 ? "" : progress >= 0.3 ? "" : "";

  // Build SVG arc paths for each day segment
  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    const start = {
      x: cx + r * Math.cos(startAngle),
      y: cy + r * Math.sin(startAngle),
    };
    const end = {
      x: cx + r * Math.cos(endAngle),
      y: cy + r * Math.sin(endAngle),
    };
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: size, height: size }}
      />

      <svg width={size} height={size}>
        {/* Per-day arc segments */}
        {Array.from({ length: totalDays }, (_, i) => {
          const day = i + 1;
          const startAngle = -Math.PI / 2 + i * (segmentAngle + segmentGap);
          const endAngle = startAngle + segmentAngle;
          const color = getDayColor(day);
          const isActive = day <= currentDay;

          return (
            <path
              key={day}
              d={describeArc(center, center, radius, startAngle, endAngle)}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={animated ? (isActive ? 1 : 0.4) : 0}
              style={{
                transition: `opacity 0.5s ease ${i * 0.03}s`,
                filter: statusMap.get(day) === "approved" ? "drop-shadow(0 0 3px rgba(34, 197, 94, 0.4))" : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {emoji && <span className="text-lg mb-0.5">{emoji}</span>}
        <span className="text-2xl font-black text-stone-900 tabular-nums tracking-tight leading-none">
          {streak}
        </span>
        <span className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest">
          {streak === 1 ? "day" : "days"}
        </span>
      </div>
    </div>
  );
}
