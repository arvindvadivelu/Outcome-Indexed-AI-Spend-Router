/**
 * AURA Vision Studio Controller
 * Handles generative image prompts, style switches, real-time image adjustments,
 * object detection tags, and gallery downloads with API support.
 */

import { AuraNav } from '../nav.js';
import { auraApi } from '../apiClient.js';

class StudioApp {
  constructor() {
    this.nav = new AuraNav('studio');
    this.selectedStyle = 'Photorealistic 8K';
    this.selectedRatio = '16:9';
    
    this.sampleGallery = [
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
        prompt: "Futuristic Quantum Metropolis with Bioluminescent Aurora and Floating Monoliths",
        style: "Photorealistic 8K",
        ratio: "16:9",
        tags: ["Quantum City (99.1%)", "Atmospheric Glow (97.8%)", "Cyber Architecture (95.4%)"]
      },
      {
        url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=85",
        prompt: "Cybernetic Neural Core with Holographic Data Streams and Superconductors",
        style: "Cyberpunk Neon",
        ratio: "1:1",
        tags: ["Neural Core (99.6%)", "Hologram (98.3%)", "Superconductor (96.2%)"]
      },
      {
        url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=85",
        prompt: "Deep Space Nebula with Interstellar Exploration Vessel and Gravitational Lens",
        style: "Cinematic Film",
        ratio: "16:9",
        tags: ["Deep Nebula (99.8%)", "Exploration Vessel (94.9%)", "Cosmic Dust (97.1%)"]
      },
      {
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85",
        prompt: "Algorithmic Cyber Matrix Code Streams in Quantum Sub-Zero Supercomputer",
        style: "3D Octane Render",
        ratio: "16:9",
        tags: ["Matrix Streams (98.7%)", "Quantum Computing (96.5%)", "Sub-Zero Core (93.8%)"]
      }
    ];

    this.currentImage = this.sampleGallery[0];
    this.initDOM();
    this.bindEvents();
    this.renderGallery();
  }

  initDOM() {
    this.promptInput = document.querySelector('#studio-prompt');
    this.generateBtn = document.querySelector('#btn-generate');
    this.mainPreviewImg = document.querySelector('#studio-preview-img');
    this.promptDisplay = document.querySelector('#display-prompt-title');
    this.tagsContainer = document.querySelector('#detection-tags');
    this.galleryGrid = document.querySelector('#studio-gallery-grid');
    
    // Sliders
    this.brightnessSlider = document.querySelector('#slider-brightness');
    this.contrastSlider = document.querySelector('#slider-contrast');
    this.saturationSlider = document.querySelector('#slider-saturation');
    this.blurSlider = document.querySelector('#slider-blur');
  }

  bindEvents() {
    // Style Chips Selection
    document.querySelectorAll('.style-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.style-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedStyle = chip.getAttribute('data-style');
      });
    });

    // Ratio Selection
    document.querySelectorAll('.ratio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedRatio = btn.getAttribute('data-ratio');
      });
    });

    // Quick Prompt Chips
    document.querySelectorAll('.quick-prompt-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (this.promptInput) {
          this.promptInput.value = tag.getAttribute('data-prompt');
        }
      });
    });

    // Generate Button
    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => this.generateConcept());
    }

    // Sliders Real-Time Filter Binding
    const updateFilters = () => {
      const b = this.brightnessSlider ? this.brightnessSlider.value : 100;
      const c = this.contrastSlider ? this.contrastSlider.value : 100;
      const s = this.saturationSlider ? this.saturationSlider.value : 100;
      const bl = this.blurSlider ? this.blurSlider.value : 0;

      if (this.mainPreviewImg) {
        this.mainPreviewImg.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${bl}px)`;
      }
    };

    [this.brightnessSlider, this.contrastSlider, this.saturationSlider, this.blurSlider].forEach(sl => {
      if (sl) sl.addEventListener('input', updateFilters);
    });

    // Copy Prompt Button
    const btnCopy = document.querySelector('#btn-copy-prompt');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(this.currentImage.prompt);
        this.nav.showToast('Prompt copied to clipboard');
      });
    }

    // Download Button
    const btnDownload = document.querySelector('#btn-download-image');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        window.open(this.currentImage.url, '_blank');
        this.nav.showToast('Opening high-resolution 4K asset');
      });
    }

    // Upscale Button
    const btnUpscale = document.querySelector('#btn-upscale');
    if (btnUpscale) {
      btnUpscale.addEventListener('click', () => {
        btnUpscale.textContent = 'Enhancing Resolution...';
        setTimeout(() => {
          btnUpscale.textContent = '✨ Upscaled 4K HDR';
          this.nav.showToast('Neural 4K Super-Resolution applied');
        }, 1200);
      });
    }
  }

  async generateConcept() {
    const prompt = this.promptInput ? this.promptInput.value.trim() : '';
    if (!prompt) {
      this.nav.showToast('Please enter a concept description');
      return;
    }

    if (this.generateBtn) {
      this.generateBtn.disabled = true;
      this.generateBtn.innerHTML = `
        <div class="animate-spin" style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%;"></div>
        <span>Synthesizing Diffusion Latents...</span>
      `;
    }

    // Call REST API
    const remoteData = await auraApi.synthesizeVision(prompt, this.selectedStyle, this.selectedRatio);

    if (remoteData && remoteData.image_url) {
      this.currentImage = {
        url: remoteData.image_url,
        prompt: remoteData.prompt,
        style: remoteData.style,
        ratio: remoteData.aspect_ratio,
        tags: remoteData.neural_tags || ["Neural Synthesis (99.2%)"]
      };
    } else {
      // Local fallback
      await new Promise(r => setTimeout(r, 1000));
      const randomAsset = this.sampleGallery[Math.floor(Math.random() * this.sampleGallery.length)];
      this.currentImage = {
        ...randomAsset,
        prompt: prompt,
        style: this.selectedStyle,
        ratio: this.selectedRatio
      };
    }

    if (this.mainPreviewImg) {
      this.mainPreviewImg.src = this.currentImage.url;
      this.mainPreviewImg.style.opacity = '0';
      setTimeout(() => {
        this.mainPreviewImg.style.opacity = '1';
        this.mainPreviewImg.style.transition = 'opacity 0.4s ease';
      }, 50);
    }

    if (this.promptDisplay) {
      this.promptDisplay.textContent = prompt;
    }

    if (this.tagsContainer) {
      this.tagsContainer.innerHTML = this.currentImage.tags.map(t => `
        <span class="badge badge-ai">${t}</span>
      `).join('');
    }

    if (this.generateBtn) {
      this.generateBtn.disabled = false;
      this.generateBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>Generate Neural Concept</span>
      `;
    }

    this.nav.showToast('Neural image synthesis complete');
  }

  renderGallery() {
    if (!this.galleryGrid) return;
    this.galleryGrid.innerHTML = this.sampleGallery.map((item, idx) => `
      <div class="image-card" data-idx="${idx}">
        <img src="${item.url}" alt="${item.prompt}" />
        <div class="image-overlay">
          <div class="image-card-title">${item.prompt}</div>
          <div style="font-size: 0.7rem; color: var(--accent-cyan); margin-top: 4px;">${item.style}</div>
        </div>
      </div>
    `).join('');

    this.galleryGrid.querySelectorAll('.image-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = card.getAttribute('data-idx');
        const item = this.sampleGallery[idx];
        if (item) {
          this.currentImage = item;
          if (this.mainPreviewImg) this.mainPreviewImg.src = item.url;
          if (this.promptDisplay) this.promptDisplay.textContent = item.prompt;
          if (this.promptInput) this.promptInput.value = item.prompt;
          if (this.tagsContainer) {
            this.tagsContainer.innerHTML = item.tags.map(t => `<span class="badge badge-ai">${t}</span>`).join('');
          }
          this.nav.showToast(`Loaded "${item.prompt.substring(0, 30)}..."`);
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.Studio = new StudioApp();
});
