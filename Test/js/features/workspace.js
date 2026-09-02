/**
 * AURA Workspace & Research Collections Manager
 * Manages search history, saved dossiers, bookmarks, and export formats.
 */

export class WorkspaceManager {
  constructor() {
    this.historyKey = 'aura_search_history';
    this.bookmarksKey = 'aura_bookmarks';
  }

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  saveSearchToHistory(query) {
    if (!query) return;
    let history = this.getHistory();
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    history.unshift(query);
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem(this.historyKey, JSON.stringify(history));
  }

  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(this.bookmarksKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  addBookmark(searchResult) {
    if (!searchResult || !searchResult.query) return;
    let bookmarks = this.getBookmarks();
    bookmarks = bookmarks.filter(b => b.query.toLowerCase() !== searchResult.query.toLowerCase());
    bookmarks.unshift({
      id: 'bm_' + Date.now(),
      query: searchResult.query,
      model: searchResult.model,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      snippet: searchResult.aiSummary ? searchResult.aiSummary.substring(0, 140) + '...' : '',
      fullResult: searchResult
    });
    localStorage.setItem(this.bookmarksKey, JSON.stringify(bookmarks));
  }

  removeBookmark(id) {
    let bookmarks = this.getBookmarks();
    bookmarks = bookmarks.filter(b => b.id !== id);
    localStorage.setItem(this.bookmarksKey, JSON.stringify(bookmarks));
  }

  exportToMarkdown(searchResult) {
    if (!searchResult) return;
    const dateStr = new Date().toISOString();
    let md = `# Research Dossier: ${searchResult.query}\n`;
    md += `*Generated via AURA Intelligence (${searchResult.model}) on ${dateStr}*\n\n`;
    md += `## Synthesized Analysis\n\n${searchResult.aiSummary}\n\n`;
    
    if (searchResult.sources && searchResult.sources.length) {
      md += `## Sources & Citations\n\n`;
      searchResult.sources.forEach(s => {
        md += `[${s.index}] ${s.title} - *${s.domain}*\n`;
      });
      md += '\n';
    }

    if (searchResult.suggestedFollowUps && searchResult.suggestedFollowUps.length) {
      md += `## Recommended Inquiries\n\n`;
      searchResult.suggestedFollowUps.forEach(q => {
        md += `- ${q}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AURA_Research_${searchResult.query.replace(/[^a-z0-9]/gi, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportToJson(searchResult) {
    if (!searchResult) return;
    const blob = new Blob([JSON.stringify(searchResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AURA_Dossier_${searchResult.query.replace(/[^a-z0-9]/gi, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  printReport() {
    window.print();
  }
}
