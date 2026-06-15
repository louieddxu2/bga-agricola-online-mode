(() => {
  console.log('30_panel-shell.js loaded');
  const AC = window.AgriCompact;
  if (!AC) {
    console.log('30_panel-shell.js window.AgriCompact is undefined!');
    return;
  }

  AC.init = async function init() {
    console.log('AC.init() starting...');
    await AC.settings.load();
    AC.injectToggle();
    AC.applyVars();
    AC.positionToggle?.();
    if (AC.state.settings.enabled) AC.openPanel();
  };

  AC.injectToggle = function injectToggle() {
    if (document.getElementById(AC.IDS.toggle)) return;
    const btn = document.createElement('button');
    btn.id = AC.IDS.toggle;
    btn.type = 'button';
    btn.textContent = 'Agricola Compact';
    btn.addEventListener('click', () => AC.state.settings.enabled ? AC.closePanel() : AC.openPanel());
    document.documentElement.appendChild(btn);
  };

  AC.openPanel = function openPanel() {
    AC.settings.save({ enabled: true });
    document.documentElement.classList.add('bga-agri-v10-open');
    document.getElementById(AC.IDS.panel)?.remove();

    const panel = document.createElement('section');
    panel.id = AC.IDS.panel;
    panel.innerHTML = `
      <div id="${AC.IDS.toolbar}">
        <strong>Agricola Compact</strong>
        <span>v0.10 modular</span>
        <button data-action="refresh">更新</button>
        <button data-action="debug">複製偵測</button>
        <button data-action="boardDown">板區高-</button>
        <button data-action="boardUp">板區高+</button>
        <button data-action="handDown">手牌-</button>
        <button data-action="handUp">手牌+</button>
        <button data-action="handCardDown">手牌卡-</button>
        <button data-action="handCardUp">手牌卡+</button>
        <button data-action="cardDown">出牌卡-</button>
        <button data-action="cardUp">出牌卡+</button>
        <button data-action="reset">重置</button>
        <button data-action="close">收合</button>
      </div>
      <div id="${AC.IDS.hand}"></div>
      <div id="${AC.IDS.boards}"></div>
    `;
    panel.addEventListener('click', AC.interactions.handlePanelClick, true);
    document.documentElement.appendChild(panel);

    AC.refresh();
    AC.positionToggle();
    requestAnimationFrame(AC.positionToggle);
    AC.onResize = () => {
      AC.positionToggle();
      AC.layoutFarms();
    };
    window.addEventListener('resize', AC.onResize);
    AC.observer.start();
  };

  AC.closePanel = function closePanel() {
    AC.settings.save({ enabled: false });
    document.documentElement.classList.remove('bga-agri-v10-open');
    document.getElementById(AC.IDS.panel)?.remove();
    document.getElementById(AC.IDS.zoom)?.remove();
    AC.observer.stop();

    if (AC.onResize) {
      window.removeEventListener('resize', AC.onResize);
    }
    AC.positionToggle();
  };

  AC.handleAction = function handleAction(action) {
    const s = AC.state.settings;
    const U = AC.utils;

    if (action === 'close') return AC.closePanel();
    if (action === 'refresh') return AC.refresh();
    if (action === 'debug') return AC.debug.copy();
    if (action === 'reset') {
      AC.settings.reset(true);
      return AC.refresh();
    }

    if (action === 'boardDown') AC.settings.save({ boardHeight: U.clamp(s.boardHeight - 3, 20, 72) });
    if (action === 'boardUp') AC.settings.save({ boardHeight: U.clamp(s.boardHeight + 3, 20, 72) });
    if (action === 'handDown') AC.settings.save({ handHeight: U.clamp(s.handHeight - 12, 50, 240) });
    if (action === 'handUp') AC.settings.save({ handHeight: U.clamp(s.handHeight + 12, 50, 240) });
    if (action === 'handCardDown') AC.settings.save({ handCardScale: U.round(U.clamp(s.handCardScale - 0.03, 0.16, 0.75)) });
    if (action === 'handCardUp') AC.settings.save({ handCardScale: U.round(U.clamp(s.handCardScale + 0.03, 0.16, 0.75)) });
    if (action === 'cardDown') AC.settings.save({ cardPreviewScale: U.round(U.clamp(s.cardPreviewScale - 0.02, 0.20, 0.60)) });
    if (action === 'cardUp') AC.settings.save({ cardPreviewScale: U.round(U.clamp(s.cardPreviewScale + 0.02, 0.20, 0.60)) });

    AC.layoutFarms();
    AC.positionToggle();
  };

  AC.positionToggle = function positionToggle() {
    const btn = document.getElementById(AC.IDS.toggle);
    if (!btn) return;

    btn.style.setProperty('display', 'inline-flex', 'important');
    btn.style.setProperty('width', 'max-content', 'important');
    btn.style.setProperty('max-width', 'max-content', 'important');
    btn.style.setProperty('height', 'auto', 'important');
    btn.style.setProperty('white-space', 'nowrap', 'important');

    const panel = document.getElementById(AC.IDS.panel);

    if (AC.state.settings?.enabled && panel) {
      const pr = panel.getBoundingClientRect();

      // First neutralize the closed-state anchors, then measure the real button size.
      btn.style.setProperty('right', 'auto', 'important');
      btn.style.setProperty('bottom', 'auto', 'important');
      btn.style.setProperty('left', '0px', 'important');
      btn.style.setProperty('top', '0px', 'important');

      const br = btn.getBoundingClientRect();
      const gap = 8;
      const left = Math.max(0, Math.round(pr.right - br.width - gap));
      const top = Math.max(0, Math.round(pr.top - br.height - gap));

      btn.style.setProperty('left', `${left}px`, 'important');
      btn.style.setProperty('top', `${top}px`, 'important');
      btn.style.setProperty('right', 'auto', 'important');
      btn.style.setProperty('bottom', 'auto', 'important');
      return;
    }

    btn.style.setProperty('left', 'auto', 'important');
    btn.style.setProperty('top', 'auto', 'important');
    btn.style.setProperty('right', '14px', 'important');
    btn.style.setProperty('bottom', '12px', 'important');
  };

})();
