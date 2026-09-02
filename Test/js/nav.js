/**
 * AURA Universal Navigation & App Shell Controller
 * Manages cross-page routing, global apps launcher modal, theme sync, and notifications.
 */

export class AuraNav {
  constructor(activePage = 'search') {
    this.activePage = activePage;
    this.currentTheme = localStorage.getItem('aura_theme') || 'obsidian';
    this.initNavbar();
    this.applyTheme(this.currentTheme);
  }

  initNavbar() {
    // Apps Launcher Toggle
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

    // Theme Toggle
    const themeBtn = document.querySelector('#btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const themes = ['obsidian', 'cyber', 'navy', 'light'];
        const nextIdx = (themes.indexOf(this.currentTheme) + 1) % themes.length;
        this.applyTheme(themes[nextIdx]);
      });
    }
  }

  applyTheme(themeName) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('aura_theme', themeName);
  }

  showToast(message) {
    let container = document.querySelector('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}
