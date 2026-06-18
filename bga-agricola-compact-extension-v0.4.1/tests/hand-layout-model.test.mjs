import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { computeHandLayout } = require('../content/original-ui/layout-models.js');

const baseInput = {
  targetViewportLeft: 600,
  targetViewportRight: 1300,
  targetViewportTop: 360,
  centralBottom: 620,
  viewportHeight: 1000,
  rightEdge: 1800,
  cardCount: 7,
  cardW: 211.5,
  cardH: 336.6
};

test('keeps hand beside the central board when lower space is too small', () => {
  const result = computeHandLayout({
    ...baseInput,
    boardsLeft: 0,
    boardsTop: 650,
    boardsBottom: 950
  });

  assert.equal(result.mode, 'right-two-row');
  assert.equal(result.handViewportLeft, baseInput.targetViewportLeft);
  assert.equal(result.handViewportTop, baseInput.targetViewportTop);
  assert.ok(result.cardScale >= 0.16);
  assert.ok(result.cardScale <= 0.9);
});

test('moves hand below player boards when combined lower space can fit a card', () => {
  const result = computeHandLayout({
    ...baseInput,
    boardsLeft: 0,
    boardsTop: 760,
    boardsBottom: 820
  });

  assert.equal(result.mode, 'below-boards-row');
  assert.equal(result.handViewportLeft, 0);
  assert.equal(result.handViewportTop, 824);
  assert.equal(result.handAvailableW, 1788);
  assert.equal(result.handHeight, result.scaledCardH);
});

test('below-board hand size is limited by width when many cards are present', () => {
  const fewCards = computeHandLayout({
    ...baseInput,
    cardCount: 4,
    boardsTop: 780,
    boardsBottom: 800
  });
  const manyCards = computeHandLayout({
    ...baseInput,
    cardCount: 14,
    boardsTop: 780,
    boardsBottom: 800
  });

  assert.equal(fewCards.mode, 'below-boards-row');
  assert.equal(manyCards.mode, 'below-boards-row');
  assert.ok(manyCards.cardScale < fewCards.cardScale);
});

test('below-board hand size is capped at the configured maximum', () => {
  const result = computeHandLayout({
    ...baseInput,
    cardCount: 1,
    boardsTop: 900,
    boardsBottom: 910,
    rightEdge: 2200
  });

  assert.equal(result.mode, 'below-boards-row');
  assert.equal(result.cardScale, 0.9);
});
