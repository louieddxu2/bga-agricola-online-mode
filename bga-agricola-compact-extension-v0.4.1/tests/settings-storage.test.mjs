import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const settingsSource = readFileSync(new URL('../content/10_settings.js', import.meta.url), 'utf8');

test('settings storage access does not reference undeclared chrome global', () => {
  assert.match(settingsSource, /function\s+localStorageArea\s*\(/);
  assert.match(settingsSource, /globalThis\.chrome\?\.storage\?\.local/);
  assert.doesNotMatch(settingsSource, /(?<!globalThis\.)chrome\?\.storage/);
  assert.doesNotMatch(settingsSource, /(?<!globalThis\.)chrome\.storage/);
});
