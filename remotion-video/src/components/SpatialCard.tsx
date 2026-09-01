import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

interface SpatialCardProps {
  children: React.ReactNode;
  delay?: number;
  width?: number | string;
  height?: number | string;
  glowColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({
  children,
  delay = 0,
  width = "auto",
  height = "auto",
  glowColor = COLOR_TOKENS.cobaltBlue,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRING_PRESETS.smooth,
  });

  const scale = interpolate(cardSpring, [0, 1], [0.92, 1]);
  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const translateY = interpolate(cardSpring, [0, 1], [30, 0]);

  // Subtle live floating motion
  const floatY = Math.sin((frame + delay * 5) * 0.04) * 4;

  return (
    <div
      style={{
        width,
        height,
        transform: `translateY(${translateY + floatY}px) scale(${scale})`,
        opacity,
        background: "rgba(14, 14, 20, 0.75)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderRadius: 28,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: `
          0 24px 60px -12px rgba(0, 0, 0, 0.65),
          0 0 40px -10px ${glowColor}25,
          inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)
        `,
        padding: 32,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Top Specular Edge Glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
          opacity: 0.8,
        }}
      />

      {children}
    </div>
  );
};
