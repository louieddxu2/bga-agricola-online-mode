import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const compactSource = readFileSync(new URL('../content/85_original-ui-compact.js', import.meta.url), 'utf8');
const handSource = readFileSync(new URL('../content/original-ui/hand-layout.js', import.meta.url), 'utf8');

test('compact disable schedules deferred restore passes after preference restoration', () => {
  assert.match(compactSource, /function\s+scheduleDeferredRestore\s*\(/);
  assert.match(compactSource, /requestAnimationFrame\(restore\)/);
  assert.match(compactSource, /setTimeout\(restore,\s*80\)/);
  assert.match(compactSource, /setTimeout\(restore,\s*250\)/);

  const disableBody = compactSource.match(/disable\(\)\s*\{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(disableBody, /preferences\.restoreStableBgaPreferences\(\)/);
  assert.match(disableBody, /scheduleDeferredRestore\(\)/);
});

test('hand restore scrubs compact-only positioning from unmanaged residue', () => {
  assert.match(handSource, /function\s+clearHandLayoutFromCard\s*\(/);
  assert.match(handSource, /function\s+cleanupFormerHandCards\s*\(/);
  assert.match(handSource, /\.player-card\[data-bga-agri-v10-hand-original-style\]/);
  assert.match(handSource, /!\s*card\.closest\('#hand-container'\)/);
  assert.match(handSource, /function\s+scrubCompactHandInlineStyle\s*\(/);
  assert.match(handSource, /'position'[\s\S]*'left'[\s\S]*'--agricolaCardWidth'[\s\S]*\.forEach\(prop\s*=>\s*handContainer\.style\.removeProperty\(prop\)\)/);
  assert.match(handSource, /'transform'[\s\S]*'--bga-agri-v10-card-title-font-size'[\s\S]*\.forEach\(prop\s*=>\s*card\.style\.removeProperty\(prop\)\)/);
  assert.match(handSource, /clearHandLayoutFromCard,\s*cleanupFormerHandCards/);
});
