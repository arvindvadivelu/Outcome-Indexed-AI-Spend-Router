/**
 * 🎨 Minimalist Apple Light Mode Design Tokens & Physics
 * Pure White + Deep Navy + Electric Blue + Desaturated Teal
 */

export const COLOR_TOKENS = {
  bgWhite: "#FFFFFF",
  bgCanvas: "#F8FAFC",
  surfaceCard: "#FFFFFF",
  borderLight: "rgba(10, 31, 68, 0.08)",
  borderActive: "#2D5FFF",
  
  // Brand & Accents
  primaryBlue: "#2D5FFF",     // Electric Blue
  textNavy: "#0A1F44",        // Deep Navy Headline
  textSecondary: "#475569",   // Refined Slate Body
  textMuted: "#94A3B8",       // Micro-copy
  
  // Highlight / Success (USED ONLY for savings/success moments)
  highlightTeal: "#00C2A8",   // Desaturated Teal
  
  // Subtle alerts
  subtleRed: "#F43F5E",
};

export const SPRING_PRESETS = {
  // Minimalist, confident Apple motion (easeOutExpo feel)
  confident: { damping: 18, mass: 0.9, stiffness: 120 },
  smooth: { damping: 16, mass: 0.8, stiffness: 100 },
  snappy: { damping: 14, mass: 0.6, stiffness: 160 },
  settle: { damping: 24, mass: 1.2, stiffness: 80 },
};

export const SCENE_DURATIONS = {
  scene01: 180, // 0:00 - 0:06 (180 frames)
  scene02: 210, // 0:06 - 0:13 (210 frames)
  scene03: 210, // 0:13 - 0:20 (210 frames)
  scene04: 240, // 0:20 - 0:28 (240 frames)
  scene05: 210, // 0:28 - 0:35 (210 frames)
  scene06: 210, // 0:35 - 0:42 (210 frames)
  scene07: 210, // 0:42 - 0:49 (210 frames)
  scene08: 330, // 0:49 - 0:58 (330 frames)
};
