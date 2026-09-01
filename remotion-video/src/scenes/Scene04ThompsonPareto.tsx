import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { MinimalCard } from "../components/MinimalCard";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene04ThompsonPareto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth left-to-right confidence meter fill (Hero Animation)
  const meterFill = interpolate(frame, [25, 85], [0, 99.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          headline="Scored. Routed. Instantly."
          subtext="Every request is scored in real time, then sent to whichever model performs best for that exact task."
          delay={5}
        />
      </div>

      {/* Hero Scorecard Card */}
      <MinimalCard width={760} delay={15}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card Header & Task Info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLOR_TOKENS.textMuted, textTransform: "uppercase" }}>
                Active Task Evaluation
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: COLOR_TOKENS.textNavy, marginTop: 4 }}>
                "Extract structured JSON line items from invoice PDF"
              </div>
            </div>
            <div style={{ padding: "6px 14px", borderRadius: 99, background: "rgba(45, 95, 255, 0.08)", color: COLOR_TOKENS.primaryBlue, fontWeight: 700, fontSize: 13 }}>
              Scored in 1.4ms
            </div>
          </div>

          {/* Smooth Hero Confidence Meter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: COLOR_TOKENS.textSecondary }}>Thompson Outcome Confidence</span>
              <span style={{ color: COLOR_TOKENS.primaryBlue, fontWeight: 800 }}>{meterFill.toFixed(1)}%</span>
            </div>

            <div style={{ width: "100%", height: 14, borderRadius: 999, background: "rgba(10, 31, 68, 0.06)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${meterFill}%`,
                  height: "100%",
                  background: COLOR_TOKENS.primaryBlue,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          {/* Micro-Data Comparison Rows */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid rgba(10,31,68,0.06)", paddingTop: 16 }}>
            <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: COLOR_TOKENS.textMuted, fontWeight: 600 }}>Simple query routing</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLOR_TOKENS.textNavy, marginTop: 2 }}>
                48ms · $0.0002
              </div>
            </div>

            <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: COLOR_TOKENS.textMuted, fontWeight: 600 }}>Complex logic routing</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLOR_TOKENS.textNavy, marginTop: 2 }}>
                210ms · $0.0004
              </div>
            </div>
          </div>
        </div>
      </MinimalCard>
    </div>
  );
};
