import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene5_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main text entrance
  const mainScale = spring({ frame, fps, config: { damping: 8, stiffness: 300 } });
  const mainOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // "Motiv" logo
  const logoDelay = 20;
  const logoOpacity = interpolate(frame, [logoDelay, logoDelay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = spring({
    frame: Math.max(0, frame - logoDelay),
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // URL
  const urlDelay = 40;
  const urlOpacity = interpolate(frame, [urlDelay, urlDelay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow
  const glowIntensity = 0.15 + Math.sin(frame * 0.15) * 0.1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Big background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(249,115,22,${glowIntensity}) 0%, transparent 60%)`,
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        {/* Main text */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 56,
            fontWeight: 800,
            color: "#fafaf9",
            marginBottom: 50,
            opacity: mainOpacity,
            transform: `scale(${mainScale})`,
            lineHeight: 1.3,
          }}
        >
          Stop thinking.
          <br />
          <span style={{ color: "#f97316" }}>Start staking.</span>
        </p>

        {/* Motiv logo */}
        <p
          style={{
            fontFamily: "Pacifico, cursive",
            fontSize: 140,
            color: "#f97316",
            lineHeight: 1,
            marginBottom: 40,
            opacity: logoOpacity,
            transform: `scale(${logoScale}) rotate(-3deg)`,
            textShadow: "0 0 60px rgba(249,115,22,0.5)",
          }}
        >
          Motiv
        </p>

        {/* URL / handle */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 28,
            color: "#78716c",
            fontWeight: 600,
            opacity: urlOpacity,
            letterSpacing: 2,
          }}
        >
          Your excuses just got expensive.
        </p>
      </div>
    </AbsoluteFill>
  );
};
