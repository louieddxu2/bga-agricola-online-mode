(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.DEFAULTS = {
    version: AC.VERSION,
    enabled: false,
    boardHeight: 36,
    handHeight: 96,
    handCardScale: 0.28,
    cardPreviewScale: 0.30
  };
  AC.state.settings = { ...AC.DEFAULTS };

  AC.settings = {
    async load() {
      return new Promise(resolve => {
        if (!chrome?.storage?.local) {
          AC.state.settings = { ...AC.DEFAULTS };
          resolve(AC.state.settings);
          return;
        }
        chrome.storage.local.get(AC.DEFAULTS, stored => {
          if (stored.version !== AC.VERSION) {
            chrome.storage.local.set(AC.DEFAULTS);
            AC.state.settings = { ...AC.DEFAULTS };
          } else {
            AC.state.settings = { ...AC.DEFAULTS, ...stored };
          }
          resolve(AC.state.settings);
        });
      });
    },

    save(patch = {}) {
      AC.state.settings = { ...AC.state.settings, ...patch, version: AC.VERSION };
      if (chrome?.storage?.local) chrome.storage.local.set(AC.state.settings);
      AC.applyVars?.();
    },

    reset(keepEnabled = true) {
      AC.state.settings = { ...AC.DEFAULTS, enabled: keepEnabled };
      if (chrome?.storage?.local) chrome.storage.local.set(AC.state.settings);
      AC.applyVars?.();
    }
  };

  AC.applyVars = function applyVars() {
    const s = AC.state.settings || AC.DEFAULTS;
    const root = document.documentElement;
    root.style.setProperty('--bga-agri-v10-board-height', `${s.boardHeight}vh`);
    root.style.setProperty('--bga-agri-v10-hand-height', `${s.handHeight}px`);
    root.style.setProperty('--bga-agri-v10-hand-card-scale', String(s.handCardScale));
    root.style.setProperty('--bga-agri-v10-card-preview-scale', String(s.cardPreviewScale));
    root.style.setProperty('--bga-agri-v10-total-height', `calc(${s.boardHeight}vh + ${s.handHeight}px + 32px)`);
  };
})();
