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

    const boards = document.getElementById(AC.IDS.boards);
    if (!boards) return;

    AC.cards.renderHand();

    // 記錄當前每位玩家卡片欄的滾動位置 (scrollTop)
    const scrollPositions = [];
    boards.querySelectorAll('.bga-agri-v10-player').forEach((playerEl) => {
      const occCol = playerEl.querySelector('.bga-agri-v10-occ-col');
      const impCol = playerEl.querySelector('.bga-agri-v10-imp-col');
      scrollPositions.push({
        occ: occCol ? occCol.scrollTop : 0,
        imp: impCol ? impCol.scrollTop : 0
      });
    });

    boards.textContent = '';
    const players = AC.dom.collectPlayers();

    players.forEach(player => {
      const panel = document.createElement('div');
      panel.className = 'bga-agri-v10-player';

      const left = document.createElement('div');
      left.className = 'bga-agri-v10-left';

      left.appendChild(AC.resourceRow.renderTopRow(player));
      left.appendChild(AC.resourceRow.renderResourceRow(player));
      left.appendChild(AC.farmView.render(player));

      panel.appendChild(left);
      panel.appendChild(AC.cards.renderCardColumns(player));
      boards.appendChild(panel);
    });

    // 還原每位玩家卡片欄的滾動位置
    boards.querySelectorAll('.bga-agri-v10-player').forEach((playerEl, idx) => {
      const pos = scrollPositions[idx];
      if (pos) {
        const occCol = playerEl.querySelector('.bga-agri-v10-occ-col');
        const impCol = playerEl.querySelector('.bga-agri-v10-imp-col');
        if (occCol && pos.occ) occCol.scrollTop = pos.occ;
        if (impCol && pos.imp) impCol.scrollTop = pos.imp;
      }
    });

    requestAnimationFrame(AC.layoutFarms);
  };
})();
