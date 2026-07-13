(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  function setSelectValue(select, value) {
    if (!select || select.value === value) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setCheckboxValue(checkbox, value) {
    if (!checkbox || checkbox.checked === value) return;
    checkbox.checked = value;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function findResourcesNearBoardPreference() {
    const rows = [...document.querySelectorAll('#settings-section-layout .row-data-boolean')];
    const row = rows.find(candidate => {
      const text = candidate.querySelector('.boolean-setting-text')?.textContent?.trim() || '';
      return text === '玩家板塊附近的資源' || /resources near player board/i.test(text);
    });
    return row?.querySelector('input.boolean-setting-chk') || null;
  }

  function applyStableBgaPreferences() {
    const handPref = document.querySelector('#preference_control_108');
    if (handPref && handPref.dataset.bgaAgriV10ForcedByCompact !== '1') {
      handPref.dataset.bgaAgriV10OriginalValue = handPref.value;
      handPref.dataset.bgaAgriV10ForcedByCompact = '1';
      // BGA hand preference 2 = screen-bottom. This is the stable native hand DOM
      // source for compact mode; board-bottom conflicts with some player-board
      // placement modes and can leave stale non-native hand layout behind.
      setSelectValue(handPref, '2');
    }

    const resourcesPref = findResourcesNearBoardPreference();
    if (resourcesPref && resourcesPref.dataset.bgaAgriV10ForcedByCompact !== '1') {
      resourcesPref.dataset.bgaAgriV10OriginalChecked = String(resourcesPref.checked);
      resourcesPref.dataset.bgaAgriV10ForcedByCompact = '1';
      setCheckboxValue(resourcesPref, true);
    }
  }

  function restoreStableBgaPreferences() {
    ['#preference_control_108'].forEach(selector => {
      const pref = document.querySelector(`${selector}[data-bga-agri-v10-forced-by-compact="1"]`);
      if (!pref) return;
      const oldValue = pref.dataset.bgaAgriV10OriginalValue;
      delete pref.dataset.bgaAgriV10OriginalValue;
      delete pref.dataset.bgaAgriV10ForcedByCompact;
      if (oldValue !== undefined) setSelectValue(pref, oldValue);
    });

    const resourcesPref = findResourcesNearBoardPreference();
    if (resourcesPref?.dataset.bgaAgriV10ForcedByCompact === '1') {
      const oldChecked = resourcesPref.dataset.bgaAgriV10OriginalChecked === 'true';
      delete resourcesPref.dataset.bgaAgriV10OriginalChecked;
      delete resourcesPref.dataset.bgaAgriV10ForcedByCompact;
      setCheckboxValue(resourcesPref, oldChecked);
    }
  }

  AC.originalUiPreferences = {
    applyStableBgaPreferences,
    restoreStableBgaPreferences,
    setSelectValue
  };
})();
