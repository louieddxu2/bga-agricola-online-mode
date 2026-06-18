import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const bootstrap = readFileSync(new URL('../content/00_bootstrap.js', import.meta.url), 'utf8');

test('manifest version matches bootstrap runtime version', () => {
  const match = bootstrap.match(/VERSION:\s*['"]([^'"]+)['"]/);

  assert.ok(match, 'content/00_bootstrap.js should expose AC.VERSION');
  assert.equal(match[1], manifest.version);
});

test('manifest content script files exist', () => {
  for (const block of manifest.content_scripts) {
    for (const script of block.js || []) {
      assert.ok(existsSync(new URL(`../${script}`, import.meta.url)), `${script} should exist`);
    }
    for (const stylesheet of block.css || []) {
      assert.ok(existsSync(new URL(`../${stylesheet}`, import.meta.url)), `${stylesheet} should exist`);
    }
  }
});

test('manifest does not load test files in the extension package', () => {
  const listedFiles = manifest.content_scripts.flatMap(block => [
    ...(block.js || []),
    ...(block.css || [])
  ]);

  assert.equal(listedFiles.some(file => file.startsWith('tests/')), false);
});
