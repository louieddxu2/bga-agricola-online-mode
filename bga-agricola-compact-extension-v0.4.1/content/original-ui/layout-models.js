((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    const AC = root.AgriCompact;
    if (AC) AC.originalUiModels = Object.assign({}, AC.originalUiModels || {}, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, () => {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function computeHandLayout(input) {
    const {
      targetViewportLeft,
      targetViewportRight,
      targetViewportTop,
      centralBottom,
      topStatusHeight,
      centralHeight,
      boardsLeft = 0,
      boardsHeight,
      boardsViewportBottom,
      viewportHeight,
      rightEdge,
      cardCount,
      cardW,
      cardH,
      minScale = 0.16,
      maxScale = 0.9
    } = input;

    const availableW = Math.max(120, targetViewportRight - targetViewportLeft);
    const rightSideOneRow = cardCount > 0 && cardCount < 5;
    let slotW = availableW / (rightSideOneRow ? 5 : 7);
    let cardScale = clamp(slotW / cardW, minScale, maxScale);
    let scaledCardH = cardH * cardScale;
    let handLayoutMode = rightSideOneRow ? 'right-one-row' : 'right-two-row';
    let handViewportLeft = targetViewportLeft;
    let handViewportTop = targetViewportTop;
    let handAvailableW = availableW;
    let handHeight = rightSideOneRow ? scaledCardH : scaledCardH * 2;

    if (Number.isFinite(topStatusHeight) && Number.isFinite(centralHeight) && Number.isFinite(boardsHeight)) {
      const lowerSpace = Math.max(0, viewportHeight - topStatusHeight - centralHeight - boardsHeight - 8);
      const rightSideCardH = scaledCardH;
      const canUseBelowBoards = lowerSpace > rightSideCardH;

      if (canUseBelowBoards) {
        handLayoutMode = 'below-boards-row';
        handViewportLeft = Math.max(0, boardsLeft);
        handViewportTop = Number.isFinite(boardsViewportBottom)
          ? boardsViewportBottom + 4
          : viewportHeight - lowerSpace - 4;
        handAvailableW = Math.max(120, rightEdge - handViewportLeft - 12);
        const safeCardCount = Math.max(1, cardCount);
        const heightScale = lowerSpace / cardH;
        const noOverlapWidthScale = handAvailableW / (safeCardCount * cardW);
        cardScale = clamp(Math.min(heightScale, noOverlapWidthScale, maxScale), minScale, maxScale);
        scaledCardH = cardH * cardScale;
        handHeight = scaledCardH;
        slotW = handAvailableW / safeCardCount;
      }
    }

    return {
      mode: handLayoutMode,
      cardScale,
      scaledCardW: cardW * cardScale,
      scaledCardH,
      handViewportLeft,
      handViewportTop,
      handAvailableW,
      handHeight,
      slotW
    };
  }

  function computePlayerActionCardPlan(groupCardCounts, layout) {
    const totalCards = groupCardCounts.reduce((sum, count) => sum + count, 0);
    const useClearLayout = totalCards <= 4;
    const groupCount = groupCardCounts.length;
    const twoColumnGroups = layout.columns >= 2 && groupCount === 4 && groupCardCounts.every(count => count === 1);
    const rows = twoColumnGroups ? 2 : groupCount;
    const rowH = rows > 0
      ? Math.min(layout.slotH, (layout.height - layout.gap * Math.max(0, rows - 1)) / rows)
      : layout.slotH;

    return {
      totalCards,
      useClearLayout,
      groupColumns: twoColumnGroups ? 2 : 1,
      groupRows: rows,
      groupW: twoColumnGroups ? layout.slotW : Math.max(layout.slotW, layout.columns * layout.slotW + layout.gap * Math.max(0, layout.columns - 1)),
      groupH: useClearLayout ? rowH : layout.slotH
    };
  }

  function computePlayerActionCardGroupLayout(input) {
    const { cardCount, plan, layout, cardW, cardH, headerH, maxScale = 0.9 } = input;
    const groupW = plan.groupW;
    const groupH = plan.groupH;
    const cardColumns = plan.useClearLayout && cardCount > 1 && groupW >= (layout.slotW * 2 + layout.gap) ? 2 : 1;
    const cardRows = plan.useClearLayout ? Math.ceil(cardCount / cardColumns) : 1;
    const cardAreaH = Math.max(1, groupH - headerH - 4);
    const cardCellW = (groupW - layout.gap * Math.max(0, cardColumns - 1)) / cardColumns;
    const cardCellH = plan.useClearLayout
      ? (cardAreaH - layout.gap * Math.max(0, cardRows - 1)) / Math.max(1, cardRows)
      : cardAreaH;
    const scale = clamp(Math.min((cardCellW - 6) / cardW, (cardCellH - 4) / cardH), 0.16, maxScale);
    const scaledCardW = cardW * scale;
    const scaledCardH = cardH * scale;
    const overlapStep = cardCount <= 1
      ? 0
      : Math.max(0, Math.min(scaledCardH + 4, (cardAreaH - scaledCardH) / (cardCount - 1)));

    return {
      cardColumns,
      cardRows,
      cardAreaH,
      cardCellW,
      cardCellH,
      scale,
      scaledCardW,
      scaledCardH,
      overlapStep
    };
  }

  function computeActionCardRegion(input) {
    const {
      centralBottom,
      roundTop,
      roundRight,
      roundWidth,
      roundHeight,
      turnW,
      turnH,
      rightLimit
    } = input;
    const left = roundRight;
    const availableW = Math.max(0, rightLimit - left - 8);
    if (availableW < 40) return null;

    const slotMaxW = Math.max(40, Math.min(roundWidth || turnW, availableW));
    const slotMaxH = Math.max(40, roundHeight || turnH);
    const gap = 8;
    const columns = availableW >= (slotMaxW * 2 + gap) ? 2 : 1;
    const slotW = Math.max(40, Math.min(slotMaxW, (availableW - gap * (columns - 1)) / columns));
    const slotH = slotMaxH;
    const height = Math.max(slotH, centralBottom - roundTop);

    return {
      left,
      top: roundTop,
      width: availableW,
      height,
      columns,
      slotW,
      slotH,
      gap
    };
  }

  return {
    computeActionCardRegion,
    computeHandLayout,
    computePlayerActionCardGroupLayout,
    computePlayerActionCardPlan
  };
});
