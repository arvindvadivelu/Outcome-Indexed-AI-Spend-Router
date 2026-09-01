import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

interface KineticTextProps {
  headline: string;
  highlightWord?: string;
  highlightColor?: string;
  subtitle?: string;
  delay?: number;
  align?: "center" | "left" | "right";
  fontSize?: number;
  subFontSize?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  headline,
  highlightWord,
  highlightColor = COLOR_TOKENS.electricCyan,
  subtitle,
  delay = 0,
  align = "center",
  fontSize = 64,
  subFontSize = 26,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = headline.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
        textAlign: align,
        width: "100%",
        maxWidth: 1500,
        zIndex: 10,
      }}
    >
      {/* Kinetic Headline Words */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
          gap: "14px 20px",
        }}
      >
        {words.map((word, idx) => {
          const wordDelay = delay + idx * 3;
          const wordSpring = spring({
            frame: frame - wordDelay,
            fps,
            config: SPRING_PRESETS.snappy,
          });

          const translateY = interpolate(wordSpring, [0, 1], [40, 0]);
          const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
          const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase());

          return (
            <div
              key={idx}
              style={{
                overflow: "hidden",
                paddingBottom: 6,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                  transform: `translateY(${translateY}px)`,
                  opacity,
                  color: isHighlight ? highlightColor : COLOR_TOKENS.textPrimary,
                  textShadow: isHighlight
                    ? `0 0 40px ${highlightColor}66, 0 0 80px ${highlightColor}33`
                    : "none",
                }}
              >
                {word}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtitle with smooth fade & push */}
      {subtitle && (
        <div style={{ marginTop: 24, overflow: "hidden" }}>
          {(() => {
            const subSpring = spring({
              frame: frame - (delay + words.length * 3 + 6),
              fps,
              config: SPRING_PRESETS.smooth,
            });
            const subY = interpolate(subSpring, [0, 1], [25, 0]);
            const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);

            return (
              <p
                style={{
                  fontSize: subFontSize,
                  fontWeight: 400,
                  color: COLOR_TOKENS.textSecondary,
                  letterSpacing: "-0.01em",
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  transform: `translateY(${subY}px)`,
                  opacity: subOpacity,
                  maxWidth: 900,
                  lineHeight: 1.45,
                }}
              >
                {subtitle}
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
};
