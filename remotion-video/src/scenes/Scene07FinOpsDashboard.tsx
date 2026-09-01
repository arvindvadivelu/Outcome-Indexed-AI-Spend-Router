import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { MinimalCard } from "../components/MinimalCard";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene07FinOpsDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pouring fill animation (the emotional peak of the video)
  const pourSpring = spring({
    frame: frame - 15,
    fps,
    config: SPRING_PRESETS.confident,
  });
  const fillProgress = interpolate(pourSpring, [0, 1], [0, 1]);

  const width = 840;
  const height = 240;

  // Navy unoptimized curve
  const navyPath = "M 40,80 L 180,80 L 340,75 L 500,70 L 660,70 L 800,65";
  // Blue optimized curve
  const bluePath = "M 40,80 L 180,130 L 340,160 L 500,185 L 660,195 L 800,200";

  // Polygon connecting the gap between two curves for the teal fill
  const gapPolygon = "M 40,80 L 180,80 L 340,75 L 500,70 L 660,70 L 800,65 L 800,200 L 660,195 L 500,185 L 340,160 L 180,130 Z";

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

      <div style={{ marginBottom: 36, zIndex: 10 }}>
        <MinimalText
          headline="40%+ lower spend."
          highlightWord="40%+"
          highlightColor={COLOR_TOKENS.highlightTeal}
          subtext="Same or better output quality. Zero manual intervention."
          delay={5}
          fontSize={80}
          subFontSize={26}
        />
      </div>

      {/* Resolved Chart Card with Pouring Teal Fill */}
      <MinimalCard width={width} height={height + 60} delay={12}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="tealPourGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_TOKENS.highlightTeal} stopOpacity="0.32" />
                <stop offset="100%" stopColor={COLOR_TOKENS.highlightTeal} stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Subtle baseline */}
            <line x1="40" y1="210" x2="800" y2="210" stroke="rgba(10, 31, 68, 0.08)" strokeWidth="1" />

            {/* Gap Area Filled with Desaturated Teal */}
            <path
              d={gapPolygon}
              fill="url(#tealPourGrad)"
              opacity={fillProgress}
            />

            {/* Navy Curve */}
            <path
              d={navyPath}
              fill="none"
              stroke={COLOR_TOKENS.textNavy}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Electric Blue Curve */}
            <path
              d={bluePath}
              fill="none"
              stroke={COLOR_TOKENS.primaryBlue}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          {/* Central Teal "SAVED" Badge in the Gap */}
          <div
            style={{
              position: "absolute",
              top: 105,
              left: 450,
              transform: `scale(${fillProgress})`,
              opacity: fillProgress,
              padding: "6px 16px",
              borderRadius: 999,
              background: COLOR_TOKENS.highlightTeal,
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.05em",
              boxShadow: "0 6px 20px rgba(0, 194, 168, 0.35)",
            }}
          >
            42.8% SAVED
          </div>
        </div>
      </MinimalCard>
    </div>
  );
};
