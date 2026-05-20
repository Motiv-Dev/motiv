import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene3_Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // "Motiv" reveal with rotation
  const motivDelay = 30;
  const motivScale = spring({
    frame: Math.max(0, frame - motivDelay),
    fps,
    config: { damping: 8, stiffness: 300 },
  });
  const motivOpacity = interpolate(frame, [motivDelay, motivDelay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const tagDelay = 60;
  const tagOpacity = interpolate(frame, [tagDelay, tagDelay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagY = spring({
    frame: Math.max(0, frame - tagDelay),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Feature bullets
  const features = [
    "Stake real money",
    "Prove it daily",
    "Miss a day = money burns",
  ];

  // Fade out
  const fadeOut = interpolate(frame, [190, 210], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Orange glow pulse
  const glowSize = 400 + Math.sin(frame * 0.08) * 50;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        {/* "What if" */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 40,
            color: "#a8a29e",
            fontWeight: 500,
            marginBottom: 20,
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          What if quitting cost you money?
        </p>

        {/* "Motiv" */}
        <p
          style={{
            fontFamily: "Pacifico, cursive",
            fontSize: 180,
            color: "#f97316",
            lineHeight: 1,
            marginBottom: 40,
            opacity: motivOpacity,
            transform: `scale(${motivScale}) rotate(-3deg)`,
            textShadow: "0 0 80px rgba(249,115,22,0.4)",
          }}
        >
          Motiv
        </p>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 32,
            color: "#78716c",
            fontWeight: 600,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginBottom: 80,
            opacity: tagOpacity,
            transform: `translateY(${(1 - tagY) * 30}px)`,
          }}
        >
          Execute or Forfeit
        </p>

        {/* Feature bullets */}
        {features.map((feat, i) => {
          const featDelay = 100 + i * 20;
          const featOpacity = interpolate(frame, [featDelay, featDelay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const featX = spring({
            frame: Math.max(0, frame - featDelay),
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                opacity: featOpacity,
                transform: `translateX(${(1 - featX) * 80}px)`,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#e7e5e4",
                }}
              >
                {i === 2 ? (
                  <>
                    Miss a day ={" "}
                    <span style={{ color: "#ef4444" }}>money burns</span>
                  </>
                ) : (
                  feat
                )}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
