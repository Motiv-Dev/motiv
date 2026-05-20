import { useCurrentFrame, random, interpolate } from "remotion";
import React from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

export const BackgroundParticles: React.FC = () => {
  const frame = useCurrentFrame();

  // Generate consistent particles using seeded random
  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      x: random(`px-${i}`) * 1080,
      y: random(`py-${i}`) * 1920,
      size: 1 + random(`ps-${i}`) * 3,
      speed: 0.3 + random(`psp-${i}`) * 0.8,
      opacity: 0.1 + random(`po-${i}`) * 0.3,
      delay: random(`pd-${i}`) * 200,
    }));
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {particles.map((p, i) => {
        const y = (p.y - (frame + p.delay) * p.speed) % 1920;
        const adjustedY = y < 0 ? y + 1920 : y;
        const flicker = 0.7 + Math.sin(frame * 0.05 + i) * 0.3;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + Math.sin(frame * 0.02 + i * 0.5) * 15,
              top: adjustedY,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: i % 3 === 0 ? "#f97316" : "#fafaf9",
              opacity: p.opacity * flicker,
              filter: `blur(${p.size > 2 ? 1 : 0}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// Floating orbs — larger, blurred, ambient
export const FloatingOrbs: React.FC<{ color?: string; count?: number }> = ({
  color = "#f97316",
  count = 3,
}) => {
  const frame = useCurrentFrame();

  const orbs = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: 200 + random(`ox-${i}`) * 680,
      y: 400 + random(`oy-${i}`) * 1100,
      size: 200 + random(`os-${i}`) * 300,
      phase: random(`op-${i}`) * Math.PI * 2,
    }));
  }, [count]);

  return (
    <>
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: orb.x + Math.sin(frame * 0.008 + orb.phase) * 60,
            top: orb.y + Math.cos(frame * 0.006 + orb.phase) * 40,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
};
