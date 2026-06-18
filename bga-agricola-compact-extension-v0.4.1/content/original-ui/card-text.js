(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  function titleWeight(text) {
    return [...String(text || '').trim()].reduce((sum, ch) => {
      if (/\s/.test(ch)) return sum + 0.3;
      if (/[\u0000-\u007f]/.test(ch)) return sum + 0.58;
      return sum + 1;
    }, 0);
  }

  function cardTitleFontSize(card, unscaledTitleW, cardScale) {
    const title = card.querySelector('.card-title')?.textContent || '';
    const visibleCardW = Math.max(1, unscaledTitleW * cardScale);
    const weight = Math.max(4, titleWeight(title));
    const visibleFontSize = AC.utils.clamp((visibleCardW * 1.08) / weight, 15, 20);
    return AC.utils.round(visibleFontSize / Math.max(cardScale, 0.05));
  }

  AC.originalUiCardText = {
    cardTitleFontSize,
    titleWeight
  };
})();
