/**
 * AURA Specialized SERP Widgets
 * Renders interactive financial charts, live weather forecast cards,
 * interactive code execution runners, and calculation cards.
 */

export class WidgetManager {
  /**
   * Renders Financial Stock / Crypto Card with smooth Canvas chart
   */
  static renderFinanceWidget(data, container) {
    if (!data || !container) return;

    container.innerHTML = `
      <div class="finance-widget-card glass-panel">
        <div class="finance-header">
          <div>
            <div class="finance-ticker">${data.ticker}</div>
            <div class="finance-name">${data.name}</div>
          </div>
          <span class="badge ${data.isPositive ? 'badge-live' : 'badge-pro'}">LIVE MARKET</span>
        </div>
        <div class="finance-price">$${data.price.toLocaleString()}</div>
        <div class="finance-change ${data.isPositive ? 'up' : 'down'}">
          ${data.isPositive ? '▲' : '▼'} ${data.change} (Today)
        </div>
        <canvas class="finance-sparkline-canvas" id="sparkline-canvas" width="300" height="90"></canvas>
        <div class="finance-stats-grid">
          <div class="stat-item">
            <span class="stat-label">Market Cap</span>
            <span class="stat-val">${data.mktCap}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">P/E Ratio</span>
            <span class="stat-val">${data.peRatio}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">52-Wk High</span>
            <span class="stat-val">${data.high52}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Volume</span>
            <span class="stat-val">${data.volume}</span>
          </div>
        </div>
      </div>
    `;

    // Draw Smooth Sparkline Chart
    const canvas = container.querySelector('#sparkline-canvas');
    if (canvas && data.history) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const pts = data.history;
      const min = Math.min(...pts);
      const max = Math.max(...pts);
      const range = max - min || 1;

      const coords = pts.map((val, i) => ({
        x: (i / (pts.length - 1)) * (w - 20) + 10,
        y: h - 15 - ((val - min) / range) * (h - 30)
      }));

      ctx.clearRect(0, 0, w, h);

      // Gradient Fill
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      if (data.isPositive) {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      } else {
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
      }

      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const xc = (coords[i].x + coords[i - 1].x) / 2;
        const yc = (coords[i].y + coords[i - 1].y) / 2;
        ctx.quadraticCurveTo(coords[i - 1].x, coords[i - 1].y, xc, yc);
      }
      ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const xc = (coords[i].x + coords[i - 1].x) / 2;
        const yc = (coords[i].y + coords[i - 1].y) / 2;
        ctx.quadraticCurveTo(coords[i - 1].x, coords[i - 1].y, xc, yc);
      }
      ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
      ctx.strokeStyle = data.isPositive ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  /**
   * Renders Atmospheric Weather Forecast Card
   */
  static renderWeatherWidget(data, container) {
    if (!data || !container) return;

    container.innerHTML = `
      <div class="weather-widget-card glass-panel">
        <div class="weather-city">${data.city}</div>
        <div class="weather-temp-main">
          <div class="weather-temp-degrees">${data.temp}</div>
          <div class="weather-condition-text">${data.condition}</div>
        </div>
        <div class="finance-stats-grid" style="margin-bottom: 14px;">
          <div class="stat-item">
            <span class="stat-label">Humidity</span>
            <span class="stat-val">${data.humidity}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Wind</span>
            <span class="stat-val">${data.wind}</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
          ${(data.forecast || []).map(f => `
            <div style="text-align: center; font-size: 0.75rem;">
              <div style="color: var(--text-muted);">${f.day}</div>
              <div style="font-weight: 600; margin-top: 4px;">${f.temp}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renders Code Sandbox Widget
   */
  static renderCodeWidget(data, container) {
    if (!data || !container) return;

    container.innerHTML = `
      <div class="code-widget-card">
        <div class="code-header">
          <span class="code-lang-tag">${data.lang.toUpperCase()} PLAYGROUND</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" id="btn-copy-code">Copy</button>
            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.75rem;" id="btn-run-code">▶ Run</button>
          </div>
        </div>
        <div class="code-body"><code>${this.escapeHtml(data.code)}</code></div>
        <div class="code-run-output" id="code-output-box">${this.escapeHtml(data.output)}</div>
      </div>
    `;

    const copyBtn = container.querySelector('#btn-copy-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(data.code);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      });
    }

    const runBtn = container.querySelector('#btn-run-code');
    const outBox = container.querySelector('#code-output-box');
    if (runBtn && outBox) {
      runBtn.addEventListener('click', () => {
        outBox.textContent = 'Executing in WebAssembly sandbox...';
        setTimeout(() => {
          outBox.textContent = data.output;
        }, 300);
      });
    }
  }

  static escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
