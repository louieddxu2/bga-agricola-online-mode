import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles/original-ui.css', import.meta.url), 'utf8');

test('player-status log filter is scoped to compact mode and logs panel', () => {
  assert.match(
    css,
    /html\.bga-agri-v10-open\.bga-agri-v10-original-compact\s+#logs\s+\.log\.notif_playerstatus\s*\{\s*display:\s*none\s*!important;/m
  );
});

test('player action card title rule is scoped to the managed holder', () => {
  assert.match(
    css,
    /#action-cards-holder\[data-bga-agri-v10-action-cards-managed="1"\]\s+\.player-card\s+\.card-title/
  );
});

test('hand title rule is scoped to the managed native hand container', () => {
  assert.match(
    css,
    /#hand-container\[data-bga-agri-v10-hand-fixed="1"\]\s+\.player-card\s+\.card-title/
  );
});

test('player board name enlargement is scoped and avoids transform scaling', () => {
  const rule = css.match(
    /html\.bga-agri-v10-open\.bga-agri-v10-original-compact\s+#player-boards\s+\.resources-bar-holder\.active\s+\.player-board-name\s*\{[^}]+\}/m
  )?.[0] || '';

  assert.match(rule, /font-size:\s*30px\s*!important;/);
  assert.match(rule, /line-height:\s*1\.05\s*!important;/);
  assert.doesNotMatch(rule, /transform\s*:/);
  assert.doesNotMatch(rule, /scale\(/);
});
