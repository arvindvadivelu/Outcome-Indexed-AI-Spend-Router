import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLOR_TOKENS } from "../design/tokens";

interface AudioWaveformVisualizerProps {
  isEnhanced: boolean;
  width?: number;
  height?: number;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isEnhanced,
  width = 680,
  height = 80,
}) => {
  const frame = useCurrentFrame();
  const barCount = 36;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width,
        height,
        padding: "12px 24px",
        borderRadius: 999,
        background: isEnhanced ? "rgba(45, 95, 255, 0.05)" : "rgba(10, 31, 68, 0.04)",
        border: `1px solid ${isEnhanced ? "rgba(45, 95, 255, 0.2)" : "rgba(10, 31, 68, 0.08)"}`,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: isEnhanced ? COLOR_TOKENS.primaryBlue : COLOR_TOKENS.textMuted,
          marginRight: 12,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {isEnhanced ? "🎙️ Studio Mastered" : "📻 Unprocessed Mic"}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, height: "100%" }}>
        {Array.from({ length: barCount }).map((_, i) => {
          // Compute animated bar heights
          const speed = isEnhanced ? 0.18 : 0.08;
          const noiseFactor = isEnhanced ? 1.0 : 0.4;
          
          const rawHeight = Math.sin(frame * speed + i * 0.4) * Math.cos(frame * 0.1 + i * 0.2);
          const normalized = Math.abs(rawHeight);
          
          const barHeight = interpolate(
            normalized,
            [0, 1],
            [isEnhanced ? 12 : 6, isEnhanced ? height * 0.75 : height * 0.35]
          );

          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${barHeight}px`,
                borderRadius: 999,
                background: isEnhanced
                  ? i % 4 === 0
                    ? COLOR_TOKENS.highlightTeal
                    : COLOR_TOKENS.primaryBlue
                  : "rgba(10, 31, 68, 0.25)",
                transition: "height 0.1s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
