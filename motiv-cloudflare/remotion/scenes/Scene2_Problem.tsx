import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const LINES = [
  { text: "Set a goal.", delay: 0 },
  { text: "Felt motivated.", delay: 25 },
  { text: "Bought the gear.", delay: 50 },
  { text: "Quit in 4 days.", delay: 75, color: "#ef4444" },
];

export const Scene2_Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const strikeProgress = interpolate(frame, [130, 160], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px", opacity: fadeOut }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 28, color: "#57534e", fontWeight: 600, marginBottom: 50, letterSpacing: 5, textTransform: "uppercase" }}>Sound familiar?</p>
      {LINES.map((line, i) => {
        const lineOpacity = interpolate(frame, [line.delay, line.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const lineX = spring({ frame: Math.max(0, frame - line.delay), fps, config: { damping: 15, stiffness: 120 } });
        const isLast = i === LINES.length - 1;
        const showStrike = !isLast && frame > 130;

        return (
          <div key={i} style={{ opacity: lineOpacity, transform: `translateX(${(1 - lineX) * 80}px)`, marginBottom: 24, position: "relative" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: isLast ? 64 : 48, fontWeight: isLast ? 900 : 700, color: line.color || (showStrike ? "#44403c" : "#e7e5e4"), lineHeight: 1.2 }}>{line.text}</p>
            {showStrike && <div style={{ position: "absolute", top: "50%", left: 0, height: 3, width: `${strikeProgress}%`, backgroundColor: "#78716c", borderRadius: 2 }} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
