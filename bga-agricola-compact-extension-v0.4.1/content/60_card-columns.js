(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.cards = {
    findHandCards() {
      // BGA can render the player's hand in different places depending on the
      // table display preference. The original version only read the bottom
      // alternative hand wrapper. Also read the hand container embedded below
      // the player/farm board area.
      const selectors = [
        '#alternative-hand-wrapper #hand-container > .player-card',
        '#player-boards #player-boards-left-column #hand-container > .player-card',
        '#player-boards #hand-container > .player-card'
      ];

      const seen = new Set();
      const cards = [];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(card => {
          if (card.closest(`#${AC.IDS.panel}, #${AC.IDS.zoom}`)) return;
          const key = card.id || card.dataset.id || card;
          if (seen.has(key)) return;
          seen.add(key);
          cards.push(card);
        });
      });
      return cards;
    },

    renderHand() {
      const hand = document.getElementById(AC.IDS.hand);
      if (!hand) return;
      hand.textContent = '';

      AC.cards.findHandCards().forEach(source => {
        const wrap = document.createElement('div');
        wrap.className = 'bga-agri-v10-hand-card';
        const clone = AC.dom.cloneWithSource(source);
        clone.dataset.sourceId = source.id || '';
        wrap.appendChild(clone);
        hand.appendChild(wrap);
      });
    },

    renderCardColumns(player) {
      const cards = document.createElement('div');
      cards.className = 'bga-agri-v10-cards';

      const occ = document.createElement('div');
      occ.className = 'bga-agri-v10-card-col bga-agri-v10-occ-col';

      const imp = document.createElement('div');
      imp.className = 'bga-agri-v10-card-col bga-agri-v10-imp-col';

      const appendCard = (source, target) => {
        const wrap = document.createElement('div');
        wrap.className = 'bga-agri-v10-played-card';
        const clone = AC.dom.cloneWithSource(source);
        clone.dataset.sourceId = source.id || '';
        clone.classList.remove('mini');
        wrap.appendChild(clone);
        target.appendChild(wrap);
      };

      player.occupationCards.forEach(card => appendCard(card, occ));
      player.improvementCards.forEach(card => appendCard(card, imp));

      cards.appendChild(occ);
      cards.appendChild(imp);
      return cards;
    }
  };

  AC.refresh = function refresh() {
    if (!AC.state.settings?.enabled) return;

    // v0.11.1: original-DOM prototype only. No cloned farm/card/hand panel.
    document.getElementById(AC.IDS.hand)?.remove();
    document.getElementById(AC.IDS.boards)?.remove();
    document.querySelectorAll('.bga-agri-v10-player, .bga-agri-v10-hand-card').forEach(el => el.remove());

    requestAnimationFrame(() => {
      AC.layoutOriginalPlayerBoards?.();
      if (document.documentElement.classList.contains('bga-agri-v10-original-compact')) {
        AC.originalUiCompact?.layoutHandCards?.();
        AC.originalUiCompact?.layoutPlayerActionCards?.();
      }
    });
  };
})();
