import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('README source map documents every manifest-loaded asset', () => {
  const loadedFiles = manifest.content_scripts.flatMap(block => [
    ...(block.js || []),
    ...(block.css || [])
  ]);

  for (const file of loadedFiles) {
    assert.ok(readme.includes(`\`${file}\``), `${file} should be documented in README.md`);
  }
});
