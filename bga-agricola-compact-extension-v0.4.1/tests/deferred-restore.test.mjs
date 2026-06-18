import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const compactSource = readFileSync(new URL('../content/85_original-ui-compact.js', import.meta.url), 'utf8');

test('compact disable schedules deferred restore passes after preference restoration', () => {
  assert.match(compactSource, /function\s+scheduleDeferredRestore\s*\(/);
  assert.match(compactSource, /requestAnimationFrame\(restore\)/);
  assert.match(compactSource, /setTimeout\(restore,\s*80\)/);
  assert.match(compactSource, /setTimeout\(restore,\s*250\)/);

  const disableBody = compactSource.match(/disable\(\)\s*\{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(disableBody, /preferences\.restoreStableBgaPreferences\(\)/);
  assert.match(disableBody, /scheduleDeferredRestore\(\)/);
});
