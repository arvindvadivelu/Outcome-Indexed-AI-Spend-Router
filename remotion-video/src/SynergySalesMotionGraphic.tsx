import React from "react";
import {
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SynergySalesMotionGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 🎥 Smooth Cinematic Push-in
  const cameraScale = interpolate(frame, [0, 450], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });
  const cameraTranslateY = interpolate(frame, [0, 450], [0, -15], {
    extrapolateRight: "clamp",
  });

  // 💡 Atmospheric Studio Breathing Pulse
  const ambientGlow = interpolate(
    Math.sin((frame / 45) * Math.PI),
    [-1, 1],
    [0.8, 1.2]
  );
  const laptopFlicker = interpolate(
    Math.sin((frame / 14) * Math.PI) + Math.cos((frame / 9) * Math.PI),
    [-2, 2],
    [0.85, 1.25]
  );

  // ✨ Kinetic Typography Springs
  // 1. "Sotuv"
  const sotuvSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const sotuvOpacity = interpolate(sotuvSpring, [0, 1], [0, 1]);
  const sotuvY = interpolate(sotuvSpring, [0, 1], [-70, 0]);

  // 2. "menejeri"
  const menejeriSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.8 },
  });
  const menejeriOpacity = interpolate(menejeriSpring, [0, 1], [0, 1]);
  const menejeriX = interpolate(menejeriSpring, [0, 1], [-50, 0]);

  // 3. "kerak"
  const kerakSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 130, mass: 0.7 },
  });
  const kerakOpacity = interpolate(kerakSpring, [0, 1], [0, 1]);
  const kerakScale = interpolate(kerakSpring, [0, 1], [0.75, 1]);

  // Dynamic floating typography
  const textFloat = Math.sin((frame / 30) * Math.PI) * 4;

  // 🌟 Periodic Specular Shimmer Sweep
  const shimmerCycle = frame % 110;
  const shimmerProgress = interpolate(shimmerCycle, [20, 65], [-120, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 🏢 "SYNERGY" Logo Animation
  const synergySpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const synergyOpacity = interpolate(synergySpring, [0, 1], [0, 1]);
  const synergyY = interpolate(synergySpring, [0, 1], [40, 0]);

  // ⭐ Sparkle Stars Dynamics
  const starRotation = (frame * 1.8) % 360;
  const starPulse = interpolate(
    Math.sin((frame / 14) * Math.PI),
    [-1, 1],
    [0.9, 1.35]
  );

  // 💰 "Oylik maosh / 3mln +Kpi" Animation
  const salarySpring = spring({
    frame: frame - 36,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const salaryOpacity = interpolate(salarySpring, [0, 1], [0, 1]);
  const salaryScale = interpolate(salarySpring, [0, 1], [0.8, 1]);

  // Count up: 0 -> 3.0
  const counterVal = interpolate(frame, [36, 85], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 📊 Holographic HUD Left-Rail (Frames 50 - 450)
  const hudSpring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const hudOpacity = interpolate(hudSpring, [0, 1], [0, 0.95]);

  // 🚀 Benefits Sequence (Frames 140 - 330)
  const perksActive = frame >= 140 && frame <= 340;
  const perksProgress = interpolate(frame, [140, 160, 320, 340], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 🎯 Final CTA (Frames 330 - 450)
  const ctaActive = frame >= 330;
  const ctaSpring = spring({
    frame: frame - 330,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.88, 1]);
  const ctaPulse = interpolate(
    Math.sin((frame / 10) * Math.PI),
    [-1, 1],
    [1.0, 1.05]
  );

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#0d041c",
        fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* 🎵 SYNCHRONIZED MASTER SOUNDTRACK & UZBEK NEURAL VOICEOVER */}
      <Audio src={staticFile("synergy_ad_audio.wav")} />

      {/* 🖼️ BACKGROUND POSTER PLATE WITH HIGH-END VIOLET AMBIENCE */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraScale}) translateY(${cameraTranslateY}px)`,
          transformOrigin: "center center",
          zIndex: 1,
        }}
      >
        <Img
          src={staticFile("synergy_bg.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "contrast(1.08) saturate(1.1)",
          }}
        />

        {/* Dynamic Volumetric Purple Aura */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "48%",
            transform: "translate(-50%, -50%)",
            width: 750,
            height: 750,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(88, 28, 135, 0.22) 50%, transparent 75%)",
            filter: "blur(95px)",
            opacity: ambientGlow,
            pointerEvents: "none",
          }}
        />

        {/* Laptop Screen Reflection Glow */}
        <div
          style={{
            position: "absolute",
            top: "57%",
            left: "25%",
            width: 340,
            height: 250,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(147, 51, 234, 0.3) 45%, transparent 70%)",
            filter: "blur(40px)",
            opacity: laptopFlicker,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* 🔮 CYBER LIGHT PARTICLES */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        {[...Array(20)].map((_, i) => {
          const particleY = ((frame * (1.2 + (i % 3) * 0.4) + i * 95) % 1920);
          const particleX = (i * 54 + Math.sin(frame / 22 + i) * 28) % 1080;
          const pSize = 3 + (i % 3) * 2;
          const pOpacity =
            0.2 +
            0.6 *
              Math.sin(((frame + i * 18) / 28) * Math.PI) *
              (1 - particleY / 1920);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: particleX,
                bottom: particleY,
                width: pSize,
                height: pSize,
                borderRadius: "50%",
                backgroundColor: i % 2 === 0 ? "#c084fc" : "#38bdf8",
                boxShadow: `0 0 ${pSize * 3}px ${i % 2 === 0 ? "#c084fc" : "#7dd3fc"}`,
                opacity: Math.max(0, pOpacity),
              }}
            />
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 🏷️ TOP STATUS BADGE: "FAOL BO'SH ISH O'RNI" */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 80,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: sotuvOpacity,
          transform: `translateY(${sotuvY * 0.4}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow: "0 0 12px #22c55e",
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#f8fafc",
            }}
          >
            FAOL BO'SH ISH O'RNI
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🌟 HERO TITLE: "Sotuv menejeri kerak" */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 165,
          left: 80,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          transform: `translateY(${textFloat}px)`,
        }}
      >
        {/* LINE 1: "Sotuv" */}
        <div
          style={{
            position: "relative",
            opacity: sotuvOpacity,
            transform: `translateY(${sotuvY}px)`,
            overflow: "hidden",
            display: "inline-block",
          }}
        >
          <span
            style={{
              fontSize: 136,
              fontWeight: 900,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              textShadow:
                "0 20px 40px rgba(0,0,0,0.7), 0 0 35px rgba(168, 85, 247, 0.4)",
            }}
          >
            Sotuv
          </span>
          {/* Shimmer light sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${shimmerProgress}%`,
              width: "45%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              transform: "skewX(-25deg)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* LINE 2: "menejeri" */}
        <div
          style={{
            position: "relative",
            opacity: menejeriOpacity,
            transform: `translateX(${menejeriX}px)`,
            overflow: "hidden",
            display: "inline-block",
            marginTop: -6,
          }}
        >
          <span
            style={{
              fontSize: 136,
              fontWeight: 900,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              textShadow:
                "0 20px 40px rgba(0,0,0,0.7), 0 0 35px rgba(168, 85, 247, 0.4)",
            }}
          >
            menejeri
          </span>
        </div>

        {/* LINE 3: "kerak" */}
        <div
          style={{
            position: "relative",
            opacity: kerakOpacity,
            transform: `scale(${kerakScale})`,
            transformOrigin: "left center",
            marginTop: -6,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            style={{
              fontSize: 136,
              fontWeight: 900,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              textShadow:
                "0 20px 40px rgba(0,0,0,0.7), 0 0 45px rgba(192, 132, 252, 0.55)",
            }}
          >
            kerak
          </span>

          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              backgroundColor: "#c084fc",
              boxShadow: "0 0 25px #c084fc, 0 0 50px #9333ea",
            }}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 💼 LEFT-COLUMN INTERACTIVE HUD WIDGETS (Above & Left of Laptop) */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 610,
          left: 80,
          width: 480,
          zIndex: 8,
          opacity: hudOpacity,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Metric Card 1: Sales Target HUD */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 18,
            background: "rgba(18, 10, 38, 0.8)",
            border: "1px solid rgba(168, 85, 247, 0.35)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.5)",
            transform: `translateY(${Math.sin(frame / 25) * 3}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🎯</span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                Oylik Sotuv Rejasi
              </span>
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#4ade80",
                backgroundColor: "rgba(74, 222, 128, 0.18)",
                padding: "3px 10px",
                borderRadius: 6,
              }}
            >
              +142% BAJARILDI
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: 8,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, interpolate(frame, [50, 105], [0, 92]))}%`,
                background: "linear-gradient(90deg, #9333ea, #38bdf8)",
                borderRadius: 4,
                boxShadow: "0 0 12px #38bdf8",
              }}
            />
          </div>
        </div>

        {/* Metric Card 2: Live Client Call / Audio Equalizer */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 18,
            background: "rgba(18, 10, 38, 0.8)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transform: `translateY(${Math.cos(frame / 22) * 3}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                boxShadow: "0 0 10px #ef4444",
              }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#cbd5e1",
              }}
            >
              Mijoz bilan muzokara...
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {[...Array(9)].map((_, i) => {
              const h = interpolate(
                Math.sin((frame / 4.5 + i * 1.3) * Math.PI),
                [-1, 1],
                [4, 24]
              );
              return (
                <div
                  key={i}
                  style={{
                    width: 3.5,
                    height: h,
                    borderRadius: 2,
                    backgroundColor: "#38bdf8",
                    boxShadow: "0 0 8px rgba(56, 189, 248, 0.9)",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Metric Card 3: Deal Revenue Badge */}
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 16,
            background: "rgba(18, 10, 38, 0.8)",
            border: "1px solid rgba(192, 132, 252, 0.3)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>
            O'rtacha Chek:
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#38bdf8",
              textShadow: "0 0 10px rgba(56, 189, 248, 0.5)",
            }}
          >
            $15,000+ B2B Bitim
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🚀 MIDDLE ACT: LEFT-SLIDING VALUE PROPOSITIONS (Frames 140 - 330) */}
      {/* ============================================================ */}
      {perksActive && (
        <div
          style={{
            position: "absolute",
            top: 860,
            left: 80,
            width: 480,
            zIndex: 15,
            opacity: perksProgress,
            transform: `scale(${interpolate(perksProgress, [0, 1], [0.94, 1])})`,
          }}
        >
          <div
            style={{
              padding: "20px 22px",
              borderRadius: 20,
              backgroundColor: "rgba(15, 7, 32, 0.92)",
              border: "1.5px solid rgba(192, 132, 252, 0.4)",
              backdropFilter: "blur(24px)",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(147, 51, 234, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#c084fc",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>⚡</span> BIZ TAKLIF QILAMIZ:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "📄", title: "Rasmiy ish o'rni", sub: "Mehnat kodeksi asosida" },
                { icon: "📈", title: "Cheksiz KPI bonus", sub: "Cheklovsiz yuqori foizlar" },
                { icon: "🏢", title: "Zamonaviy ofis", sub: "Shinam va qulay muhit" },
                { icon: "🎓", title: "Kuchli mentorlik", sub: "Professional treninglar" },
              ].map((perk, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{perk.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
                      {perk.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {perk.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🎯 FINAL ACT: CALL TO ACTION (Frames 330 - 450) */}
      {/* ============================================================ */}
      {ctaActive && (
        <div
          style={{
            position: "absolute",
            top: 860,
            left: 80,
            width: 480,
            zIndex: 20,
            opacity: ctaOpacity,
            transform: `scale(${ctaScale * ctaPulse})`,
          }}
        >
          <div
            style={{
              padding: "24px 26px",
              borderRadius: 22,
              background:
                "linear-gradient(135deg, rgba(88, 28, 135, 0.96), rgba(15, 7, 32, 0.96))",
              border: "2px solid rgba(192, 132, 252, 0.55)",
              backdropFilter: "blur(24px)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.85), 0 0 50px rgba(168, 85, 247, 0.45)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              🚀 JAMOAMIZGA QO'SHILING!
            </div>
            <div
              style={{
                fontSize: 15,
                color: "#e2e8f0",
                marginBottom: 16,
              }}
            >
              Rezyumeni yuboring va darhol suhbatdan o'ting
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "12px 20px",
                  borderRadius: 12,
                  backgroundColor: "#38bdf8",
                  color: "#0f172a",
                  fontSize: 16,
                  fontWeight: 800,
                  boxShadow: "0 0 20px rgba(56, 189, 248, 0.6)",
                }}
              >
                <span>✈️</span> Telegram: @synergy_hr
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                📞 +998 71 200-00-00
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 💎 BOTTOM-LEFT: "SYNERGY" BRAND LOGO & SPARKLE STARS */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 80,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: synergyOpacity,
          transform: `translateY(${synergyY}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: "0.08em",
              color: "#FFFFFF",
              textTransform: "uppercase",
              textShadow: "0 10px 30px rgba(0,0,0,0.8)",
            }}
          >
            SYNERGY
          </span>

          {/* DUAL 4-POINT SPARKLE STARS */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              position: "relative",
              width: 44,
              height: 44,
            }}
          >
            {/* Primary Star */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="#FFFFFF"
              style={{
                filter: "drop-shadow(0 0 10px rgba(255,255,255,0.95))",
                transform: `scale(${starPulse}) rotate(${starRotation * 0.4}deg)`,
                transformOrigin: "center center",
              }}
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>

            {/* Secondary Star */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="#c084fc"
              style={{
                position: "absolute",
                top: -4,
                right: -8,
                filter: "drop-shadow(0 0 8px #c084fc)",
                transform: `scale(${starPulse * 1.1}) rotate(${-starRotation * 0.6}deg)`,
                transformOrigin: "center center",
              }}
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 💰 BOTTOM-RIGHT: "Oylik maosh / 3mln +Kpi" WIDGET */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          right: 80,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          opacity: salaryOpacity,
          transform: `scale(${salaryScale})`,
          transformOrigin: "bottom right",
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "#e2e8f0",
            letterSpacing: "-0.01em",
            marginBottom: 2,
            textShadow: "0 4px 15px rgba(0,0,0,0.8)",
          }}
        >
          Oylik maosh
        </span>

        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textShadow:
                "0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(168, 85, 247, 0.4)",
            }}
          >
            {counterVal >= 2.9 ? "3mln" : `${counterVal.toFixed(1)}mln`}
          </span>

          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#38bdf8",
              letterSpacing: "-0.02em",
              marginLeft: 8,
              textShadow: "0 0 20px rgba(56, 189, 248, 0.6)",
            }}
          >
            +Kpi
          </span>
        </div>
      </div>
    </div>
  );
};
