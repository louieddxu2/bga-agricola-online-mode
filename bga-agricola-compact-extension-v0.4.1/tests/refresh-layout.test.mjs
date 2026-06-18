import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cardColumnsSource = readFileSync(new URL('../content/60_card-columns.js', import.meta.url), 'utf8');
const compactSource = readFileSync(new URL('../content/85_original-ui-compact.js', import.meta.url), 'utf8');

test('refresh re-applies compact hand and action-card layouts after DOM changes', () => {
  const refreshBody = cardColumnsSource.match(/AC\.refresh\s*=\s*function\s+refresh\(\)\s*\{([\s\S]*?)\n  \};/)?.[1] || '';

  assert.match(refreshBody, /AC\.originalUiCompact\?\.layoutHandCards\?\.\(\)/);
  assert.match(refreshBody, /AC\.originalUiCompact\?\.layoutPlayerActionCards\?\.\(\)/);
});

test('original compact API exposes action-card relayout for refresh observers', () => {
  assert.match(compactSource, /layoutPlayerActionCards:\s*actionCards\.layoutPlayerActionCards/);
});
