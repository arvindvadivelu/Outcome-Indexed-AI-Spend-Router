import React from "react";
import { Sequence, useCurrentFrame, interpolate } from "remotion";
import { Scene01TheBurn } from "./scenes/Scene01TheBurn";
import { Scene02TheBottleneck } from "./scenes/Scene02TheBottleneck";
import { Scene03TheReveal } from "./scenes/Scene03TheReveal";
import { Scene04ThompsonPareto } from "./scenes/Scene04ThompsonPareto";
import { Scene05SpeculativeRace } from "./scenes/Scene05SpeculativeRace";
import { Scene06SlaEscrow } from "./scenes/Scene06SlaEscrow";
import { Scene07FinOpsDashboard } from "./scenes/Scene07FinOpsDashboard";
import { Scene08DropInCTA } from "./scenes/Scene08DropInCTA";
import { SCENE_DURATIONS } from "./design/tokens";

export const OutcomeIndexedFilm: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle clean fade in and fade out
  const globalFadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const globalFadeOut = interpolate(frame, [1785, 1800], [1, 0], { extrapolateLeft: "clamp" });
  const globalOpacity = Math.min(globalFadeIn, globalFadeOut);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        opacity: globalOpacity,
      }}
    >
      {/* SCENE 01 — The Quiet Problem (0:00–0:06 | Frames 0–180) */}
      <Sequence from={0} durationInFrames={SCENE_DURATIONS.scene01}>
        <Scene01TheBurn />
      </Sequence>

      {/* SCENE 02 — The Default Problem (0:06–0:13 | Frames 180–390) */}
      <Sequence from={180} durationInFrames={SCENE_DURATIONS.scene02}>
        <Scene02TheBottleneck />
      </Sequence>

      {/* SCENE 03 — Introducing the Router (0:13–0:20 | Frames 390–600) */}
      <Sequence from={390} durationInFrames={SCENE_DURATIONS.scene03}>
        <Scene03TheReveal />
      </Sequence>

      {/* SCENE 04 — Real-Time Scoring (0:20–0:28 | Frames 600–840) */}
      <Sequence from={600} durationInFrames={SCENE_DURATIONS.scene04}>
        <Scene04ThompsonPareto />
      </Sequence>

      {/* SCENE 05 — Dual-Dispatch Race (0:28–0:35 | Frames 840–1050) */}
      <Sequence from={840} durationInFrames={SCENE_DURATIONS.scene05}>
        <Scene05SpeculativeRace />
      </Sequence>

      {/* SCENE 06 — Automatic Refunds (0:35–0:42 | Frames 1050–1260) */}
      <Sequence from={1050} durationInFrames={SCENE_DURATIONS.scene06}>
        <Scene06SlaEscrow />
      </Sequence>

      {/* SCENE 07 — The Payoff (0:42–0:49 | Frames 1260–1470) */}
      <Sequence from={1260} durationInFrames={SCENE_DURATIONS.scene07}>
        <Scene07FinOpsDashboard />
      </Sequence>

      {/* SCENE 08 — Zero-Code CTA (0:49–0:58 | Frames 1470–1800) */}
      <Sequence from={1470} durationInFrames={SCENE_DURATIONS.scene08}>
        <Scene08DropInCTA />
      </Sequence>
    </div>
  );
};
