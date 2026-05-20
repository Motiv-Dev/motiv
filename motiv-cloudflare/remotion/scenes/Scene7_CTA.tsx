import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene7_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainScale = spring({ frame, fps, config: { damping: 8, stiffness: 300 } });
  const mainOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const logoDelay = 30;
  const logoOpacity = interpolate(frame, [logoDelay, logoDelay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoScale = spring({ frame: Math.max(0, frame - logoDelay), fps, config: { damping: 10, stiffness: 200 } });

  const tagDelay = 60;
  const tagOpacity = interpolate(frame, [tagDelay, tagDelay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const glowIntensity = 0.15 + Math.sin(frame * 0.1) * 0.1;

  // Pulsing ring
  const ringScale = 1 + Math.sin(frame * 0.06) * 0.05;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Pulsing ring */}
      <div style={{
        position: "absolute",
        width: 500, height: 500,
        borderRadius: "50%",
        border: "1px solid rgba(249,115,22,0.1)",
        transform: `scale(${ringScale})`,
      }} />
      <div style={{
        position: "absolute",
        width: 700, height: 700,
        borderRadius: "50%",
        border: "1px solid rgba(249,115,22,0.05)",
        transform: `scale(${ringScale * 1.1})`,
      }} />

      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(249,115,22,${glowIntensity}) 0%, transparent 60%)` }} />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 48, fontWeight: 800, color: "#fafaf9", marginBottom: 40, opacity: mainOpacity, transform: `scale(${mainScale})`, lineHeight: 1.3 }}>
          Stop thinking.
          <br />
          <span style={{ color: "#f97316" }}>Start staking.</span>
        </p>

        <p style={{ fontFamily: "Pacifico, cursive", fontSize: 120, color: "#f97316", lineHeight: 1, marginBottom: 30, opacity: logoOpacity, transform: `scale(${logoScale}) rotate(-3deg)`, textShadow: "0 0 60px rgba(249,115,22,0.5)" }}>Motiv</p>

        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: "#78716c", fontWeight: 600, opacity: tagOpacity, letterSpacing: 2 }}>
          Your excuses just got expensive.
        </p>
      </div>
    </AbsoluteFill>
  );
};
