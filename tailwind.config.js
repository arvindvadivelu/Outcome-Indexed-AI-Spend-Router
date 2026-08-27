/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#E5E5EA",
        input: "#E5E5EA",
        ring: "#0050FF",
        background: "#FBFBFD",
        foreground: "#1D1D1F",
        primary: {
          DEFAULT: "#0050FF",
          foreground: "#FFFFFF",
          50: "#EEF4FF",
          100: "#D9E5FF",
          200: "#B3CCFF",
          300: "#80A8FF",
          400: "#3374FF",
          500: "#0050FF",
          600: "#0040CC",
          700: "#003099",
          800: "#002066",
          900: "#001033",
        },
        apple: {
          bg: "#FBFBFD",
          card: "#FFFFFF",
          subtle: "#F5F5F7",
          border: "#E5E5EA",
          borderHover: "#D2D2D7",
          text: "#1D1D1F",
          muted: "#86868B",
          blue: "#0050FF",
          blueHover: "#0043D6",
          blueSubtle: "#EEF4FF",
        },
        secondary: {
          DEFAULT: "#F5F5F7",
          foreground: "#1D1D1F",
        },
        muted: {
          DEFAULT: "#F5F5F7",
          foreground: "#86868B",
        },
        accent: {
          DEFAULT: "#EEF4FF",
          foreground: "#0050FF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1D1D1F",
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1.25rem",
        xl: "1rem",
        lg: "0.75rem",
        md: "0.5rem",
      },
      boxShadow: {
        "apple-sm": "0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        "apple-md": "0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
        "apple-lg": "0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        "apple-blue": "0 8px 24px -2px rgba(0, 80, 255, 0.25)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Plus Jakarta Sans",
          "Inter",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
