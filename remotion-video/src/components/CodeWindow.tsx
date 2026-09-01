import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

interface CodeWindowProps {
  delay?: number;
  showMorph?: boolean;
}

export const CodeWindow: React.FC<CodeWindowProps> = ({
  delay = 0,
  showMorph = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const winSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRING_PRESETS.smooth,
  });

  const scale = interpolate(winSpring, [0, 1], [0.92, 1]);
  const opacity = interpolate(winSpring, [0, 1], [0, 1]);
  const translateY = interpolate(winSpring, [0, 1], [40, 0]);

  // Morph animation from standard OpenAI URL to Outcome Router URL
  const morphProgress = interpolate(frame - (delay + 30), [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const originalUrl = 'baseURL: "https://api.openai.com/v1"';
  const newUrl = 'baseURL: "https://api.outcomerouter.ai/v1"';

  return (
    <div
      style={{
        width: 780,
        borderRadius: 20,
        background: "rgba(10, 10, 14, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 50px -10px rgba(0, 80, 255, 0.25)",
        overflow: "hidden",
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
      }}
    >
      {/* Window Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F56" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#27C93F" }} />
        </div>
        <span style={{ fontSize: 12, color: COLOR_TOKENS.textMuted, letterSpacing: "-0.01em" }}>
          client.ts — Zero-Code Drop-In Proxy
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Code Body */}
      <div style={{ padding: "24px 28px", fontSize: 16, lineHeight: 1.8 }}>
        <div style={{ color: "#71717A" }}>// 1. Initialize OpenAI Client with Drop-in Proxy</div>
        <div>
          <span style={{ color: "#F43F5E" }}>import </span>
          <span style={{ color: "#F59E0B" }}>OpenAI </span>
          <span style={{ color: "#F43F5E" }}>from </span>
          <span style={{ color: "#10B981" }}>"openai"</span>;
        </div>
        <div style={{ height: 8 }} />
        <div>
          <span style={{ color: "#3B82F6" }}>const </span>
          <span style={{ color: "#E2E8F0" }}>openai = </span>
          <span style={{ color: "#3B82F6" }}>new </span>
          <span style={{ color: "#F59E0B" }}>OpenAI</span>
          <span style={{ color: "#E2E8F0" }}>(&#123;</span>
        </div>

        {/* Dynamic Highlighted BaseURL Line */}
        <div
          style={{
            paddingLeft: 24,
            background: morphProgress > 0.5 ? "rgba(0, 240, 255, 0.12)" : "rgba(255, 255, 255, 0.04)",
            borderLeft: `3px solid ${morphProgress > 0.5 ? COLOR_TOKENS.electricCyan : COLOR_TOKENS.crimsonAlert}`,
            margin: "4px 0",
            paddingTop: 2,
            paddingBottom: 2,
            transition: "all 0.3s ease",
          }}
        >
          {showMorph && morphProgress > 0.5 ? (
            <span>
              <span style={{ color: "#E2E8F0" }}>baseURL: </span>
              <span style={{ color: COLOR_TOKENS.electricCyan, fontWeight: 700 }}>
                "{newUrl.slice(10, -1)}"
              </span>
              <span style={{ color: "#10B981", marginLeft: 12, fontSize: 12 }}>
                ✓ OUTCOME ROUTER ACTIVE
              </span>
            </span>
          ) : (
            <span style={{ textDecoration: showMorph && morphProgress > 0.2 ? "line-through" : "none" }}>
              <span style={{ color: "#E2E8F0" }}>baseURL: </span>
              <span style={{ color: "#EF4444" }}>"{originalUrl.slice(10, -1)}"</span>
            </span>
          )}
        </div>

        <div style={{ paddingLeft: 24 }}>
          <span style={{ color: "#E2E8F0" }}>apiKey: process.env.</span>
          <span style={{ color: "#38BDF8" }}>OIR_LIVE_API_KEY</span>
        </div>
        <div>
          <span style={{ color: "#E2E8F0" }}>&#125;);</span>
        </div>
      </div>
    </div>
  );
};
