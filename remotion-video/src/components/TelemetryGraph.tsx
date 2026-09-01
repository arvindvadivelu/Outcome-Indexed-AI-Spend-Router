import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TOKENS, SPRING_PRESETS } from "../design/tokens";

interface TelemetryGraphProps {
  delay?: number;
  width?: number;
  height?: number;
}

export const TelemetryGraph: React.FC<TelemetryGraphProps> = ({
  delay = 0,
  width = 650,
  height = 240,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drawSpring = spring({
    frame: frame - delay,
    fps,
    config: SPRING_PRESETS.gentle,
  });

  const pathProgress = interpolate(drawSpring, [0, 1], [0, 1]);

  // Points representing baseline spend vs outcome routed spend
  const points = [
    { x: 30, y: 190 },
    { x: 130, y: 175 },
    { x: 230, y: 150 },
    { x: 330, y: 110 },
    { x: 430, y: 75 },
    { x: 530, y: 45 },
    { x: 610, y: 35 },
  ];

  const svgPath = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_TOKENS.electricCyan} stopOpacity="0.35" />
            <stop offset="100%" stopColor={COLOR_TOKENS.electricCyan} stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLOR_TOKENS.cobaltBlue} />
            <stop offset="100%" stopColor={COLOR_TOKENS.electricCyan} />
          </linearGradient>
        </defs>

        {/* Horizontal Baseline Grids */}
        <line x1="20" y1="50" x2={width - 20} y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <line x1="20" y1="120" x2={width - 20} y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <line x1="20" y1="190" x2={width - 20} y2="190" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

        {/* Animated Area Fill */}
        <path
          d={`${svgPath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`}
          fill="url(#spendGrad)"
          opacity={pathProgress}
        />

        {/* Animated Line Stroke */}
        <path
          d={svgPath}
          fill="none"
          stroke="url(#strokeGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={1000}
          strokeDashoffset={1000 * (1 - pathProgress)}
        />

        {/* Live Data Markers */}
        {points.map((p, i) => {
          const ptSpring = spring({
            frame: frame - (delay + i * 5),
            fps,
            config: SPRING_PRESETS.snappy,
          });
          const scale = interpolate(ptSpring, [0, 1], [0, 1]);

          return (
            <g key={i} transform={`translate(${p.x}, ${p.y}) scale(${scale})`}>
              <circle r="6" fill={COLOR_TOKENS.bgDark} stroke={COLOR_TOKENS.electricCyan} strokeWidth="3" />
              <circle r="12" fill="none" stroke={COLOR_TOKENS.electricCyan} strokeWidth="1" opacity="0.4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
