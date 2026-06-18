(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  function mutationTouchesPlayerCard(mutation) {
    const targetTouchesCard = mutation.target?.closest?.('.player-card');
    const addedOrRemovedCard = [...mutation.addedNodes || [], ...mutation.removedNodes || []]
      .some(node => node.nodeType === 1 && (
        node.matches?.('.player-card') ||
        node.querySelector?.('.player-card')
      ));
    return Boolean(targetTouchesCard || addedOrRemovedCard);
  }

  AC.observer = {
    start() {
      AC.observer.stop();
      const target = document.querySelector('#game_play_area') || document.querySelector('#player-boards') || document.body;
      AC.state.observer = new MutationObserver(mutations => {
        if (!AC.state.settings?.enabled) return;
        if (mutations.every(m => m.target?.closest?.(`#${AC.IDS.panel}, #${AC.IDS.zoom}`))) return;
        const cardMutation = mutations.some(mutationTouchesPlayerCard);
        if (cardMutation) AC.originalUiHand?.cleanupFormerHandCards?.();
        clearTimeout(AC.state.refreshTimer);
        AC.state.refreshTimer = setTimeout(AC.refresh, cardMutation ? 360 : 250);
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
