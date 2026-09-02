/**
 * AURA Application Controller
 * Master orchestrator connecting UI, search engine, interactive canvas,
 * voice audio suite, widgets, and workspace management.
 */

import { KnowledgeBase } from './engine/knowledgeBase.js';
import { SearchEngineCore } from './engine/searchCore.js';
import { DeepResearchEngine } from './features/deepResearch.js';
import { KnowledgeGraphVisualizer } from './features/knowledgeGraph.js';
import { WidgetManager } from './features/widgets.js';
import { VoiceAudioManager } from './features/voiceAudio.js';
import { WorkspaceManager } from './features/workspace.js';
import { auraApi } from './apiClient.js';

class AuraApp {
  constructor() {
    this.core = new SearchEngineCore();
    this.workspace = new WorkspaceManager();
    this.currentResult = null;
    this.currentTab = 'overview';
    this.isProMode = false;
    this.selectedModel = 'AURA Ultra 2.5';
    this.currentTheme = localStorage.getItem('aura_theme') || 'obsidian';

    this.initDOM();
    this.initVoiceAudio();
    this.initAmbientBackground();
    this.bindEvents();
    this.applyTheme(this.currentTheme);
    this.renderQuickQueries();
  }

  initDOM() {
    this.heroSection = document.querySelector('#hero-section');
    this.serpContainer = document.querySelector('#serp-container');
    this.heroSearchInput = document.querySelector('#hero-search-input');
    this.serpSearchInput = document.querySelector('#serp-search-input');
    this.heroSearchWrap = document.querySelector('#hero-search-wrap');
    this.serpHeaderSearch = document.querySelector('#serp-header-search');
    this.suggestionsDropdown = document.querySelector('#suggestions-dropdown');
    
    this.aiAnswerContainer = document.querySelector('#ai-answer-body');
    this.aiLatencyEl = document.querySelector('#ai-latency-stat');
    this.sourcesGrid = document.querySelector('#sources-grid');
    this.sidebarWidgets = document.querySelector('#sidebar-widgets');
    this.deepResearchPanel = document.querySelector('#deep-research-container');
    this.knowledgeGraphCanvas = document.querySelector('#knowledge-graph-canvas');
    this.toastContainer = document.querySelector('#toast-container');
    
    // Tab containers
    this.tabOverviewView = document.querySelector('#tab-overview-view');
    this.tabWebView = document.querySelector('#tab-web-view');
    this.tabImagesView = document.querySelector('#tab-images-view');
    this.tabNewsView = document.querySelector('#tab-news-view');
    this.tabCodeView = document.querySelector('#tab-code-view');
    this.tabAcademicView = document.querySelector('#tab-academic-view');

    // Setup Deep Research and Graph Visualizer
    this.deepEngine = new DeepResearchEngine(this.deepResearchPanel);
    if (this.knowledgeGraphCanvas) {
      this.graphVisualizer = new KnowledgeGraphVisualizer(this.knowledgeGraphCanvas, (nodeId) => {
        this.executeSearch(nodeId);
      });
    }
  }

  initVoiceAudio() {
    this.voiceAudio = new VoiceAudioManager({
      onSpeechResult: (transcript) => {
        if (this.heroSearchInput) this.heroSearchInput.value = transcript;
        if (this.serpSearchInput) this.serpSearchInput.value = transcript;
        this.executeSearch(transcript);
      }
    });
  }

  bindEvents() {
    // Form submissions
    document.querySelectorAll('.search-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        if (input && input.value.trim()) {
          this.executeSearch(input.value.trim());
        }
      });
    });

    // Autocomplete Input Listening
    if (this.heroSearchInput) {
      this.heroSearchInput.addEventListener('input', (e) => this.handleAutocomplete(e.target.value));
      this.heroSearchInput.addEventListener('focus', (e) => this.handleAutocomplete(e.target.value));
    }

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#hero-search-wrap') && this.suggestionsDropdown) {
        this.suggestionsDropdown.classList.remove('open');
      }
    });

    // Apps Launcher Modal Toggle
    const launcherBtn = document.querySelector('#btn-apps-launcher');
    const appsModal = document.querySelector('#apps-grid-modal');
    if (launcherBtn && appsModal) {
      launcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        appsModal.classList.toggle('open');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#apps-grid-modal') && !e.target.closest('#btn-apps-launcher')) {
          appsModal.classList.remove('open');
        }
      });
    }

    // Pro Mode Toggles
    document.querySelectorAll('.pro-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.isProMode = !this.isProMode;
        document.querySelectorAll('.pro-toggle-btn').forEach(b => {
          b.classList.toggle('active', this.isProMode);
        });
        this.showToast(this.isProMode ? 'Autonomous Deep Research Pro Enabled' : 'Standard Fast Search Enabled');
      });
    });

    // Voice Search Buttons
    document.querySelectorAll('.btn-voice-search').forEach(btn => {
      btn.addEventListener('click', () => {
        this.voiceAudio.startListening();
      });
    });

    // Close Voice Modal
    const voiceCloseBtn = document.querySelector('#btn-close-voice');
    if (voiceCloseBtn) {
      voiceCloseBtn.addEventListener('click', () => this.voiceAudio.stopListening());
    }

    // SERP Tabs
    document.querySelectorAll('.serp-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // TTS Read Aloud Button
    const ttsBtn = document.querySelector('#btn-tts-read');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        if (this.currentResult && this.currentResult.aiSummary) {
          this.voiceAudio.speakText(this.currentResult.aiSummary, (speaking) => {
            ttsBtn.classList.toggle('active', speaking);
            ttsBtn.innerHTML = speaking
              ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> <span>Pause</span>`
              : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg> <span>Read</span>`;
          });
        }
      });
    }

    // Follow-up Chat Submit
    const followupForm = document.querySelector('#followup-form');
    if (followupForm) {
      followupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = followupForm.querySelector('#followup-input');
        if (input && input.value.trim()) {
          const query = `${this.currentResult?.query || ''} - ${input.value.trim()}`;
          input.value = '';
          this.executeSearch(query);
        }
      });
    }

    // Export Buttons
    const btnExportMd = document.querySelector('#btn-export-md');
    if (btnExportMd) {
      btnExportMd.addEventListener('click', () => {
        this.workspace.exportToMarkdown(this.currentResult);
        this.showToast('Research dossier exported as Markdown');
      });
    }

    const btnBookmark = document.querySelector('#btn-bookmark');
    if (btnBookmark) {
      btnBookmark.addEventListener('click', () => {
        this.workspace.addBookmark(this.currentResult);
        this.showToast('Search saved to Collections');
        this.renderCollections();
      });
    }

    // Drawer Toggles
    const btnOpenCollections = document.querySelector('#btn-open-collections');
    const drawerBackdrop = document.querySelector('#drawer-backdrop');
    const btnCloseDrawer = document.querySelector('#btn-close-drawer');

    if (btnOpenCollections && drawerBackdrop) {
      btnOpenCollections.addEventListener('click', () => {
        this.renderCollections();
        drawerBackdrop.classList.add('open');
      });
    }
    if (btnCloseDrawer && drawerBackdrop) {
      btnCloseDrawer.addEventListener('click', () => drawerBackdrop.classList.remove('open'));
    }
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) drawerBackdrop.classList.remove('open');
      });
    }

    // Theme Switcher Cycle
    const themeBtn = document.querySelector('#btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const themes = ['obsidian', 'cyber', 'navy', 'light'];
        const nextIdx = (themes.indexOf(this.currentTheme) + 1) % themes.length;
        this.applyTheme(themes[nextIdx]);
      });
    }

    // Brand Logo Reset to Hero
    const brandLogo = document.querySelector('#brand-home-link');
    if (brandLogo) {
      brandLogo.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToHero();
      });
    }

    // Global Keybindings (/ to focus search, Esc to clear)
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const activeInput = this.serpContainer.classList.contains('active') ? this.serpSearchInput : this.heroSearchInput;
        if (activeInput) activeInput.focus();
      } else if (e.key === 'Escape') {
        if (this.suggestionsDropdown) this.suggestionsDropdown.classList.remove('open');
        if (drawerBackdrop) drawerBackdrop.classList.remove('open');
      }
    });
  }

  applyTheme(themeName) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('aura_theme', themeName);
    this.showToast(`Theme switched to ${themeName.toUpperCase()}`);
  }

  async executeSearch(query) {
    if (!query) return;

    if (this.suggestionsDropdown) {
      this.suggestionsDropdown.classList.remove('open');
    }

    // Switch view to SERP mode
    this.switchToSerp();
    if (this.heroSearchInput) this.heroSearchInput.value = query;
    if (this.serpSearchInput) this.serpSearchInput.value = query;

    this.workspace.saveSearchToHistory(query);

    // Show loading skeleton states
    this.renderLoadingState(query);

    // If Pro mode, run Deep Research Trace first
    if (this.isProMode) {
      this.deepResearchPanel.style.display = 'block';
      await this.deepEngine.executeResearchTrace(query);
    } else {
      this.deepResearchPanel.style.display = 'none';
    }

    // Try REST API First, with instant fallback
    let result = null;
    const remoteResponse = await auraApi.executeSearch(query, this.selectedModel, this.isProMode);
    
    if (remoteResponse && remoteResponse.ai_summary) {
      result = {
        query: remoteResponse.query,
        intent: remoteResponse.intent,
        latencyMs: remoteResponse.latency_ms,
        model: remoteResponse.model,
        isPro: remoteResponse.is_pro,
        aiSummary: remoteResponse.ai_summary,
        sources: remoteResponse.sources.map(s => ({
          title: s.title,
          domain: s.domain,
          index: s.citation_index
        })),
        widgetData: null,
        images: remoteResponse.images || [],
        news: remoteResponse.news || [],
        papers: [],
        codeSnippet: null,
        graphData: remoteResponse.graph_data,
        suggestedFollowUps: remoteResponse.suggested_follow_ups || []
      };

      // Check specialized widget data
      if (remoteResponse.intent === 'finance') {
        const fin = await auraApi.getFinance(query);
        if (fin) result.widgetData = { type: 'finance', data: fin };
      } else if (remoteResponse.intent === 'weather') {
        const w = await auraApi.getWeather(query);
        if (w) result.widgetData = { type: 'weather', data: w };
      }
    } else {
      // Local Engine Fallback
      result = await this.core.search(query, {
        isPro: this.isProMode,
        model: this.selectedModel
      });
    }

    this.currentResult = result;
    this.renderSerpResult(result);
  }

  renderSerpResult(result) {
    // 1. Latency & Metadata
    if (this.aiLatencyEl) {
      this.aiLatencyEl.textContent = `${result.latencyMs}ms • ${result.model}`;
    }

    // 2. Sources Cards
    if (this.sourcesGrid) {
      this.sourcesGrid.innerHTML = result.sources.map(s => `
        <a class="source-card" href="https://${s.domain}" target="_blank" rel="noopener noreferrer">
          <div class="source-card-header">
            <div class="source-favicon">${s.domain.charAt(0).toUpperCase()}</div>
            <div class="source-domain">${s.domain}</div>
            <span class="source-badge-index">[${s.index}]</span>
          </div>
          <div class="source-card-title">${s.title}</div>
        </a>
      `).join('');
    }

    // 3. AI Answer Streaming Typewriter
    if (this.aiAnswerContainer) {
      this.renderMarkdownStream(result.aiSummary, this.aiAnswerContainer);
    }

    // 4. Knowledge Graph
    if (this.graphVisualizer && result.graphData) {
      this.graphVisualizer.setData(result.graphData);
    }

    // 5. Sidebar Widgets (Finance, Weather, Code)
    if (this.sidebarWidgets) {
      this.sidebarWidgets.innerHTML = '';
      if (result.widgetData) {
        const widgetBox = document.createElement('div');
        if (result.widgetData.type === 'finance') {
          WidgetManager.renderFinanceWidget(result.widgetData.data, widgetBox);
        } else if (result.widgetData.type === 'weather') {
          WidgetManager.renderWeatherWidget(result.widgetData.data, widgetBox);
        }
        this.sidebarWidgets.appendChild(widgetBox);
      }
      if (result.codeSnippet) {
        const codeBox = document.createElement('div');
        WidgetManager.renderCodeWidget(result.codeSnippet, codeBox);
        this.sidebarWidgets.appendChild(codeBox);
      }
    }

    // 6. Populate Other Tab Views
    this.renderWebTab(result);
    this.renderImagesTab(result);
    this.renderNewsTab(result);
    this.renderAcademicTab(result);
    this.renderCodeTab(result);
  }

  renderMarkdownStream(markdownText, container) {
    container.innerHTML = '';
    const formattedHtml = this.parseMarkdown(markdownText);
    
    // Smooth fade in
    container.innerHTML = formattedHtml;
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease-in';
    setTimeout(() => container.style.opacity = '1', 50);

    // Bind citation pill clicks
    container.querySelectorAll('.citation-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const index = pill.getAttribute('data-index');
        this.showToast(`Referenced Source [${index}]`);
      });
    });
  }

  parseMarkdown(md) {
    if (!md) return '';
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\[(\d+)\]/g, '<span class="citation-pill" data-index="$1">$1</span>')
      .replace(/```python([\s\S]*?)```/gim, '<pre><code class="lang-python">$1</code></pre>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em;">$1</code>')
      .replace(/^\s*\-\s(.*$)/gim, '<li>$1</li>')
      .replace(/\|(.+)\|/gim, (match) => {
        const cells = match.split('|').filter(c => c.trim() !== '');
        return `<tr>${cells.map(c => `<td style="padding: 6px 12px; border: 1px solid var(--border-subtle);">${c.trim()}</td>`).join('')}</tr>`;
      })
      .replace(/\n\n/gim, '</p><p>');

    return `<p>${html}</p>`;
  }

  renderWebTab(result) {
    if (!this.tabWebView) return;
    this.tabWebView.innerHTML = `
      <div class="web-results-list">
        ${result.sources.map(s => `
          <div class="web-result-item">
            <div class="web-result-url">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>https://${s.domain}/research/${encodeURIComponent(result.query)}</span>
            </div>
            <a class="web-result-title" href="https://${s.domain}" target="_blank">${s.title}</a>
            <div class="web-result-snippet">Verified primary source covering foundational principles, empirical performance data, and standardized benchmark assessments.</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderImagesTab(result) {
    if (!this.tabImagesView) return;
    this.tabImagesView.innerHTML = `
      <div class="images-gallery-grid">
        ${(result.images || []).map(img => `
          <div class="image-card" onclick="window.open('${img.url}', '_blank')">
            <img src="${img.url}" alt="${img.title}" loading="lazy" />
            <div class="image-overlay">
              <div class="image-card-title">${img.title}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderNewsTab(result) {
    if (!this.tabNewsView) return;
    this.tabNewsView.innerHTML = `
      <div class="web-results-list">
        ${(result.news || []).map(n => `
          <div class="web-result-item">
            <div style="display: flex; gap: 8px; font-size: 0.75rem; color: var(--accent-cyan); margin-bottom: 4px;">
              <span>${n.source}</span> • <span>${n.time}</span>
            </div>
            <h3 style="font-size: 1.1rem; margin-bottom: 6px;">${n.headline}</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">${n.snippet}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderAcademicTab(result) {
    if (!this.tabAcademicView) return;
    this.tabAcademicView.innerHTML = `
      <div class="web-results-list">
        ${(result.papers || []).map(p => `
          <div class="web-result-item">
            <div style="font-size: 0.78rem; color: var(--accent-secondary); margin-bottom: 4px;">
              ${p.journal} (${p.year}) • Cited by ${p.citations}
            </div>
            <h3 style="font-size: 1.1rem; color: #ffffff; margin-bottom: 6px;">${p.title}</h3>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">Authors: ${p.authors}</div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">DOI: ${p.doi}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCodeTab(result) {
    if (!this.tabCodeView) return;
    if (result.codeSnippet) {
      this.tabCodeView.innerHTML = `<div id="code-tab-container"></div>`;
      WidgetManager.renderCodeWidget(result.codeSnippet, this.tabCodeView.querySelector('#code-tab-container'));
    } else {
      this.tabCodeView.innerHTML = `
        <div class="glass-panel" style="padding: 24px; text-align: center; color: var(--text-secondary);">
          No dedicated runnable code playground for this topic. Try queries like <em>"Implement LRU Cache in Python"</em>.
        </div>
      `;
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.serp-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });

    const views = [
      { name: 'overview', el: this.tabOverviewView },
      { name: 'web', el: this.tabWebView },
      { name: 'images', el: this.tabImagesView },
      { name: 'news', el: this.tabNewsView },
      { name: 'code', el: this.tabCodeView },
      { name: 'academic', el: this.tabAcademicView }
    ];

    views.forEach(v => {
      if (v.el) {
        v.el.style.display = v.name === tabName ? 'block' : 'none';
      }
    });
  }

  handleAutocomplete(text) {
    if (!this.suggestionsDropdown) return;
    const val = (text || '').trim().toLowerCase();
    if (!val) {
      this.suggestionsDropdown.classList.remove('open');
      return;
    }

    const matches = KnowledgeBase.trendingQueries.filter(item => item.query.toLowerCase().includes(val));
    if (matches.length === 0) {
      this.suggestionsDropdown.classList.remove('open');
      return;
    }

    this.suggestionsDropdown.innerHTML = matches.slice(0, 5).map(m => `
      <div class="suggestion-item" data-query="${m.query}">
        <div class="suggestion-left">
          <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>${m.query}</span>
        </div>
        <span class="suggestion-category">${m.category}</span>
      </div>
    `).join('');

    this.suggestionsDropdown.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const query = item.getAttribute('data-query');
        this.executeSearch(query);
      });
    });

    this.suggestionsDropdown.classList.add('open');
  }

  renderQuickQueries() {
    const container = document.querySelector('#quick-queries-container');
    if (!container) return;
    container.innerHTML = KnowledgeBase.trendingQueries.slice(0, 4).map(q => `
      <div class="query-chip" data-query="${q.query}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>${q.query}</span>
      </div>
    `).join('');

    container.querySelectorAll('.query-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        this.executeSearch(q);
      });
    });
  }

  renderCollections() {
    const container = document.querySelector('#collections-list-body');
    if (!container) return;
    const bookmarks = this.workspace.getBookmarks();

    if (bookmarks.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 0;">No saved research dossiers yet. Click the bookmark icon during search to save queries.</div>`;
      return;
    }

    container.innerHTML = bookmarks.map(b => `
      <div class="collection-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #ffffff; font-size: 0.95rem;">${b.query}</strong>
          <button class="btn-icon btn-del-bm" data-id="${b.id}" style="width: 28px; height: 28px; font-size: 0.75rem;">✕</button>
        </div>
        <div style="font-size: 0.75rem; color: var(--accent-cyan);">${b.timestamp} • ${b.model}</div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">${b.snippet}</p>
      </div>
    `).join('');

    container.querySelectorAll('.btn-del-bm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.workspace.removeBookmark(id);
        this.renderCollections();
      });
    });

    container.querySelectorAll('.collection-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        const bm = bookmarks[i];
        if (bm) {
          document.querySelector('#drawer-backdrop')?.classList.remove('open');
          this.executeSearch(bm.query);
        }
      });
    });
  }

  switchToSerp() {
    if (this.heroSection) this.heroSection.style.display = 'none';
    if (this.serpContainer) this.serpContainer.classList.add('active');
    if (this.serpHeaderSearch) this.serpHeaderSearch.style.display = 'block';
    this.switchTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchToHero() {
    if (this.heroSection) this.heroSection.style.display = 'flex';
    if (this.serpContainer) this.serpContainer.classList.remove('active');
    if (this.serpHeaderSearch) this.serpHeaderSearch.style.display = 'none';
    if (this.heroSearchInput) {
      this.heroSearchInput.value = '';
      this.heroSearchInput.focus();
    }
  }

  renderLoadingState(query) {
    if (this.aiAnswerContainer) {
      this.aiAnswerContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px 0;">
          <div style="display: flex; align-items: center; gap: 10px; color: var(--accent-cyan);">
            <div class="animate-spin" style="width: 16px; height: 16px; border: 2px solid var(--accent-cyan); border-top-color: transparent; border-radius: 50%;"></div>
            <span style="font-size: 0.9rem; font-weight: 600;">Synthesizing answer from multiple authoritative web streams...</span>
          </div>
          <div style="height: 14px; width: 90%; background: rgba(255,255,255,0.06); border-radius: 4px;" class="animate-pulse-glow"></div>
          <div style="height: 14px; width: 75%; background: rgba(255,255,255,0.06); border-radius: 4px;" class="animate-pulse-glow"></div>
          <div style="height: 14px; width: 85%; background: rgba(255,255,255,0.06); border-radius: 4px;" class="animate-pulse-glow"></div>
        </div>
      `;
    }
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
      <span>${message}</span>
    `;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  initAmbientBackground() {
    const canvas = document.querySelector('#ambient-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.1
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    render();
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.Aura = new AuraApp();
});
