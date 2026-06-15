(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  const TOPLINE_ID = 'bga-agri-v10-original-topline';

  function textOf(el) {
    return (el?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findLogoAction() {
    return document.querySelector('#logoicon:not([style*="display:none"]), #logoicon_inprogress:not([style*="display:none"]), #logoicon, #logoicon_inprogress');
  }

  function findReturnAction() {
    const candidates = [
      ...document.querySelectorAll(
        '#pagemaintitle_wrap button, #pagemaintitle_wrap a, #pagemaintitle_wrap .bgabutton, ' +
        '#page-title button, #page-title a, #page-title .bgabutton'
      )
    ];
    return candidates.find(el => /返回|回到|目錄|列表|Return|Back/i.test(textOf(el))) || null;
  }

  function getFlowParts() {
    const flow = document.querySelector('#game-flow-panel');
    if (!flow) return { round: '', phases: '' };

    const round = textOf(flow.querySelector('.gf-round')) || '';
    const cloned = flow.cloneNode(true);
    cloned.querySelector('.gf-round')?.remove();
    const phases = textOf(cloned);
    return { round, phases };
  }

  function updateTopline() {
    const row = document.getElementById(TOPLINE_ID);
    if (!row) return;

    const titleText = textOf(document.querySelector('#pagemaintitletext'));
    const originalLogo = findLogoAction();
    const { round, phases } = getFlowParts();
    const originalReturn = findReturnAction();

    const logoBtn = row.querySelector('[data-part="logo"]');
    if (originalLogo) {
      const img = originalLogo.querySelector('img');
      logoBtn.innerHTML = img?.src ? `<img src="${img.src}" alt="回到目錄">` : '☰';
      logoBtn.style.display = '';
      logoBtn.onclick = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        originalLogo.click();
      };
    } else {
      logoBtn.textContent = '☰';
      logoBtn.style.display = '';
      logoBtn.onclick = null;
    }

    row.querySelector('[data-part="status"]').textContent = titleText || ' ';
    row.querySelector('[data-part="round"]').textContent = round || ' ';
    row.querySelector('[data-part="phases"]').textContent = phases || ' ';

    const btn = row.querySelector('[data-part="return"]');
    if (originalReturn) {
      btn.textContent = textOf(originalReturn) || '返回遊戲桌列表';
      btn.style.display = '';
      btn.onclick = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        originalReturn.click();
      };
    } else {
      btn.textContent = '';
      btn.style.display = 'none';
      btn.onclick = null;
    }
  }

  function ensureTopline() {
    let row = document.getElementById(TOPLINE_ID);
    if (!row) {
      row = document.createElement('div');
      row.id = TOPLINE_ID;
      row.innerHTML = `
        <button type="button" class="bga-agri-v10-topline-logo" data-part="logo" title="回到目錄"></button>
        <span class="bga-agri-v10-topline-status" data-part="status"></span>
        <span class="bga-agri-v10-topline-sep">｜</span>
        <span class="bga-agri-v10-topline-round" data-part="round"></span>
        <span class="bga-agri-v10-topline-sep">｜</span>
        <span class="bga-agri-v10-topline-phases" data-part="phases"></span>
        <button type="button" class="bga-agri-v10-topline-return" data-part="return"></button>
      `;

      const gameArea = document.querySelector('#game_play_area');
      if (gameArea) gameArea.insertBefore(row, gameArea.firstChild);
      else document.body.prepend(row);
    }

    updateTopline();
    return row;
  }

  AC.originalUiCompact = {
    enable() {
      document.documentElement.classList.add('bga-agri-v10-original-compact');
      ensureTopline();
      clearInterval(AC.originalUiCompact._timer);
      AC.originalUiCompact._timer = setInterval(updateTopline, 1000);
    },

    disable() {
      document.documentElement.classList.remove('bga-agri-v10-original-compact');
      clearInterval(AC.originalUiCompact._timer);
      AC.originalUiCompact._timer = null;
      document.getElementById(TOPLINE_ID)?.remove();
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
