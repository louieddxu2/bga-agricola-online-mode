import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const preferencesSource = readFileSync(new URL('../content/original-ui/preferences.js', import.meta.url), 'utf8');
const actionCardsSource = readFileSync(new URL('../content/original-ui/action-cards-layout.js', import.meta.url), 'utf8');

test('compact mode forces stable native sources for hand and player action cards', () => {
  assert.match(preferencesSource, /#preference_control_108/);
  assert.match(preferencesSource, /setSelectValue\(handPref,\s*'2'\)/);
  assert.match(preferencesSource, /#preference_control_150/);
  assert.match(preferencesSource, /setSelectValue\(actionCardsPref,\s*'0'\)/);
});

test('action card layout is driven by active card DOM, not preference 150 location', () => {
  assert.match(actionCardsSource, /const\s+activeGroups\s*=\s*groups\.filter\(group\s*=>\s*group\.querySelector\('\.player-card'\)\)/);
  assert.doesNotMatch(actionCardsSource, /function\s+playerActionCardsEnabled/);
  assert.doesNotMatch(actionCardsSource, /preference_control_150/);
});
