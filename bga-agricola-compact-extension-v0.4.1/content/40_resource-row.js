(() => {
  const AC = window.AgriCompact;
  if (!AC) return;

  AC.resourceRow = {
    getPlayerHex(player) {
      const hex = player.resources?.querySelector('.agricola-player-pannel')?.dataset?.color || '';
      if (hex) return hex.replace(/^#/, '');
      const rgb = player.color || '';
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
      if (!match) return '';
      return [match[1], match[2], match[3]]
        .map(n => Number(n).toString(16).padStart(2, '0'))
        .join('');
    },

    applyPlayerColor(node, hex) {
      if (!node || !hex) return node;
      const color = `#${hex.replace(/^#/, '')}`;
      node.dataset.color = hex.replace(/^#/, '');
      node.style.color = color;

      node.querySelectorAll('.agricola-meeple, .meeple-container').forEach(el => {
        el.dataset.color = hex.replace(/^#/, '');
      });

      node.querySelectorAll('.meeple-farmer_icon, .meeple-fence_icon, .meeple-stable_icon').forEach(el => {
        el.dataset.color = hex.replace(/^#/, '');
      });

      return node;
    },

    renderPersonalPart(player, cls) {
      const el = player.resources?.querySelector(`.player-panel-personal-resources .${cls}`);
      if (!el) return null;

      const clone = AC.dom.cloneResource(el);
      const hex = AC.resourceRow.getPlayerHex(player);
      AC.resourceRow.applyPlayerColor(clone, hex);

      const span = clone.querySelector('span[data-max]');
      if (span) {
        const value = span.textContent.trim();
        const max = span.dataset.max;
        if (max) span.textContent = `${value}/${max}`;
      }

      clone.classList.add('bga-agri-v10-personal-part');
      return clone;
    },

    renderAnimalStrip(player) {
      const strip = document.createElement('div');
      strip.className = 'bga-agri-v10-animal-strip';

      ['resource-sheep', 'resource-pig', 'resource-cattle'].forEach(cls => {
        const el = player.resources?.querySelector(`.player-panel-board-resources .${cls}`);
        if (el) strip.appendChild(AC.dom.cloneResource(el));
      });

      if (!strip.children.length) strip.classList.add('bga-agri-v10-animal-strip-empty');
      return strip;
    },

    renderTopRow(player) {
      const row = document.createElement('div');
      row.className = 'bga-agri-v10-top-row';

      const hex = AC.resourceRow.getPlayerHex(player);

      const start = player.resources?.querySelector('.agricola-first-player-holder');
      if (start && start.children.length) {
        const startClone = AC.dom.cloneWithSource(start);
        startClone.classList.add('bga-agri-v10-start-marker');
        AC.resourceRow.applyPlayerColor(startClone, hex);
        row.appendChild(startClone);
      } else {
        const spacer = document.createElement('span');
        spacer.className = 'bga-agri-v10-start-spacer';
        row.appendChild(spacer);
      }

      const nameGroup = document.createElement('span');
      nameGroup.className = 'bga-agri-v10-name-group';

      const farmerCluster = player.resources?.querySelector('.player-board-name .farmer-cluster');
      if (farmerCluster) {
        const clusterClone = AC.dom.cloneWithSource(farmerCluster);
        clusterClone.classList.add('bga-agri-v10-name-farmers');
        AC.resourceRow.applyPlayerColor(clusterClone, hex);
        nameGroup.appendChild(clusterClone);
      }

      const name = document.createElement('span');
      name.className = 'bga-agri-v10-player-name';
      name.textContent = player.name;
      if (player.color) name.style.color = player.color;
      nameGroup.appendChild(name);

      row.appendChild(nameGroup);

      const parts = document.createElement('div');
      parts.className = 'bga-agri-v10-parts';

      ['resource-farmer', 'resource-fence', 'resource-stable'].forEach(cls => {
        const part = AC.resourceRow.renderPersonalPart(player, cls);
        if (part) parts.appendChild(part);
      });

      const begging = player.resources?.querySelector('.player-panel-resources .resource-begging');
      if (begging && AC.dom.getResourceNumber(begging) > 0) {
        const beggingClone = AC.dom.cloneResource(begging);
        beggingClone.classList.add('bga-agri-v10-begging-part');
        parts.appendChild(beggingClone);
      }

      row.appendChild(parts);

      const animals = AC.resourceRow.renderAnimalStrip(player);
      if (!animals.classList.contains('bga-agri-v10-animal-strip-empty')) row.appendChild(animals);

      return row;
    },

    renderResourceRow(player) {
      const row = document.createElement('div');
      row.className = 'bga-agri-v10-resource-row';

      const left = document.createElement('div');
      left.className = 'bga-agri-v10-resource-left';

      ['resource-wood', 'resource-clay', 'resource-stone', 'resource-reed', 'resource-grain', 'resource-vegetable', 'resource-food'].forEach(cls => {
        const el = player.resources?.querySelector(`.player-panel-resources .${cls}`);
        if (el) left.appendChild(AC.dom.cloneResource(el));
      });

      row.appendChild(left);
      return row;
    }
  };
})();
