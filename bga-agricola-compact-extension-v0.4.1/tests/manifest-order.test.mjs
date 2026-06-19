import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const scripts = manifest.content_scripts[0].js;

test('layout models load before original compact UI script', () => {
  const modelIndex = scripts.indexOf('content/original-ui/layout-models.js');
  const compactIndex = scripts.indexOf('content/85_original-ui-compact.js');

  assert.notEqual(modelIndex, -1);
  assert.notEqual(compactIndex, -1);
  assert.ok(modelIndex < compactIndex);
});

test('original UI helper modules load before feature layout modules and lifecycle script', () => {
  const indexOf = script => {
    const index = scripts.indexOf(script);
    assert.notEqual(index, -1, `${script} should be listed in manifest`);
    return index;
  };

  const styleIndex = indexOf('content/original-ui/style-state.js');
  const preferencesIndex = indexOf('content/original-ui/preferences.js');
  const cardTextIndex = indexOf('content/original-ui/card-text.js');
  const actionCardsIndex = indexOf('content/original-ui/action-cards-layout.js');
  const handIndex = indexOf('content/original-ui/hand-layout.js');
  const compactIndex = indexOf('content/85_original-ui-compact.js');

  assert.ok(styleIndex < actionCardsIndex);
  assert.ok(cardTextIndex < actionCardsIndex);
  assert.ok(cardTextIndex < handIndex);
  assert.ok(preferencesIndex < compactIndex);
  assert.ok(actionCardsIndex < compactIndex);
  assert.ok(handIndex < compactIndex);
});

test('legacy cloned resource row module is not loaded', () => {
  const stylesheets = manifest.content_scripts[0].css || [];

  assert.equal(scripts.includes('content/40_resource-row.js'), false);
  assert.equal(stylesheets.includes('styles/resource-row.css'), false);
});
