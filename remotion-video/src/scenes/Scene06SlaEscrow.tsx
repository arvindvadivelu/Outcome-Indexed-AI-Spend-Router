import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WhiteBackground } from "../components/WhiteBackground";
import { MinimalText } from "../components/MinimalText";
import { MinimalCard } from "../components/MinimalCard";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

export const Scene06SlaEscrow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // State change from normal to SLA breach refund (around frame 45)
  const isRefunded = frame >= 45;

  const refundSpring = spring({
    frame: frame - 45,
    fps,
    config: SPRING_PRESETS.confident,
  });

  const refundOpacity = interpolate(refundSpring, [0, 1], [0, 1]);
  const refundY = interpolate(refundSpring, [0, 1], [15, 0]);

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
          headline="Miss the SLA? Get refunded. Automatically."
          highlightWord="refunded."
          highlightColor={COLOR_TOKENS.highlightTeal}
          subtext="No tickets. No disputes. Automated credit adjustments right on the wire."
          delay={5}
        />
      </div>

      {/* Minimal Receipt Style Card */}
      <MinimalCard width={640} delay={15}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(10,31,68,0.06)", paddingBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLOR_TOKENS.textMuted, textTransform: "uppercase" }}>
              Request Transaction #94821
            </span>
            <span style={{ fontSize: 13, fontFamily: "monospace", color: COLOR_TOKENS.textSecondary }}>
              Target: &lt; 250ms
            </span>
          </div>

          {/* Latency metric changing from Navy to Teal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, color: COLOR_TOKENS.textSecondary }}>Measured Upstream Latency</span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: isRefunded ? COLOR_TOKENS.highlightTeal : COLOR_TOKENS.textNavy,
                transition: "color 0.2s ease",
              }}
            >
              294ms {isRefunded && "(+44ms SLA Breach)"}
            </span>
          </div>

          {/* Clean Refund Line Item appearing beneath */}
          {isRefunded && (
            <div
              style={{
                transform: `translateY(${refundY}px)`,
                opacity: refundOpacity,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 18px",
                borderRadius: 12,
                background: "rgba(0, 194, 168, 0.08)",
                border: "1px solid rgba(0, 194, 168, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLOR_TOKENS.highlightTeal }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: COLOR_TOKENS.highlightTeal }}>
                  Automated SLA Credit Issued
                </span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: COLOR_TOKENS.highlightTeal }}>
                -$0.0042 (Refunded)
              </span>
            </div>
          )}
        </div>
      </MinimalCard>
    </div>
  );
};
