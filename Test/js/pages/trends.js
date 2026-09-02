/**
 * AURA Global Trends Controller
 * Renders multi-line comparative search volume charts on HTML5 Canvas,
 * real-time breakout search velocity feeds, and regional heatmaps.
 */

import { AuraNav } from '../nav.js';

class TrendsApp {
  constructor() {
    this.nav = new AuraNav('trends');
    this.canvas = document.querySelector('#trends-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.activeTimeframe = '7d';

    this.datasets = [
      { name: "Autonomous AI Agents", color: "#00f5d4", data: [20, 24, 35, 42, 58, 72, 94, 100] },
      { name: "Quantum Superconductors", color: "#6366f1", data: [45, 48, 44, 52, 60, 68, 70, 78] },
      { name: "Nuclear Fusion Energy", color: "#f59e0b", data: [15, 18, 22, 28, 32, 45, 50, 62] }
    ];

    this.breakouts = [
      { rank: 1, title: "DeepSeek R1 Open Reasoning Models", surge: "+680% Breakout", category: "AI & Tech", volume: "1.8M searches" },
      { rank: 2, title: "Room-Temperature Solid-State Batteries", surge: "+450% Surge", category: "Clean Energy", volume: "920K searches" },
      { rank: 3, title: "SpaceX Starship Orbital Catch & Reusability", surge: "+390% Surge", category: "Space", volume: "1.4M searches" },
      { rank: 4, title: "CRISPR Deactivated Cas9 Epigenetics", surge: "+310% Surge", category: "Biotech", volume: "640K searches" },
      { rank: 5, title: "NVIDIA Blackwell B200 Datacenter Clusters", surge: "+280% Surge", category: "Hardware", volume: "2.1M searches" }
    ];

    this.activeBreakouts = [...this.breakouts];
    this.initCanvas();
    this.bindEvents();
    this.renderChart();
    this.renderBreakouts();
  }

  initCanvas() {
    const resize = () => {
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = 280;
        this.renderChart();
      }
    };
    resize();
    window.addEventListener('resize', resize);
  }

  bindEvents() {
    // Timeframe Switches
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTimeframe = btn.getAttribute('data-tf');
        this.renderChart();
        this.nav.showToast(`Updated to ${this.activeTimeframe.toUpperCase()} trend window`);
      });
    });

    // Category Filter Badges
    document.querySelectorAll('.trend-cat-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const cat = tag.getAttribute('data-cat');
        if (cat === 'all') {
          this.activeBreakouts = [...this.breakouts];
        } else {
          this.activeBreakouts = this.breakouts.filter(b => b.category.toLowerCase().includes(cat.toLowerCase()));
        }
        this.renderBreakouts();
      });
    });
  }

  renderChart() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 30; y < h - 30; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    // Draw Datasets
    this.datasets.forEach(set => {
      const pts = set.data;
      const coords = pts.map((val, i) => ({
        x: 40 + (i / (pts.length - 1)) * (w - 70),
        y: h - 35 - (val / 100) * (h - 70)
      }));

      // Line
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
        const xc = (coords[i].x + coords[i - 1].x) / 2;
        const yc = (coords[i].y + coords[i - 1].y) / 2;
        ctx.quadraticCurveTo(coords[i - 1].x, coords[i - 1].y, xc, yc);
      }
      ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
      ctx.strokeStyle = set.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = set.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Points
      coords.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = set.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    });
  }

  renderBreakouts() {
    const container = document.querySelector('#trends-breakouts-list');
    if (!container) return;

    container.innerHTML = this.activeBreakouts.map(item => `
      <div class="trend-card-item">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">#${item.rank} IN ${item.category.toUpperCase()}</span>
          <span class="trend-surge-badge">${item.surge}</span>
        </div>
        <h3 style="font-size: 1.1rem; color: #ffffff; margin: 4px 0;">${item.title}</h3>
        <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
          <span>Search Volume</span>
          <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${item.volume}</strong>
        </div>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.Trends = new TrendsApp();
});
