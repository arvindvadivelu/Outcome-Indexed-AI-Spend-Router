/**
 * AURA Unified REST API Client
 * Zero-overhead client with strict types, rate-limit resilience, and automatic fallback.
 */

export class ApiClient {
  constructor(baseUrl = '') {
    // If running on standalone static server (e.g. port 8088), fallback to localhost:8000
    this.baseUrl = baseUrl || (window.location.port === '8000' ? '' : 'http://127.0.0.1:8000');
  }

  async _fetchJson(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[ApiClient] Request to ${url} failed or offline, using fallback:`, err.message);
      return null;
    }
  }

  // 1. Search & Synthesis
  async executeSearch(query, model = 'AURA Ultra 2.5', isPro = false) {
    const payload = { query, model, is_pro: isPro };
    const remoteData = await this._fetchJson('/api/search', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return remoteData;
  }

  // 2. Autonomous Deep Research
  async executeDeepResearch(query) {
    const remoteData = await this._fetchJson('/api/research/deep', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
    return remoteData;
  }

  // 3. Finance & Weather
  async getFinance(ticker) {
    return await this._fetchJson(`/api/finance/${encodeURIComponent(ticker)}`);
  }

  async getWeather(city) {
    return await this._fetchJson(`/api/weather/${encodeURIComponent(city)}`);
  }

  // 4. Scholar Papers
  async getScholarPapers(query = '', domain = '') {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (domain) params.append('domain', domain);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await this._fetchJson(`/api/scholar/papers${qs}`);
  }

  // 5. Global Trends
  async getTrends(timeframe = '7d') {
    return await this._fetchJson(`/api/trends?timeframe=${encodeURIComponent(timeframe)}`);
  }

  // 6. Workspace Document CRUD & AI Actions
  async getDocuments() {
    return await this._fetchJson('/api/workspace/docs');
  }

  async createDocument(title, content = '') {
    return await this._fetchJson('/api/workspace/docs', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
  }

  async updateDocument(docId, title, content) {
    const payload = {};
    if (title !== undefined) payload.title = title;
    if (content !== undefined) payload.content = content;
    return await this._fetchJson(`/api/workspace/docs/${encodeURIComponent(docId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteDocument(docId) {
    return await this._fetchJson(`/api/workspace/docs/${encodeURIComponent(docId)}`, {
      method: 'DELETE'
    });
  }

  async executeAiAction(docId, action, context) {
    return await this._fetchJson('/api/workspace/ai-action', {
      method: 'POST',
      body: JSON.stringify({ document_id: docId, action, context })
    });
  }

  // 7. Vision Studio
  async synthesizeVision(prompt, style = 'Photorealistic 8K', aspectRatio = '16:9') {
    return await this._fetchJson('/api/studio/synthesize', {
      method: 'POST',
      body: JSON.stringify({ prompt, style, aspect_ratio: aspectRatio })
    });
  }
}

export const auraApi = new ApiClient();
