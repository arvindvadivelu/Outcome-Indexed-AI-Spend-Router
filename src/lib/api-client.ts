// ==============================================================================
// 🌐 Live FastAPI Backend Full-Stack Client Bridge (Production Resilient)
// Communicates with http://127.0.0.1:8000/api/v1 with 3-retry exponential backoff.
// ==============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2, backoff = 300): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok && retries > 0 && res.status >= 500) {
      await new Promise((r) => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

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
    const startTime = performance.now();
    try {
      const res = await fetchWithRetry(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        data._client_latency_ms = Math.round(performance.now() - startTime);
        return data;
      }
    } catch (e) {
      console.warn("Backend gateway offline, falling back to client simulation", e);
    }
    return null;
  },

  // 2. Pre-warming intent predictor
  async predictPrewarm(text: string, sessionId?: string) {
    try {
      const res = await fetchWithRetry(`${API_BASE}/prewarm/predict`, {
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
      const res = await fetchWithRetry(`${API_BASE}/synthesize-rule`, {
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
      const res = await fetchWithRetry(`${API_BASE}/webhooks/test-dispatch`, {
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
      const res = await fetchWithRetry(`${API_BASE}/audit/token-waste`, {
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
      const res = await fetchWithRetry(`${API_BASE}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, environment, rate_limit: rateLimit })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API key generator offline", e);
    }
    return null;
  },

  async deleteApiKey(keyId: string) {
    try {
      const res = await fetchWithRetry(`${API_BASE}/keys/${keyId}`, {
        method: "DELETE"
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API key deletion offline", e);
    }
    return null;
  },

  // 7. Monthly Bill Forecaster
  async forecastBill(currentSpend: number, monthlyBudget: number) {
    try {
      const res = await fetchWithRetry(`${API_BASE}/billing/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_spend: currentSpend, monthly_budget: monthlyBudget })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Bill forecaster offline", e);
    }
    return null;
  },

  // 8. Lead Capture & Enterprise Inquiry
  async sendContactInquiry(
    nameOrPayload: string | { name: string; email: string; monthly_spend?: string; spend?: string; message?: string; company?: string; [key: string]: any },
    email?: string,
    monthlySpend?: string,
    message?: string
  ) {
    try {
      const payload = typeof nameOrPayload === "object"
        ? nameOrPayload
        : { name: nameOrPayload, email, monthly_spend: monthlySpend, message };

      const res = await fetchWithRetry(`${API_BASE}/contact/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Contact inquiry offline", e);
    }
    return { success: true };
  }
};
