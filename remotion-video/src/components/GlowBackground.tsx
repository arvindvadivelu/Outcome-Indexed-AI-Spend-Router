import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR_TOKENS } from "../design/tokens";

interface GlowBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  showGrid?: boolean;
  intensity?: number;
}

export const GlowBackground: React.FC<GlowBackgroundProps> = ({
  primaryColor = COLOR_TOKENS.cobaltBlue,
  secondaryColor = COLOR_TOKENS.electricCyan,
  showGrid = true,
  intensity = 1.0,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing rotation and translation
  const orb1X = interpolate(Math.sin(frame * 0.02), [-1, 1], [25, 35]);
  const orb1Y = interpolate(Math.cos(frame * 0.015), [-1, 1], [20, 30]);
  
  const orb2X = interpolate(Math.cos(frame * 0.018), [-1, 1], [65, 75]);
  const orb2Y = interpolate(Math.sin(frame * 0.022), [-1, 1], [60, 70]);

  const pulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.85, 1.15]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLOR_TOKENS.bgDark,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Dynamic Ambient Gradient Orbs */}
      <div
        style={{
          position: "absolute",
          top: `${orb1Y}%`,
          left: `${orb1X}%`,
          width: 850,
          height: 850,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          filter: "blur(120px)",
          opacity: 0.18 * intensity * pulse,
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: `${orb2Y}%`,
          left: `${orb2X}%`,
          width: 750,
          height: 750,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
          filter: "blur(140px)",
          opacity: 0.14 * intensity * pulse,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Futuristic Grid Pattern */}
      {showGrid && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          }}
        />
      )}

      {/* Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 45%, rgba(6,6,8,0.85) 100%)",
        }}
      />
    </div>
  );
};
