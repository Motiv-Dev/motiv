import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const STEPS = [
  { num: "01", title: "Stake", desc: "Lock ₹500–₹5000", color: "#f97316", icon: "🎯" },
  { num: "02", title: "Prove", desc: "Photo + GPS daily", color: "#3b82f6", icon: "📸" },
  { num: "03", title: "Win", desc: "Complete = money back", color: "#22c55e", icon: "💰" },
];

export const Scene5_HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px", opacity: fadeOut }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 28, color: "#57534e", fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", marginBottom: 70, opacity: headerOpacity }}>How it works</p>

      {STEPS.map((step, i) => {
        const delay = 30 + i * 35;
        const stepOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const stepScale = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 200 } });

        return (
          <div key={i} style={{ opacity: stepOpacity, transform: `scale(${stepScale})`, marginBottom: 40, display: "flex", alignItems: "center", gap: 30, width: "100%" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${step.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${step.color}10` }}>
              <span style={{ fontSize: 32 }}>{step.icon}</span>
            </div>
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 40, fontWeight: 800, color: "#fafaf9", marginBottom: 4 }}>{step.title}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, fontWeight: 500, color: "#78716c" }}>{step.desc}</p>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
