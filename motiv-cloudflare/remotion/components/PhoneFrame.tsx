import React from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
  scale?: number;
  rotate?: number;
  x?: number;
  y?: number;
  shadow?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  scale = 1,
  rotate = 0,
  x = 0,
  y = 0,
  shadow = true,
}) => {
  const phoneWidth = 375;
  const phoneHeight = 812;
  const borderRadius = 50;
  const bezelWidth = 12;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: "center center",
        position: "relative",
        width: phoneWidth + bezelWidth * 2,
        height: phoneHeight + bezelWidth * 2,
      }}
    >
      {/* Shadow */}
      {shadow && (
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: borderRadius + 10,
            background: "rgba(0,0,0,0.4)",
            filter: "blur(40px)",
            zIndex: -1,
          }}
        />
      )}

      {/* Orange glow behind phone */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "80%",
          height: "60%",
          background: "radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: -1,
        }}
      />

      {/* Phone body */}
      <div
        style={{
          width: phoneWidth + bezelWidth * 2,
          height: phoneHeight + bezelWidth * 2,
          borderRadius,
          background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)",
          padding: bezelWidth,
          position: "relative",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: phoneWidth,
            height: phoneHeight,
            borderRadius: borderRadius - bezelWidth,
            overflow: "hidden",
            position: "relative",
            background: "#faf9f7",
          }}
        >
          {children}
        </div>

        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: bezelWidth,
            left: "50%",
            transform: "translateX(-50%)",
            width: 150,
            height: 34,
            backgroundColor: "#0a0a0a",
            borderRadius: "0 0 20px 20px",
            zIndex: 10,
          }}
        >
          {/* Camera dot */}
          <div
            style={{
              position: "absolute",
              right: 25,
              top: 10,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1a2e, #333)",
              boxShadow: "inset 0 0 3px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: bezelWidth + 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 130,
            height: 5,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 3,
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
};

// Laptop frame
export const LaptopFrame: React.FC<{
  children: React.ReactNode;
  scale?: number;
}> = ({ children, scale = 1 }) => {
  const screenW = 640;
  const screenH = 400;

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
      {/* Screen housing */}
      <div
        style={{
          width: screenW + 24,
          height: screenH + 24,
          background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
          borderRadius: "16px 16px 0 0",
          padding: 12,
          boxShadow: "0 -2px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: screenW,
            height: screenH,
            borderRadius: 8,
            overflow: "hidden",
            background: "#faf9f7",
          }}
        >
          {children}
        </div>
      </div>

      {/* Keyboard base */}
      <div
        style={{
          width: screenW + 80,
          height: 16,
          marginLeft: -28,
          background: "linear-gradient(to bottom, #333, #222)",
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};
