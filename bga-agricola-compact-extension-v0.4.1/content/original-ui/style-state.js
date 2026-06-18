(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  function backupStyle(el, key) {
    if (!el || el.dataset[key] !== undefined) return;
    el.dataset[key] = el.getAttribute('style') || '';
  }

  function restoreStyle(el, key) {
    if (!el || el.dataset[key] === undefined) return;
    const old = el.dataset[key];
    if (old) el.setAttribute('style', old);
    else el.removeAttribute('style');
    delete el.dataset[key];
  }

  AC.originalUiStyleState = {
    backupStyle,
    restoreStyle
  };
})();
