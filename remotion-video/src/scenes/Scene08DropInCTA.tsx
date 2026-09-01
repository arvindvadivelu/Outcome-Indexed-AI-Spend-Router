import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { MinimalCard } from "../components/MinimalCard";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene08DropInCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Morph from api.openai.com to api.outcomerouter.ai around frame 30
  const isMorphed = frame >= 30;

  // Text cursor blink once on the changed line
  const cursorVisible = frame >= 25 && frame <= 55 && Math.floor(frame / 6) % 2 === 0;

  // Final CTA reveal (frame 80 onwards, settling into stillness)
  const ctaSpring = spring({
    frame: frame - 70,
    fps,
    config: SPRING_PRESETS.settle,
  });
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.95, 1]);

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

      <div style={{ marginBottom: 32, zIndex: 10 }}>
        <MinimalText
          headline="One line. Zero rewrites."
          highlightWord="Zero"
          highlightColor={COLOR_TOKENS.primaryBlue}
          subtext="One line changes your endpoint. Nothing else changes."
          delay={5}
        />
      </div>

      {/* Minimalist Code Card with Single Line Diff */}
      <MinimalCard width={740} delay={12}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
            fontSize: 16,
            lineHeight: 1.8,
            color: "#94A3B8", // Untouched code greyed slightly to emphasize diff
          }}
        >
          <div>
            <span style={{ color: "#64748B" }}>import </span>
            <span style={{ color: COLOR_TOKENS.textNavy, fontWeight: 600 }}>OpenAI </span>
            <span style={{ color: "#64748B" }}>from </span>
            <span style={{ color: "#64748B" }}>"openai"</span>;
          </div>
          <div>
            <span style={{ color: "#64748B" }}>const </span>
            <span style={{ color: COLOR_TOKENS.textNavy, fontWeight: 600 }}>openai = </span>
            <span style={{ color: "#64748B" }}>new </span>
            <span style={{ color: COLOR_TOKENS.textNavy, fontWeight: 600 }}>OpenAI</span>
            <span>(&#123;</span>
          </div>

          {/* Emphasized single diff line */}
          <div
            style={{
              paddingLeft: 20,
              background: isMorphed ? "rgba(45, 95, 255, 0.08)" : "rgba(10, 31, 68, 0.04)",
              borderRadius: 6,
              margin: "4px 0",
              color: isMorphed ? COLOR_TOKENS.primaryBlue : COLOR_TOKENS.textNavy,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>
              baseURL: "{isMorphed ? "https://api.outcomerouter.ai/v1" : "https://api.openai.com/v1"}"
            </span>
            {cursorVisible && (
              <span style={{ width: 2, height: 18, background: COLOR_TOKENS.primaryBlue, marginLeft: 4 }} />
            )}
          </div>

          <div style={{ paddingLeft: 20 }}>
            <span>apiKey: process.env.OUTCOME_ROUTER_API_KEY</span>
          </div>
          <div>
            <span>&#125;);</span>
          </div>
        </div>
      </MinimalCard>

      {/* Final Beat of Stillness: Clean Centered CTA */}
      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: COLOR_TOKENS.primaryBlue,
            letterSpacing: "-0.03em",
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
          }}
        >
          outcomerouter.ai
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: COLOR_TOKENS.textSecondary,
            letterSpacing: "-0.01em",
          }}
        >
          Route for outcomes.
        </div>
      </div>
    </div>
  );
};
