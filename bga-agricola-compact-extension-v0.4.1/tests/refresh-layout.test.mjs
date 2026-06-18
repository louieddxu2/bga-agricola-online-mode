import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cardColumnsSource = readFileSync(new URL('../content/60_card-columns.js', import.meta.url), 'utf8');
const compactSource = readFileSync(new URL('../content/85_original-ui-compact.js', import.meta.url), 'utf8');
const farmSource = readFileSync(new URL('../content/50_farm-view.js', import.meta.url), 'utf8');
const observerSource = readFileSync(new URL('../content/80_observer.js', import.meta.url), 'utf8');

test('refresh re-applies compact hand and action-card layouts after DOM changes', () => {
  const refreshBody = cardColumnsSource.match(/AC\.refresh\s*=\s*function\s+refresh\(\)\s*\{([\s\S]*?)\n  \};/)?.[1] || '';

  assert.match(refreshBody, /AC\.originalUiCompact\?\.layoutHandCards\?\.\(\)/);
  assert.match(refreshBody, /AC\.originalUiCompact\?\.layoutPlayerActionCards\?\.\(\)/);
});

test('original compact API exposes action-card relayout for refresh observers', () => {
  assert.match(compactSource, /layoutPlayerActionCards:\s*actionCards\.layoutPlayerActionCards/);
});

test('played card layout clears stale hand transforms before sizing farm-side cards', () => {
  const stackColumnBody = farmSource.match(/const\s+stackColumn\s*=\s*\(list,\s*columnIndex\)\s*=>\s*\{([\s\S]*?)\n        \};/)?.[1] || '';

  assert.match(stackColumnBody, /AC\.originalUiHand\?\.clearHandLayoutFromCard\?\.\(card\)/);
  assert.match(stackColumnBody, /clearHandLayoutFromCard[\s\S]*bgaAgriV1211OriginalStyle/);
});

test('observer delays card-move refreshes and clears former hand cards first', () => {
  assert.match(observerSource, /function\s+mutationTouchesPlayerCard\s*\(/);
  assert.match(observerSource, /mutations\.some\(mutationTouchesPlayerCard\)/);
  assert.match(observerSource, /AC\.originalUiHand\?\.cleanupFormerHandCards\?\.\(\)/);
  assert.match(observerSource, /setTimeout\(AC\.refresh,\s*cardMutation\s*\?\s*360\s*:\s*250\)/);
});
