import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FloatingOrbs } from "../components/Particles";

export const Scene3_Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const questionOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const questionScale = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });

  const motivDelay = 50;
  const motivScale = spring({ frame: Math.max(0, frame - motivDelay), fps, config: { damping: 8, stiffness: 250 } });
  const motivOpacity = interpolate(frame, [motivDelay, motivDelay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tagDelay = 90;
  const tagOpacity = interpolate(frame, [tagDelay, tagDelay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = spring({ frame: Math.max(0, frame - tagDelay), fps, config: { damping: 15, stiffness: 100 } });

  const fadeOut = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Line that draws under "Motiv"
  const lineWidth = interpolate(frame, [motivDelay + 20, motivDelay + 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <FloatingOrbs />

      <div style={{ textAlign: "center", zIndex: 2 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 36, color: "#a8a29e", fontWeight: 500, marginBottom: 30, opacity: questionOpacity, transform: `scale(${questionScale})` }}>
          What if quitting cost you money?
        </p>

        <div style={{ position: "relative", display: "inline-block" }}>
          <p style={{ fontFamily: "Pacifico, cursive", fontSize: 160, color: "#f97316", lineHeight: 1, opacity: motivOpacity, transform: `scale(${motivScale}) rotate(-3deg)`, textShadow: "0 0 80px rgba(249,115,22,0.4)" }}>Motiv</p>
          {/* Underline stroke */}
          <svg style={{ position: "absolute", bottom: -10, left: "-5%", width: "110%", height: 20, opacity: motivOpacity }} viewBox="0 0 300 20" preserveAspectRatio="none">
            <path d="M10,10 Q80,18 150,10 T290,12" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeDasharray="280" strokeDashoffset={280 - (lineWidth / 100) * 280} />
          </svg>
        </div>

        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 28, color: "#78716c", fontWeight: 600, letterSpacing: 6, textTransform: "uppercase", marginTop: 40, opacity: tagOpacity, transform: `translateY(${(1 - tagY) * 20}px)` }}>
          Execute or Forfeit
        </p>
      </div>
    </AbsoluteFill>
  );
};
