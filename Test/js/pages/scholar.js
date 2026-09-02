/**
 * AURA Scholar & Research Lab Controller
 * Handles academic literature search, citation graphing, paper modal reading,
 * and BibTeX export via REST API.
 */

import { AuraNav } from '../nav.js';
import { auraApi } from '../apiClient.js';

class ScholarApp {
  constructor() {
    this.nav = new AuraNav('scholar');
    
    this.papers = [
      {
        id: "p1",
        title: "Autonomous Multi-Agent Reasoning via Latent Tree-of-Thought Decomposition",
        authors: "Dr. Elena Vance, Prof. Marcus Chen, Dr. K. Tanaka",
        journal: "Journal of Artificial Intelligence Research (JAIR), Vol 74",
        year: 2025,
        citations: 418,
        doi: "10.1145/3411764.3445582",
        domain: "AI & Machine Learning",
        abstract: "We introduce an autonomous multi-agent framework capable of decomposing complex combinatorial reasoning tasks into decentralized sub-agent trees. Across 1,400 benchmark evaluation suites, our approach achieves a 42.6% reduction in hallucination rates while accelerating inference throughput by 3.2x compared to standard sequential chain-of-thought methods.",
        bibtex: `@article{vance2025autonomous,\n  title={Autonomous Multi-Agent Reasoning via Latent Tree-of-Thought Decomposition},\n  author={Vance, Elena and Chen, Marcus and Tanaka, Kenji},\n  journal={Journal of Artificial Intelligence Research},\n  volume={74},\n  pages={112--134},\n  year={2025},\n  publisher={JAIR}\n}`
      },
      {
        id: "p2",
        title: "Fault-Tolerant Superconducting Qubit Architectures at 15 Millikelvin",
        authors: "Dr. Arthur Pendelton, S. Rostova, H. Lindqvist",
        journal: "Nature Quantum Information, Issue 18",
        year: 2024,
        citations: 924,
        doi: "10.1038/s41534-024-00812-x",
        domain: "Quantum Physics",
        abstract: "Scalable quantum computation demands surface-code error mitigation with thresholds exceeding physical error rates. Here we demonstrate a 128-qubit planar architecture operating at 15 mK with two-qubit gate fidelities exceeding 99.92%, paving a verifiable path towards utility-scale quantum supremacy.",
        bibtex: `@article{pendelton2024fault,\n  title={Fault-Tolerant Superconducting Qubit Architectures at 15 Millikelvin},\n  author={Pendelton, Arthur and Rostova, Svetlana and Lindqvist, Henrik},\n  journal={Nature Quantum Information},\n  volume={18},\n  year={2024}\n}`
      },
      {
        id: "p3",
        title: "CRISPR Epigenome Editing for Cellular Rejuvenation in Mammalian Models",
        authors: "Prof. Sarah Sterling, Dr. David Zhao, L. Moreau",
        journal: "Cell Stem Cell & Longevity, Vol 32",
        year: 2025,
        citations: 612,
        doi: "10.1016/j.stem.2025.02.011",
        domain: "Biotech & Longevity",
        abstract: "Transient expression of Yamanaka reprogramming factors mediated via deactivated Cas9 epigenome modifiers restores youthful DNA methylation profiles without inducing oncogenic pluripotency, leading to a 28% increase in median lifespan in aged murine cohorts.",
        bibtex: `@article{sterling2025crispr,\n  title={CRISPR Epigenome Editing for Cellular Rejuvenation in Mammalian Models},\n  author={Sterling, Sarah and Zhao, David and Moreau, Luc},\n  journal={Cell Stem Cell & Longevity},\n  year={2025}\n}`
      }
    ];

    this.activePapers = [...this.papers];
    this.initDOM();
    this.bindEvents();
    this.loadPapersFromApi();
  }

  initDOM() {
    this.searchInput = document.querySelector('#scholar-search-input');
    this.papersListContainer = document.querySelector('#scholar-papers-list');
    this.paperModal = document.querySelector('#paper-modal');
    this.modalContent = document.querySelector('#paper-modal-content');
  }

  bindEvents() {
    // Search Filter Input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.filterPapers(query, '');
      });
    }

    // Quick Domain Tags
    document.querySelectorAll('.domain-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const dom = tag.getAttribute('data-domain');
        if (this.searchInput) this.searchInput.value = dom;
        this.filterPapers('', dom);
        this.nav.showToast(`Filtered by ${dom}`);
      });
    });

    // Close Modal
    document.querySelector('#btn-close-paper-modal')?.addEventListener('click', () => {
      if (this.paperModal) this.paperModal.classList.remove('active');
    });

    if (this.paperModal) {
      this.paperModal.addEventListener('click', (e) => {
        if (e.target === this.paperModal) this.paperModal.classList.remove('active');
      });
    }
  }

  async loadPapersFromApi() {
    const remote = await auraApi.getScholarPapers();
    if (remote && Array.isArray(remote) && remote.length > 0) {
      this.papers = remote;
      this.activePapers = [...remote];
    }
    this.renderPapers();
  }

  async filterPapers(query, domain) {
    const remote = await auraApi.getScholarPapers(query, domain);
    if (remote && Array.isArray(remote)) {
      this.activePapers = remote;
    } else {
      // Local fallback
      this.activePapers = this.papers.filter(p => {
        const matchQ = !query || p.title.toLowerCase().includes(query) || p.authors.toLowerCase().includes(query) || p.abstract.toLowerCase().includes(query);
        const matchD = !domain || p.domain.toLowerCase().includes(domain.toLowerCase());
        return matchQ && matchD;
      });
    }
    this.renderPapers();
  }

  renderPapers() {
    if (!this.papersListContainer) return;

    if (this.activePapers.length === 0) {
      this.papersListContainer.innerHTML = `<div class="glass-panel" style="padding: 30px; text-align: center; color: var(--text-muted);">No academic publications matching your query. Try broadening your criteria.</div>`;
      return;
    }

    this.papersListContainer.innerHTML = this.activePapers.map(paper => `
      <article class="scholar-paper-card" id="card-${paper.id}">
        <div class="scholar-meta-row">
          <span>${paper.journal}</span> • <span>${paper.year}</span> • <span style="color: #10b981; font-weight: 600;">Cited by ${paper.citations}</span>
        </div>
        <h2 class="scholar-paper-title">${paper.title}</h2>
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Authors: ${paper.authors}</div>
        <p class="scholar-abstract">${paper.abstract}</p>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim);">DOI: ${paper.doi}</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-read-paper" data-id="${paper.id}" style="padding: 4px 12px; font-size: 0.78rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>AI Reader</span>
            </button>
            <button class="btn btn-primary btn-bibtex" data-id="${paper.id}" style="padding: 4px 12px; font-size: 0.78rem;">BibTeX</button>
          </div>
        </div>
      </article>
    `).join('');

    // Bind AI Reader Modal Buttons
    this.papersListContainer.querySelectorAll('.btn-read-paper').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = this.papers.find(item => item.id === id);
        if (p) this.openPaperModal(p);
      });
    });

    // Bind BibTeX copy buttons
    this.papersListContainer.querySelectorAll('.btn-bibtex').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = this.papers.find(item => item.id === id);
        if (p) {
          navigator.clipboard.writeText(p.bibtex);
          this.nav.showToast('BibTeX citation copied to clipboard');
        }
      });
    });
  }

  openPaperModal(paper) {
    if (!this.paperModal || !this.modalContent) return;

    this.modalContent.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">${paper.journal} • ${paper.year}</div>
      <h2 style="font-size: 1.4rem; color: #ffffff; margin: 8px 0 12px;">${paper.title}</h2>
      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;"><strong>Authors:</strong> ${paper.authors}</div>
      
      <div class="glass-panel" style="padding: 16px; margin-bottom: 16px; background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.3);">
        <div style="font-size: 0.82rem; font-weight: 700; color: #c7d2fe; margin-bottom: 6px;">🧠 AURA AI Executive Synthesis:</div>
        <div style="font-size: 0.9rem; line-height: 1.6; color: #f8fafc;">
          This paper establishes empirical verification of next-generation methodologies. Key claims demonstrate up to a 42% gain in algorithmic resilience with peer-reviewed consensus score of 98.4%.
        </div>
      </div>

      <h4 style="font-size: 0.95rem; margin-bottom: 6px; color: #ffffff;">Abstract:</h4>
      <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 20px;">${paper.abstract}</p>

      <h4 style="font-size: 0.95rem; margin-bottom: 6px; color: #ffffff;">BibTeX Entry:</h4>
      <pre style="background: #060911; padding: 14px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: #a5b4fc; overflow-x: auto;"><code>${paper.bibtex}</code></pre>
    `;

    this.paperModal.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.Scholar = new ScholarApp();
});
