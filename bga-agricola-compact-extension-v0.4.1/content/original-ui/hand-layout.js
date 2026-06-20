(() => {
  const AC = window.AgriCompact;
  if (!AC) return;
  const models = AC.originalUiModels || {};
  const cardText = AC.originalUiCardText || {};

  function restoreHandAncestors() {
    document.querySelectorAll('[data-bga-agri-v10-hand-ancestor="1"]').forEach(el => {
      const oldStyle = el.dataset.bgaAgriV10HandAncestorOriginalStyle;
      if (oldStyle !== undefined) {
        if (oldStyle) el.setAttribute('style', oldStyle);
        else el.removeAttribute('style');
        delete el.dataset.bgaAgriV10HandAncestorOriginalStyle;
      }
      delete el.dataset.bgaAgriV10HandAncestor;
    });
  }

  function restoreHandBoardGap() {
    const playerBoards = document.querySelector('#player-boards');
    if (playerBoards?.dataset.bgaAgriV10HandGapOriginalStyle !== undefined) {
      const old = playerBoards.dataset.bgaAgriV10HandGapOriginalStyle;
      if (old) playerBoards.setAttribute('style', old);
      else playerBoards.removeAttribute('style');
      delete playerBoards.dataset.bgaAgriV10HandGapOriginalStyle;
    }
    document.querySelectorAll('[data-bga-agri-v10-hand-board-gap-original-style]').forEach(el => {
      const old = el.dataset.bgaAgriV10HandBoardGapOriginalStyle;
      if (old) el.setAttribute('style', old);
      else el.removeAttribute('style');
      delete el.dataset.bgaAgriV10HandBoardGapOriginalStyle;
    });
    document.querySelectorAll('[data-bga-agri-v10-hand-clip-original-style]').forEach(el => {
      const old = el.dataset.bgaAgriV10HandClipOriginalStyle;
      if (old) el.setAttribute('style', old);
      else el.removeAttribute('style');
      delete el.dataset.bgaAgriV10HandClipOriginalStyle;
    });
  }

  function prepareHandAncestors(handContainer) {
    const leftColumn = handContainer?.closest('#player-boards-left-column');
    if (!leftColumn) return;
    if (leftColumn.dataset.bgaAgriV10HandAncestorOriginalStyle === undefined) {
      leftColumn.dataset.bgaAgriV10HandAncestorOriginalStyle = leftColumn.getAttribute('style') || '';
    }
    leftColumn.dataset.bgaAgriV10HandAncestor = '1';
    leftColumn.style.setProperty('display', 'block', 'important');
    leftColumn.style.setProperty('position', 'absolute', 'important');
    leftColumn.style.setProperty('left', '0px', 'important');
    leftColumn.style.setProperty('top', '0px', 'important');
    leftColumn.style.setProperty('width', '0px', 'important');
    leftColumn.style.setProperty('height', '0px', 'important');
    leftColumn.style.setProperty('overflow', 'visible', 'important');
    leftColumn.style.setProperty('pointer-events', 'none', 'important');
    leftColumn.style.setProperty('z-index', '120', 'important');
  }

  function clearHandLayoutFromCard(card, options = {}) {
    if (!card) return;
    const props = [
      'position',
      'left',
      'top',
      'margin',
      'padding',
      'overflow',
      'box-sizing',
      'z-index',
      'transform',
      'transform-origin'
    ];
    if (!options.preserveTitleVars) {
      props.push(
        '--bga-agri-v10-card-title-font-size',
        '--bga-agri-v10-card-title-width'
      );
    }
    props.forEach(prop => card.style.removeProperty(prop));
    delete card.dataset.bgaAgriV10HandOriginalStyle;
  }

  function cleanupFormerHandCards() {
    document.querySelectorAll('.player-card[data-bga-agri-v10-hand-original-style]').forEach(card => {
      if (!card.closest('#hand-container')) clearHandLayoutFromCard(card, { preserveTitleVars: true });
    });
  }

  function scrubCompactHandInlineStyle(handContainer) {
    if (!handContainer) return;
    const wasManaged = handContainer.dataset.bgaAgriV10HandFixed === '1' ||
      handContainer.dataset.bgaAgriV10OriginalStyle !== undefined ||
      handContainer.querySelector('[data-bga-agri-v10-hand-original-style]') ||
      handContainer.querySelector(':scope > .player-card[style*="transform"]');

    if (!wasManaged) return;

    [
      'position',
      'display',
      'left',
      'top',
      'width',
      'height',
      'z-index',
      'background',
      'margin',
      'padding',
      'gap',
      'overflow',
      'pointer-events',
      '--agricolaCardWidth',
      '--agricolaCardHeight',
      '--agricolaCardScale'
    ].forEach(prop => handContainer.style.removeProperty(prop));

    handContainer.querySelectorAll(':scope > .player-card').forEach(clearHandLayoutFromCard);

    delete handContainer.dataset.bgaAgriV10HandFixed;
    delete handContainer.dataset.bgaAgriV10OriginalParentId;
  }

  function handDisplayMode(handContainer) {
    const pref108 = document.querySelector('#preference_control_108')?.value;
    const isModal = pref108 === '0' ||
                    handContainer.closest('#popin_showHand_contents') !== null ||
                    handContainer.closest('.agricola_popin') !== null;
    if (isModal) return 'modal';

    // BGA also supports board-bottom and screen-bottom hand positions. Until the
    // screen-bottom variant gets its own compact layout, treat both non-modal
    // modes as central-board anchored hands.
    return 'board-anchored';
  }

  function chooseHandContainer() {
    const pref108 = document.querySelector('#preference_control_108')?.value;
    const selectors = pref108 === '1'
      ? [
          '#player-boards #player-boards-left-column #hand-container',
          '#player-boards #hand-container',
          '#alternative-hand-wrapper #hand-container',
          '#hand-container'
        ]
      : [
          '#alternative-hand-wrapper #hand-container',
          '#player-boards #player-boards-left-column #hand-container',
          '#player-boards #hand-container',
          '#hand-container'
        ];

    const seen = new Set();
    const candidates = selectors
      .flatMap(selector => [...document.querySelectorAll(selector)])
      .filter(el => {
        if (seen.has(el)) return false;
        seen.add(el);
        if (el.closest(`#${AC.IDS.panel}, #${AC.IDS.zoom}`)) return false;
        return true;
      });

    return candidates.find(el => el.querySelector(':scope > .player-card')) || candidates[0] || null;
  }

  function mergeRects(rects, fallback) {
    const visibleRects = rects.filter(r => r && r.width > 0 && r.height > 0);
    if (!visibleRects.length) return fallback;

    const left = Math.min(...visibleRects.map(r => r.left));
    const top = Math.min(...visibleRects.map(r => r.top));
    const right = Math.max(...visibleRects.map(r => r.right));
    const bottom = Math.max(...visibleRects.map(r => r.bottom));
    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top
    };
  }

  function getPlayerBoardsVisualRect(playerBoards) {
    if (!playerBoards) return null;
    const fallback = playerBoards.getBoundingClientRect();
    const boardRoots = [...playerBoards.querySelectorAll(':scope > .player-board-resizable')];
    const nodes = boardRoots.flatMap(board => [
      board,
      ...board.querySelectorAll('.player-board-wrapper'),
      ...board.querySelectorAll('.player-board-holder'),
      ...board.querySelectorAll('.agricola-player-board'),
      ...board.querySelectorAll('.cards-wrapper')
    ]);

    return mergeRects(nodes.map(el => el.getBoundingClientRect()), fallback);
  }

  function getTopStatusHeight() {
    const status = document.querySelector('#page-title') ||
      document.querySelector('#pagemaintitle_wrap') ||
      document.querySelector('#gameaction_status');
    const rect = status?.getBoundingClientRect();
    return rect && rect.height > 0 ? rect.height : 0;
  }

  function reserveHandClipSpace(handViewportBottom) {
    const overall = document.querySelector('#overall-content');
    if (!overall || !Number.isFinite(handViewportBottom)) return;
    if (overall.dataset.bgaAgriV10HandClipOriginalStyle === undefined) {
      overall.dataset.bgaAgriV10HandClipOriginalStyle = overall.getAttribute('style') || '';
    }
    const overallRect = overall.getBoundingClientRect();
    const neededH = Math.ceil(handViewportBottom - overallRect.top + 8);
    if (neededH > 0) {
      overall.style.setProperty('min-height', `${neededH}px`, 'important');
    }
  }

  function layoutHandCards() {
    const central = document.querySelector('#central-board');
    if (!central) return;
    cleanupFormerHandCards();

    // Keep the native hand DOM in its original BGA parent. Do not append it to
    // #central-board; position it visually with page coordinates so it scrolls
    // with the central board instead of floating in the viewport.
    const handContainer = chooseHandContainer();
    if (!handContainer) return;

    // Do not touch modal/popin hand mode. Non-modal BGA hand positions share
    // the compact central-board anchored layout for now.
    if (handDisplayMode(handContainer) === 'modal') {
      restoreHandCards();
      return;
    }

    const allCards = [...handContainer.querySelectorAll(':scope > .player-card')];
    if (!allCards.length) {
      restoreHandBoardGap();
      scrubCompactHandInlineStyle(handContainer);
      return;
    }

    prepareHandAncestors(handContainer);

    if (!handContainer.dataset.bgaAgriV10OriginalStyle) {
      handContainer.dataset.bgaAgriV10OriginalStyle = handContainer.getAttribute('style') || '';
    }
    handContainer.dataset.bgaAgriV10HandFixed = '1';

    const centralRect = central.getBoundingClientRect();
    // Anchor the hand area to central-board features, then translate that
    // viewport target into the hand container's absolute-positioning context.
    // Required visual anchors:
    //   left edge = left edge of round 8
    //   right edge = right edge of round 14
    //   top edge  = bottom edge of round 9 / harvest-slot-9
    const round8Bg = document.querySelector('#bga-agri-v10-round-bg-layer .bga-agri-v10-round-bg-tile[data-round="8"]');
    const round14Bg = document.querySelector('#bga-agri-v10-round-bg-layer .bga-agri-v10-round-bg-tile[data-round="14"]');
    const turn8 = document.getElementById('turn_8');
    const turn14 = document.getElementById('turn_14');
    const harvest9 = document.getElementById('harvest-slot-9');
    const turn9 = document.getElementById('turn_9');

    const targetViewportLeft = round8Bg?.getBoundingClientRect().left ??
                               turn8?.getBoundingClientRect().left ??
                               (centralRect.left + 657 * (centralRect.width / (central.offsetWidth || 1320) || 1));
    const targetViewportRight = round14Bg?.getBoundingClientRect().right ??
                                turn14?.getBoundingClientRect().right ??
                                centralRect.right;
    const targetViewportTop = harvest9?.getBoundingClientRect().bottom ??
                              turn9?.getBoundingClientRect().bottom ??
                              (centralRect.top + 334 * (centralRect.height / (central.offsetHeight || 620) || 1));

    let availableW = targetViewportRight - targetViewportLeft;
    if (Number.isNaN(availableW) || !Number.isFinite(availableW)) availableW = 630;
    availableW = Math.max(120, availableW);

    const wrapper = document.querySelector('.player-board-wrapper');
    const sourceStyle = wrapper ? getComputedStyle(wrapper) : getComputedStyle(document.documentElement);
    const varW = parseFloat(sourceStyle.getPropertyValue('--agricolaCardWidth'));
    const varH = parseFloat(sourceStyle.getPropertyValue('--agricolaCardHeight'));
    const varScale = parseFloat(sourceStyle.getPropertyValue('--agricolaCardScale'));

    const cardW = (Number.isFinite(varW) && varW > 50) ? varW : 211.5;
    const cardH = (Number.isFinite(varH) && varH > 50) ? varH : 336.6;
    const cardScaleVal = (Number.isFinite(varScale) && varScale > 0.1) ? varScale : 0.72;

    handContainer.style.setProperty('--agricolaCardWidth', `${cardW}px`);
    handContainer.style.setProperty('--agricolaCardHeight', `${cardH}px`);
    handContainer.style.setProperty('--agricolaCardScale', `${cardScaleVal}`);

    const occupationCards = allCards.filter(card => card.classList.contains('occupation'));
    const improvementCards = allCards.filter(card => !card.classList.contains('occupation'));

    let handModelInput = {
      targetViewportLeft,
      targetViewportRight,
      targetViewportTop,
      centralBottom: centralRect.bottom,
      topStatusHeight: getTopStatusHeight(),
      centralHeight: centralRect.height,
      viewportHeight: window.innerHeight,
      rightEdge: window.innerWidth,
      cardCount: allCards.length,
      cardW,
      cardH
    };

    const playerBoards = document.querySelector('#player-boards');
    if (playerBoards) {
      const boardsRect = getPlayerBoardsVisualRect(playerBoards);
      const rightSideRect = (document.querySelector('#right-side') || document.querySelector('#right-side-second-part'))?.getBoundingClientRect();
      handModelInput = Object.assign(handModelInput, {
        boardsLeft: boardsRect.left,
        boardsHeight: boardsRect.height,
        boardsViewportBottom: boardsRect.bottom,
        rightEdge: rightSideRect?.left || window.innerWidth
      });
    }
    const handModel = models.computeHandLayout(handModelInput);
    const {
      mode: handLayoutMode,
      cardScale,
      scaledCardW,
      scaledCardH,
      handViewportLeft,
      handAvailableW,
      handHeight,
      slotW
    } = handModel;
    let handViewportTop = handModel.handViewportTop;
    const rowHeight = scaledCardH;
    if (handLayoutMode === 'below-boards-row') {
      restoreHandBoardGap();
      reserveHandClipSpace(handViewportTop + handHeight);
    }
    handContainer.dataset.bgaAgriV10HandLayoutMode = handLayoutMode;

    handContainer.style.setProperty('position', 'absolute', 'important');
    handContainer.style.setProperty('display', 'block', 'important');
    handContainer.style.setProperty('left', '0px', 'important');
    handContainer.style.setProperty('top', '0px', 'important');

    const zeroRect = handContainer.getBoundingClientRect();
    const targetLeft = handViewportLeft - zeroRect.left;
    const targetTop = handViewportTop - zeroRect.top;

    handContainer.style.setProperty('left', `${targetLeft}px`, 'important');
    handContainer.style.setProperty('top', `${targetTop}px`, 'important');
    handContainer.style.setProperty('width', `${handAvailableW}px`, 'important');
    handContainer.style.setProperty('height', `${handHeight}px`, 'important');
    handContainer.style.setProperty('z-index', '100', 'important');
    handContainer.style.setProperty('background', 'transparent', 'important');
    handContainer.style.setProperty('margin', '0', 'important');
    handContainer.style.setProperty('padding', '0', 'important');
    handContainer.style.setProperty('gap', '0', 'important');
    handContainer.style.setProperty('overflow', 'visible', 'important');
    handContainer.style.setProperty('pointer-events', 'auto', 'important');

    const isRightSideHand = handLayoutMode === 'right-two-row' || handLayoutMode === 'right-one-row';
    if (playerBoards && isRightSideHand && !handContainer.closest('#player-boards')) {
      const gapTargets = [playerBoards];
      const firstGapTarget = gapTargets[0];
      const currentMarginTop = parseFloat(firstGapTarget?.style.marginTop) || 0;
      const naturalBoardsTop = (firstGapTarget?.getBoundingClientRect().top ?? playerBoards.getBoundingClientRect().top) - currentMarginTop;
      const neededGap = Math.max(0, handViewportTop + handHeight + 8 - naturalBoardsTop);
      gapTargets.forEach(el => {
        if (!el) return;
        if (el === playerBoards) {
          if (el.dataset.bgaAgriV10HandGapOriginalStyle === undefined) {
            el.dataset.bgaAgriV10HandGapOriginalStyle = el.getAttribute('style') || '';
          }
        } else if (el.dataset.bgaAgriV10HandBoardGapOriginalStyle === undefined) {
          el.dataset.bgaAgriV10HandBoardGapOriginalStyle = el.getAttribute('style') || '';
        }
        el.style.setProperty('margin-top', `${Math.ceil(neededGap)}px`, 'important');
      });
    }

    const stackRow = (list, rowIndex) => {
      const n = list.length;
      const stepX = n <= 1
        ? 0
        : Math.max(0, Math.min(slotW, (handAvailableW - scaledCardW) / (n - 1)));

      list.forEach((card, index) => {
        if (!card.dataset.bgaAgriV10HandOriginalStyle) {
          card.dataset.bgaAgriV10HandOriginalStyle = card.getAttribute('style') || '';
        }
        card.style.setProperty('position', 'absolute', 'important');
        card.style.setProperty('left', `${index * stepX}px`, 'important');
        card.style.setProperty('top', `${rowIndex * rowHeight}px`, 'important');
        card.style.setProperty('margin', '0', 'important');
        card.style.setProperty('padding', '0', 'important');
        card.style.setProperty('overflow', 'visible', 'important');
        card.style.setProperty('box-sizing', 'border-box', 'important');
        card.style.setProperty('z-index', `${10 + index}`, 'important');
        card.style.setProperty('transform', `scale(${cardScale})`, 'important');
        card.style.setProperty('transform-origin', 'top left', 'important');

        // Hand cards are small enough that each row normally has enough width
        // for the usual 7 occupations / 7 improvements.  Size titles from the
        // full card width, matching the played-card logic beside player boards.
        card.style.setProperty('--bga-agri-v10-card-title-font-size', `${cardText.cardTitleFontSize(card, cardW, cardScale)}px`);
        card.style.setProperty('--bga-agri-v10-card-title-width', `${cardW}px`);
      });
    };

    if (handLayoutMode === 'below-boards-row' || handLayoutMode === 'right-one-row') {
      const allVisibleCards = [...occupationCards, ...improvementCards];
      const n = allVisibleCards.length;
      const stepX = n <= 1
        ? 0
        : Math.max(0, Math.min(handLayoutMode === 'right-one-row' ? slotW : scaledCardW + 8, (handAvailableW - scaledCardW) / (n - 1)));

      allVisibleCards.forEach((card, index) => {
        if (!card.dataset.bgaAgriV10HandOriginalStyle) {
          card.dataset.bgaAgriV10HandOriginalStyle = card.getAttribute('style') || '';
        }
        card.style.setProperty('position', 'absolute', 'important');
        card.style.setProperty('left', `${index * stepX}px`, 'important');
        card.style.setProperty('top', '0px', 'important');
        card.style.setProperty('margin', '0', 'important');
        card.style.setProperty('padding', '0', 'important');
        card.style.setProperty('overflow', 'visible', 'important');
        card.style.setProperty('box-sizing', 'border-box', 'important');
        card.style.setProperty('z-index', `${10 + index}`, 'important');
        card.style.setProperty('transform', `scale(${cardScale})`, 'important');
        card.style.setProperty('transform-origin', 'top left', 'important');
        card.style.setProperty('--bga-agri-v10-card-title-font-size', `${cardText.cardTitleFontSize(card, cardW, cardScale)}px`);
        card.style.setProperty('--bga-agri-v10-card-title-width', `${cardW}px`);
      });
    } else {
      stackRow(occupationCards, 0);
      stackRow(improvementCards, 1);
    }
  }

  function restoreHandCards() {
    document.querySelectorAll('[data-bga-agri-v10-hand-original-style]').forEach(card => {
      if (card.dataset.bgaAgriV10HandOriginalStyle !== undefined) {
        const old = card.dataset.bgaAgriV10HandOriginalStyle;
        if (old) card.setAttribute('style', old);
        else card.removeAttribute('style');
        delete card.dataset.bgaAgriV10HandOriginalStyle;
      }
    });

    const handContainers = new Set([
      ...document.querySelectorAll('#hand-container'),
      ...document.querySelectorAll('[data-bga-agri-v10-hand-fixed="1"]'),
      ...document.querySelectorAll('[data-bga-agri-v10-original-style]')
    ]);

    handContainers.forEach(handContainer => {
      const oldStyle = handContainer.dataset.bgaAgriV10OriginalStyle;
      if (oldStyle !== undefined) {
        if (oldStyle) handContainer.setAttribute('style', oldStyle);
        else handContainer.removeAttribute('style');
        delete handContainer.dataset.bgaAgriV10OriginalStyle;
      } else {
        scrubCompactHandInlineStyle(handContainer);
      }
      delete handContainer.dataset.bgaAgriV10HandFixed;
      delete handContainer.dataset.bgaAgriV10OriginalParentId;
      delete handContainer.dataset.bgaAgriV10HandLayoutMode;
    });

    restoreHandBoardGap();
    restoreHandAncestors();
  }

  AC.originalUiHand = {
    layoutHandCards,
    restoreHandCards,
    clearHandLayoutFromCard,
    cleanupFormerHandCards
  };
})();
