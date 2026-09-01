import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { MinimalCard } from "../components/MinimalCard";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene05SpeculativeRace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Model 1 (Winner) progress from 0% to 100%
  const winnerProgress = interpolate(frame, [20, 80], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Model 2 (Loser) progress lags behind and halts
  const loserProgress = interpolate(frame, [20, 80], [0, 32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Loser subtle fade to 10% opacity mid-race (Payoff animation)
  const loserOpacity = interpolate(frame, [60, 95], [1.0, 0.12], {
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

      <div style={{ marginBottom: 40, zIndex: 10 }}>
        <MinimalText
          headline="We race two models. You pay for one."
          highlightWord="one."
          highlightColor={COLOR_TOKENS.primaryBlue}
          subtext="Simultaneous dual-dispatch with instant cancellation of trailing streams."
          delay={5}
        />
      </div>

      {/* Dual Race Lines Container */}
      <MinimalCard width={800} delay={15}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Winner Lane */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
              <span style={{ color: COLOR_TOKENS.primaryBlue }}>Model A (Groq LPU)</span>
              <span style={{ color: COLOR_TOKENS.primaryBlue }}>
                {winnerProgress >= 100 ? "Finished first (58ms · Billed)" : `${Math.round(winnerProgress)}%`}
              </span>
            </div>

            <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(10, 31, 68, 0.06)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${winnerProgress}%`,
                  height: "100%",
                  background: COLOR_TOKENS.primaryBlue,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          {/* Loser Lane (fading out) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: loserOpacity }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
              <span style={{ color: COLOR_TOKENS.textSecondary }}>Model B (Flagship Baseline)</span>
              <span style={{ color: COLOR_TOKENS.textMuted }}>
                {winnerProgress >= 100 ? "Cancelled mid-race ($0.00)" : `${Math.round(loserProgress)}%`}
              </span>
            </div>

            <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(10, 31, 68, 0.06)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${loserProgress}%`,
                  height: "100%",
                  background: COLOR_TOKENS.textSecondary,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>
      </MinimalCard>
    </div>
  );
};
