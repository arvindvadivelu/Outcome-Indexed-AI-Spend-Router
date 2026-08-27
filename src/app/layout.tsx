import type { Metadata, Viewport } from "next";
import "./globals.css";

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

import { GlobalAICopilot } from "@/components/GlobalAICopilot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#FBFBFD] text-[#1D1D1F] selection:bg-[#0050FF] selection:text-white">
        {children}
        <GlobalAICopilot />
      </body>
    </html>
  );
}
