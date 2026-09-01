import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

interface MinimalTextProps {
  headline: string;
  subtext?: string;
  highlightWord?: string;
  highlightColor?: string;
  delay?: number;
  align?: "center" | "left" | "right";
  fontSize?: number;
  subFontSize?: number;
}

export const MinimalText: React.FC<MinimalTextProps> = ({
  headline,
  subtext,
  highlightWord,
  highlightColor = COLOR_TOKENS.primaryBlue,
  delay = 0,
  align = "center",
  fontSize = 68,
  subFontSize = 24,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRING_PRESETS.confident,
  });

  const translateY = interpolate(textSpring, [0, 1], [30, 0]);
  const opacity = interpolate(textSpring, [0, 1], [0, 1]);

  const words = headline.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
        textAlign: align,
        width: "100%",
        maxWidth: 1400,
        zIndex: 10,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <h1
        style={{
          fontSize,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.08,
          color: COLOR_TOKENS.textNavy,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Söhne", sans-serif',
          margin: 0,
        }}
      >
        {words.map((word, idx) => {
          const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase());
          return (
            <span
              key={idx}
              style={{
                color: isHighlight ? highlightColor : COLOR_TOKENS.textNavy,
                marginRight: "0.26em",
              }}
            >
              {word}
            </span>
          );
        })}
      </h1>

      {subtext && (
        <p
          style={{
            fontSize: subFontSize,
            fontWeight: 500,
            color: COLOR_TOKENS.textSecondary,
            letterSpacing: "-0.015em",
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
            marginTop: 18,
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
};
