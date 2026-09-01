import React from "react";
import { COLOR_TOKENS } from "../design/tokens";

export const WhiteBackground: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLOR_TOKENS.bgWhite,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Soft subtle ambient depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, #FFFFFF 60%, #F8FAFC 100%)",
        }}
      />
    </div>
  );
};
