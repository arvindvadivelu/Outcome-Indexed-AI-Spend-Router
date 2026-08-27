# Outcome Router Node.js / TypeScript SDK

Cut your AI API token spend by 40% while maximizing business outcomes.

## 5-Line Quickstart

```typescript
import { OutcomeRouterClient } from "outcome-router";

const router = new OutcomeRouterClient({ apiKey: "oir_live_your_key" });

// 1. Call AI with outcome-optimized routing
const response = await router.chat({
  messages: [{ role: "user", content: "Draft follow-up email for demo lead" }],
  routing_preferences: {
    strategy: "outcome_optimized",
    target_metric: "demo_booked"
  }
});

console.log("Model:", response._routerMetadata.modelUsed);
console.log("Dollars Saved:", response._routerMetadata.savedUsd);

// 2. Report conversion feedback downstream
await router.recordOutcome({
  requestId: response._routerMetadata.requestId!,
  outcomeSuccess: true,
  metricName: "demo_booked",
  revenueImpactUsd: 450
});
```
