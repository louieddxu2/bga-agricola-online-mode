(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.dom = {
    findPlayerBoards(root = document) {
      const scope = root.querySelector ? root : document;
      const candidates = [...scope.querySelectorAll('.player-board-resizable')];
      const seen = new Set();
      return candidates.filter(el => {
        if (seen.has(el)) return false;
        seen.add(el);
        if (el.closest(`#${AC.IDS.panel}, #${AC.IDS.zoom}, .agricola_popin, #popin_showHand_contents`)) return false;
        return !!el.querySelector('.agricola-player-board') && !!el.querySelector('.resources-bar-holder');
      });
    },

    collectPlayers() {
      return AC.dom.findPlayerBoards()
        .map((source, index) => {
          const resources = source.querySelector('.resources-bar-holder');
          return {
            index,
            source,
            resources,
            name: resources?.querySelector('.player-board-name-text')?.textContent?.trim() || '',
            color: resources?.querySelector('.player-board-name')?.style?.color || '',
            farm: source.querySelector('.agricola-player-board'),
            occupationCards: [...source.querySelectorAll('.cards-wrapper .player-card.occupation')],
            improvementCards: [...source.querySelectorAll('.cards-wrapper .player-card:not(.occupation)')]
          };
        });
    },

    cloneWithSource(node) {
      if (!node) return null;
      const clone = node.cloneNode(true);
      AC.dom.annotateAndCleanClone(clone);
      return clone;
    },

    annotateAndCleanClone(node) {
      if (!node || node.nodeType !== 1) return node;

      const annotate = el => {
        if (el.id && !el.dataset.sourceId) el.dataset.sourceId = el.id;
      };
      annotate(node);
      node.querySelectorAll('[id]').forEach(annotate);

      node.querySelectorAll('.reserve, .player-reserve').forEach(el => {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('width', '0', 'important');
        el.style.setProperty('height', '0', 'important');
        el.style.setProperty('overflow', 'hidden', 'important');
      });

      // The compact panel uses read-only clones. BGA's own helper / close / zoom
      // controls inside cards do not reliably trigger the original card behavior
      // after cloning, so remove them from cloned cards and keep only our own
      // panel-level click / zoom / proxy action controls.
      node.querySelectorAll([
        '.player-card .help-marker',
        '.player-card .card-rulings-icon',
        '.player-card .player-card-zoom',
        '.player-card .player-card-stats',
        '.player-card .agricola_popin_closeicon'
      ].join(',')).forEach(el => el.remove());

      return node;
    },

    cloneResource(el) {
      return AC.dom.cloneWithSource(el);
    },

    getResourceNumber(el) {
      const data = Number(el?.dataset?.n);
      if (!Number.isNaN(data)) return data;
      const txt = el?.querySelector('span')?.textContent?.trim();
      const n = Number(txt);
      return Number.isNaN(n) ? 0 : n;
    },

    findOriginalById(sourceId) {
      if (!sourceId) return null;
      const candidates = [...document.querySelectorAll(`[id="${AC.utils.cssEscape(sourceId)}"]`)];
      return candidates.find(el => !el.closest(`#${AC.IDS.panel}, #${AC.IDS.zoom}`)) || null;
    }
  };
})();
