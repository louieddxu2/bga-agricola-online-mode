(() => {
  const AC = window.AgriCompact;
  if (!AC) return;
  const preferences = AC.originalUiPreferences || {};
  const actionCards = AC.originalUiActionCards || {};
  const hand = AC.originalUiHand || {};

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

  function isFirstGameHintText(text) {
    const normalized = String(text || '').replace(/\s+/g, '');
    return (
      /這名玩家.*第一次.*(遊玩|玩遊戲)/.test(normalized) ||
      /他每回合的時間將加倍/.test(normalized) ||
      /感謝您幫助我/.test(normalized)
    );
  }

  function hideRightPanelFirstGameHints() {
    const rightSide = document.querySelector('#right-side');
    if (!rightSide) return;

    const hidden = AC.state.rightPanelFirstGameHints || [];
    const hiddenNodes = new Set(hidden.map(entry => entry.node));
    const walker = document.createTreeWalker(rightSide, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node?.parentElement || hiddenNodes.has(node)) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest('#logs_wrap, #logs, #log_history')) return NodeFilter.FILTER_REJECT;
        return isFirstGameHintText(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const matches = [];
    while (walker.nextNode()) matches.push(walker.currentNode);

    matches.forEach(node => {
      hidden.push({ node, text: node.nodeValue });
      node.nodeValue = '';
    });
    AC.state.rightPanelFirstGameHints = hidden.filter(entry => entry.node?.isConnected);
  }

  function restoreRightPanelFirstGameHints() {
    (AC.state.rightPanelFirstGameHints || []).forEach(entry => {
      if (entry.node?.isConnected) entry.node.nodeValue = entry.text;
    });
    AC.state.rightPanelFirstGameHints = [];
  }

  function hideRightPanelHeaderControls() {
    const row = document.querySelector('#player_board_config #player_config > #player_config_row');
    if (!row || !row.querySelector('#uwe-help') || !row.querySelector('#help-mode-switch')) return;
    if (row.dataset.bgaAgriV10RightHeaderHidden === '1') return;

    AC.state.rightPanelHeaderControls = {
      node: row,
      display: row.style.display || ''
    };
    row.dataset.bgaAgriV10RightHeaderHidden = '1';
    row.style.setProperty('display', 'none', 'important');
  }

  function restoreRightPanelHeaderControls() {
    const entry = AC.state.rightPanelHeaderControls;
    if (entry?.node?.isConnected) {
      entry.node.style.display = entry.display || '';
      delete entry.node.dataset.bgaAgriV10RightHeaderHidden;
    }
    AC.state.rightPanelHeaderControls = null;
  }

  function layoutRightPanelChrome() {
    hideRightPanelFirstGameHints();
    hideRightPanelHeaderControls();
  }

  function restoreOriginalUiFragments() {
    actionCards.restorePlayerActionCards();
    hand.restoreHandCards();
  }

  function scheduleDeferredRestore() {
    const restore = () => restoreOriginalUiFragments();
    requestAnimationFrame(restore);
    setTimeout(restore, 80);
    setTimeout(restore, 250);
  }

  AC.originalUiCompact = {
    layoutHandCards: hand.layoutHandCards,
    layoutPlayerActionCards: actionCards.layoutPlayerActionCards,
    layoutRightPanelHints: layoutRightPanelChrome,
    enable() {
      preferences.applyStableBgaPreferences();
      document.documentElement.classList.add('bga-agri-v10-original-compact');
      // Native #page-title is kept visible; no duplicate compact topline is created.
      requestAnimationFrame(() => {
        layoutRightPanelChrome();
        layoutPhysicalRounds();
        layoutRightLogLimit();
        hand.layoutHandCards();
        actionCards.layoutPlayerActionCards();
      });
      if (!AC.originalUiCompact._onResize) {
        AC.originalUiCompact._onResize = () => requestAnimationFrame(() => {
          layoutRightPanelChrome();
          layoutPhysicalRounds();
          layoutRightLogLimit();
          hand.layoutHandCards();
          actionCards.layoutPlayerActionCards();
        });
      }
      window.addEventListener('resize', AC.originalUiCompact._onResize);
    },

    disable() {
      restoreOriginalUiFragments();
      preferences.restoreStableBgaPreferences();
      document.documentElement.classList.remove('bga-agri-v10-original-compact');
      if (AC.originalUiCompact._onResize) window.removeEventListener('resize', AC.originalUiCompact._onResize);
      clearPhysicalRoundLayout();
      clearRoundBackgroundLayer();
      clearRightLogLimit();
      restoreRightPanelFirstGameHints();
      restoreRightPanelHeaderControls();
      document.getElementById('bga-agri-v10-original-topline')?.remove();
      scheduleDeferredRestore();
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
