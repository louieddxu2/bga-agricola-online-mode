(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.DEFAULTS = {
    version: AC.VERSION,
    enabled: false,
    boardHeight: 34,
    handHeight: 96,
    handCardScale: 0.28,
    cardPreviewScale: 0.30
  };
  AC.state.settings = { ...AC.DEFAULTS };

  function localStorageArea() {
    return globalThis.chrome?.storage?.local || null;
  }

  AC.settings = {
    async load() {
      return new Promise(resolve => {
        const storage = localStorageArea();
        if (!storage) {
          AC.state.settings = { ...AC.DEFAULTS };
          resolve(AC.state.settings);
          return;
        }
        storage.get(AC.DEFAULTS, stored => {
          if (stored.version !== AC.VERSION) {
            storage.set(AC.DEFAULTS);
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
      localStorageArea()?.set(AC.state.settings);
      AC.applyVars?.();
    },

    reset(keepEnabled = true) {
      AC.state.settings = { ...AC.DEFAULTS, enabled: keepEnabled };
      localStorageArea()?.set(AC.state.settings);
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
