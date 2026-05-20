import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene6_Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { label: "Beta Users", value: 500, suffix: "+", color: "#f97316" },
    { label: "Total Staked", value: 250000, prefix: "₹", suffix: "", color: "#22c55e" },
    { label: "Completion Rate", value: 87, suffix: "%", color: "#3b82f6" },
  ];

  const fadeOut = interpolate(frame, [150, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px", opacity: fadeOut }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 28, color: "#57534e", fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", marginBottom: 60 }}>Early Results</p>

      {stats.map((stat, i) => {
        const delay = 20 + i * 25;
        const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const scale = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 200 } });
        const countTo = Math.min(stat.value, Math.floor(interpolate(frame, [delay, delay + 60], [0, stat.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

        return (
          <div key={i} style={{ opacity, transform: `scale(${scale})`, marginBottom: 40, textAlign: "center" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 72, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
              {stat.prefix || ""}{stat.value > 1000 ? `${Math.floor(countTo / 1000)}K` : countTo}{stat.suffix}
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 22, fontWeight: 500, color: "#78716c", marginTop: 8 }}>{stat.label}</p>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
