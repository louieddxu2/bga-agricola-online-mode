(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.observer = {
    start() {
      AC.observer.stop();
      const target = document.querySelector('#game_play_area') || document.querySelector('#player-boards') || document.body;
      AC.state.observer = new MutationObserver(mutations => {
        if (!AC.state.settings?.enabled) return;
        if (mutations.every(m => m.target?.closest?.(`#${AC.IDS.panel}, #${AC.IDS.zoom}`))) return;
        clearTimeout(AC.state.refreshTimer);
        AC.state.refreshTimer = setTimeout(AC.refresh, 250);
      });
      AC.state.observer.observe(target, { childList: true, subtree: true, attributes: true, characterData: true });
    },

    stop() {
      if (AC.state.observer) AC.state.observer.disconnect();
      AC.state.observer = null;
      clearTimeout(AC.state.refreshTimer);
    }
  };
})();
