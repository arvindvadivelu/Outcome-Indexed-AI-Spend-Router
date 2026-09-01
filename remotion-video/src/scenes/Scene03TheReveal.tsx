import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene03TheReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const routes = [
    { from: "Simple Query", to: "Groq LPU (Llama 3.3)", cost: "$0.00018", latency: "48ms", color: COLOR_TOKENS.primaryBlue },
    { from: "SDR Outreach", to: "DeepSeek-V3", cost: "$0.00042", latency: "160ms", color: COLOR_TOKENS.primaryBlue },
    { from: "Deep Reasoning", to: "Claude 3.5 Sonnet", cost: "$0.00300", latency: "340ms", color: COLOR_TOKENS.textNavy },
  ];

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
          headline="Outcome Router."
          subtext="Routes for results. Not brand names."
          highlightWord="Outcome"
          highlightColor={COLOR_TOKENS.primaryBlue}
          delay={5}
          fontSize={76}
        />
      </div>

      {/* 3 Intentional Decision Paths */}
      <div style={{ display: "flex", gap: 24, zIndex: 10 }}>
        {routes.map((r, idx) => {
          const arcSpring = spring({
            frame: frame - (18 + idx * 8),
            fps,
            config: SPRING_PRESETS.confident,
          });

          const translateY = interpolate(arcSpring, [0, 1], [30, 0]);
          const opacity = interpolate(arcSpring, [0, 1], [0, 1]);

          return (
            <div
              key={idx}
              style={{
                transform: `translateY(${translateY}px)`,
                opacity,
                width: 340,
                background: "#FFFFFF",
                padding: "24px 28px",
                borderRadius: 20,
                border: "1.5px solid rgba(45, 95, 255, 0.2)",
                boxShadow: "0 20px 40px -15px rgba(45, 95, 255, 0.08), 0 1px 3px rgba(10, 31, 68, 0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: COLOR_TOKENS.textMuted, textTransform: "uppercase" }}>
                  {r.from}
                </span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(45,95,255,0.08)", color: COLOR_TOKENS.primaryBlue, fontWeight: 700 }}>
                  WINNER
                </span>
              </div>

              <div style={{ fontSize: 20, fontWeight: 800, color: COLOR_TOKENS.textNavy, marginTop: 10, letterSpacing: "-0.02em" }}>
                {r.to}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(10,31,68,0.06)", fontSize: 13 }}>
                <span style={{ color: COLOR_TOKENS.textSecondary }}>Latency: <strong style={{ color: COLOR_TOKENS.textNavy }}>{r.latency}</strong></span>
                <span style={{ color: COLOR_TOKENS.textSecondary }}>Cost: <strong style={{ color: COLOR_TOKENS.primaryBlue }}>{r.cost}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
