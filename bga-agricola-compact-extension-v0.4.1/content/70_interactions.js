(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.interactions = {
    handlePanelClick(e) {
      const action = e.target?.dataset?.action;
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        AC.handleAction(action);
        return;
      }

      const card = e.target.closest?.('.player-card');
      if (card && card.closest(`#${AC.IDS.panel}`)) {
        e.preventDefault();
        e.stopPropagation();

        if (e.ctrlKey || e.metaKey || e.shiftKey) AC.interactions.activateOriginalFromClone(card);
        else AC.interactions.zoomCard(card);
      }
    },

    zoomCard(card) {
      const sourceId = card.dataset.sourceId || card.closest('[data-source-id]')?.dataset?.sourceId || '';
      document.getElementById(AC.IDS.zoom)?.remove();

      const overlay = document.createElement('div');
      overlay.id = AC.IDS.zoom;

      const box = document.createElement('div');
      box.className = 'bga-agri-v10-zoom-box';

      const clone = AC.dom.cloneWithSource(card);
      clone.classList.remove('mini');
      clone.classList.add('bga-agri-v10-zoom-card');
      if (sourceId) clone.dataset.sourceId = sourceId;

      box.appendChild(clone);
      overlay.appendChild(box);

      overlay.addEventListener('click', ev => {
        if (ev.target === overlay) overlay.remove();
      });

      const onKeyDown = ev => {
        if (ev.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', onKeyDown, true);
        }
      };
      document.addEventListener('keydown', onKeyDown, true);

      document.documentElement.appendChild(overlay);
    },

    activateOriginalFromClone(cloneCard) {
      const sourceId = cloneCard.dataset.sourceId || cloneCard.closest('[data-source-id]')?.dataset?.sourceId;
      if (!sourceId) return AC.utils.toast('找不到原卡 id');
      AC.interactions.activateOriginal(sourceId);
    },

    activateOriginal(sourceId) {
      const original = AC.dom.findOriginalById(sourceId);
      if (!original) return AC.utils.toast('原卡不存在或已更新');

      document.getElementById(AC.IDS.zoom)?.remove();
      original.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      original.classList.add('bga-agri-v10-source-flash');
      setTimeout(() => original.classList.remove('bga-agri-v10-source-flash'), 1200);

      try { original.focus?.(); } catch (_) {}
      try { original.click?.(); } catch (_) {}

      const rect = original.getBoundingClientRect();
      const cx = Math.round(rect.left + rect.width / 2);
      const cy = Math.round(rect.top + rect.height / 2);
      const init = { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy, screenX: cx, screenY: cy, button: 0, buttons: 1 };

      for (const type of ['pointerover', 'mouseover', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        try {
          const ev = type.startsWith('pointer') && typeof PointerEvent === 'function'
            ? new PointerEvent(type, { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true })
            : new MouseEvent(type, init);
          original.dispatchEvent(ev);
        } catch (_) {}
      }

      AC.utils.toast('已嘗試代理點擊原卡');
    }
  };
})();
