import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const compactSource = readFileSync(new URL('../content/85_original-ui-compact.js', import.meta.url), 'utf8');
const refreshSource = readFileSync(new URL('../content/60_card-columns.js', import.meta.url), 'utf8');
const panelHeight = '--bga-agri-v10-log-panel-height';
const logsHeight = '--bga-agri-v10-logs-height';

function createPage() {
  const elements = new Map();
  const frames = new Map();
  const classes = new Set();
  const styles = new Map();
  const listeners = new Map();
  const timers = new Map();
  const cardLayouts = [];
  let nextFrame = 0;
  let nextTimer = 0;
  let now = 0;

  const noop = () => {};
  const AC = {
    IDS: { hand: 'compact-hand', boards: 'compact-boards' },
    state: { settings: { enabled: false } },
    openPanel() { AC.state.settings.enabled = true; },
    closePanel() { AC.state.settings.enabled = false; },
    originalUiPreferences: { applyStableBgaPreferences: noop, restoreStableBgaPreferences: noop },
    originalUiHand: { layoutHandCards: () => cardLayouts.push('hand'), restoreHandCards: noop },
    originalUiActionCards: { layoutPlayerActionCards: () => cardLayouts.push('action cards'), restorePlayerActionCards: noop }
  };
  runInNewContext(refreshSource + '\n' + compactSource, {
    window: {
      AgriCompact: AC,
      innerWidth: 1200,
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: name => listeners.delete(name)
    },
    document: {
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
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(callback, delay) {
      timers.set(++nextTimer, { callback, at: now + delay });
      return nextTimer;
    },
    clearTimeout(id) { timers.delete(id); }
  });

  return {
    AC, styles, classes, listeners, cardLayouts,
    add(selector, rect) {
      elements.set(selector, { offsetHeight: rect.height, getBoundingClientRect: () => rect });
    },
    flushFrame() {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback());
    },
    advanceTime(ms) {
      const end = now + ms;
      for (const [id, timer] of timers) {
        if (timer.at > end) continue;
        now = timer.at;
        timers.delete(id);
        timer.callback();
      }
      now = end;
    },
    pendingTimers: () => timers.size
  };
}

test('startup retries stop when the delayed sidebar and player list become measurable', () => {
  const page = createPage();
  page.AC.openPanel();
  page.flushFrame();
  assert.equal(page.styles.has(logsHeight), false);

  page.add('#ActionFishing', { bottom: 510, height: 100 });
  page.add('#right-side-second-part', { top: 220, left: 1000 });
  const boardsRect = { left: 0, right: 1200, top: 470, height: 200 };
  page.add('#player-boards', boardsRect);
  const logsRect = { left: 1000, right: 1200, top: 260, width: 200 };
  page.add('#logs_wrap', logsRect);
  page.advanceTime(80);

  assert.equal(page.styles.get(panelHeight), '250px');
  assert.equal(page.styles.get(logsHeight), '210px');
  assert.deepEqual(page.cardLayouts, ['hand', 'action cards', 'hand', 'action cards']);
  assert.equal(page.pendingTimers(), 1);

  logsRect.top = 320;
  page.add('#right-side-first-part', { height: 60 });
  page.advanceTime(160);
  assert.equal(page.styles.get(logsHeight), '150px');
  assert.equal(page.pendingTimers(), 0);
  assert.equal(page.cardLayouts.length, 4);

  boardsRect.top = 340;
  page.AC.refresh();
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '20px');

  page.add('#logs_wrap', { ...logsRect, top: 350 });
  page.advanceTime(5000);
  assert.equal(page.styles.get(logsHeight), '20px');
  page.AC.refresh();
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '0px');

  boardsRect.top = 600;
  page.listeners.get('resize')();
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '160px');
  assert.equal(page.pendingTimers(), 0);
});

test('missing sidebar stops startup retries after four seconds and can still use regular refresh', () => {
  const page = createPage();
  page.AC.openPanel();
  page.flushFrame();
  page.advanceTime(3999);
  assert.equal(page.pendingTimers(), 1);
  page.advanceTime(1);
  assert.equal(page.pendingTimers(), 0);

  page.add('#ActionFishing', { bottom: 510, height: 100 });
  page.add('#right-side-second-part', { top: 220 });
  page.add('#logs_wrap', { left: 1000, right: 1200, top: 260, width: 200 });
  page.AC.refresh();
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '250px');
  assert.equal(page.pendingTimers(), 0);
});

test('closing compact mode cancels a pending startup retry and clears its CSS overrides', () => {
  const page = createPage();
  page.add('#ActionFishing', { bottom: 510, height: 100 });
  page.add('#right-side-second-part', { top: 220 });
  page.add('#logs_wrap', { left: 1000, right: 1200, top: 260, width: 200 });
  page.AC.openPanel();
  page.flushFrame();
  assert.equal(page.styles.get(logsHeight), '250px');
  assert.equal(page.pendingTimers(), 1);

  page.listeners.get('resize')();
  page.AC.closePanel();
  page.flushFrame();
  page.advanceTime(5000);

  assert.equal(page.styles.size, 0);
  assert.equal(page.classes.has('bga-agri-v10-log-limited'), false);
  assert.equal(page.pendingTimers(), 0);
});
