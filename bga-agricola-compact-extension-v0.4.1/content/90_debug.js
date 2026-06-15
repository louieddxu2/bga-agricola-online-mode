(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  function rectOf(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
      right: Math.round(r.right),
      bottom: Math.round(r.bottom)
    };
  }

  function shortClass(el) {
    if (!el) return null;
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string'
      ? '.' + el.className.trim().replace(/\s+/g, '.')
      : '';
    return `${el.tagName?.toLowerCase() || ''}${id}${cls}`;
  }

  function cssOf(el) {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      position: cs.position,
      zIndex: cs.zIndex,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage === 'none' ? 'none' : cs.backgroundImage.slice(0, 220),
      backgroundSize: cs.backgroundSize,
      backgroundPosition: cs.backgroundPosition,
      opacity: cs.opacity,
      visibility: cs.visibility,
      overflow: cs.overflow,
      transform: cs.transform,
      isolation: cs.isolation,
      pointerEvents: cs.pointerEvents,
      width: cs.width,
      height: cs.height,
      fontSize: cs.fontSize
    };
  }

  function nodeInfo(el) {
    if (!el) return null;
    return {
      node: shortClass(el),
      rect: rectOf(el),
      css: cssOf(el),
      childCount: el.children?.length ?? 0,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    };
  }

  function elementAtCenter(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const x = Math.round(r.left + r.width / 2);
    const y = Math.round(r.top + r.height / 2);
    const hit = document.elementFromPoint(x, y);
    return {
      point: { x, y },
      hit: shortClass(hit),
      hitClosestFarm: shortClass(hit?.closest?.('.agricola-player-board')),
      hitClosestCell: shortClass(hit?.closest?.('.board-cell'))
    };
  }

  function farmLayerReport(root) {
    if (!root) return null;

    const farm = root.matches?.('.agricola-player-board')
      ? root
      : root.querySelector?.('.agricola-player-board');

    const grid = farm?.querySelector('.player-board-grid');
    const firstCell = grid?.querySelector('.board-cell');
    const firstNodeBg = grid?.querySelector('.board-cell .node-background');
    const firstEmpty = grid?.querySelector('.board-cell .node-background .empty-node');
    const room = grid?.querySelector('.meeple-roomWood, .meeple-roomClay, .meeple-roomStone');
    const field = grid?.querySelector('.meeple-field');
    const pasture = grid?.querySelector('.meeple-pasture');
    const crop = grid?.querySelector('.meeple-grain, .meeple-vegetable');
    const animal = grid?.querySelector('.meeple-sheep, .meeple-pig, .meeple-cattle');

    const firstVirtualCell = grid?.querySelector('.board-cell.cell-virtual');
    const firstNodeCell = grid?.querySelector('.board-cell.cell-node');
    const virtualChain = backgroundChainFrom(firstVirtualCell || firstCell);
    const farmChain = backgroundChainFrom(farm);

    return {
      root: nodeInfo(root),
      farm: nodeInfo(farm),
      grid: nodeInfo(grid),
      firstCell: nodeInfo(firstCell),
      firstVirtualCell: nodeInfo(firstVirtualCell),
      firstNodeCell: nodeInfo(firstNodeCell),
      firstNodeBackground: nodeInfo(firstNodeBg),
      firstEmptyNode: nodeInfo(firstEmpty),
      sampleRoom: nodeInfo(room),
      sampleField: nodeInfo(field),
      samplePasture: nodeInfo(pasture),
      sampleCrop: nodeInfo(crop),
      sampleAnimal: nodeInfo(animal),
      hitFarmCenter: elementAtCenter(farm),
      hitFirstCellCenter: elementAtCenter(firstCell),
      backdropSearch: {
        fromVirtualCell: virtualChain,
        firstVirtualBackdropCandidate: firstBackdropCandidate(virtualChain),
        fromFarm: farmChain,
        firstFarmBackdropCandidate: firstBackdropCandidate(farmChain)
      }
    };
  }

  function compactFarmForIndex(index) {
    const players = [...document.querySelectorAll(`#${AC.IDS.boards} .bga-agri-v10-player`)];
    return players[index]?.querySelector('.bga-agri-v10-farm-area') || null;
  }


  function isTransparentColor(color) {
    return !color ||
      color === 'transparent' ||
      color === 'rgba(0, 0, 0, 0)' ||
      color === 'rgba(0,0,0,0)';
  }

  function backgroundChainFrom(el, limit = 12) {
    const chain = [];
    let cur = el;
    let depth = 0;

    while (cur && depth < limit) {
      const cs = getComputedStyle(cur);
      const item = {
        depth,
        node: shortClass(cur),
        rect: rectOf(cur),
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage === 'none' ? 'none' : cs.backgroundImage.slice(0, 220),
        backgroundSize: cs.backgroundSize,
        backgroundPosition: cs.backgroundPosition,
        opacity: cs.opacity,
        position: cs.position,
        zIndex: cs.zIndex,
        overflow: cs.overflow,
        transform: cs.transform,
        isCandidate: !isTransparentColor(cs.backgroundColor) || cs.backgroundImage !== 'none'
      };

      chain.push(item);
      cur = cur.parentElement;
      depth += 1;
    }

    return chain;
  }

  function firstBackdropCandidate(chain) {
    return chain.find(item => item.isCandidate) || null;
  }


  function attrsOf(el) {
    if (!el) return null;
    const out = {};
    for (const a of [...el.attributes || []]) {
      if (a.name === 'style') continue;
      out[a.name] = a.value;
    }
    return out;
  }

  function layoutCssOf(el) {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      position: cs.position,
      left: cs.left,
      top: cs.top,
      right: cs.right,
      bottom: cs.bottom,
      width: cs.width,
      height: cs.height,
      margin: cs.margin,
      padding: cs.padding,
      boxSizing: cs.boxSizing,
      overflow: cs.overflow,
      transform: cs.transform,
      zIndex: cs.zIndex,
      order: cs.order,
      gridTemplateColumns: cs.gridTemplateColumns,
      gridTemplateRows: cs.gridTemplateRows,
      gridAutoFlow: cs.gridAutoFlow,
      gridColumn: cs.gridColumn,
      gridRow: cs.gridRow,
      flexDirection: cs.flexDirection,
      flexWrap: cs.flexWrap,
      justifyContent: cs.justifyContent,
      alignItems: cs.alignItems,
      backgroundColor: cs.backgroundColor,
      visibility: cs.visibility,
      opacity: cs.opacity
    };
  }

  function briefNodeInfo(el) {
    if (!el) return null;
    return {
      node: shortClass(el),
      attrs: attrsOf(el),
      rect: rectOf(el),
      css: layoutCssOf(el),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      childCount: el.children?.length ?? 0
    };
  }

  function parentChain(el, limit = 8) {
    const chain = [];
    let cur = el;
    let depth = 0;
    while (cur && depth < limit) {
      chain.push(briefNodeInfo(cur));
      cur = cur.parentElement;
      depth += 1;
    }
    return chain;
  }

  function numberFromTurnId(el) {
    const m = (el?.id || '').match(/turn[_-]?(\d+)/i);
    return m ? Number(m[1]) : null;
  }

  function clusterNumbers(values, tolerance = 6) {
    const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
    const clusters = [];
    for (const v of sorted) {
      const last = clusters[clusters.length - 1];
      if (!last || Math.abs(last.values[last.values.length - 1] - v) > tolerance) {
        clusters.push({ values: [v] });
      } else {
        last.values.push(v);
      }
    }
    return clusters.map(c => Math.round(c.values.reduce((a, b) => a + b, 0) / c.values.length));
  }

  function collectOriginalUiLayout() {
    const selectors = [
      '#game-flow-panel',
      '#player-boards',
      '#alternative-hand-wrapper',
      '#main-boards',
      '#central-board-holder',
      '#central-board',
      '#left-board-holder',
      '#left-board',
      '#right-board-holder',
      '#right-board',
      '#overall-content',
      '#page-content',
      '#logs_wrap',
      '#right-side'
    ];

    const candidates = {};
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      candidates[sel] = briefNodeInfo(el);
    }

    const turnEls = [
      ...document.querySelectorAll(
        '#central-board .turn-action-container, ' +
        '#central-board [id^="turn_"], ' +
        '#central-board [id^="turn-"], ' +
        '.turn-action-container'
      )
    ].filter((el, idx, arr) => arr.indexOf(el) === idx);

    const turnContainers = turnEls
      .map((el, domIndex) => {
        const r = el.getBoundingClientRect();
        return {
          domIndex,
          turnNumber: numberFromTurnId(el),
          node: shortClass(el),
          attrs: attrsOf(el),
          rect: rectOf(el),
          css: layoutCssOf(el),
          parent: shortClass(el.parentElement),
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140)
        };
      })
      .sort((a, b) => {
        const an = a.turnNumber ?? 9999;
        const bn = b.turnNumber ?? 9999;
        return an - bn || a.domIndex - b.domIndex;
      });

    const xs = clusterNumbers(turnContainers.map(t => t.rect?.x));
    const ys = clusterNumbers(turnContainers.map(t => t.rect?.y));
    const positionsByTurn = turnContainers.map(t => ({
      turnNumber: t.turnNumber,
      x: t.rect?.x,
      y: t.rect?.y,
      w: t.rect?.w,
      h: t.rect?.h,
      position: t.css?.position,
      gridColumn: t.css?.gridColumn,
      gridRow: t.css?.gridRow,
      order: t.css?.order
    }));

    const firstTurn = turnEls[0] || null;
    const actionCards = [
      ...document.querySelectorAll('#central-board .action-card-holder:not(.component), #central-board .action-card-holder')
    ].slice(0, 80).map((el, index) => ({
      index,
      node: shortClass(el),
      attrs: attrsOf(el),
      rect: rectOf(el),
      css: layoutCssOf(el),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    }));

    return {
      candidates,
      centralBoard: briefNodeInfo(document.querySelector('#central-board')),
      centralBoardParentChain: parentChain(document.querySelector('#central-board')),
      firstTurnParentChain: parentChain(firstTurn),
      layoutSummary: {
        turnCount: turnContainers.length,
        uniqueTurnX: xs,
        uniqueTurnY: ys,
        allTurnPositions: [...new Set(turnContainers.map(t => t.css?.position))],
        likelyNeedsAbsoluteOverride: turnContainers.some(t => ['absolute', 'relative', 'fixed'].includes(t.css?.position)),
        note: 'Use this to decide whether turn cells can be reordered by grid/flex CSS or need per-turn top/left overrides.'
      },
      positionsByTurn,
      turnContainers,
      actionCards
    };
  }

  AC.debug = {
    copy() {
      const players = AC.dom.collectPlayers();

      const report = {
        version: AC.VERSION,
        debugVersion: 'farm-layer-v3-original-ui-layout',
        url: location.href,
        viewport: { w: innerWidth, h: innerHeight },
        settings: AC.state.settings,
        players: players.map(p => ({
          index: p.index,
          name: p.name,
          color: p.color,
          hasFarm: !!p.farm,
          occupations: p.occupationCards.length,
          improvements: p.improvementCards.length,
          resourcesText: p.resources?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 240)
        })),
        panel: (() => {
          const el = document.getElementById(AC.IDS.panel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
        })(),
        toggle: (() => {
          const el = document.getElementById(AC.IDS.toggle);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            rect: {
              x: Math.round(r.x),
              y: Math.round(r.y),
              w: Math.round(r.width),
              h: Math.round(r.height),
              rightGap: Math.round(innerWidth - r.right),
              bottomGap: Math.round(innerHeight - r.bottom)
            },
            css: {
              position: cs.position,
              left: cs.left,
              right: cs.right,
              top: cs.top,
              bottom: cs.bottom,
              width: cs.width,
              maxWidth: cs.maxWidth,
              display: cs.display,
              transform: cs.transform
            }
          };
        })(),
        originalUiLayout: collectOriginalUiLayout(),
        farmLayers: players.map(p => ({
          index: p.index,
          name: p.name,
          original: farmLayerReport(p.farm),
          compact: farmLayerReport(compactFarmForIndex(p.index))
        }))
      };

      const text = JSON.stringify(report, null, 2);
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      AC.utils.toast('已複製偵測');
    }
  };

  AC.init();
})();
