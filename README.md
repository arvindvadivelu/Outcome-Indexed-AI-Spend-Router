# Outcome-Indexed AI Spend Router

> **Reduce AI API spend by 40% while maintaining or improving business outcomes (conversions, code merges, customer satisfaction).**

---

## 🚀 Overview

Unlike traditional routers (e.g. Router.com or MegaRouter) that only route to the lowest token cost, **Outcome-Indexed AI Spend Router** uses Bayesian Thompson Sampling to route every prompt to the cheapest model that achieves your **target business KPIs**.

- **Target Audience:** B2B SaaS companies, AI agencies spending $5K–$100K/month on LLM APIs.
- **Core Value Prop:** 40% average reduction in monthly AI bills with +10% improvement in conversion/resolution KPIs.
- **Dual Currency:** Native support for both **INR (₹)** and **USD ($)** pricing and Stripe billing.

---

## 🏛️ Architecture

```
User / SDK Client
      │
      ▼
Next.js 14 Web App / API Gateway
      │
      ▼
FastAPI Outcome Router Engine (Python 3.11/3.14)
      ├── Exact & Semantic Prompt Cache (Redis + pgvector)
      ├── Context Compressor (30-50% token reduction)
      ├── Thompson Sampling Bandit (Online Beta Priors)
      └── Circuit Breaker & Auto-Fallback Logic
            │
            ▼
Multi-Model Gateway (OpenAI, Anthropic, DeepSeek, Groq, Together, Fireworks, Ollama)
```

---

## 💻 5-Line SDK Quickstart

### Python Client (`pip install outcome-router`)

```python
from outcome_router import OutcomeRouterClient

router = OutcomeRouterClient(api_key="oir_live_8f39a7b92")

# 1. Route to optimal outcome model
res = router.chat(
    messages=[{"role": "user", "content": "Write cold outreach for CTO"}],
    strategy="outcome_optimized", # or 'cost_minimum', 'latency_prioritized'
    target_metric="demo_booked"
)
print("Model Picked:", res["_router_metadata"]["model_used"])
print("Dollars Saved:", res["_router_metadata"]["saved_usd"])

# 2. Record downstream conversion feedback
router.record_outcome(
    request_id=res["_router_metadata"]["request_id"],
    outcome_success=True, # e.g. lead booked a demo
    metric_name="demo_booked",
    revenue_impact_usd=500.0
)
```

### TypeScript / Node.js Client (`npm install outcome-router`)

```typescript
import { OutcomeRouterClient } from "outcome-router";

const router = new OutcomeRouterClient({ apiKey: "oir_live_8f39a7b92" });

const res = await router.chat({
  messages: [{ role: "user", content: "Review TypeScript PR for race conditions" }],
  routing_preferences: {
    strategy: "outcome_optimized",
    target_metric: "code_merged"
  }
});

console.log("Model Used:", res._routerMetadata.modelUsed);
console.log("Savings:", res._routerMetadata.savedUsd);

// Report async outcome
await router.recordOutcome({
  requestId: res._routerMetadata.requestId!,
  outcomeSuccess: true,
  metricName: "code_merged"
});
```

---

## 💰 Pricing & Plans

| Plan Tier | India (INR/mo) | International (USD/mo) | Token Quota | Models Included |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | ₹0 | $0 | 10,000 / mo | 3 Models (GPT-4o mini, DeepSeek, Groq) |
| **Starter** | ₹1,499 | $29 | 100,000 / mo | 5 Models + Caching + Outcome Loop |
| **Growth** | ₹4,999 | $99 | 500,000 / mo | 10 Models + Live A/B Benchmarks |
| **Business** | ₹14,999 | $299 | 2,000,000 / mo | Unlimited Models + Webhooks + 99.9% SLA |
| **Enterprise** | ₹50,000+ | $999+ | Unlimited | Dedicated VPC, On-Prem, SOC 2 Type II |

**Token Overage:** ₹0.10 / token (India) | $0.002 / token (International)

---

## 🛠️ Complete Page Directory (25 Total)

### Public Pages (8)
1. `/` — Homepage (Hero, ROI calculator, interactive router simulation, benchmarks)
2. `/features` — Deep-dive feature breakdown
3. `/pricing` — Dual currency INR/USD pricing matrix with overage calculator
4. `/case-studies` — Customer ROI success stories (FinFlow, DevMorph, Helios Health)
5. `/blog` — AI economics and engineering articles
6. `/docs` — API reference, SDK guide, headers documentation
7. `/about` — Team, mission, outcome vs token thesis
8. `/contact` — Sales inquiry and demo request form

### Authenticated App (10)
9. `/app/dashboard` — Executive dashboard (Net savings vs GPT-4o, win rates, live stream)
10. `/app/routing` — Visual routing policy rules builder and simulator
11. `/app/benchmarks` — Live A/B model benchmark matrix and Pareto rankings
12. `/app/analytics/tokens` — Token spend allocation by team, project, and cache layer
13. `/app/settings/api-keys` — API key generation, revocation, and rate limiting
14. `/app/billing` — Stripe subscription management, invoices, usage meter
15. `/app/team` — Team member management and RBAC permissions
16. `/app/integrations` — 1-click connectors (Slack, Notion, Datadog, Ollama, Langfuse)
17. `/app/webhooks` — Webhook endpoint subscriptions and payload tester
18. `/app/logs` — Immutable audit log viewer with request payload drawer

### Auth Pages (4)
19. `/auth/signup` — Sign up (Email/password, Google OAuth, GitHub OAuth, SSO)
20. `/auth/signin` — Sign in
21. `/auth/forgot-password` — Password recovery
22. `/auth/reset-password` — Password reset

### Legal Pages (3)
23. `/privacy` — Privacy policy with Zero-Data-Retention guarantees
24. `/terms` — Terms of service and 99.9% SLA terms
25. `/dpa` — Data Processing Agreement (GDPR compliance with SCCs)

---

## ⚡ Quickstart (Local Development)

### 1. Frontend (Next.js 14)
```bash
npm install
npm run dev
# App will run on http://localhost:3000
```

### 2. Backend (FastAPI Python)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
# API docs available at http://localhost:8000/api/v1/docs
```

### 3. Docker Compose (Full Stack)
```bash
docker-compose up --build
```

---

## 🔒 Security & Compliance
- **Zero-Data-Retention:** Customer prompts are never stored or used to train models.
- **pgvector Cosine Partitioning:** AES-256 encrypted prompt embedding cache.
- **SOC 2 Type II & GDPR Ready:** Includes full DPA agreement and deletion guarantees.
