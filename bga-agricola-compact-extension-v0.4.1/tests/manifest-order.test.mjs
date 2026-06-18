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
