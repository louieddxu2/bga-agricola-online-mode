import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const notice = readFileSync(new URL('../NOTICE.md', import.meta.url), 'utf8');

test('README source map documents every manifest-loaded asset', () => {
  const loadedFiles = manifest.content_scripts.flatMap(block => [
    ...(block.js || []),
    ...(block.css || [])
  ]);

  for (const file of loadedFiles) {
    assert.ok(readme.includes(`\`${file}\``), `${file} should be documented in README.md`);
  }
});

test('README and NOTICE document external code and asset references', () => {
  for (const reference of [
    'https://boardgamearena.com/',
    'chrome.storage.local',
    'MutationObserver',
    'central.png',
    'node:test',
    '#preference_control_108',
    '#ActionFishing'
  ]) {
    assert.ok(readme.includes(reference), `${reference} should be documented in README.md`);
    assert.ok(notice.includes(reference), `${reference} should be documented in NOTICE.md`);
  }

  assert.match(notice, /does not copy or\s+redistribute Board Game Arena's application source code/);
  assert.match(notice, /does not ship the image in the release\s+zip/);
});
