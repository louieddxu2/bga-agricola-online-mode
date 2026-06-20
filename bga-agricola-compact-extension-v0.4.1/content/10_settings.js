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

  function safeStorageSet(storage, values) {
    if (!storage) return;
    try {
      storage.set(values, () => {
        try {
          void globalThis.chrome?.runtime?.lastError;
        } catch (_) {}
      });
    } catch (error) {
      console.warn('[AgriCompact] settings storage set failed', error);
    }
  }

  function safeStorageGet(storage, defaults, callback) {
    if (!storage) {
      callback(defaults);
      return;
    }
    try {
      storage.get(defaults, stored => {
        try {
          if (globalThis.chrome?.runtime?.lastError) {
            callback(defaults);
            return;
          }
        } catch (_) {
          callback(defaults);
          return;
        }
        callback(stored || defaults);
      });
    } catch (error) {
      console.warn('[AgriCompact] settings storage get failed', error);
      callback(defaults);
    }
  }

  AC.settings = {
    async load() {
      return new Promise(resolve => {
        const storage = localStorageArea();
        safeStorageGet(storage, AC.DEFAULTS, stored => {
          if (stored.version !== AC.VERSION) {
            safeStorageSet(storage, AC.DEFAULTS);
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
      const storage = localStorageArea();
      safeStorageSet(storage, AC.state.settings);
      AC.applyVars?.();
    },

    reset(keepEnabled = true) {
      AC.state.settings = { ...AC.DEFAULTS, enabled: keepEnabled };
      const storage = localStorageArea();
      safeStorageSet(storage, AC.state.settings);
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
