import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene1_Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = spring({ frame, fps, config: { damping: 80, stiffness: 200 } });

  const counter = Math.min(5000, Math.floor(interpolate(frame, [40, 140], [0, 5000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  const slamOpacity = interpolate(frame, [150, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slamScale = spring({ frame: Math.max(0, frame - 150), fps, config: { damping: 8, stiffness: 400 } });

  const fadeOut = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", transform: `scale(${1 + Math.sin(frame * 0.04) * 0.15})` }} />

      <div style={{ textAlign: "center", transform: `scale(${scale})`, opacity }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 38, color: "#a8a29e", fontWeight: 600, marginBottom: 16, letterSpacing: 3, textTransform: "uppercase" }}>You pledged</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 150, fontWeight: 900, color: "#f97316", lineHeight: 1, marginBottom: 16 }}>₹{counter.toLocaleString("en-IN")}</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 32, color: "#78716c", fontWeight: 500 }}>to wake up at 6 AM.</p>
      </div>

      <div style={{ position: "absolute", bottom: 500, opacity: slamOpacity, transform: `scale(${slamScale})` }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 64, fontWeight: 900, color: "#ef4444", letterSpacing: -2 }}>You didn't. It's gone.</p>
      </div>
    </AbsoluteFill>
  );
};
