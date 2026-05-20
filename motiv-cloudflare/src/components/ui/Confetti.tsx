"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/sounds";

export function useConfetti() {
  const fire = useCallback((streak: number) => {
    sounds.success();

    // Bronze (< 7 days) - basic confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f97316", "#fb923c", "#fdba74", "#fed7aa"],
    });

    // Silver (>= 7 days) - more particles + sides
    if (streak >= 7) {
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#94a3b8", "#cbd5e1", "#e2e8f0", "#f97316"] });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#94a3b8", "#cbd5e1", "#e2e8f0", "#f97316"] });
      }, 200);
    }

    // Gold (>= 21 days) - fireworks
    if (streak >= 21) {
      sounds.achievement();
      const duration = 2000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#f97316"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#f97316"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }

    // Diamond (>= 42 days) - absolute madness
    if (streak >= 42) {
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 180,
          startVelocity: 45,
          gravity: 0.8,
          ticks: 300,
          origin: { y: 0.5 },
          colors: ["#f97316", "#fbbf24", "#ef4444", "#22c55e", "#3b82f6", "#a855f7"],
          shapes: ["circle", "square"],
          scalar: 1.5,
        });
      }, 500);
    }
  }, []);

  return fire;
}
