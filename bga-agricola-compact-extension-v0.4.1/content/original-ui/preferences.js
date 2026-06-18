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
    if (!handPref || handPref.dataset.bgaAgriV10ForcedByCompact === '1') return;
    handPref.dataset.bgaAgriV10OriginalValue = handPref.value;
    handPref.dataset.bgaAgriV10ForcedByCompact = '1';
    // BGA hand preference 2 = screen-bottom. This is the stable native hand DOM
    // source for compact mode; board-bottom conflicts with some player-board
    // placement modes and can leave stale non-native hand layout behind.
    setSelectValue(handPref, '2');
  }

  function restoreStableBgaPreferences() {
    const handPref = document.querySelector('#preference_control_108[data-bga-agri-v10-forced-by-compact="1"]');
    if (!handPref) return;
    const oldValue = handPref.dataset.bgaAgriV10OriginalValue;
    delete handPref.dataset.bgaAgriV10OriginalValue;
    delete handPref.dataset.bgaAgriV10ForcedByCompact;
    if (oldValue !== undefined) setSelectValue(handPref, oldValue);
  }

  AC.originalUiPreferences = {
    applyStableBgaPreferences,
    restoreStableBgaPreferences,
    setSelectValue
  };
})();
