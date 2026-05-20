import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PhoneFrame } from "../components/PhoneFrame";
import { DashboardMockup, LandingMockup } from "../components/MockUI";

export const Scene4_PhoneMockup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides up from bottom
  const phoneY = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const phoneOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // Switch from landing to dashboard at frame 180
  const showDashboard = frame > 180;
  const transitionOpacity = showDashboard
    ? interpolate(frame, [180, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // Subtle floating
  const floatY = Math.sin(frame * 0.02) * 8;
  const floatRotate = Math.sin(frame * 0.015) * 1.5;

  // Label
  const labelDelay = 60;
  const labelOpacity = interpolate(frame, [labelDelay, labelDelay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dashLabelDelay = 220;
  const dashLabelOpacity = showDashboard
    ? interpolate(frame, [dashLabelDelay, dashLabelDelay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const fadeOut = interpolate(frame, [390, 420], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      {/* Background glow */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", top: "30%", left: "50%", transform: "translate(-50%, -50%)" }} />

      {/* Label */}
      <div style={{ position: "absolute", top: 140, textAlign: "center", zIndex: 10 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: "#78716c", fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", opacity: showDashboard ? dashLabelOpacity : labelOpacity }}>
          {showDashboard ? "Your Dashboard" : "The App"}
        </p>
      </div>

      {/* Phone */}
      <div style={{
        opacity: phoneOpacity,
        transform: `translateY(${(1 - phoneY) * 300 + floatY}px) rotate(${floatRotate}deg)`,
      }}>
        <PhoneFrame scale={1.15}>
          {showDashboard ? (
            <div style={{ opacity: transitionOpacity }}>
              <DashboardMockup />
            </div>
          ) : (
            <LandingMockup />
          )}
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
