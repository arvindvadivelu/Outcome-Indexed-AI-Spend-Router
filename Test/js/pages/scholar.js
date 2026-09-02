/**
 * AURA Scholar & Research Lab Controller
 * Handles academic literature search, citation graphing, paper modal reading,
 * and BibTeX export.
 */

import { AuraNav } from '../nav.js';

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
        bibtex: `@article{vance2025autonomous,
  title={Autonomous Multi-Agent Reasoning via Latent Tree-of-Thought Decomposition},
  author={Vance, Elena and Chen, Marcus and Tanaka, Kenji},
  journal={Journal of Artificial Intelligence Research},
  volume={74},
  pages={112--134},
  year={2025},
  publisher={JAIR}
}`
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
        bibtex: `@article{pendelton2024fault,
  title={Fault-Tolerant Superconducting Qubit Architectures at 15 Millikelvin},
  author={Pendelton, Arthur and Rostova, Svetlana and Lindqvist, Henrik},
  journal={Nature Quantum Information},
  volume={18},
  year={2024}
}`
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
        bibtex: `@article{sterling2025crispr,
  title={CRISPR Epigenome Editing for Cellular Rejuvenation in Mammalian Models},
  author={Sterling, Sarah and Zhao, David and Moreau, Luc},
  journal={Cell Stem Cell & Longevity},
  year={2025}
}`
      },
      {
        id: "p4",
        title: "High-Throughput Distributed Consensus via Zero-Knowledge State Channels",
        authors: "Alexandre Dubois, Rachel Cohen, M. Al-Mansoor",
        journal: "IEEE Transactions on Dependable & Secure Computing",
        year: 2024,
        citations: 380,
        doi: "10.1109/TDSC.2024.3129845",
        domain: "Distributed Systems",
        abstract: "We formulate an asynchronous consensus algorithm that offloads cryptographic verification to non-interactive zero-knowledge proofs (zk-SNARKs), achieving over 180,000 transactions per second under adversarial network partitions.",
        bibtex: `@article{dubois2024consensus,
  title={High-Throughput Distributed Consensus via Zero-Knowledge State Channels},
  author={Dubois, Alexandre and Cohen, Rachel},
  journal={IEEE Transactions on Dependable & Secure Computing},
  year={2024}
}`
      }
    ];

    this.activePapers = [...this.papers];
    this.initDOM();
    this.bindEvents();
    this.renderPapers();
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
        this.activePapers = this.papers.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.authors.toLowerCase().includes(query) ||
          p.abstract.toLowerCase().includes(query) ||
          p.domain.toLowerCase().includes(query)
        );
        this.renderPapers();
      });
    }

    // Quick Domain Tags
    document.querySelectorAll('.domain-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const dom = tag.getAttribute('data-domain');
        if (this.searchInput) this.searchInput.value = dom;
        this.activePapers = this.papers.filter(p => p.domain.toLowerCase().includes(dom.toLowerCase()) || p.title.toLowerCase().includes(dom.toLowerCase()));
        this.renderPapers();
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
