import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const {
  computeActionCardRegion,
  computePlayerActionCardGroupLayout,
  computePlayerActionCardPlan
} = require('../content/original-ui/layout-models.js');

const actionCardsSource = readFileSync(new URL('../content/original-ui/action-cards-layout.js', import.meta.url), 'utf8');

const twoColumnRegion = {
  columns: 2,
  slotW: 140,
  slotH: 140,
  height: 440,
  gap: 8
};

test('action card region opens two columns only when the round-14 right side can fit two round slots', () => {
  const oneColumn = computeActionCardRegion({
    centralBottom: 620,
    roundTop: 100,
    roundRight: 1200,
    roundWidth: 140,
    roundHeight: 140,
    turnW: 140,
    turnH: 140,
    rightLimit: 1450
  });
  const twoColumns = computeActionCardRegion({
    centralBottom: 620,
    roundTop: 100,
    roundRight: 1200,
    roundWidth: 140,
    roundHeight: 140,
    turnW: 140,
    turnH: 140,
    rightLimit: 1510
  });

  assert.equal(oneColumn.columns, 1);
  assert.equal(twoColumns.columns, 2);
});

test('three players with action cards stay as three player rows', () => {
  const plan = computePlayerActionCardPlan([1, 1, 1], twoColumnRegion);

  assert.equal(plan.useClearLayout, true);
  assert.equal(plan.groupColumns, 1);
  assert.equal(plan.groupRows, 3);
});

test('four players with one card each become a 2x2 layout when width allows', () => {
  const plan = computePlayerActionCardPlan([1, 1, 1, 1], twoColumnRegion);

  assert.equal(plan.useClearLayout, true);
  assert.equal(plan.groupColumns, 2);
  assert.equal(plan.groupRows, 2);
  assert.equal(plan.groupW, twoColumnRegion.slotW);
});

test('one player with multiple cards keeps the cards under one player name', () => {
  const plan = computePlayerActionCardPlan([2], twoColumnRegion);
  const group = computePlayerActionCardGroupLayout({
    cardCount: 2,
    plan,
    layout: twoColumnRegion,
    cardW: 211.5,
    cardH: 336.6,
    headerH: 22
  });

  assert.equal(plan.groupRows, 1);
  assert.equal(group.cardColumns, 2);
  assert.equal(group.cardRows, 1);
  assert.ok(group.scale >= 0.16);
  assert.ok(group.scale <= 0.9);
});

test('more than four action cards use compressed overlap mode', () => {
  const plan = computePlayerActionCardPlan([2, 2, 1], twoColumnRegion);
  const group = computePlayerActionCardGroupLayout({
    cardCount: 2,
    plan,
    layout: twoColumnRegion,
    cardW: 211.5,
    cardH: 336.6,
    headerH: 22
  });

  assert.equal(plan.useClearLayout, false);
  assert.equal(group.cardColumns, 1);
  assert.equal(group.cardRows, 1);
  assert.ok(group.overlapStep >= 0);
});

test('action card DOM layout uses turn 14 as the right-edge source', () => {
  assert.match(actionCardsSource, /const\s+topSource\s*=\s*round14Bg\s*\|\|\s*turn14/);
  assert.match(actionCardsSource, /const\s+rightSource\s*=\s*turn14\s*\|\|\s*round14Bg/);
  assert.match(actionCardsSource, /roundRight:\s*rightRect\.right/);
  assert.doesNotMatch(actionCardsSource, /roundRight:\s*topRect\.right/);
});

test('action card holder is fixed outside the player-board grid flow', () => {
  assert.match(actionCardsSource, /leftColumn\.style\.setProperty\('position',\s*'fixed'/);
  assert.match(actionCardsSource, /leftColumn\.style\.setProperty\('width',\s*'0px'/);
  assert.match(actionCardsSource, /holder\.style\.setProperty\('position',\s*'fixed'/);
  assert.doesNotMatch(actionCardsSource, /leftColumn\.style\.setProperty\('position',\s*'static'/);
});
