import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

// Recreates the Motiv dashboard UI for the video
export const DashboardMockup: React.FC<{ animateIn?: boolean }> = ({ animateIn = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const streakValue = Math.min(
    12,
    Math.floor(interpolate(frame, [30, 120], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  );

  const progressWidth = interpolate(frame, [30, 120], [0, 57], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ width: 375, height: 812, background: "#faf9f7", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      {/* Nav */}
      <div style={{ padding: "54px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e5e4" }}>
        <span style={{ fontFamily: "Pacifico, cursive", fontSize: 22, color: "#f97316", transform: "rotate(-2deg)", display: "inline-block" }}>Motiv</span>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f5f5f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>🏆</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Greeting */}
        <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 500, marginBottom: 4 }}>Welcome back</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: "#1c1917", marginBottom: 24 }}>Subhang</p>

        {/* Active stake card */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #e7e5e4", padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>🏋️</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#1c1917" }}>Gym</span>
              </div>
              <p style={{ fontSize: 12, color: "#a8a29e", fontWeight: 500 }}>{streakValue} of 21 days</p>
            </div>
            {/* Streak ring */}
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#f5f5f4" strokeWidth="5" />
              <circle
                cx="36" cy="36" r="30" fill="none" stroke="#f97316" strokeWidth="5"
                strokeDasharray={`${progressWidth * 1.88} 188.5`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
              <text x="36" y="38" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="900" fill="#1c1917">
                {streakValue}
              </text>
            </svg>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: "#f5f5f4", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: `${progressWidth}%`, background: "linear-gradient(90deg, #fb923c, #f97316)", borderRadius: 3 }} />
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#1c1917" }}>₹100</p>
              <p style={{ fontSize: 10, color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Daily Risk</p>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#22c55e" }}>₹{streakValue * 100}</p>
              <p style={{ fontSize: 10, color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Saved</p>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#ef4444" }}>₹0</p>
              <p style={{ fontSize: 10, color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Burned</p>
            </div>
          </div>

          {/* Submit button */}
          <div style={{
            marginTop: 20,
            background: "#1c1917",
            color: "white",
            borderRadius: 16,
            padding: "14px 0",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}>
            📸 Submit Today&apos;s Proof
          </div>
        </div>

        {/* Second stake */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #e7e5e4", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📚</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917" }}>Study</p>
                <p style={{ fontSize: 11, color: "#a8a29e" }}>5 of 14 days</p>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "#f0fdf4", color: "#16a34a" }}>Active</span>
          </div>
        </div>

        {/* New Stake CTA */}
        <div style={{
          marginTop: 16,
          border: "2px dashed #e7e5e4",
          borderRadius: 16,
          padding: "14px 0",
          textAlign: "center",
          color: "#a8a29e",
          fontSize: 13,
          fontWeight: 600,
        }}>
          + New Stake
        </div>
      </div>
    </div>
  );
};

// Landing page mockup
export const LandingMockup: React.FC = () => {
  return (
    <div style={{ width: 375, height: 812, background: "#faf9f7", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      {/* Nav */}
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(252,250,248,0.9)", backdropFilter: "blur(10px)" }}>
        <span style={{ fontFamily: "Pacifico, cursive", fontSize: 20, color: "#f97316", transform: "rotate(-2deg)", display: "inline-block" }}>Motiv</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#57534e" }}>Login</span>
          <span style={{ fontSize: 11, fontWeight: 600, background: "#1c1917", color: "white", padding: "6px 14px", borderRadius: 20 }}>Join</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "60px 20px 40px", textAlign: "center" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "white", border: "1px solid #fed7aa", marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#c2410c" }}>V1 Live</span>
        </div>

        <p style={{ fontFamily: "Pacifico, cursive", fontSize: 64, color: "#f97316", lineHeight: 0.9, marginBottom: 16, transform: "rotate(-2deg)" }}>Motiv</p>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#c2410c", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Your excuses just got expensive</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: "#1c1917", marginBottom: 24 }}>Execute or Forfeit.</p>

        <div style={{ background: "#1c1917", color: "white", borderRadius: 12, padding: "14px 24px", fontSize: 14, fontWeight: 700, display: "inline-block" }}>
          Pledge Your Stake →
        </div>
      </div>

      {/* Steps preview */}
      <div style={{ padding: "0 20px" }}>
        {[
          { n: 1, title: "Stake", desc: "Lock real money" },
          { n: 2, title: "Execute", desc: "Complete daily tasks" },
          { n: 3, title: "Verify", desc: "AI audits your proof" },
        ].map((s) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f5f5f4" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#a8a29e" }}>
              {s.n}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1c1917" }}>{s.title}</p>
              <p style={{ fontSize: 11, color: "#a8a29e" }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
