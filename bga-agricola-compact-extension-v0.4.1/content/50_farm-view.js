(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.farmView = {
    render(player) {
      const area = document.createElement('div');
      area.className = 'bga-agri-v10-farm-area';

      const shell = document.createElement('div');
      shell.className = 'bga-agri-v10-farm-shell player-board-wrapper';

      const holder = document.createElement('div');
      holder.className = 'bga-agri-v10-farm-holder player-board-holder';

      if (player.farm) {
        const farmClone = AC.dom.cloneWithSource(player.farm);
        holder.appendChild(farmClone);
      }

      shell.appendChild(holder);
      area.appendChild(shell);
      return area;
    }
  };

  AC.layoutFarms = function layoutFarms() {
    AC.applyVars();
    document.querySelectorAll(`#${AC.IDS.boards} .bga-agri-v10-farm-area`).forEach(area => {
      const shell = area.querySelector('.bga-agri-v10-farm-shell');
      if (!shell) return;

      const sw = Math.max(1, area.clientWidth);
      const sh = Math.max(1, area.clientHeight);
      const scale = Math.max(0.05, sw / 658);

      shell.style.transform = `scale(${scale})`;
      shell.style.left = `${Math.max(0, (sw - 658 * scale) / 2)}px`;
      shell.style.top = `${Math.max(0, (sh - 405 * scale) / 2)}px`;
    });
  };
})();
