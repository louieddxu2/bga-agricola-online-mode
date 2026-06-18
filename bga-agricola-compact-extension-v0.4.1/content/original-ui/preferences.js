(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  function setSelectValue(select, value) {
    if (!select || select.value === value) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
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

    const actionCardsPref = document.querySelector('#preference_control_150');
    if (actionCardsPref && actionCardsPref.dataset.bgaAgriV10ForcedByCompact !== '1') {
      actionCardsPref.dataset.bgaAgriV10OriginalValue = actionCardsPref.value;
      actionCardsPref.dataset.bgaAgriV10ForcedByCompact = '1';
      // BGA action-card preference 0 = player-panel area. This keeps the native
      // source away from the central board while compact mode renders it beside
      // round 14 using its own positioning.
      setSelectValue(actionCardsPref, '0');
    }
  }

  function restoreStableBgaPreferences() {
    ['#preference_control_108', '#preference_control_150'].forEach(selector => {
      const pref = document.querySelector(`${selector}[data-bga-agri-v10-forced-by-compact="1"]`);
      if (!pref) return;
      const oldValue = pref.dataset.bgaAgriV10OriginalValue;
      delete pref.dataset.bgaAgriV10OriginalValue;
      delete pref.dataset.bgaAgriV10ForcedByCompact;
      if (oldValue !== undefined) setSelectValue(pref, oldValue);
    });
  }

  AC.originalUiPreferences = {
    applyStableBgaPreferences,
    restoreStableBgaPreferences,
    setSelectValue
  };
})();
