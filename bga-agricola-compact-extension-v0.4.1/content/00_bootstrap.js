(() => {
  'use strict';

  console.log('00_bootstrap.js loaded, pathname:', location.pathname);
  const isAgricolaPage =
    /(^|\/)agricola($|[/?#])/.test(location.pathname) ||
    document.querySelector('link[href*="agricola.css"]') ||
    document.querySelector('#player-boards, #alternative-hand-wrapper #hand-container, #player-boards #hand-container');
  console.log('isAgricolaPage:', !!isAgricolaPage);

  if (!isAgricolaPage) return;
  console.log('00_bootstrap.js past page check');
  if (window.__BGA_AGRICOLA_COMPACT_V011_ORIGINAL_BOARDS__) return;
  window.__BGA_AGRICOLA_COMPACT_V011_ORIGINAL_BOARDS__ = true;

  window.AgriCompact = {
    VERSION: '0.12.39',
    IDS: {
      toggle: 'bga-agri-v10-toggle',
      panel: 'bga-agri-v10-panel',
      hand: 'bga-agri-v10-hand',
      boards: 'bga-agri-v10-boards',
      zoom: 'bga-agri-v10-zoom',
      toast: 'bga-agri-v10-toast'
    },
    state: {
      settings: null,
      observer: null,
      refreshTimer: null
    },
    utils: {
      clamp(n, min, max) { return Math.max(min, Math.min(max, n)); },
      round(n) { return Math.round(n * 100) / 100; },
      cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
        return String(value).replace(/"/g, '\\22 ');
      },
      toast(msg) {
        const AC = window.AgriCompact;
        document.getElementById(AC.IDS.toast)?.remove();
        const el = document.createElement('div');
        el.id = AC.IDS.toast;
        el.textContent = msg;
        document.documentElement.appendChild(el);
        setTimeout(() => el.remove(), 1600);
      }
    }
  };
})();
