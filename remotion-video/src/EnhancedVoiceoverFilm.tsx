import React from "react";
import { Audio, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { WhiteBackground } from "./components/WhiteBackground";
import { MinimalText } from "./components/MinimalText";
import { MinimalCard } from "./components/MinimalCard";
import { AudioWaveformVisualizer } from "./components/AudioWaveformVisualizer";
import { COLOR_TOKENS, SPRING_PRESETS } from "./design/tokens";

export const EnhancedVoiceoverFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split point at 14.5s (frame 435)
  const isEnhanced = frame >= 435;

  // Transition Flash & Zoom effect around frame 435
  const transitionProgress = interpolate(frame, [420, 445], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cameraScale = interpolate(
    Math.sin((frame / 900) * Math.PI),
    [0, 1],
    [1.0, 1.03]
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${cameraScale})`,
      }}
    >
      {/* 🎵 SYNCHRONIZED 30-SECOND NEURAL VOICEOVER (BEFORE VS AFTER ENHANCED) */}
      <Audio src={staticFile("voiceover_30s_enhanced.mp3")} />

      <WhiteBackground />

      {/* Top Status Header: BEFORE VS AFTER INDICATOR */}
      <div style={{ position: "absolute", top: 60, display: "flex", gap: 16, zIndex: 30 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 24px",
            borderRadius: 999,
            background: isEnhanced ? "rgba(0, 194, 168, 0.1)" : "rgba(244, 63, 94, 0.1)",
            border: `1.5px solid ${isEnhanced ? COLOR_TOKENS.highlightTeal : COLOR_TOKENS.subtleRed}`,
            boxShadow: "0 8px 24px -6px rgba(10, 31, 68, 0.08)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: isEnhanced ? COLOR_TOKENS.highlightTeal : COLOR_TOKENS.subtleRed,
              boxShadow: `0 0 12px ${isEnhanced ? COLOR_TOKENS.highlightTeal : COLOR_TOKENS.subtleRed}`,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: isEnhanced ? COLOR_TOKENS.highlightTeal : COLOR_TOKENS.subtleRed,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily: 'system-ui, -apple-system, "Inter", sans-serif',
            }}
          >
            {isEnhanced ? "🟢 AFTER ENHANCEMENT: STUDIO MASTERED & ROUTED" : "🔴 BEFORE ENHANCEMENT: RAW UNOPTIMIZED"}
          </span>
        </div>
      </div>

      {/* PART 1: BEFORE ENHANCEMENT (Frames 0 - 435 | 0:00 - 0:14.5s) */}
      {!isEnhanced && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", zIndex: 10 }}>
          <div style={{ marginBottom: 32 }}>
            <MinimalText
              headline="Same usage. Different bill."
              subtext="Your AI bill doesn't reflect your usage. It reflects your defaults."
              highlightWord="Different"
              highlightColor={COLOR_TOKENS.subtleRed}
              delay={5}
            />
          </div>

          <MinimalCard width={800} delay={12}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLOR_TOKENS.textNavy }}>
                Default Static Route (Monolith Only)
              </div>
              <div style={{ fontSize: 13, color: COLOR_TOKENS.subtleRed, fontWeight: 700 }}>
                High Latency · 0% Outcome Scoring
              </div>
            </div>

            {/* Static high spend line */}
            <div style={{ height: 10, borderRadius: 999, background: "rgba(10,31,68,0.06)", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: COLOR_TOKENS.textNavy }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13, color: COLOR_TOKENS.textSecondary }}>
              <span>Monthly AI Spend: <strong>$48,500/mo</strong></span>
              <span>P95 Latency: <strong style={{ color: COLOR_TOKENS.subtleRed }}>1,480ms</strong></span>
            </div>
          </MinimalCard>
        </div>
      )}

      {/* PART 2: AFTER ENHANCEMENT (Frames 435 - 900 | 14.5s - 30.0s) */}
      {isEnhanced && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", zIndex: 10 }}>
          <div style={{ marginBottom: 32 }}>
            <MinimalText
              headline="40%+ lower spend. Same quality."
              subtext="Outcome Router scores every request in real time. Route for outcomes at outcomerouter.ai"
              highlightWord="40%+"
              highlightColor={COLOR_TOKENS.highlightTeal}
              delay={0}
              fontSize={74}
            />
          </div>

          <MinimalCard width={800} delay={0} borderColor={COLOR_TOKENS.highlightTeal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLOR_TOKENS.textNavy }}>
                Outcome Router (Bayesian Thompson Optimization)
              </div>
              <div style={{ fontSize: 13, color: COLOR_TOKENS.highlightTeal, fontWeight: 800 }}>
                ✓ 42.8% COST AVOIDANCE
              </div>
            </div>

            {/* Optimized spend line with pouring teal */}
            <div style={{ height: 12, borderRadius: 999, background: "rgba(10,31,68,0.06)", overflow: "hidden" }}>
              <div style={{ width: "57%", height: "100%", background: COLOR_TOKENS.highlightTeal }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13, color: COLOR_TOKENS.textSecondary }}>
              <span>Optimized Spend: <strong style={{ color: COLOR_TOKENS.highlightTeal }}>$27,800/mo</strong></span>
              <span>P95 Latency: <strong style={{ color: COLOR_TOKENS.primaryBlue }}>48ms - 190ms</strong></span>
            </div>
          </MinimalCard>
        </div>
      )}

      {/* Real-Time Waveform Visualizer & CTA Bar at Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          zIndex: 20,
        }}
      >
        <AudioWaveformVisualizer isEnhanced={isEnhanced} />

        {isEnhanced && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: COLOR_TOKENS.primaryBlue,
              letterSpacing: "-0.02em",
              fontFamily: 'system-ui, -apple-system, "Inter", sans-serif',
            }}
          >
            outcomerouter.ai — Route for outcomes.
          </div>
        )}
      </div>
    </div>
  );
};
