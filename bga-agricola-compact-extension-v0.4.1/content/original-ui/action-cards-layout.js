(() => {
  const AC = window.AgriCompact;
  if (!AC) return;
  const models = AC.originalUiModels || {};
  const styleState = AC.originalUiStyleState || {};
  const cardText = AC.originalUiCardText || {};

  function getTurnSize() {
    const t = document.querySelector('#turn_1');
    if (!t) return { width: 140, height: 140 };
    const cs = getComputedStyle(t);
    const width = parseFloat(cs.width) || t.getBoundingClientRect().width || 140;
    const height = parseFloat(cs.height) || t.getBoundingClientRect().height || 140;
    return { width, height };
  }

  function actionCardLayoutRects() {
    const central = document.querySelector('#central-board');
    if (!central) return null;

    const round14Bg = document.querySelector('#bga-agri-v10-round-bg-layer .bga-agri-v10-round-bg-tile[data-round="14"]');
    const turn14 = document.getElementById('turn_14');
    const anchorSource = round14Bg || turn14;
    if (!anchorSource) return null;

    const centralRect = central.getBoundingClientRect();
    const anchorRect = anchorSource.getBoundingClientRect();
    const turnRect = turn14?.getBoundingClientRect?.();
    const rightSideRect = (document.querySelector('#right-side') || document.querySelector('#right-side-second-part'))?.getBoundingClientRect();
    const rightLimit = rightSideRect?.left || window.innerWidth;
    const turnSize = getTurnSize();
    return models.computeActionCardRegion?.({
      centralBottom: centralRect.bottom,
      roundTop: anchorRect.top,
      roundRight: anchorRect.right,
      roundWidth: anchorRect.width || turnRect?.width,
      roundHeight: anchorRect.height || turnRect?.height,
      turnW: turnSize.width,
      turnH: turnSize.height,
      rightLimit
    }) || null;
  }

  function layoutPlayerActionCards() {
    const holder = document.querySelector('#action-cards-holder');
    if (!holder) return;

    const groups = [...holder.querySelectorAll('.action-cards-player-group')];
    const activeGroups = groups.filter(group => group.querySelector('.player-card'));
    if (!activeGroups.length) {
      restorePlayerActionCards();
      return;
    }

    const layout = actionCardLayoutRects();
    if (!layout) {
      restorePlayerActionCards();
      return;
    }

    const leftColumn = holder.closest('#player-boards-left-column');
    if (leftColumn) {
      styleState.backupStyle(leftColumn, 'bgaAgriV10ActionCardsAncestorOriginalStyle');
      leftColumn.dataset.bgaAgriV10ActionCardsAncestor = '1';
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

    styleState.backupStyle(holder, 'bgaAgriV10ActionCardsOriginalStyle');
    holder.dataset.bgaAgriV10ActionCardsManaged = '1';

    holder.style.setProperty('display', 'block', 'important');
    holder.style.setProperty('position', 'absolute', 'important');
    holder.style.setProperty('left', '0px', 'important');
    holder.style.setProperty('top', '0px', 'important');

    const zeroRect = holder.getBoundingClientRect();
    const targetLeft = layout.left - zeroRect.left;
    const targetTop = layout.top - zeroRect.top;

    holder.style.setProperty('left', `${Math.round(targetLeft)}px`, 'important');
    holder.style.setProperty('top', `${Math.round(targetTop)}px`, 'important');
    holder.style.setProperty('width', `${Math.round(layout.width)}px`, 'important');
    holder.style.setProperty('height', `${Math.round(layout.height)}px`, 'important');
    holder.style.setProperty('margin', '0', 'important');
    holder.style.setProperty('padding', '0', 'important');
    holder.style.setProperty('background', 'transparent', 'important');
    holder.style.setProperty('overflow', 'visible', 'important');
    holder.style.setProperty('z-index', '110', 'important');
    holder.style.setProperty('pointer-events', 'auto', 'important');
    const actionCardBaseSize = Math.max(40, Math.min(layout.slotW, layout.slotH - 32));
    holder.style.setProperty('--agricolaCardWidth', `${actionCardBaseSize}px`, 'important');
    holder.style.setProperty('--agricolaCardHeight', `${actionCardBaseSize}px`, 'important');
    holder.style.setProperty('--agricolaCardScale', `${actionCardBaseSize / 235}`, 'important');

    const firstActionCard = activeGroups[0]?.querySelector('.player-card');
    const actionCardStyle = firstActionCard ? getComputedStyle(firstActionCard) : null;
    const actionCardRect = firstActionCard?.getBoundingClientRect?.();
    const actionCardW = Math.max(
      parseFloat(actionCardStyle?.width) || 0,
      firstActionCard?.offsetWidth || 0,
      actionCardRect?.width || 0,
      115
    );
    const actionCardH = Math.max(
      parseFloat(actionCardStyle?.height) || 0,
      firstActionCard?.offsetHeight || 0,
      actionCardRect?.height || 0,
      115
    );
    const groupCardCounts = activeGroups.map(group => group.querySelectorAll('.player-card').length);
    const plan = models.computePlayerActionCardPlan(groupCardCounts, layout);

    groups.forEach(group => {
      styleState.backupStyle(group, 'bgaAgriV10ActionCardsOriginalStyle');
      const isActive = activeGroups.includes(group);
      if (!isActive) {
        group.style.setProperty('display', 'none', 'important');
      }
    });

    activeGroups.forEach((group, index) => {
      const row = Math.floor(index / plan.groupColumns);
      const col = index % plan.groupColumns;
      const header = group.querySelector('.action-cards-player-header');
      const cardsWrap = group.querySelector('.action-cards-player-cards');
      const cards = [...group.querySelectorAll('.player-card')];

      styleState.backupStyle(header, 'bgaAgriV10ActionCardsOriginalStyle');
      styleState.backupStyle(cardsWrap, 'bgaAgriV10ActionCardsOriginalStyle');
      cards.forEach(card => styleState.backupStyle(card, 'bgaAgriV10ActionCardsOriginalStyle'));

      const headerH = Math.max(18, Math.min(28, header?.getBoundingClientRect().height || 22));
      const groupW = plan.groupW;
      const groupH = plan.groupH;
      const groupLayout = models.computePlayerActionCardGroupLayout({
        cardCount: cards.length,
        plan,
        layout,
        cardW: actionCardW,
        cardH: actionCardH,
        headerH,
        maxScale: 1
      });
      const { cardColumns, cardCellW, cardCellH, scale, scaledCardW, overlapStep } = groupLayout;

      group.dataset.bgaAgriV10ActionCardsManaged = '1';
      group.style.setProperty('display', 'block', 'important');
      group.style.setProperty('position', 'absolute', 'important');
      group.style.setProperty('left', `${Math.round(col * (groupW + layout.gap))}px`, 'important');
      group.style.setProperty('top', `${Math.round(row * (groupH + layout.gap))}px`, 'important');
      group.style.setProperty('width', `${Math.round(groupW)}px`, 'important');
      group.style.setProperty('height', `${Math.round(groupH)}px`, 'important');
      group.style.setProperty('margin', '0', 'important');
      group.style.setProperty('padding', '0', 'important');
      group.style.setProperty('box-sizing', 'border-box', 'important');
      group.style.setProperty('overflow', 'visible', 'important');
      group.style.setProperty('z-index', `${10 + index}`, 'important');
      group.style.setProperty('pointer-events', 'auto', 'important');

      if (header) {
        header.style.setProperty('display', 'block', 'important');
        header.style.setProperty('position', 'relative', 'important');
        header.style.setProperty('height', `${headerH}px`, 'important');
        header.style.setProperty('line-height', `${headerH - 2}px`, 'important');
        header.style.setProperty('margin', '0', 'important');
        header.style.setProperty('padding', '0 2px', 'important');
        header.style.setProperty('box-sizing', 'border-box', 'important');
        header.style.setProperty('overflow', 'hidden', 'important');
        header.style.setProperty('pointer-events', 'none', 'important');
      }

      if (cardsWrap) {
        cardsWrap.style.setProperty('display', 'block', 'important');
        cardsWrap.style.setProperty('position', 'absolute', 'important');
        cardsWrap.style.setProperty('left', '0px', 'important');
        cardsWrap.style.setProperty('right', '0px', 'important');
        cardsWrap.style.setProperty('top', `${headerH + 2}px`, 'important');
        cardsWrap.style.setProperty('height', `${Math.max(0, groupH - headerH - 2)}px`, 'important');
        cardsWrap.style.setProperty('overflow', 'visible', 'important');
        cardsWrap.style.setProperty('pointer-events', 'auto', 'important');
      }

      cards.forEach((card, cardIndex) => {
        card.style.setProperty('display', 'block', 'important');
        card.style.setProperty('position', 'absolute', 'important');
        const cardCol = plan.useClearLayout ? cardIndex % cardColumns : 0;
        const cardRow = plan.useClearLayout ? Math.floor(cardIndex / cardColumns) : cardIndex;
        const cellLeft = cardCol * (cardCellW + layout.gap);
        const cellTop = plan.useClearLayout ? cardRow * (cardCellH + layout.gap) : cardIndex * overlapStep;
        const innerLeft = cellLeft + Math.max(0, (cardCellW - scaledCardW) / 2);
        const innerTop = cellTop + (plan.useClearLayout ? Math.max(0, (cardCellH - groupLayout.scaledCardH) / 2) : 0);
        card.style.setProperty('left', `${Math.round(innerLeft)}px`, 'important');
        card.style.setProperty('top', `${Math.round(innerTop)}px`, 'important');
        card.style.setProperty('margin', '0', 'important');
        card.style.setProperty('padding', '0', 'important');
        card.style.setProperty('overflow', 'visible', 'important');
        card.style.setProperty('box-sizing', 'border-box', 'important');
        card.style.setProperty('transform', `scale(${scale})`, 'important');
        card.style.setProperty('transform-origin', 'top left', 'important');
        card.style.setProperty('z-index', `${20 + cardIndex}`, 'important');
        card.style.setProperty('--bga-agri-v10-card-title-font-size', `${cardText.cardTitleFontSize(card, actionCardW, scale)}px`);
        card.style.setProperty('--bga-agri-v10-card-title-width', `${actionCardW}px`);
      });
    });
  }

  function restorePlayerActionCards() {
    document.querySelectorAll('[data-bga-agri-v10-action-cards-managed="1"], [data-bga-agri-v10-action-cards-original-style]').forEach(el => {
      styleState.restoreStyle(el, 'bgaAgriV10ActionCardsOriginalStyle');
      delete el.dataset.bgaAgriV10ActionCardsManaged;
    });

    document.querySelectorAll('[data-bga-agri-v10-action-cards-ancestor="1"], [data-bga-agri-v10-action-cards-ancestor-original-style]').forEach(el => {
      styleState.restoreStyle(el, 'bgaAgriV10ActionCardsAncestorOriginalStyle');
      delete el.dataset.bgaAgriV10ActionCardsAncestor;
    });
  }

  AC.originalUiActionCards = {
    layoutPlayerActionCards,
    restorePlayerActionCards
  };
})();
