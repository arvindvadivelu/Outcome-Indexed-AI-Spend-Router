/**
 * AURA Quantum Maps & Spatial Navigator
 * Interactive HTML5 Canvas vector map, real-time autonomous vehicle simulation,
 * multi-modal route planning, and POI discovery.
 */

import { AuraNav } from '../nav.js';

class MapsApp {
  constructor() {
    this.nav = new AuraNav('maps');
    this.canvas = document.querySelector('#maps-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentMode = 'hyperloop';
    this.activeLayer = 'vector';
    this.zoom = 1;
    this.pan = { x: 0, y: 0 };
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    this.hubs = [
      { id: "hub-1", name: "SF Quantum Hub", x: 180, y: 150, type: "lab", status: "Active • 99.9% Uptime" },
      { id: "hub-2", name: "Silicon Valley AI Cluster", x: 480, y: 340, type: "cluster", status: "High Traffic Corridor" },
      { id: "hub-3", name: "Stanford Supercomputing Lab", x: 320, y: 220, type: "university", status: "Research Verified" },
      { id: "hub-4", name: "Clean Energy Fusion Grid", x: 620, y: 180, type: "energy", status: "Zero Carbon Emission" },
      { id: "hub-5", name: "Autonomous Skyport", x: 260, y: 380, type: "transit", status: "32 Drones in Transit" }
    ];

    // Vehicles simulating live traffic pulses
    this.vehicles = Array.from({ length: 18 }, (_, i) => ({
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      hubA: this.hubs[i % this.hubs.length],
      hubB: this.hubs[(i + 1) % this.hubs.length]
    }));

    this.selectedHub = this.hubs[0];
    this.initCanvas();
    this.bindEvents();
    this.startMapLoop();
  }

  initCanvas() {
    const resize = () => {
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
  }

  bindEvents() {
    // Transit Mode Selection
    document.querySelectorAll('.transit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.transit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.getAttribute('data-mode');
        this.updateRouteMetrics();
      });
    });

    // POI Filter Badges
    document.querySelectorAll('.poi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const name = chip.getAttribute('data-poi');
        const target = this.hubs.find(h => h.name.toLowerCase().includes(name.toLowerCase()));
        if (target) {
          this.selectedHub = target;
          this.pan.x = (this.canvas.width / 2) - target.x;
          this.pan.y = (this.canvas.height / 2) - target.y;
          this.updatePoiCard(target);
          this.nav.showToast(`Centered on ${target.name}`);
        }
      });
    });

    // Route Calculate Button
    const btnCalc = document.querySelector('#btn-calc-route');
    if (btnCalc) {
      btnCalc.addEventListener('click', () => {
        this.updateRouteMetrics();
        this.nav.showToast('Quantum Multi-Modal Route Computed');
      });
    }

    // Canvas Pan & Drag Interactions
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.pan.x += dx;
        this.pan.y += dy;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Canvas Pin Click
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - this.pan.x) / this.zoom;
      const my = (e.clientY - rect.top - this.pan.y) / this.zoom;

      for (const hub of this.hubs) {
        const dx = mx - hub.x;
        const dy = my - hub.y;
        if (Math.sqrt(dx * dx + dy * dy) < 24) {
          this.selectedHub = hub;
          this.updatePoiCard(hub);
          this.nav.showToast(`Selected: ${hub.name}`);
          break;
        }
      }
    });

    // Map Controls
    document.querySelector('#btn-zoom-in')?.addEventListener('click', () => this.zoom = Math.min(this.zoom + 0.2, 2.5));
    document.querySelector('#btn-zoom-out')?.addEventListener('click', () => this.zoom = Math.max(this.zoom - 0.2, 0.6));
    document.querySelector('#btn-recenter')?.addEventListener('click', () => {
      this.pan = { x: 0, y: 0 };
      this.zoom = 1;
      this.nav.showToast('Map Recentered');
    });
  }

  updateRouteMetrics() {
    const timeEl = document.querySelector('#metric-time');
    const distEl = document.querySelector('#metric-dist');
    const carbonEl = document.querySelector('#metric-carbon');

    if (this.currentMode === 'hyperloop') {
      if (timeEl) timeEl.textContent = '11 Mins';
      if (distEl) distEl.textContent = '38.4 km';
      if (carbonEl) carbonEl.textContent = '-96% CO2 (0.02 kg)';
    } else if (this.currentMode === 'ev') {
      if (timeEl) timeEl.textContent = '24 Mins';
      if (distEl) distEl.textContent = '42.1 km';
      if (carbonEl) carbonEl.textContent = '-88% CO2 (0.08 kg)';
    } else if (this.currentMode === 'drone') {
      if (timeEl) timeEl.textContent = '8 Mins';
      if (distEl) distEl.textContent = '31.2 km';
      if (carbonEl) carbonEl.textContent = '-92% CO2 (0.04 kg)';
    } else {
      if (timeEl) timeEl.textContent = '4.2 Hours';
      if (distEl) distEl.textContent = '36.8 km';
      if (carbonEl) carbonEl.textContent = '0% CO2 (Net Zero)';
    }
  }

  updatePoiCard(hub) {
    const titleEl = document.querySelector('#poi-title');
    const statusEl = document.querySelector('#poi-status');
    const coordsEl = document.querySelector('#poi-coords');

    if (titleEl) titleEl.textContent = hub.name;
    if (statusEl) statusEl.textContent = hub.status;
    if (coordsEl) coordsEl.textContent = `LAT: 37.${hub.y}3° N, LON: 122.${hub.x}8° W`;
  }

  startMapLoop() {
    const render = () => {
      this.renderMap();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  renderMap() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(this.pan.x, this.pan.y);
    ctx.scale(this.zoom, this.zoom);

    // 1. Draw Vector Grid Roads
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = -200; x < w + 400; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -200);
      ctx.lineTo(x, h + 400);
      ctx.stroke();
    }
    for (let y = -200; y < h + 400; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(w + 400, y);
      ctx.stroke();
    }

    // 2. Draw Major Arterial Highway Lines between hubs
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < this.hubs.length; i++) {
      for (let j = i + 1; j < this.hubs.length; j++) {
        ctx.beginPath();
        ctx.moveTo(this.hubs[i].x, this.hubs[i].y);
        ctx.lineTo(this.hubs[j].x, this.hubs[j].y);
        ctx.stroke();
      }
    }

    // 3. Draw Active Computed Route with Glowing Gradient
    ctx.beginPath();
    ctx.moveTo(this.hubs[0].x, this.hubs[0].y);
    ctx.lineTo(this.hubs[2].x, this.hubs[2].y);
    ctx.lineTo(this.hubs[1].x, this.hubs[1].y);
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Draw Live Traffic Particle Vehicles
    for (const v of this.vehicles) {
      v.progress = (v.progress + v.speed) % 1;
      const vx = v.hubA.x + (v.hubB.x - v.hubA.x) * v.progress;
      const vy = v.hubA.y + (v.hubB.y - v.hubA.y) * v.progress;

      ctx.beginPath();
      ctx.arc(vx, vy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 5. Draw Hub Pins & Labels
    for (const hub of this.hubs) {
      const isSelected = this.selectedHub === hub;

      // Glow ring
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, isSelected ? 22 : 14, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(6, 182, 212, 0.2)';
      ctx.fill();

      // Inner solid pin
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#a855f7' : '#06b6d4';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Text label
      ctx.font = `600 ${isSelected ? '12px' : '11px'} 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(hub.name, hub.x, hub.y + 24);
    }

    ctx.restore();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.Maps = new MapsApp();
});
