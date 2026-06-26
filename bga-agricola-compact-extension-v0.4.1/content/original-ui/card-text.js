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

  function titleScriptInfo(text) {
    const str = String(text || '');
    return {
      hasHan: /[\u3400-\u9fff]/.test(str),
      hasKana: /[\u3040-\u30ff]/.test(str),
      hasHangul: /[\uac00-\ud7af]/.test(str),
      hasLatin: /[A-Za-z]/.test(str)
    };
  }

  function adjustCardTitle(card, unscaledTitleW, cardScale) {
    const titleEl = card.querySelector('.card-title');
    if (!titleEl) return;

    const text = titleEl.textContent || '';
    const scriptInfo = titleScriptInfo(text);

    // 1. Reset dynamic style override and custom attributes
    titleEl.removeAttribute('data-title-mode');
    titleEl.style.removeProperty('--bga-agri-v10-card-title-font-size');

    // 2. Get the base/initial font size
    const initialFontSize = cardTitleFontSize(card, unscaledTitleW, cardScale);

    // 3. Try layout as single line (nowrap)
    titleEl.setAttribute('data-title-mode', 'nowrap');
    titleEl.style.setProperty('--bga-agri-v10-card-title-font-size', `${initialFontSize}px`);

    // 4. Measure client size in Layout Space
    const titleW = titleEl.clientWidth || unscaledTitleW || 211.5;
    const maxTitleHeight = titleW * 0.16;

    // Check if the single line fits inside clientWidth
    const singleLineFits = titleEl.scrollWidth <= titleEl.clientWidth + 1;

    // Primarily Chinese Han characters: has Han, no Kana, no Hangul
    const isMainlyChinese = scriptInfo.hasHan && !scriptInfo.hasKana && !scriptInfo.hasHangul;

    if (isMainlyChinese && singleLineFits) {
      // Keep single line large Chinese font logic
      return;
    }

    // Short English/other languages: keep single line if it fits
    if (singleLineFits) {
      return;
    }

    // 5. Fallback to two-line mode
    titleEl.setAttribute('data-title-mode', 'twoline');

    // Get exact height limit in Layout Space based on card type geometric ratio:
    // - Occupation cards: circle art starts at ~16% of card width.
    // - Improvement cards: hexagon art starts at ~22% of card width.
    const isOccupation = card.classList.contains('occupation');
    const twoLineMaxHeight = titleW * (isOccupation ? 0.16 : 0.22);

    // Increase the minimum font size limit (visible 7px) to keep text legible.
    let currentSize = initialFontSize;
    const minSize = Math.max(7 / Math.max(cardScale, 0.05), 7);
    let lastTwoLineSize = initialFontSize;

    while (currentSize > minSize) {
      titleEl.style.setProperty('--bga-agri-v10-card-title-font-size', `${currentSize}px`);
      
      // If the title can fit in a single line at the current size, it is about to fold back to a single line.
      // We stop shrinking and restore the last size that forced it to be two lines.
      const stillNeedsTwoLines = titleEl.scrollWidth > titleEl.clientWidth + 1;
      if (!stillNeedsTwoLines) {
        currentSize = lastTwoLineSize;
        titleEl.style.setProperty('--bga-agri-v10-card-title-font-size', `${currentSize}px`);
        break;
      }

      lastTwoLineSize = currentSize;

      if (titleEl.scrollHeight <= twoLineMaxHeight + 1) {
        break;
      }
      currentSize -= 0.5;
    }
  }

  AC.originalUiCardText = {
    cardTitleFontSize,
    titleWeight,
    titleScriptInfo,
    adjustCardTitle
  };
})();
