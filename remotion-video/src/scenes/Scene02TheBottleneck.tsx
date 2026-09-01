import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { MinimalCard } from "../components/MinimalCard";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene02TheBottleneck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cards stagger drop
  const prompts = [
    { title: "One-Word Classification", prompt: '"Is this user churn risk: yes/no?"', tag: "Simple · 1 token" },
    { title: "SDR Email Draft", prompt: '"Write a 3-sentence intro to VP Eng"', tag: "Medium · 120 tokens" },
    { title: "Full Code Reasoning", prompt: '"Refactor PostgreSQL query plan"', tag: "Complex · 850 tokens" },
  ];

  // Snap animation to the same expensive model destination
  const snapProgress = interpolate(frame, [50, 90], [0, 1], {
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
          headline="One model. Every request."
          subtext="Simple question, paragraph, or complex reasoning — all hitting the same expensive model."
          delay={5}
        />
      </div>

      {/* 3 Prompts converging into 1 single expensive model */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, zIndex: 10 }}>
        <div style={{ display: "flex", gap: 20 }}>
          {prompts.map((p, idx) => {
            const cardSpring = spring({
              frame: frame - (15 + idx * 8),
              fps,
              config: SPRING_PRESETS.confident,
            });
            const dropY = interpolate(cardSpring, [0, 1], [-40, 0]);
            const opacity = interpolate(cardSpring, [0, 1], [0, 1]);

            return (
              <div
                key={idx}
                style={{
                  transform: `translateY(${dropY}px)`,
                  opacity,
                  width: 320,
                  background: "#FFFFFF",
                  padding: "20px 24px",
                  borderRadius: 18,
                  border: "1px solid rgba(10, 31, 68, 0.08)",
                  boxShadow: "0 16px 36px -10px rgba(10, 31, 68, 0.06)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: COLOR_TOKENS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {p.tag}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLOR_TOKENS.textNavy, marginTop: 6 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 13, color: COLOR_TOKENS.textSecondary, marginTop: 4, fontStyle: "italic" }}>
                  {p.prompt}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connecting converging line */}
        <div style={{ width: 2, height: 24, background: "rgba(10, 31, 68, 0.15)" }} />

        {/* Single Identical Expensive Model Destination */}
        <div
          style={{
            padding: "16px 40px",
            borderRadius: 999,
            background: "#FFFFFF",
            border: "1.5px solid rgba(10, 31, 68, 0.15)",
            boxShadow: "0 12px 30px -8px rgba(10, 31, 68, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLOR_TOKENS.subtleRed }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: COLOR_TOKENS.textNavy }}>
            Same Flagship Monolith (Maximum Cost on Every Token)
          </span>
        </div>
      </div>
    </div>
  );
};
