import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { MinimalCard } from "../components/MinimalCard";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene01TheBurn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clean SVG path draw progress (ease-out)
  const drawSpringNavy = spring({
    frame: frame - 15,
    fps,
    config: SPRING_PRESETS.confident,
  });
  const navyProgress = interpolate(drawSpringNavy, [0, 1], [0, 1]);

  const drawSpringBlue = spring({
    frame: frame - 45,
    fps,
    config: SPRING_PRESETS.confident,
  });
  const blueProgress = interpolate(drawSpringBlue, [0, 1], [0, 1]);

  // Chart points
  const width = 840;
  const height = 240;

  // High static spend curve (Deep Navy)
  const navyPath = "M 40,80 L 180,80 L 340,75 L 500,70 L 660,70 L 800,65";
  // Outcome-optimized lower spend curve (Electric Blue)
  const bluePath = "M 40,80 L 180,130 L 340,160 L 500,185 L 660,195 L 800,200";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLOR_TOKENS.bgWhite,
      }}
    >
      <WhiteBackground />

      <div style={{ marginBottom: 40, zIndex: 10 }}>
        <MinimalText
          headline="Same usage. Different bill."
          highlightWord="Different"
          highlightColor={COLOR_TOKENS.primaryBlue}
          subtext="Your AI bill doesn't reflect your usage. It reflects your defaults."
          delay={5}
        />
      </div>

      {/* Minimalist Chart Card */}
      <MinimalCard width={width} height={height + 60} delay={15}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Subtle baseline */}
            <line x1="40" y1="210" x2="800" y2="210" stroke="rgba(10, 31, 68, 0.08)" strokeWidth="1" />

            {/* Navy Unoptimized Baseline Line */}
            <path
              d={navyPath}
              fill="none"
              stroke={COLOR_TOKENS.textNavy}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={900}
              strokeDashoffset={900 * (1 - navyProgress)}
            />

            {/* Electric Blue Optimized Route Line */}
            <path
              d={bluePath}
              fill="none"
              stroke={COLOR_TOKENS.primaryBlue}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={900}
              strokeDashoffset={900 * (1 - blueProgress)}
            />
          </svg>

          {/* Clean minimal legend */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 20,
              display: "flex",
              gap: 28,
              fontSize: 13,
              fontFamily: 'system-ui, -apple-system, "Inter", sans-serif',
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLOR_TOKENS.textNavy }}>
              <div style={{ width: 12, height: 4, borderRadius: 2, background: COLOR_TOKENS.textNavy }} />
              Current Defaults
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLOR_TOKENS.primaryBlue, opacity: blueProgress }}>
              <div style={{ width: 12, height: 4, borderRadius: 2, background: COLOR_TOKENS.primaryBlue }} />
              Outcome Routed
            </div>
          </div>
        </div>
      </MinimalCard>
    </div>
  );
};
