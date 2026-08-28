import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GlobalAICopilot } from "@/components/GlobalAICopilot";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBFBFD",
};

export const metadata: Metadata = {
  title: "Outcome-Indexed AI Spend Router | Cut AI Spend by 40%",
  description:
    "Enterprise AI model gateway that routes prompts to the cheapest LLM achieving your target business outcomes (conversions, satisfaction, code merge rates).",
  keywords: [
    "AI router",
    "LLM spend optimization",
    "token cost reduction",
    "outcome-indexed",
    "model gateway",
    "FinOps for AI",
    "Claude 3.5 Sonnet",
    "DeepSeek",
    "OpenAI",
  ],
  authors: [{ name: "Outcome Router Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[#FBFBFD] text-[#1D1D1F] selection:bg-[#0050FF] selection:text-white">
        {children}
        <GlobalAICopilot />
      </body>
    </html>
  );
}
