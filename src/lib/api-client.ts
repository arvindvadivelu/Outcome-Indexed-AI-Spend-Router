// ==============================================================================
// 🌐 Live FastAPI Backend Full-Stack Client Bridge
// Communicates with http://127.0.0.1:8000/api/v1 with graceful resilience.
// ==============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const apiClient = {
  // 1. Live Chat Completion Gateway
  async chatCompletion(payload: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    routing_preferences?: {
      strategy?: string;
      target_metric?: string;
      max_latency_ms?: number;
      speculative_mode?: boolean;
    };
  }) {
    try {
      const res = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend gateway offline, falling back to simulated engine", e);
    }
    return null;
  },

  // 2. Pre-warming intent predictor
  async predictPrewarm(text: string, sessionId?: string) {
    try {
      const res = await fetch(`${API_BASE}/prewarm/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, session_id: sessionId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Prewarm service offline", e);
    }
    return null;
  },

  // 3. Natural Language Rule Synthesizer
  async synthesizeRule(prompt: string) {
    try {
      const res = await fetch(`${API_BASE}/synthesize-rule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Synthesizer offline", e);
    }
    return null;
  },

  // 4. Live Webhook Dispatcher
  async dispatchTestWebhook(endpointUrl: string, secretKey: string, event: string) {
    try {
      const res = await fetch(`${API_BASE}/webhooks/test-dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint_url: endpointUrl, secret_key: secretKey, event })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Webhook dispatcher offline", e);
    }
    return null;
  },

  // 5. Token Waste Anomaly Scanner
  async auditTokenWaste() {
    try {
      const res = await fetch(`${API_BASE}/audit/token-waste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Token waste scanner offline", e);
    }
    return null;
  },

  // 6. API Keys CRUD
  async createApiKey(name: string, environment: string, rateLimit: number) {
    try {
      const res = await fetch(`${API_BASE}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, environment, rate_limit: rateLimit })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Key creation offline", e);
    }
    return null;
  },

  async deleteApiKey(keyId: string) {
    try {
      const res = await fetch(`${API_BASE}/keys/${keyId}`, {
        method: "DELETE"
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Key deletion offline", e);
    }
    return null;
  },

  // 7. Billing Forecast
  async forecastBill(currentSpendUSD: number, monthlyBudgetUSD: number) {
    try {
      const res = await fetch(`${API_BASE}/billing/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_spend_usd: currentSpendUSD, monthly_budget_usd: monthlyBudgetUSD })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Forecaster offline", e);
    }
    return null;
  },

  // 8. Contact Form Inquiry
  async sendContactInquiry(data: { name: string; email: string; company: string; spend: string; message: string }) {
    try {
      const res = await fetch(`${API_BASE}/contact/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Contact endpoint offline", e);
    }
    return null;
  }
};
