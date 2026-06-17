(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  let cachedBoardBackgroundInfo = null;




  function localActionCardRect(id) {
    const central = document.querySelector('#central-board');
    const el = document.querySelector(`${id} .action-card`) || document.querySelector(id);
    if (!central || !el) return null;
    const c = central.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      left: r.left - c.left,
      top: r.top - c.top,
      width: r.width,
      height: r.height,
      right: r.right - c.left,
      bottom: r.bottom - c.top
    };
  }

  function getTurnSize() {
    const t = document.querySelector('#turn_1');
    if (!t) return { width: 140, height: 140 };
    const cs = getComputedStyle(t);
    const width = parseFloat(cs.width) || t.getBoundingClientRect().width || 140;
    const height = parseFloat(cs.height) || t.getBoundingClientRect().height || 140;
    return { width, height };
  }

  function centeredTopForPair(ids, turnHeight, fallback) {
    const rects = ids.map(localActionCardRect).filter(Boolean);
    if (!rects.length) return fallback;
    const top = Math.min(...rects.map(r => r.top));
    const bottom = Math.max(...rects.map(r => r.bottom));
    return Math.round(((top + bottom) / 2) - (turnHeight / 2));
  }

  function setPos(id, x, y) {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    el.style.setProperty('left', `${Math.round(x)}px`, 'important');
    el.style.setProperty('top', `${Math.round(y)}px`, 'important');
  }


  function clearPhysicalRoundLayout() {
    [
      'turn_1', 'turn_2', 'turn_3', 'turn_4', 'turn_5', 'turn_6', 'turn_7',
      'turn_8', 'turn_9', 'turn_10', 'turn_11', 'turn_12', 'turn_13', 'turn_14',
      'harvest-slot-4', 'harvest-slot-7', 'harvest-slot-9',
      'harvest-slot-11', 'harvest-slot-13', 'harvest-slot-14'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.removeProperty('left');
      el.style.removeProperty('top');
    });
  }


  function usableBackgroundImage(bg) {
    if (!bg || bg === 'none') return '';
    // Ignore generic gradients; we need an actual image URL for the crop layer.
    if (!/url\(/i.test(bg)) return '';
    return bg;
  }

  function urlCss(url) {
    return `url("${String(url).replace(/"/g, '%22')}")`;
  }

  function findCentralPngFromPerformance() {
    try {
      const hit = performance.getEntriesByType('resource')
        .map(entry => entry?.name || '')
        .find(name => /\/games\/agricola\/[^?#]+\/img\/central\.png(?:[?#].*)?$/i.test(name) || /\/img\/central\.png(?:[?#].*)?$/i.test(name));
      return hit || '';
    } catch (_) {
      return '';
    }
  }

  function findCentralPngFromInlineScripts() {
    try {
      const scripts = [...document.scripts].map(script => script.textContent || '').join('\n');
      const themeMatch = scripts.match(/g_gamethemeurl\s*=\s*['"]([^'"]+)['"]/);
      if (themeMatch?.[1]) return `${themeMatch[1].replace(/\/$/, '')}/img/central.png`;

      const directMatch = scripts.match(/https?:\/\/[^'"\\\s]+\/games\/agricola\/[^'"\\\s]+\/img\/central\.png/);
      if (directMatch?.[0]) return directMatch[0];
    } catch (_) {}
    return '';
  }

  function readBoardBackgroundImage() {
    if (cachedBoardBackgroundInfo?.backgroundImage) return cachedBoardBackgroundInfo;

    const candidates = [
      '#central-board',
      '#central-board-holder',
      '#main-boards',
      '#left-board'
    ];

    const debug = [];
    for (const selector of candidates) {
      const el = document.querySelector(selector);
      if (!el) continue;
      const bg = usableBackgroundImage(getComputedStyle(el).backgroundImage);
      debug.push({ selector, backgroundImage: bg || getComputedStyle(el).backgroundImage || '' });
      if (bg) {
        cachedBoardBackgroundInfo = { element: el, backgroundImage: bg, source: selector };
        return cachedBoardBackgroundInfo;
      }
    }

    const fromPerf = findCentralPngFromPerformance();
    if (fromPerf) {
      cachedBoardBackgroundInfo = { element: document.querySelector('#central-board'), backgroundImage: urlCss(fromPerf), source: 'performance central.png' };
      return cachedBoardBackgroundInfo;
    }

    const fromScript = findCentralPngFromInlineScripts();
    if (fromScript) {
      cachedBoardBackgroundInfo = { element: document.querySelector('#central-board'), backgroundImage: urlCss(fromScript), source: 'inline g_gamethemeurl central.png' };
      return cachedBoardBackgroundInfo;
    }

    if (!readBoardBackgroundImage._warned) {
      readBoardBackgroundImage._warned = true;
      console.warn('[AgriCompact] round background image not found', debug);
    }
    return null;
  }


  function setRoundBackgroundStatus(text, kind = 'info') {
    const central = document.querySelector('#central-board');
    if (!central) return;
    let status = document.getElementById('bga-agri-v10-bg-status');
    if (!status) {
      status = document.createElement('div');
      status.id = 'bga-agri-v10-bg-status';
      central.appendChild(status);
    }
    status.className = `bga-agri-v10-bg-status-${kind}`;
    status.textContent = text;
  }

  function clearRoundBackgroundStatus() {
    document.getElementById('bga-agri-v10-bg-status')?.remove();
  }

  function ensureRoundBackgroundLayer(layout) {
    const central = document.querySelector('#central-board');
    if (!central) return;

    const bgInfo = readBoardBackgroundImage();
    if (!bgInfo?.backgroundImage) {
      setRoundBackgroundStatus('BG not found', 'error');
      return;
    }

    // Take over the board background: disable BGA's full central-board image and
    // rebuild only the part we still want to show. This avoids rendering the
    // original oversized background to the right of round 1.
    if (!central.dataset.bgaAgriV10OriginalBgImageValue) {
      central.dataset.bgaAgriV10OriginalBgImageValue = central.style.getPropertyValue('background-image') || '__empty__';
      central.dataset.bgaAgriV10OriginalBgImagePriority = central.style.getPropertyPriority('background-image') || '';
    }
    central.style.setProperty('background-image', 'none', 'important');

    let layer = document.getElementById('bga-agri-v10-round-bg-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'bga-agri-v10-round-bg-layer';
      central.prepend(layer);
    }

    // This is no longer a foreground debug overlay. It is the replacement
    // background layer, kept below BGA's action-card DOM.
    layer.classList.remove('bga-agri-v10-round-bg-layer-debug');
    layer.textContent = '';
    layer.dataset.source = bgInfo.source || bgInfo.element?.id || bgInfo.element?.tagName?.toLowerCase() || 'unknown';

    // Use the original round-2 area as the crop source. The user-provided
    // screenshot confirms the BGA 830x795 coordinate space, where the original
    // round 2 is at x=331, y=1 and has cleaner surroundings than round 6.
    const margin = 10;
    const sourceOrigin = { x: 331, y: 1 };
    const source = {
      x: Math.max(0, sourceOrigin.x - margin),
      y: Math.max(0, sourceOrigin.y - margin),
      w: layout.turnW + margin * 2,
      h: layout.turnH + margin * 2
    };
    const targetOffsetX = sourceOrigin.x - source.x;
    const targetOffsetY = sourceOrigin.y - source.y;

    const cutX = Math.round(layout.x[0] + layout.turnW);
    const leftBg = document.createElement('div');
    leftBg.className = 'bga-agri-v10-board-bg-left';
    leftBg.style.setProperty('left', '0px');
    leftBg.style.setProperty('top', '0px');
    leftBg.style.setProperty('width', `${cutX}px`);
    leftBg.style.setProperty('height', '620px');
    leftBg.style.setProperty('background-image', bgInfo.backgroundImage);
    leftBg.style.setProperty('background-size', '830px 795px');
    leftBg.style.setProperty('background-position', '0 0');
    layer.appendChild(leftBg);

    const targets = [
      { round: 1, x: layout.x[0], y: layout.topY, row: 'top' },
      { round: 2, x: layout.x[1], y: layout.topY, row: 'top' },
      { round: 3, x: layout.x[1], y: layout.midY, row: 'mid' },
      { round: 4, x: layout.x[1], y: layout.bottomY, row: 'bottom' },
      { round: 5, x: layout.x[2], y: layout.topY, row: 'top' },
      { round: 6, x: layout.x[2], y: layout.midY, row: 'mid' },
      { round: 7, x: layout.x[2], y: layout.bottomY, row: 'bottom' },
      { round: 8, x: layout.x[3], y: layout.topY, row: 'top' },
      { round: 9, x: layout.x[3], y: layout.midY, row: 'mid' },
      { round: 10, x: layout.x[4], y: layout.topY, row: 'top' },
      { round: 11, x: layout.x[4], y: layout.midY, row: 'mid' },
      { round: 12, x: layout.x[5], y: layout.topY, row: 'top' },
      { round: 13, x: layout.x[5], y: layout.midY, row: 'mid' },
      { round: 14, x: layout.x[6], y: layout.topY, row: 'top' }
    ];

    // Non-top rows stretch to adjacent row spacing while keeping their cards centered.
    const nonTopTileHeight = Math.max(source.h, (layout.bottomY - layout.midY));
    const midTileHeight = nonTopTileHeight;
    const bottomTileHeight = nonTopTileHeight;

    // The first row background has its own top boundary. In v0.10.39 this
    // boundary is aligned to the Farm Expansion action-card top, while the
    // top-row round cards are centered inside this band.
    const midTileTop = (layout.midY + layout.turnH / 2) - midTileHeight / 2;
    const topTileTop = Number.isFinite(layout.topBgY) ? layout.topBgY : (layout.topY - targetOffsetY);
    const topTileHeight = Math.max(source.h, midTileTop - topTileTop);

    targets.forEach(target => {
      const tile = document.createElement('div');
      tile.className = 'bga-agri-v10-round-bg-tile';
      tile.dataset.round = String(target.round);
      tile.dataset.row = target.row;

      const targetHeight = target.row === 'mid'
        ? midTileHeight
        : target.row === 'bottom'
          ? bottomTileHeight
          : topTileHeight;
      const targetTop = target.row === 'top'
        ? topTileTop
        : (target.y + layout.turnH / 2) - targetHeight / 2;
      const stretchY = targetHeight / source.h;

      tile.style.setProperty('left', `${Math.round(target.x - targetOffsetX)}px`);
      tile.style.setProperty('top', `${Math.round(targetTop)}px`);
      tile.style.setProperty('width', `${Math.round(source.w)}px`);
      tile.style.setProperty('height', `${Math.round(targetHeight)}px`);
      tile.style.setProperty('background-image', bgInfo.backgroundImage);
      // The screenshot-proven source coordinate system maps to BGA's 830x795 board.
      // Stretch only non-top row backgrounds vertically; the action cards themselves
      // stay at their own unscaled positions above the background.
      tile.style.setProperty('background-size', `830px ${Math.round(795 * stretchY)}px`);
      tile.style.setProperty('background-position', `-${Math.round(source.x)}px -${Math.round(source.y * stretchY)}px`);
      layer.appendChild(tile);
    });

    clearRoundBackgroundStatus();
  }

  function clearRoundBackgroundLayer() {
    document.getElementById('bga-agri-v10-round-bg-layer')?.remove();
    const central = document.querySelector('#central-board');
    if (central?.dataset.bgaAgriV10OriginalBgImageValue) {
      const oldValue = central.dataset.bgaAgriV10OriginalBgImageValue;
      const oldPriority = central.dataset.bgaAgriV10OriginalBgImagePriority || '';
      if (oldValue === '__empty__') {
        central.style.removeProperty('background-image');
      } else {
        central.style.setProperty('background-image', oldValue, oldPriority);
      }
      delete central.dataset.bgaAgriV10OriginalBgImageValue;
      delete central.dataset.bgaAgriV10OriginalBgImagePriority;
    }
    clearRoundBackgroundStatus();
  }

  function layoutPhysicalRounds() {
    if (!document.documentElement.classList.contains('bga-agri-v10-original-compact')) return;
    const central = document.querySelector('#central-board');
    if (!central) return;

    const { width: turnW, height: turnH } = getTurnSize();

    // The top row keeps BGA's first two columns: round 1 is the second visible column,
    // round 2 stays to its right. Later stage starts continue to the right.
    const x = [167, 331, 493, 657, 821, 985, 1149];

    // Required physical-board anchors:
    // - round 3 aligns vertically beside Forest + Clay Pit
    // - round 4 aligns vertically beside Reed Bank + Fishing
    const midY = centeredTopForPair(['#ActionForest', '#ActionClayPit'], turnH, 156);
    const bottomY = centeredTopForPair(['#ActionReedBank', '#ActionFishing'], turnH, 311);

    // Background crop geometry uses the same margin as ensureRoundBackgroundLayer().
    // The top-row background now starts at the Farm Expansion action-card top, and
    // top-row round cards are centered vertically inside that background band.
    const bgMargin = 10;
    const sourceH = turnH + bgMargin * 2;
    const nonTopTileHeight = Math.max(sourceH, (bottomY - midY));
    const midTileTop = (midY + turnH / 2) - nonTopTileHeight / 2;
    const farmExpansionTop = localActionCardRect('#ActionFarmExpansion')?.top;
    let topBgY = Number.isFinite(farmExpansionTop) ? farmExpansionTop : 0;
    // Keep a sane fallback if BGA temporarily reports an impossible position.
    if (topBgY >= midTileTop - 4) topBgY = Math.max(0, midTileTop - sourceH);
    topBgY = Math.max(0, Math.round(topBgY));
    const topTileHeight = Math.max(sourceH, midTileTop - topBgY);
    const topY = Math.round(topBgY + (topTileHeight - turnH) / 2);

    const harvestY = bottomY + turnH + 10;
    const harvestXOffset = Math.round(turnW * 0.37);
    const harvestSlotOverlap = 14; // harvest-slot is about 28px high; center it on the red/bottom line.

    const placeHarvest = (round, colX, y = harvestY) => setPos(`harvest-slot-${round}`, colX + harvestXOffset, y);

    // Stage 1: round 1 top, rounds 2/3/4 form the vertical stage column.
    setPos('turn_1', x[0], topY);
    setPos('turn_2', x[1], topY);
    setPos('turn_3', x[1], midY);
    setPos('turn_4', x[1], bottomY);
    placeHarvest(4, x[1]);

    // Stage 2: 5/6/7 mirrors the 2/3/4 vertical spacing.
    setPos('turn_5', x[2], topY);
    setPos('turn_6', x[2], midY);
    setPos('turn_7', x[2], bottomY);
    placeHarvest(7, x[2]);

    // Stages 3-5: two-card stages use top + bottom anchor rows.
    setPos('turn_8', x[3], topY);
    setPos('turn_9', x[3], midY);
    placeHarvest(9, x[3], midY + turnH + 10);

    setPos('turn_10', x[4], topY);
    setPos('turn_11', x[4], midY);
    placeHarvest(11, x[4], midY + turnH + 10);

    setPos('turn_12', x[5], topY);
    setPos('turn_13', x[5], midY);
    placeHarvest(13, x[5], midY + turnH + 10);

    // Stage 6: final round on top row, final harvest below it.
    setPos('turn_14', x[6], topY);
    // Place the final harvest so it overlaps the bottom border of the round-14
    // background tile, matching the visual treatment used under round 13.
    placeHarvest(14, x[6], topBgY + topTileHeight - harvestSlotOverlap);

    ensureRoundBackgroundLayer({ x, topY, topBgY, midY, bottomY, turnW, turnH });

    // 消除釣魚行動格下緣與下方玩家圖板頂端之間的縫隙
    const mainBoards = document.getElementById('main-boards');
    if (mainBoards) {
      mainBoards.style.removeProperty('margin-top');
    }
  }




  function layoutRightLogLimit() {
    const fishing = document.querySelector('#ActionFishing');
    const rightLogPanel = document.querySelector('#right-side-second-part');
    const logsWrap = document.querySelector('#logs_wrap');
    if (!fishing || !rightLogPanel || !logsWrap) return;

    const fishingRect = fishing.getBoundingClientRect();
    const panelRect = rightLogPanel.getBoundingClientRect();
    const targetHeight = Math.floor(fishingRect.bottom - panelRect.top);
    if (!Number.isFinite(targetHeight) || targetHeight < 80) return;

    rightLogPanel.style.setProperty('height', `${targetHeight}px`, 'important');
    rightLogPanel.style.setProperty('max-height', `${targetHeight}px`, 'important');
    rightLogPanel.style.removeProperty('overflow');

    const logsRect = logsWrap.getBoundingClientRect();
    const logsHeight = Math.max(40, Math.floor(fishingRect.bottom - logsRect.top));
    logsWrap.style.setProperty('height', `${logsHeight}px`, 'important');
    logsWrap.style.setProperty('max-height', `${logsHeight}px`, 'important');
    logsWrap.style.setProperty('overflow-y', 'auto', 'important');
    logsWrap.style.setProperty('overflow-x', 'hidden', 'important');
  }

  function clearRightLogLimit() {
    const rightLogPanel = document.querySelector('#right-side-second-part');
    const logsWrap = document.querySelector('#logs_wrap');
    [rightLogPanel, logsWrap].forEach(el => {
      if (!el) return;
      el.style.removeProperty('height');
      el.style.removeProperty('max-height');
      el.style.removeProperty('overflow');
      el.style.removeProperty('overflow-y');
      el.style.removeProperty('overflow-x');
    });
  }

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

  function handTitleWeight(text) {
    return [...String(text || '').trim()].reduce((sum, ch) => {
      if (/\s/.test(ch)) return sum + 0.3;
      if (/[\u0000-\u007f]/.test(ch)) return sum + 0.58;
      return sum + 1;
    }, 0);
  }

  function handCardTitleFontSize(card, unscaledTitleW, handScale) {
    const title = card.querySelector('.card-title')?.textContent || '';
    const visibleCardW = Math.max(1, unscaledTitleW * handScale);
    const weight = Math.max(4, handTitleWeight(title));
    const visibleFontSize = AC.utils.clamp((visibleCardW * 1.08) / weight, 15, 20);
    return AC.utils.round(visibleFontSize / Math.max(handScale, 0.05));
  }

  function layoutHandCards() {
    const central = document.querySelector('#central-board');
    if (!central) return;

    // Keep the native hand DOM in its original BGA parent. Do not append it to
    // #central-board; position it visually with page coordinates so it scrolls
    // with the central board instead of floating in the viewport.
    const handContainer = document.querySelector('#alternative-hand-wrapper #hand-container') ||
                          document.querySelector('#player-boards #player-boards-left-column #hand-container') ||
                          document.querySelector('#player-boards #hand-container') ||
                          document.querySelector('#hand-container');
    if (!handContainer) return;

    // Do not touch modal/popin hand mode.
    const pref108 = document.querySelector('#preference_control_108')?.value;
    const isModal = pref108 === '0' ||
                    handContainer.closest('#popin_showHand_contents') !== null ||
                    handContainer.closest('.agricola_popin') !== null;

    if (isModal) {
      restoreHandCards();
      return;
    }

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

    const slotW = availableW / 7;
    const cardScale = AC.utils.clamp(slotW / cardW, 0.16, 0.9);
    const scaledCardW = cardW * cardScale;
    const scaledCardH = cardH * cardScale;
    const rowHeight = scaledCardH;
    const handHeight = rowHeight * 2;

    handContainer.style.setProperty('position', 'absolute', 'important');
    handContainer.style.setProperty('display', 'block', 'important');

    const offsetParent = handContainer.offsetParent;
    const parentRect = offsetParent
      ? offsetParent.getBoundingClientRect()
      : { left: -window.scrollX, top: -window.scrollY };
    const targetLeft = targetViewportLeft + window.scrollX - (parentRect.left + window.scrollX);
    const targetTop = targetViewportTop + window.scrollY - (parentRect.top + window.scrollY);

    handContainer.style.setProperty('left', `${targetLeft}px`, 'important');
    handContainer.style.setProperty('top', `${targetTop}px`, 'important');
    handContainer.style.setProperty('width', `${availableW}px`, 'important');
    handContainer.style.setProperty('height', `${handHeight}px`, 'important');
    handContainer.style.setProperty('z-index', '100', 'important');
    handContainer.style.setProperty('background', 'transparent', 'important');
    handContainer.style.setProperty('margin', '0', 'important');
    handContainer.style.setProperty('padding', '0', 'important');
    handContainer.style.setProperty('gap', '0', 'important');
    handContainer.style.setProperty('overflow', 'visible', 'important');
    handContainer.style.setProperty('pointer-events', 'auto', 'important');

    const allCards = [...handContainer.querySelectorAll('.player-card')];
    const occupationCards = allCards.filter(card => card.classList.contains('occupation'));
    const improvementCards = allCards.filter(card => !card.classList.contains('occupation'));

    const playerBoards = document.querySelector('#player-boards');
    if (playerBoards) {
      if (playerBoards.dataset.bgaAgriV10HandGapOriginalStyle === undefined) {
        playerBoards.dataset.bgaAgriV10HandGapOriginalStyle = playerBoards.getAttribute('style') || '';
      }
      const currentMarginTop = parseFloat(playerBoards.style.marginTop) || 0;
      const naturalBoardsTop = playerBoards.getBoundingClientRect().top - currentMarginTop;
      const neededGap = Math.max(0, targetViewportTop + handHeight + 8 - naturalBoardsTop);
      playerBoards.style.setProperty('margin-top', `${Math.ceil(neededGap)}px`, 'important');
    }

    const stackRow = (list, rowIndex) => {
      const n = list.length;
      const stepX = n <= 1
        ? 0
        : Math.max(0, Math.min(slotW, (availableW - scaledCardW) / (n - 1)));

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
        card.style.setProperty('--bga-agri-v10-card-title-font-size', `${handCardTitleFontSize(card, cardW, cardScale)}px`);
        card.style.setProperty('--bga-agri-v10-card-title-width', `${cardW}px`);
      });
    };

    stackRow(occupationCards, 0);
    stackRow(improvementCards, 1);
  }

  function restoreHandCards() {
    const handContainer = document.querySelector('#hand-container[data-bga-agri-v10-hand-fixed="1"]') || document.querySelector('#hand-container');
    if (!handContainer) {
      restoreHandAncestors();
      return;
    }

    handContainer.querySelectorAll('.player-card').forEach(card => {
      if (card.dataset.bgaAgriV10HandOriginalStyle !== undefined) {
        const old = card.dataset.bgaAgriV10HandOriginalStyle;
        if (old) card.setAttribute('style', old);
        else card.removeAttribute('style');
        delete card.dataset.bgaAgriV10HandOriginalStyle;
      }
    });

    const oldStyle = handContainer.dataset.bgaAgriV10OriginalStyle;
    if (oldStyle !== undefined) {
      if (oldStyle) handContainer.setAttribute('style', oldStyle);
      else handContainer.removeAttribute('style');
      delete handContainer.dataset.bgaAgriV10OriginalStyle;
    }
    const playerBoards = document.querySelector('#player-boards');
    if (playerBoards?.dataset.bgaAgriV10HandGapOriginalStyle !== undefined) {
      const old = playerBoards.dataset.bgaAgriV10HandGapOriginalStyle;
      if (old) playerBoards.setAttribute('style', old);
      else playerBoards.removeAttribute('style');
      delete playerBoards.dataset.bgaAgriV10HandGapOriginalStyle;
    }
    delete handContainer.dataset.bgaAgriV10HandFixed;
    delete handContainer.dataset.bgaAgriV10OriginalParentId;
    restoreHandAncestors();
  }

  AC.originalUiCompact = {
    layoutHandCards,
    enable() {
      document.documentElement.classList.add('bga-agri-v10-original-compact');
      // Native #page-title is kept visible; no duplicate compact topline is created.
      requestAnimationFrame(() => {
        layoutPhysicalRounds();
        layoutRightLogLimit();
        layoutHandCards();
      });
      if (!AC.originalUiCompact._onResize) {
        AC.originalUiCompact._onResize = () => requestAnimationFrame(() => {
          layoutPhysicalRounds();
          layoutRightLogLimit();
          layoutHandCards();
        });
      }
      window.addEventListener('resize', AC.originalUiCompact._onResize);
    },

    disable() {
      restoreHandCards();
      document.documentElement.classList.remove('bga-agri-v10-original-compact');
      if (AC.originalUiCompact._onResize) window.removeEventListener('resize', AC.originalUiCompact._onResize);
      clearPhysicalRoundLayout();
      clearRoundBackgroundLayer();
      clearRightLogLimit();
      document.getElementById('bga-agri-v10-original-topline')?.remove();
    }
  };

  const originalOpen = AC.openPanel;
  AC.openPanel = function patchedOpenPanel(...args) {
    const result = originalOpen.apply(this, args);
    AC.originalUiCompact.enable();
    return result;
  };

  const originalClose = AC.closePanel;
  AC.closePanel = function patchedClosePanel(...args) {
    AC.originalUiCompact.disable();
    return originalClose.apply(this, args);
  };
})();
