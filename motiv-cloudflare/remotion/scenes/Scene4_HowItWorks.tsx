import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const STEPS = [
  { num: "01", title: "Stake", desc: "Lock ₹500–₹5000", color: "#f97316" },
  { num: "02", title: "Prove", desc: "Photo + GPS daily", color: "#3b82f6" },
  { num: "03", title: "Win", desc: "Complete = money back", color: "#22c55e" },
];

export const Scene4_HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Fade out
  const fadeOut = interpolate(frame, [130, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 60px",
        opacity: fadeOut,
      }}
    >
      {/* Header */}
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 32,
          color: "#57534e",
          fontWeight: 600,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 80,
          opacity: headerOpacity,
        }}
      >
        How it works
      </p>

      {/* Steps */}
      {STEPS.map((step, i) => {
        const delay = 20 + i * 30;
        const stepOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const stepScale = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { damping: 12, stiffness: 200 },
        });

        return (
          <div
            key={i}
            style={{
              opacity: stepOpacity,
              transform: `scale(${stepScale})`,
              marginBottom: 50,
              display: "flex",
              alignItems: "center",
              gap: 40,
              width: "100%",
            }}
          >
            {/* Number circle */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: `4px solid ${step.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 36,
                  fontWeight: 900,
                  color: step.color,
                }}
              >
                {step.num}
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#fafaf9",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 28,
                  fontWeight: 500,
                  color: "#78716c",
                }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}

      {/* Connecting line */}
      {frame > 20 && (
        <div
          style={{
            position: "absolute",
            left: 108,
            top: "38%",
            width: 4,
            height: interpolate(frame, [20, 80], [0, 300], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            background: "linear-gradient(to bottom, #f97316, #3b82f6, #22c55e)",
            borderRadius: 4,
            opacity: 0.3,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
