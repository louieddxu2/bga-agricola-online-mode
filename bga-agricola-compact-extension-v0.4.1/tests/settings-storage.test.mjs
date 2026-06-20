import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const settingsSource = readFileSync(new URL('../content/10_settings.js', import.meta.url), 'utf8');

test('settings storage access does not reference undeclared chrome global', () => {
  assert.match(settingsSource, /function\s+localStorageArea\s*\(/);
  assert.match(settingsSource, /globalThis\.chrome\?\.storage\?\.local/);
  assert.match(settingsSource, /function\s+localStorageArea\s*\(\)\s*\{[\s\S]*try\s*\{/);
  assert.doesNotMatch(settingsSource, /(?<!globalThis\.)chrome\?\.storage/);
  assert.doesNotMatch(settingsSource, /(?<!globalThis\.)chrome\.storage/);
  assert.doesNotMatch(settingsSource, /localStorageArea\(\)\?\./);
});

test('settings storage get and set are guarded against unavailable extension context', () => {
  assert.match(settingsSource, /function\s+safeStorageSet\s*\(/);
  assert.match(settingsSource, /function\s+safeStorageGet\s*\(/);
  assert.match(settingsSource, /try\s*\{[\s\S]*storage\.set\(values\)/);
  assert.match(settingsSource, /try\s*\{[\s\S]*storage\.get\(defaults,/);
  assert.doesNotMatch(settingsSource, /runtime\?*\.lastError|lastError/);
  assert.doesNotMatch(settingsSource, /(?<!safeStorage)storage\.set\(AC\.state\.settings/);
  assert.doesNotMatch(settingsSource, /(?<!safeStorage)storage\.set\(AC\.DEFAULTS/);
});
