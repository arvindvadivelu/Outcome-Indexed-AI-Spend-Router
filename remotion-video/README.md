# Remotion — 60-Second Premium SaaS Product Film
## Outcome-Indexed AI Spend Router

This directory contains the **Remotion motion graphics product film** for the **Outcome-Indexed AI Spend Router**.

---

### 🎥 Video Structure (60.0 Seconds | 1800 Frames @ 30 FPS)

| Scene | Timecode | Title | Key Message & Visual Concept |
|---|---|---|---|
| **01** | `00:00 - 00:07.5` | **The Capital Burn** | Uncontrolled API invoice counter ($12.4k → $68.9k/mo) showing enterprise budget hemorrhage from monolithic routing. |
| **02** | `00:07.5 - 00:15.0` | **The Monolith Bottleneck** | Slow 1,480ms P95 latency and pipeline congestion with zero outcome verification. |
| **03** | `00:15.0 - 00:23.0` | **The Paradigm Shift** | Spatial obsidian core reveal with glowing cobalt & electric cyan edge lighting. |
| **04** | `00:23.0 - 00:31.0` | **Thompson Pareto Arbitration** | Dynamic Beta priors classifying queries in <2ms (Groq Llama 3.3 @ $0.00018, DeepSeek-V3 @ $0.00042). |
| **05** | `00:31.0 - 00:39.0` | **Speculative Dual-Dispatch** | Twin streams racing in parallel; 64ms Groq win immediately cancels slower trailing Claude call on the wire. |
| **06** | `00:39.0 - 00:47.0` | **Cryptographic SLA Escrow** | SHA-256 sealed SLA contracts with automated micro-refund credits on latency breach. |
| **07** | `00:47.0 - 00:54.0` | **FinOps Telemetry Dashboard** | Telemetry curve displaying -43.4% spend avoidance with +$29,850 saved and 99.4% quality score. |
| **08** | `00:54.0 - 01:00.0` | **Zero-Code Drop-In & Hero CTA** | 1-line OpenAI SDK URL swap (`api.outcomerouter.ai/v1`) with verified live connectivity. |

---

### 🚀 Commands

```bash
# 1. Launch Remotion Studio (Interactive UI preview & timeline scrubbing)
npm run dev

# 2. Render Full 60-Second MP4
npx remotion render OutcomeIndexedFilm out/outcome_indexed_film_60s.mp4

# 3. Render Individual Scenes
npx remotion render Scene01-TheBurn out/scene01.mp4
npx remotion render Scene03-TheReveal out/scene03.mp4
npx remotion render Scene05-SpeculativeRace out/scene05.mp4
npx remotion render Scene07-FinOpsDashboard out/scene07.mp4

# 4. Render High-Res Still Frame
npx remotion still OutcomeIndexedFilm out/hero_frame.png --frame=600
```
