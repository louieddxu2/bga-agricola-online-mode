(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.farmView = {
    render(player) {
      const area = document.createElement('div');
      area.className = 'bga-agri-v10-farm-area';

      const shell = document.createElement('div');
      shell.className = 'bga-agri-v10-farm-shell player-board-wrapper';

      const holder = document.createElement('div');
      holder.className = 'bga-agri-v10-farm-holder player-board-holder';

      if (player.farm) {
        const farmClone = AC.dom.cloneWithSource(player.farm);
        holder.appendChild(farmClone);
      }

      shell.appendChild(holder);
      area.appendChild(shell);
      return area;
    }
  };

  AC.layoutFarms = function layoutFarms() {
    AC.applyVars();
    document.querySelectorAll(`#${AC.IDS.boards} .bga-agri-v10-farm-area`).forEach(area => {
      const shell = area.querySelector('.bga-agri-v10-farm-shell');
      if (!shell) return;

      const sw = Math.max(1, area.clientWidth);
      const sh = Math.max(1, area.clientHeight);
      const scale = Math.max(0.05, sw / 658);

      shell.style.transform = `scale(${scale})`;
      shell.style.left = `${Math.max(0, (sw - 658 * scale) / 2)}px`;
      shell.style.top = `${Math.max(0, (sh - 405 * scale) / 2)}px`;
    });
  };

  function titleWeight(text) {
    return [...String(text || '').trim()].reduce((sum, ch) => {
      if (/\s/.test(ch)) return sum + 0.3;
      if (/[\u0000-\u007f]/.test(ch)) return sum + 0.58;
      return sum + 1;
    }, 0);
  }

  function cardTitleFontSize(card, unscaledCardW, boardScale) {
    const title = card.querySelector('.card-title')?.textContent || '';
    const visibleCardW = Math.max(1, unscaledCardW * boardScale);
    const weight = Math.max(4, titleWeight(title));
    const visibleFontSize = AC.utils.clamp((visibleCardW * 1.08) / weight, 15, 20);
    return AC.utils.round(visibleFontSize / Math.max(boardScale, 0.05));
  }

  function handIsBelowBoards() {
    const handContainer = document.querySelector('#hand-container');
    return handContainer?.dataset.bgaAgriV10HandLayoutMode === 'below-boards-row' &&
      !!handContainer.querySelector(':scope > .player-card');
  }

  function playedCardLowerSpaceViewport(boardTop, scaledBoardHeight) {
    if (handIsBelowBoards()) return 0;
    if (!Number.isFinite(boardTop) || !Number.isFinite(scaledBoardHeight)) return 0;
    return Math.max(0, window.innerHeight - (boardTop + scaledBoardHeight) - 20);
  }

  // v0.12.10: original-DOM player boards in a normal-flow four-column row.
  // Important DOM finding from runtime inspection: .cards-wrapper is inside
  // .player-board-holder, not a sibling of .player-board-holder. Therefore the
  // previous player-board-wrapper grid could not move cards to the right.
  // This version keeps DOM nodes in place and uses only inline layout styles:
  //   .player-board-holder is the local positioning context
  //   .agricola-player-board stays at the left
  //   .cards-wrapper is absolutely positioned to the right of the farm board
  //   cards-wrapper itself is a two-column grid: occupations / improvements
  AC.layoutOriginalPlayerBoards = function layoutOriginalPlayerBoards() {
    AC.applyVars();

    // Remove stale inline styles from older fixed-bottom / grid prototypes before
    // measuring BGA's natural sizes.
    AC.restoreOriginalPlayerBoards?.();

    const root = document.querySelector('#player-boards');
    if (!root || !document.documentElement.classList.contains('bga-agri-v10-open')) return;

    const boards = AC.dom.findPlayerBoards ? AC.dom.findPlayerBoards(root) : [...root.querySelectorAll('.player-board-resizable')];
    const columnCount = 4;
    const playerTargetW = Math.max(1, window.innerWidth / columnCount);
    const farmRatio = 0.67;
    const farmTargetW = playerTargetW * farmRatio;
    const cardTargetW = playerTargetW - farmTargetW;

    boards.forEach(board => {
      if (!board.dataset.bgaAgriV11OriginalStyle) {
        board.dataset.bgaAgriV11OriginalStyle = board.getAttribute('style') || '';
      }
      const wrapper = board.querySelector(':scope > .player-board-wrapper') || board.querySelector('.player-board-wrapper');
      if (wrapper && !wrapper.dataset.bgaAgriV11OriginalStyle) {
        wrapper.dataset.bgaAgriV11OriginalStyle = wrapper.getAttribute('style') || '';
      }
      if (!wrapper) return;

      const holder = wrapper.querySelector('.player-board-holder');
      const farm = holder?.querySelector('.agricola-player-board');
      const cards = holder?.querySelector('.cards-wrapper') || wrapper.querySelector('.cards-wrapper') || board.querySelector('.cards-wrapper');
      const resourcesBar = holder?.querySelector('.resources-bar-holder');
      const playerPanel = resourcesBar?.querySelector('.agricola-player-pannel');
      const primaryResources = resourcesBar?.querySelector('.player-panel-resources');
      const boardResources = resourcesBar?.querySelector('.player-panel-board-resources');
      const personalResources = resourcesBar?.querySelector('.player-panel-personal-resources');
      if (!holder || !farm) return;

      [resourcesBar, playerPanel, primaryResources, boardResources, personalResources].forEach(el => {
        if (el && !el.dataset.bgaAgriV1224OriginalStyle) {
          el.dataset.bgaAgriV1224OriginalStyle = el.getAttribute('style') || '';
        }
      });

      if (!holder.dataset.bgaAgriV1210OriginalStyle) {
        holder.dataset.bgaAgriV1210OriginalStyle = holder.getAttribute('style') || '';
      }
      if (cards && !cards.dataset.bgaAgriV1210OriginalStyle) {
        cards.dataset.bgaAgriV1210OriginalStyle = cards.getAttribute('style') || '';
      }

      // The farm board is the actual 5x3 farm board, not the whole holder. This
      // is the correct width to reserve for the left column. The holder also
      // contains resources and cards, so using holder width made the card column
      // calculation wrong.
      const farmW = Math.max(farm.scrollWidth || 0, farm.offsetWidth || 0, farm.getBoundingClientRect().width || 0, 1);
      const scale = Math.max(0.05, farmTargetW / farmW);
      const sideW = cards ? Math.max(1, cardTargetW / scale) : 0;
      const cardColumnW = cards ? Math.max(1, sideW / 2) : 0;

      // Compute the unscaled height needed by the holder excluding cards in their
      // original below-farm flow. The cards will become absolute, so they should
      // not keep inflating the board's normal-flow height.
      const nonCardBottom = [...holder.children]
        .filter(child => child !== cards)
        .reduce((bottom, child) => Math.max(bottom, (child.offsetTop || 0) + (child.offsetHeight || 0)), 0);
      const originalFarmTop = Math.max(0, farm.offsetTop || 0);
      const farmH = Math.max(farm.scrollHeight || 0, farm.offsetHeight || 0, farm.getBoundingClientRect().height || 0, 1);

      // v0.12.26: first row is outside the original BGA resource frame and is not
      // rearranged. Use the native .agricola-player-pannel as the frame for two
      // lower rows only: row A = personal pieces + animals, row B = resources.
      const rowNaturalH = Math.max(
        primaryResources?.offsetHeight || 0,
        boardResources?.offsetHeight || 0,
        personalResources?.offsetHeight || 0,
        Math.ceil(originalFarmTop / 2),
        18
      );
      const infoRowScale = 2;
      const rowH = Math.ceil(rowNaturalH * infoRowScale);
      const panelH = rowH * 2;
      const cardBandTop = 0;
      const cardBandH = Math.max(1, panelH + farmH);
      const holderW = farmW + sideW;
      // 農莊底部柵欄通常以 position:absolute 向下延伸，不被 offsetHeight 計入；
      // 加入 fenceOverhang 緩衝確保柵欄不被 holder/board 的固定高度截斷。
      const fenceOverhang = 20;
      const holderH = Math.max(nonCardBottom, cardBandH, 1) + fenceOverhang;
      const scaledH = Math.ceil(holderH * scale);
      const lowerSpaceViewport = playedCardLowerSpaceViewport(board.getBoundingClientRect().top, scaledH);
      const lowerSpaceUnscaled = lowerSpaceViewport / Math.max(scale, 0.05);

      board.style.setProperty('width', '100%', 'important');
      board.style.setProperty('height', `${scaledH}px`, 'important');
      board.style.setProperty('min-width', '0', 'important');
      board.style.setProperty('min-height', '0', 'important');
      board.style.setProperty('margin', '0', 'important');
      board.style.setProperty('padding', '0', 'important');
      board.style.setProperty('position', 'relative', 'important');
      board.style.setProperty('overflow', 'visible', 'important');
      board.style.setProperty('box-sizing', 'border-box', 'important');

      wrapper.style.setProperty('display', 'block', 'important');
      wrapper.style.setProperty('position', 'absolute', 'important');
      wrapper.style.setProperty('left', '0px', 'important');
      wrapper.style.setProperty('top', '0px', 'important');
      wrapper.style.setProperty('width', `${holderW}px`, 'important');
      wrapper.style.setProperty('height', `${holderH}px`, 'important');
      wrapper.style.setProperty('transform', `scale(${scale})`, 'important');
      wrapper.style.setProperty('transform-origin', 'top left', 'important');
      wrapper.style.setProperty('overflow', 'visible', 'important');
      wrapper.style.setProperty('margin', '0', 'important');
      wrapper.style.setProperty('padding', '0', 'important');
      if (cards) {
        // BGA mini cards derive their size from these custom properties. Without
        // shrinking them, two 15%-wide columns overlap even if the wrapper itself
        // is correctly positioned to the right.
        wrapper.style.setProperty('--agricolaCardWidth', `${cardColumnW}px`);
        wrapper.style.setProperty('--agricolaCardHeight', `${cardColumnW * 1.591}px`);
        wrapper.style.setProperty('--agricolaCardScale', `${cardColumnW / 235}`);
      }

      holder.style.setProperty('display', 'block', 'important');
      holder.style.setProperty('position', 'relative', 'important');
      holder.style.setProperty('left', '0px', 'important');
      holder.style.setProperty('top', '0px', 'important');
      holder.style.setProperty('width', `${holderW}px`, 'important');
      holder.style.setProperty('height', `${holderH}px`, 'important');
      holder.style.setProperty('margin', '0', 'important');
      holder.style.setProperty('padding', '0', 'important');
      holder.style.setProperty('overflow', 'visible', 'important');
      holder.style.setProperty('box-sizing', 'border-box', 'important');

      if (resourcesBar && playerPanel) {
        const personalW = farmW * 0.52;
        const animalsW = farmW - personalW;

        // Constrain the whole native header/panel to the farm-board width.
        // Vertical overflow stays visible so BGA's original first row, which may
        // sit above the panel, is not clipped. Horizontal clip keeps it out of cards.
        resourcesBar.style.setProperty('display', 'block', 'important');
        resourcesBar.style.setProperty('position', 'relative', 'important');
        resourcesBar.style.setProperty('left', '0px', 'important');
        resourcesBar.style.setProperty('top', '0px', 'important');
        resourcesBar.style.setProperty('width', `${farmW}px`, 'important');
        resourcesBar.style.setProperty('height', `${panelH}px`, 'important');
        resourcesBar.style.setProperty('margin', '0', 'important');
        resourcesBar.style.setProperty('padding', '0', 'important');
        resourcesBar.style.setProperty('overflow', 'visible', 'important');
        resourcesBar.style.setProperty('clip-path', 'inset(-9999px 0 -9999px 0)', 'important');
        resourcesBar.style.setProperty('box-sizing', 'border-box', 'important');

        // Keep the native BGA frame. It now frames exactly the two lower rows.
        playerPanel.style.setProperty('display', 'block', 'important');
        playerPanel.style.setProperty('position', 'relative', 'important');
        playerPanel.style.setProperty('left', '0px', 'important');
        playerPanel.style.setProperty('top', '0px', 'important');
        playerPanel.style.setProperty('width', `${farmW}px`, 'important');
        playerPanel.style.setProperty('height', `${panelH}px`, 'important');
        playerPanel.style.setProperty('margin', '0', 'important');
        playerPanel.style.setProperty('padding', '0', 'important');
        playerPanel.style.setProperty('overflow', 'visible', 'important');
        playerPanel.style.setProperty('box-sizing', 'border-box', 'important');

        if (personalResources) {
          personalResources.style.setProperty('display', 'flex', 'important');
          personalResources.style.setProperty('position', 'absolute', 'important');
          personalResources.style.setProperty('left', '0px', 'important');
          personalResources.style.setProperty('top', '0px', 'important');
          personalResources.style.setProperty('width', `${personalW / infoRowScale}px`, 'important');
          personalResources.style.setProperty('height', `${rowH / infoRowScale}px`, 'important');
          personalResources.style.setProperty('margin', '0', 'important');
          personalResources.style.setProperty('padding', '0', 'important');
          personalResources.style.setProperty('gap', '0', 'important');
          personalResources.style.setProperty('flex-wrap', 'nowrap', 'important');
          personalResources.style.setProperty('align-items', 'center', 'important');
          personalResources.style.setProperty('justify-content', 'flex-start', 'important');
          personalResources.style.setProperty('overflow', 'visible', 'important');
          personalResources.style.setProperty('transform', `scale(${infoRowScale})`, 'important');
          personalResources.style.setProperty('transform-origin', 'top left', 'important');
          personalResources.style.setProperty('box-sizing', 'border-box', 'important');
        }

        if (boardResources) {
          boardResources.style.setProperty('display', 'flex', 'important');
          boardResources.style.setProperty('position', 'absolute', 'important');
          boardResources.style.setProperty('left', `${personalW}px`, 'important');
          boardResources.style.setProperty('top', '0px', 'important');
          boardResources.style.setProperty('width', `${animalsW / infoRowScale}px`, 'important');
          boardResources.style.setProperty('height', `${rowH / infoRowScale}px`, 'important');
          boardResources.style.setProperty('margin', '0', 'important');
          boardResources.style.setProperty('padding', '0', 'important');
          boardResources.style.setProperty('gap', '0', 'important');
          boardResources.style.setProperty('flex-wrap', 'nowrap', 'important');
          boardResources.style.setProperty('align-items', 'center', 'important');
          boardResources.style.setProperty('justify-content', 'flex-end', 'important');
          boardResources.style.setProperty('overflow', 'visible', 'important');
          boardResources.style.setProperty('transform', `scale(${infoRowScale})`, 'important');
          boardResources.style.setProperty('transform-origin', 'top left', 'important');
          boardResources.style.setProperty('box-sizing', 'border-box', 'important');
        }

        if (primaryResources) {
          primaryResources.style.setProperty('display', 'flex', 'important');
          primaryResources.style.setProperty('position', 'absolute', 'important');
          primaryResources.style.setProperty('left', '0px', 'important');
          primaryResources.style.setProperty('top', `${rowH}px`, 'important');
          primaryResources.style.setProperty('width', `${farmW / infoRowScale}px`, 'important');
          primaryResources.style.setProperty('height', `${rowH / infoRowScale}px`, 'important');
          primaryResources.style.setProperty('margin', '0', 'important');
          primaryResources.style.setProperty('padding', '0', 'important');
          primaryResources.style.setProperty('gap', '0', 'important');
          primaryResources.style.setProperty('flex-wrap', 'nowrap', 'important');
          primaryResources.style.setProperty('align-items', 'center', 'important');
          primaryResources.style.setProperty('justify-content', 'space-between', 'important');
          primaryResources.style.setProperty('overflow', 'visible', 'important');
          primaryResources.style.setProperty('transform', `scale(${infoRowScale})`, 'important');
          primaryResources.style.setProperty('transform-origin', 'top left', 'important');
          primaryResources.style.setProperty('box-sizing', 'border-box', 'important');
        }
      }

      if (cards) {
        // v0.12.11: stack cards precisely inside the vertical band that matches
        // the farm board: from the farm board's top edge to its bottom edge,
        // including the fenceOverhang buffer so cards align with the actual
        // visible bottom of the farm (fences included).
        cards.style.setProperty('display', 'block', 'important');
        cards.style.setProperty('position', 'absolute', 'important');
        cards.style.setProperty('left', `${farmW}px`, 'important');
        cards.style.setProperty('top', `${cardBandTop}px`, 'important');
        cards.style.setProperty('width', `${sideW}px`, 'important');
        const cardsH = holderH + lowerSpaceUnscaled;
        cards.style.setProperty('height', `${cardsH}px`, 'important');
        cards.style.setProperty('margin', '0', 'important');
        cards.style.setProperty('padding', '0', 'important');
        cards.style.setProperty('overflow', 'visible', 'important');
        cards.style.setProperty('box-sizing', 'border-box', 'important');

        const allCards = [...cards.querySelectorAll(':scope > .player-card')];
        const occupationCards = allCards.filter(card => card.classList.contains('occupation'));
        const improvementCards = allCards.filter(card => !card.classList.contains('occupation'));
        const colW = Math.max(1, cardColumnW);
        const cardH = Math.max(1, cardColumnW);
        const availableH = Math.max(1, cardsH);

        const stackColumn = (list, columnIndex) => {
          const n = list.length;
          const step = n <= 1
            ? 0
            : Math.max(0, Math.min(cardH, (availableH - cardH) / (n - 1)));
          const overlap = n <= 1 ? 0 : Math.max(0, cardH - step);
          const overlapRatio = n <= 1 ? 0 : Math.max(0, Math.min(1, overlap / cardH));

          list.forEach((card, index) => {
            AC.originalUiHand?.clearHandLayoutFromCard?.(card);
            if (!card.dataset.bgaAgriV1211OriginalStyle) {
              card.dataset.bgaAgriV1211OriginalStyle = card.getAttribute('style') || '';
            }
            card.dataset.bgaAgriV1211Stack = JSON.stringify({
              n,
              step: Math.round(step * 100) / 100,
              overlapRatio: Math.round(overlapRatio * 10000) / 10000
            });
            card.style.setProperty('position', 'absolute', 'important');
            card.style.setProperty('left', `${columnIndex * colW}px`, 'important');
            card.style.setProperty('top', `${index * step}px`, 'important');
            card.style.setProperty('width', `${colW}px`, 'important');
            card.style.setProperty('height', `${cardH}px`, 'important');
            card.style.setProperty('margin', '0', 'important');
            card.style.setProperty('padding', '0', 'important');
            card.style.setProperty('overflow', 'visible', 'important');
            card.style.setProperty('box-sizing', 'border-box', 'important');
            card.style.setProperty('z-index', `${10 + index}`, 'important');
            card.style.setProperty('--bga-agri-v10-card-title-font-size', `${cardTitleFontSize(card, colW, scale)}px`);
            card.style.setProperty('--bga-agri-v10-card-title-width', `${colW}px`);
          });
        };

        stackColumn(occupationCards, 0);
        stackColumn(improvementCards, 1);
      }
    });

    requestAnimationFrame(() => AC.positionToolbarAboveOriginalBoards?.());
  };

  AC.positionToolbarAboveOriginalBoards = function positionToolbarAboveOriginalBoards() {
    const panel = document.getElementById(AC.IDS.panel);
    const root = document.querySelector('#player-boards');
    if (!panel || !root || !document.documentElement.classList.contains('bga-agri-v10-open')) return;
    const rect = root.getBoundingClientRect();
    if (!Number.isFinite(rect.top)) return;
    const bottom = Math.max(0, Math.round(window.innerHeight - rect.top + 12));
    panel.style.setProperty('bottom', `${bottom}px`, 'important');
    AC.positionToggle?.();
  };

  AC.restoreOriginalPlayerBoards = function restoreOriginalPlayerBoards() {
    const root = document.querySelector('#player-boards');
    if (!root) return;

    const restoreStyle = (el, key) => {
      if (!el || el.dataset[key] === undefined) return;
      const old = el.dataset[key];
      if (old) el.setAttribute('style', old);
      else el.removeAttribute('style');
      delete el.dataset[key];
    };

    [
      'bgaAgriV11OriginalStyle',
      'bgaAgriV127OriginalStyle',
      'bgaAgriV1210OriginalStyle',
      'bgaAgriV1211OriginalStyle',
      'bgaAgriV1224OriginalStyle'
    ].forEach(key => {
      root.querySelectorAll('*').forEach(el => restoreStyle(el, key));
      restoreStyle(root, key);
    });

    root.querySelectorAll('[data-bga-agri-v1211-stack]').forEach(card => {
      delete card.dataset.bgaAgriV1211Stack;
    });

    const boards = AC.dom.findPlayerBoards ? AC.dom.findPlayerBoards(root) : [...root.querySelectorAll('.player-board-resizable')];
    boards.forEach(board => {
      if (board.dataset.bgaAgriV11OriginalStyle !== undefined) {
        const old = board.dataset.bgaAgriV11OriginalStyle;
        if (old) board.setAttribute('style', old);
        else board.removeAttribute('style');
        delete board.dataset.bgaAgriV11OriginalStyle;
      }
      delete board.dataset.bgaAgriV11BaseW;
      delete board.dataset.bgaAgriV11BaseH;
      delete board.dataset.bgaAgriV113BaseW;
      delete board.dataset.bgaAgriV113BaseH;
      delete board.dataset.bgaAgriV122BaseW;
      delete board.dataset.bgaAgriV122BaseH;
      delete board.dataset.bgaAgriV127BaseW;
      delete board.dataset.bgaAgriV127BaseH;
      delete board.dataset.bgaAgriV128BaseW;
      delete board.dataset.bgaAgriV128BaseH;
      delete board.dataset.bgaAgriV129BaseW;
      delete board.dataset.bgaAgriV129BaseH;

      const wrapper = board.querySelector(':scope > .player-board-wrapper');
      if (wrapper?.dataset.bgaAgriV11OriginalStyle !== undefined) {
        const old = wrapper.dataset.bgaAgriV11OriginalStyle;
        if (old) wrapper.setAttribute('style', old);
        else wrapper.removeAttribute('style');
        delete wrapper.dataset.bgaAgriV11OriginalStyle;
      }
      const holder = wrapper?.querySelector('.player-board-holder');
      if (holder?.dataset.bgaAgriV127OriginalStyle !== undefined) {
        const old = holder.dataset.bgaAgriV127OriginalStyle;
        if (old) holder.setAttribute('style', old);
        else holder.removeAttribute('style');
        delete holder.dataset.bgaAgriV127OriginalStyle;
      }
      if (holder?.dataset.bgaAgriV1210OriginalStyle !== undefined) {
        const old = holder.dataset.bgaAgriV1210OriginalStyle;
        if (old) holder.setAttribute('style', old);
        else holder.removeAttribute('style');
        delete holder.dataset.bgaAgriV1210OriginalStyle;
      }
      const cards = holder?.querySelector('.cards-wrapper') || wrapper?.querySelector('.cards-wrapper') || board.querySelector('.cards-wrapper');
      if (cards?.dataset.bgaAgriV127OriginalStyle !== undefined) {
        const old = cards.dataset.bgaAgriV127OriginalStyle;
        if (old) cards.setAttribute('style', old);
        else cards.removeAttribute('style');
        delete cards.dataset.bgaAgriV127OriginalStyle;
      }
      if (cards?.dataset.bgaAgriV1210OriginalStyle !== undefined) {
        const old = cards.dataset.bgaAgriV1210OriginalStyle;
        if (old) cards.setAttribute('style', old);
        else cards.removeAttribute('style');
        delete cards.dataset.bgaAgriV1210OriginalStyle;
      }
      cards?.querySelectorAll(':scope > .player-card').forEach(card => {
        if (card.dataset.bgaAgriV1211OriginalStyle !== undefined) {
          const old = card.dataset.bgaAgriV1211OriginalStyle;
          if (old) card.setAttribute('style', old);
          else card.removeAttribute('style');
          delete card.dataset.bgaAgriV1211OriginalStyle;
        }
        delete card.dataset.bgaAgriV1211Stack;
      });
      [
        holder?.querySelector('.resources-bar-holder'),
        holder?.querySelector('.agricola-player-pannel'),
        holder?.querySelector('.player-panel-resources'),
        holder?.querySelector('.player-panel-board-resources'),
        holder?.querySelector('.player-panel-personal-resources')
      ].forEach(el => {
        if (el?.dataset.bgaAgriV1224OriginalStyle !== undefined) {
          const old = el.dataset.bgaAgriV1224OriginalStyle;
          if (old) el.setAttribute('style', old);
          else el.removeAttribute('style');
          delete el.dataset.bgaAgriV1224OriginalStyle;
        }
      });
    });
  };

})();
