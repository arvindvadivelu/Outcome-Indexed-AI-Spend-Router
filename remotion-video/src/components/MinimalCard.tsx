import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

interface MinimalCardProps {
  children: React.ReactNode;
  delay?: number;
  width?: number | string;
  height?: number | string;
  borderColor?: string;
  style?: React.CSSProperties;
}

export const MinimalCard: React.FC<MinimalCardProps> = ({
  children,
  delay = 0,
  width = "auto",
  height = "auto",
  borderColor = COLOR_TOKENS.borderLight,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRING_PRESETS.confident,
  });

  const translateY = interpolate(cardSpring, [0, 1], [30, 0]);
  const opacity = interpolate(cardSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width,
        height,
        transform: `translateY(${translateY}px)`,
        opacity,
        background: COLOR_TOKENS.surfaceCard,
        borderRadius: 24,
        border: `1px solid ${borderColor}`,
        boxShadow: "0 24px 50px -15px rgba(10, 31, 68, 0.08), 0 2px 6px rgba(10, 31, 68, 0.03)",
        padding: 32,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
