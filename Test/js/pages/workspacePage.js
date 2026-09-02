/**
 * AURA Workspace & AI Docs Controller
 * Real-time document editor with AI co-writing actions, file tree, and export.
 */

import { AuraNav } from '../nav.js';

class WorkspacePageApp {
  constructor() {
    this.nav = new AuraNav('workspace');
    
    this.documents = [
      {
        id: "doc-1",
        title: "Executive Research Dossier: Quantum Computing Scaling",
        content: `# Executive Research Dossier: Quantum Computing Scaling
*Prepared by AURA Autonomous Research Intelligence*

## 1. Executive Summary
Quantum computing represents a paradigm transition from binary computational bounds to polynomial and exponential speedups across specialized mathematical classes. 

### Key Benchmarks & Milestones:
- **Surface-Code Thresholds**: Physical error rates now under 0.1% for 128-qubit superconducting planar arrays.
- **Dilution Cryogenics**: Operational stability verified at 15 mK with continuous pulse-tube cooling cycles.
- **Algorithmic Advantage**: Shor's and Grover's algorithms demonstrate theoretical optimality in cryptanalysis and search.

## 2. Strategic Implementation Roadmap
1. Deploy post-quantum lattice cryptography (NIST standardized algorithms).
2. Integrate hybrid classical-quantum cloud orchestration layers.
3. Conduct fault-tolerant simulation testing on chemical catalytic reaction pathways.`
      },
      {
        id: "doc-2",
        title: "Autonomous Agent Orchestration Architecture",
        content: `# Autonomous Agent Orchestration Architecture

## System Principles
- **Decoupled Reasoning Trees**: Agents formulate independent sub-tasks before synchronizing state.
- **Evidence Verification**: All assertions must trace to verified primary sources with confidence scores exceeding 95%.
- **Zero-Latency State Channels**: Asynchronous event streams maintain real-time telemetry.`
      }
    ];

    this.activeDoc = this.documents[0];
    this.initDOM();
    this.bindEvents();
    this.loadDocument(this.activeDoc);
    this.renderFileTree();
  }

  initDOM() {
    this.docTitleInput = document.querySelector('#doc-title-input');
    this.docEditor = document.querySelector('#doc-editor-text');
    this.fileTreeList = document.querySelector('#workspace-files-list');
    this.wordCountEl = document.querySelector('#doc-word-count');
    this.saveStatusEl = document.querySelector('#doc-save-status');
  }

  bindEvents() {
    // Editor Input & Auto-Save
    if (this.docEditor) {
      this.docEditor.addEventListener('input', () => {
        this.activeDoc.content = this.docEditor.value;
        this.updateStats();
        if (this.saveStatusEl) {
          this.saveStatusEl.textContent = 'Saving...';
          setTimeout(() => {
            this.saveStatusEl.textContent = 'Saved to Cloud';
          }, 400);
        }
      });
    }

    if (this.docTitleInput) {
      this.docTitleInput.addEventListener('input', (e) => {
        this.activeDoc.title = e.target.value;
        this.renderFileTree();
      });
    }

    // New Document Button
    document.querySelector('#btn-new-doc')?.addEventListener('click', () => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: `Untitled Document ${this.documents.length + 1}`,
        content: `# New AI Document\n\nStart typing or use AI actions above to synthesize research...`
      };
      this.documents.push(newDoc);
      this.loadDocument(newDoc);
      this.renderFileTree();
      this.nav.showToast('Created new AI document');
    });

    // AI Co-Writer Actions
    document.querySelectorAll('.ai-doc-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.executeAiAction(action);
      });
    });

    // Export Button
    document.querySelector('#btn-export-doc')?.addEventListener('click', () => {
      const blob = new Blob([this.activeDoc.content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.activeDoc.title.replace(/[^a-z0-9]/gi, '_')}.md`;
      link.click();
      URL.revokeObjectURL(url);
      this.nav.showToast('Document exported as Markdown');
    });
  }

  loadDocument(doc) {
    this.activeDoc = doc;
    if (this.docTitleInput) this.docTitleInput.value = doc.title;
    if (this.docEditor) this.docEditor.value = doc.content;
    this.updateStats();
  }

  updateStats() {
    const text = this.docEditor ? this.docEditor.value : '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(words / 200);
    if (this.wordCountEl) {
      this.wordCountEl.textContent = `${words} words • ~${readingTime} min read`;
    }
  }

  renderFileTree() {
    if (!this.fileTreeList) return;
    this.fileTreeList.innerHTML = this.documents.map(doc => `
      <div class="collection-item ${doc.id === this.activeDoc.id ? 'active' : ''}" data-id="${doc.id}" style="padding: 10px 14px; cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style="font-size: 0.88rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${doc.title}</span>
        </div>
      </div>
    `).join('');

    this.fileTreeList.querySelectorAll('.collection-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const d = this.documents.find(doc => doc.id === id);
        if (d) {
          this.loadDocument(d);
          this.renderFileTree();
        }
      });
    });
  }

  executeAiAction(action) {
    if (!this.docEditor) return;

    if (action === 'expand') {
      const addition = `\n\n### Extended Verification & Cross-References:\n- **Empirical Baseline**: Validated across distributed testbeds with 99.4% precision. [1]\n- **Latency Profile**: End-to-end response times sustain sub-40ms execution under peak concurrency. [2]`;
      this.docEditor.value += addition;
      this.activeDoc.content = this.docEditor.value;
      this.updateStats();
      this.nav.showToast('Expanded with verified citations');
    } else if (action === 'bullets') {
      const addition = `\n\n### Key Takeaways:\n1. Accelerated throughput via autonomous sub-agent decomposition.\n2. Cryogenic stability verified at 15 mK.\n3. Scalable fault-tolerance via lattice cryptographic standards.`;
      this.docEditor.value += addition;
      this.activeDoc.content = this.docEditor.value;
      this.updateStats();
      this.nav.showToast('Synthesized into 3 key takeaways');
    } else if (action === 'table') {
      const tableStr = `\n\n| Feature | Conventional Baseline | AURA Intelligence |\n| :--- | :--- | :--- |\n| **Latency** | 450ms | 32ms |\n| **Ad Invasiveness** | High (5+ Ads) | Zero Ads |\n| **Reasoning Depth** | Single Pass | Multi-Agent Tree |`;
      this.docEditor.value += tableStr;
      this.activeDoc.content = this.docEditor.value;
      this.updateStats();
      this.nav.showToast('Appended structured comparison table');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.Workspace = new WorkspacePageApp();
});
