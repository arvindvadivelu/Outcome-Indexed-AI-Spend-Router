import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { EnhancedVoiceoverFilm } from "./EnhancedVoiceoverFilm";
import { OutcomeIndexedFilm } from "./OutcomeIndexedFilm";
import { Scene01TheBurn } from "./scenes/Scene01TheBurn";
import { Scene03TheReveal } from "./scenes/Scene03TheReveal";
import { Scene04ThompsonPareto } from "./scenes/Scene04ThompsonPareto";
import { Scene05SpeculativeRace } from "./scenes/Scene05SpeculativeRace";
import { Scene06SlaEscrow } from "./scenes/Scene06SlaEscrow";
import { Scene07FinOpsDashboard } from "./scenes/Scene07FinOpsDashboard";
import { Scene08DropInCTA } from "./scenes/Scene08DropInCTA";
import { SCENE_DURATIONS } from "./design/tokens";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 🎙️ 30-SECOND BEFORE VS AFTER ENHANCED VOICEOVER FILM (900 Frames @ 30 FPS) */}
      <Composition
        id="EnhancedVoiceoverFilm"
        component={EnhancedVoiceoverFilm}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 🎬 60-SECOND COMPLETE MINIMALIST PRODUCT FILM (1800 Frames @ 30 FPS) */}
      <Composition
        id="OutcomeIndexedFilm"
        component={OutcomeIndexedFilm}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 🔍 INDIVIDUAL SCENE COMPOSITIONS */}
      <Composition
        id="Scene01-TheBurn"
        component={Scene01TheBurn}
        durationInFrames={SCENE_DURATIONS.scene01}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene04-ThompsonPareto"
        component={Scene04ThompsonPareto}
        durationInFrames={SCENE_DURATIONS.scene04}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene07-FinOpsDashboard"
        component={Scene07FinOpsDashboard}
        durationInFrames={SCENE_DURATIONS.scene07}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene08-DropInCTA"
        component={Scene08DropInCTA}
        durationInFrames={SCENE_DURATIONS.scene08}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
