(() => {
  'use strict';

  const isAgricolaPage =
    /(^|\/)agricola($|[/?#])/.test(location.pathname) ||
    document.querySelector('link[href*="agricola.css"]') ||
    document.querySelector('#player-boards #hand-container, #alternative-hand-wrapper #hand-container');

  if (!isAgricolaPage) return;
  if (window.__BGA_AGRICOLA_COMPACT_PANEL_V040__) return;
  window.__BGA_AGRICOLA_COMPACT_PANEL_V040__ = true;

  const IDS = {
    toolbar: 'bga-agri-css-toolbar',
    toggle: 'bga-agri-css-toggle',
    zoom: 'bga-agri-css-zoom',
    toast: 'bga-agri-css-toast'
  };

  const DEFAULTS = {
    enabled: true,
    // Conservative default: keep the main BGA board visible.
    panelHeight: 50,
    handHeight: 135,
    boardScale: 0.32,
    cardScale: 0.34,
    layout: 'auto'
  };

  let settings = { ...DEFAULTS };
  let mounted = false;
  let snapshots = new Map();
  let resizeTimer = null;
  let playedCardsObserver = null;

  init();

  async function init() {
    settings = await loadSettings();
    injectToolbar();
    applyVars();
    bindEvents();
    if (settings.enabled) mount();
    else setToolbarVisible(false);
  }

  function loadSettings() {
    return new Promise(resolve => {
      if (!chrome?.storage?.local) return resolve({ ...DEFAULTS });
      chrome.storage.local.get(DEFAULTS, stored => resolve({ ...DEFAULTS, ...stored }));
    });
  }

  function save(patch) {
    settings = { ...settings, ...patch };
    if (chrome?.storage?.local) chrome.storage.local.set(settings);
    applyVars();
    updateToolbarLabels();
    if (settings.enabled) mount();
  }

  function injectToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = IDS.toolbar;
    toolbar.innerHTML = `
      <strong>Agricola Compact</strong>
      <span>v0.4.1 css mode</span>
      <button data-action="apply">套用</button>
      <button data-action="layout">排列：自動</button>
      <button data-action="heightDown">高度-</button>
      <button data-action="heightUp">高度+</button>
      <button data-action="handDown">手牌-</button>
      <button data-action="handUp">手牌+</button>
      <button data-action="boardDown">板塊-</button>
      <button data-action="boardUp">板塊+</button>
      <button data-action="cardDown">卡片-</button>
      <button data-action="cardUp">卡片+</button>
      <button data-action="debug">複製偵測</button>
      <button data-action="close">收合</button>
    `;
    toolbar.addEventListener('click', e => {
      const action = e.target?.dataset?.action;
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      handleAction(action);
    });
    document.documentElement.appendChild(toolbar);

    const toggle = document.createElement('button');
    toggle.id = IDS.toggle;
    toggle.textContent = 'Agricola Compact';
    toggle.addEventListener('click', () => {
      if (settings.enabled) unmountAndHide();
      else showAndMount();
    });
    document.documentElement.appendChild(toggle);

    updateToolbarLabels();
  }

  function handleAction(action) {
    if (action === 'apply') return mount(true);
    if (action === 'close') return unmountAndHide();
    if (action === 'debug') return copyDebug();

    if (action === 'layout') {
      const next = settings.layout === 'auto' ? '4col' : settings.layout === '4col' ? '2x2' : 'auto';
      return save({ layout: next });
    }

    if (action === 'heightDown') return save({ panelHeight: clamp(settings.panelHeight - 5, 45, 90) });
    if (action === 'heightUp') return save({ panelHeight: clamp(settings.panelHeight + 5, 45, 90) });
    if (action === 'handDown') return save({ handHeight: clamp(settings.handHeight - 24, 120, 380) });
    if (action === 'handUp') return save({ handHeight: clamp(settings.handHeight + 24, 120, 380) });
    if (action === 'boardDown') return save({ boardScale: round(clamp(settings.boardScale - 0.04, 0.25, 0.85)) });
    if (action === 'boardUp') return save({ boardScale: round(clamp(settings.boardScale + 0.04, 0.25, 0.85)) });
    if (action === 'cardDown') return save({ cardScale: round(clamp(settings.cardScale - 0.04, 0.28, 0.90)) });
    if (action === 'cardUp') return save({ cardScale: round(clamp(settings.cardScale + 0.04, 0.28, 0.90)) });
  }

  function applyVars() {
    const root = document.documentElement;
    const toolbarH = 32;
    const boardH = Math.max(100, Math.round(window.innerHeight * settings.panelHeight / 100 - settings.handHeight - toolbarH));
    root.style.setProperty('--bga-agri-css-panel-height', `${settings.panelHeight}vh`);
    root.style.setProperty('--bga-agri-css-toolbar-height', `${toolbarH}px`);
    root.style.setProperty('--bga-agri-css-hand-height', `${settings.handHeight}px`);
    root.style.setProperty('--bga-agri-css-board-height', `${boardH}px`);
    // Pass adjustment scale factor based on original default (0.32)
    root.style.setProperty('--bga-agri-css-board-scale-adjust', settings.boardScale / 0.32);
    root.style.setProperty('--bga-agri-css-card-scale', settings.cardScale);
  }

  function updateToolbarLabels() {
    const layoutText = settings.layout === '4col' ? '四欄' : settings.layout === '2x2' ? '2×2' : '自動';
    setButton('layout', `排列：${layoutText}`);
  }

  function setButton(action, text) {
    const btn = document.querySelector(`#${IDS.toolbar} [data-action="${action}"]`);
    if (btn) btn.textContent = text;
  }

  function bindEvents() {
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        applyVars();
        if (settings.enabled) applyLayoutClass();
      }, 120);
    });

    document.addEventListener('click', e => {
      if (!settings.enabled) return;
      const card = e.target.closest?.('.player-card');
      if (!card) return;
      const inCompact =
        card.closest('#alternative-hand-wrapper') ||
        card.closest('#player-boards') ||
        card.closest(`#${IDS.zoom}`);
      if (!inCompact || card.closest(`#${IDS.zoom}`)) return;

      e.preventDefault();
      e.stopPropagation();
      showCardZoom(card);
    }, true);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.getElementById(IDS.zoom)?.remove();
    });
  }

  function mount(force = false) {
    if (mounted && !force) {
      applyVars();
      applyLayoutClass();
      return;
    }

    settings.enabled = true;
    if (chrome?.storage?.local) chrome.storage.local.set(settings);
    setToolbarVisible(true);
    applyVars();

    const hand = document.querySelector('#alternative-hand-wrapper');
    const handContainer = document.querySelector('#alternative-hand-wrapper #hand-container');
    const boards = document.querySelector('#player-boards');
    const leftCol = document.querySelector('#player-boards-left-column');
    const sep = document.querySelector('#player-boards-separator');
    const resizables = [...document.querySelectorAll('#player-boards > .player-board-resizable')];

    [hand, handContainer, boards, leftCol, sep, ...resizables].filter(Boolean).forEach(saveSnapshot);

    // Relocate boards to body to prevent ancestor scale/transform context from breaking position: fixed
    if (boards && boards.parentElement !== document.body) {
      document.body.appendChild(boards);
    }

    document.documentElement.classList.add('bga-agri-css-compact-active');
    hand?.classList.add('bga-agri-css-hand-fixed');
    handContainer?.classList.add('bga-agri-css-hand-container');
    boards?.classList.add('bga-agri-css-boards-fixed');
    leftCol?.classList.add('bga-agri-css-hidden-column');
    sep?.classList.add('bga-agri-css-hidden-column');
    resizables.forEach(el => el.classList.add('bga-agri-css-board-card'));

    applyLayoutClass();
    setupPlayedCardsObserver();
    arrangePlayedCards();
    mounted = true;

    if (!hand || !boards || resizables.length < 4) {
      toast('偵測不完整，請按複製偵測');
    }
  }

  function applyLayoutClass() {
    const boards = document.querySelector('#player-boards');
    if (!boards) return;

    boards.classList.remove('bga-agri-layout-4col', 'bga-agri-layout-2x2');

    let layout = settings.layout;
    if (layout === 'auto') layout = window.innerWidth >= 1250 ? '4col' : '2x2';

    boards.classList.add(layout === '4col' ? 'bga-agri-layout-4col' : 'bga-agri-layout-2x2');
  }

  function unmountAndHide() {
    unmount();
    settings.enabled = false;
    if (chrome?.storage?.local) chrome.storage.local.set(settings);
    setToolbarVisible(false);
  }

  function showAndMount() {
    settings.enabled = true;
    if (chrome?.storage?.local) chrome.storage.local.set(settings);
    setToolbarVisible(true);
    mount(true);
  }

  function unmount() {
    document.documentElement.classList.remove('bga-agri-css-compact-active');
    document.querySelector('#alternative-hand-wrapper')?.classList.remove('bga-agri-css-hand-fixed');
    document.querySelector('#alternative-hand-wrapper #hand-container')?.classList.remove('bga-agri-css-hand-container');
    document.querySelector('#player-boards')?.classList.remove(
      'bga-agri-css-boards-fixed',
      'bga-agri-layout-4col',
      'bga-agri-layout-2x2'
    );
    document.querySelector('#player-boards-left-column')?.classList.remove('bga-agri-css-hidden-column');
    document.querySelector('#player-boards-separator')?.classList.remove('bga-agri-css-hidden-column');
    document.querySelectorAll('#player-boards > .player-board-resizable').forEach(el => el.classList.remove('bga-agri-css-board-card'));

    for (const [el, snap] of snapshots.entries()) restoreSnapshot(el, snap);
    snapshots.clear();

    if (playedCardsObserver) {
      playedCardsObserver.disconnect();
      playedCardsObserver = null;
    }
    document.querySelectorAll('.cards-wrapper .player-card').forEach(card => {
      card.style.removeProperty('grid-column');
      card.style.removeProperty('grid-row');
      card.style.removeProperty('z-index');
    });

    mounted = false;
  }

  function setToolbarVisible(visible) {
    document.getElementById(IDS.toolbar).style.display = visible ? 'flex' : 'none';
    document.getElementById(IDS.toggle).style.bottom = visible ? `calc(var(--bga-agri-css-panel-height) + 10px)` : '12px';
  }

  function saveSnapshot(el) {
    if (!el || snapshots.has(el)) return;
    snapshots.set(el, {
      style: el.getAttribute('style'),
      className: el.getAttribute('class'),
      parent: el.parentElement,
      nextSibling: el.nextSibling
    });
  }

  function restoreSnapshot(el, snap) {
    if (!el || !snap) return;
    if (snap.style === null) el.removeAttribute('style');
    else el.setAttribute('style', snap.style);

    if (snap.className === null) el.removeAttribute('class');
    else el.setAttribute('class', snap.className);

    // Restore original DOM placement
    if (snap.parent && el.parentElement !== snap.parent) {
      snap.parent.insertBefore(el, snap.nextSibling);
    }
  }

  function showCardZoom(card) {
    document.getElementById(IDS.zoom)?.remove();

    const overlay = document.createElement('div');
    overlay.id = IDS.zoom;

    const box = document.createElement('div');
    box.className = 'bga-agri-css-zoom-box';

    const close = document.createElement('button');
    close.className = 'bga-agri-css-zoom-close';
    close.textContent = '×';

    const clone = card.cloneNode(true);
    clone.classList.add('bga-agri-css-zoom-card');

    // Clean inline styles on the cloned card and all its children
    // to prevent dynamic BGA scale transforms from rendering fuzzy zoomed mini cards.
    clone.removeAttribute('style');
    clone.querySelectorAll('*').forEach(el => el.removeAttribute('style'));

    // Remove mini class to allow standard full card layouts to apply
    if (clone.classList.contains('mini')) {
      clone.classList.remove('mini');
    }

    box.appendChild(close);
    box.appendChild(clone);
    overlay.appendChild(box);

    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target === close) overlay.remove();
    });

    document.documentElement.appendChild(overlay);
  }

  function copyDebug() {
    const report = {
      url: location.href,
      title: document.title,
      viewport: { width: innerWidth, height: innerHeight },
      settings,
      containers: {
        alternativeHandWrapper: summarize(document.querySelector('#alternative-hand-wrapper')),
        handContainer: summarize(document.querySelector('#alternative-hand-wrapper #hand-container')),
        playerBoards: summarize(document.querySelector('#player-boards')),
        resizables: [...document.querySelectorAll('#player-boards > .player-board-resizable')].map(summarize),
        wrappers: [...document.querySelectorAll('[id^="board-wrapper-"].player-board-wrapper')].map(summarize),
        fullCards: [...document.querySelectorAll('#hand-container > .player-card')].map(summarize).slice(0, 30)
      }
    };
    copyText(JSON.stringify(report, null, 2)).then(() => toast('已複製偵測結果'));
  }

  function summarize(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id,
      cls: el.className,
      style: el.getAttribute('style') || '',
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)
    };
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return Promise.resolve();
  }

  function toast(msg) {
    document.getElementById(IDS.toast)?.remove();
    const el = document.createElement('div');
    el.id = IDS.toast;
    el.textContent = msg;
    document.documentElement.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  function setupPlayedCardsObserver() {
    if (playedCardsObserver) return;
    const boards = document.querySelector('#player-boards');
    if (!boards) return;
    
    playedCardsObserver = new MutationObserver(() => {
      arrangePlayedCards();
    });
    playedCardsObserver.observe(boards, { childList: true, subtree: true });
  }

  function arrangePlayedCards() {
    if (!settings.enabled) return;
    
    function getPlayOrder(card, index) {
      const orderAttr = card.getAttribute('data-play-order');
      if (orderAttr !== null) {
        const parsed = parseInt(orderAttr, 10);
        if (!isNaN(parsed)) return parsed;
      }
      return index; // fallback
    }

    document.querySelectorAll('.cards-wrapper').forEach(wrapper => {
      const cards = Array.from(wrapper.children).filter(el => el.classList.contains('player-card'));
      const occupations = [];
      const developments = [];
      
      cards.forEach((card, idx) => {
        const order = getPlayOrder(card, idx);
        card.__playOrder = order;
        
        if (card.classList.contains('occupation')) {
          occupations.push(card);
        } else {
          developments.push(card);
        }
      });
      
      // Sort in ascending order (earliest played card first, grid-row = 1)
      occupations.sort((a, b) => a.__playOrder - b.__playOrder);
      developments.sort((a, b) => a.__playOrder - b.__playOrder);
      
      occupations.forEach((card, idx) => {
        card.style.setProperty('grid-column', '1', 'important');
        card.style.setProperty('grid-row', `${idx + 1}`, 'important');
        card.style.setProperty('z-index', `${idx + 1}`, 'important');
      });
      
      developments.forEach((card, idx) => {
        card.style.setProperty('grid-column', '2', 'important');
        card.style.setProperty('grid-row', `${idx + 1}`, 'important');
        card.style.setProperty('z-index', `${idx + 1}`, 'important');
      });
    });
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function round(n) { return Math.round(n * 100) / 100; }
})();
