import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

interface MetricBadgeProps {
  label: string;
  value?: string;
  delay?: number;
  color?: string;
  pulse?: boolean;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  value,
  delay = 0,
  color = COLOR_TOKENS.electricCyan,
  pulse = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRING_PRESETS.snappy,
  });

  const scale = interpolate(badgeSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(badgeSpring, [0, 1], [0, 1]);

  const pulseOpacity = pulse
    ? interpolate(Math.sin((frame + delay) * 0.1), [-1, 1], [0.5, 1])
    : 1;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 18px",
        borderRadius: 999,
        background: "rgba(255, 255, 255, 0.04)",
        border: `1px solid ${color}40`,
        backdropFilter: "blur(16px)",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Live Status Indicator Dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
          opacity: pulseOpacity,
        }}
      />

      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLOR_TOKENS.textPrimary,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>

      {value && (
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
};
