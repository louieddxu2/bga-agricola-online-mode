import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const compactSource = readFileSync(new URL('../content/85_original-ui-compact.js', import.meta.url), 'utf8');
const panelHeight = '--bga-agri-v10-log-panel-height';
const logsHeight = '--bga-agri-v10-logs-height';

function createPage() {
  const elements = new Map();
  const frames = new Map();
  const classes = new Set();
  const styles = new Map();
  const listeners = new Map();
  const cardLayouts = [];
  let nextFrame = 0;
  let mutations;
  let resize;
  const body = {};

  const noop = () => {};
  const AC = {
    state: {},
    openPanel: noop,
    closePanel: noop,
    originalUiPreferences: { applyStableBgaPreferences: noop, restoreStableBgaPreferences: noop },
    originalUiHand: { layoutHandCards: () => cardLayouts.push('hand'), restoreHandCards: noop },
    originalUiActionCards: { layoutPlayerActionCards: () => cardLayouts.push('action cards'), restorePlayerActionCards: noop }
  };
  runInNewContext(compactSource, {
    window: {
      AgriCompact: AC,
      innerWidth: 1200,
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: name => listeners.delete(name)
    },
    document: {
      body,
      documentElement: {
        classList: {
          add: name => classes.add(name),
          remove: name => classes.delete(name),
          contains: name => classes.has(name),
          toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
        },
        style: {
          getPropertyValue: name => styles.get(name),
          setProperty: (name, value) => styles.set(name, value),
          removeProperty: name => styles.delete(name)
        }
      },
      querySelector: selector => elements.get(selector),
      querySelectorAll: selectors => selectors.split(', ').map(selector => elements.get(selector)).filter(Boolean),
      getElementById: id => elements.get('#' + id)
    },
    MutationObserver: class {
      constructor(callback) { mutations = callback; }
      observe() {}
      disconnect() {}
    },
    ResizeObserver: class {
      constructor(callback) { resize = this; this.callback = callback; }
      observed = new Set();
      observe(node) { this.observed.add(node); }
      disconnect() { this.observed.clear(); }
    },
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout: noop
  });

  return {
    AC, styles, classes, listeners, cardLayouts,
    add(selector, rect) {
      const node = {
        nodeType: 1,
        matches: selectors => selectors.split(', ').includes(selector),
        getBoundingClientRect: () => rect
      };
      const previous = elements.get(selector);
      elements.set(selector, node);
      mutations?.([{ type: 'childList', target: body, addedNodes: [node], removedNodes: previous ? [previous] : [] }]);
      return node;
    },
    flushFrame() {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback());
    },
    resize(node) {
      assert.ok(resize.observed.has(node), 'layout anchor is observed');
      resize.callback();
    },
    observed: () => [...resize.observed]
  };
}

test('compact mode sizes late and replaced history panels, and responds to layout changes', () => {
  const page = createPage();
  page.AC.openPanel();
  page.flushFrame();
  assert.equal(page.styles.has(logsHeight), false);

  page.add('#ActionFishing', { bottom: 510, height: 100 });
  page.add('#right-side-second-part', { top: 220, left: 1000 });
  const boardsRect = { left: 0, right: 1200, top: 470, height: 200 };
  const boards = page.add('#player-boards', boardsRect);
  const firstPart = page.add('#right-side-first-part', {});
  const logsRect = { left: 1000, right: 1200, top: 260, width: 200 };
  const logs = page.add('#logs_wrap', logsRect);
  page.flushFrame();

  assert.equal(page.styles.get(panelHeight), '250px');
  assert.equal(page.styles.get(logsHeight), '210px');
  assert.deepEqual(page.cardLayouts, ['hand', 'action cards', 'hand', 'action cards']);

  logsRect.top = 320;
  page.resize(firstPart);
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '150px');

  boardsRect.top = 340;
  page.resize(boards);
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '20px');

  const replacement = page.add('#logs_wrap', { ...logsRect, top: 350 });
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '0px');
  assert.ok(page.observed().includes(replacement));
  assert.ok(!page.observed().includes(logs));

  boardsRect.top = 600;
  page.resize(boards);
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '160px');
  assert.equal(page.cardLayouts.length, 4);
});

test('closing compact mode cancels a pending right-log update and clears its CSS overrides', () => {
  const page = createPage();
  page.add('#ActionFishing', { bottom: 510, height: 100 });
  page.add('#right-side-second-part', { top: 220 });
  const logs = page.add('#logs_wrap', { left: 1000, right: 1200, top: 260, width: 200 });
  page.AC.openPanel();
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '250px');

  page.resize(logs);
  page.listeners.get('resize')();
  page.AC.closePanel();
  page.flushFrame();
  page.flushFrame();

  assert.equal(page.styles.size, 0);
  assert.equal(page.classes.has('bga-agri-v10-log-limited'), false);
  assert.deepEqual(page.observed(), []);
});
