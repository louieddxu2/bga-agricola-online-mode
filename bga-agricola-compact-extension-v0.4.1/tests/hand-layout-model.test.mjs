import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { computeHandLayout } = require('../content/original-ui/layout-models.js');
const handLayoutSource = readFileSync(new URL('../content/original-ui/hand-layout.js', import.meta.url), 'utf8');

const baseInput = {
  targetViewportLeft: 600,
  targetViewportRight: 1300,
  targetViewportTop: 360,
  centralBottom: 620,
  topStatusHeight: 60,
  centralHeight: 620,
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
    boardsHeight: 350
  });

  assert.equal(result.mode, 'right-two-row');
  assert.equal(result.handViewportLeft, baseInput.targetViewportLeft);
  assert.equal(result.handViewportTop, baseInput.targetViewportTop);
  assert.ok(result.cardScale >= 0.16);
  assert.ok(result.cardScale <= 0.9);
});

test('uses a single right-side row with five slots when fewer than five cards are visible', () => {
  const result = computeHandLayout({
    ...baseInput,
    cardCount: 4,
    boardsLeft: 0,
    boardsHeight: 350
  });
  const expectedSlotW = (baseInput.targetViewportRight - baseInput.targetViewportLeft) / 5;

  assert.equal(result.mode, 'right-one-row');
  assert.equal(result.slotW, expectedSlotW);
  assert.equal(result.cardScale, expectedSlotW / baseInput.cardW);
  assert.equal(result.handHeight, result.scaledCardH);
});

test('keeps five visible cards in the existing right-side two-row layout', () => {
  const result = computeHandLayout({
    ...baseInput,
    cardCount: 5,
    boardsLeft: 0,
    boardsHeight: 350
  });

  assert.equal(result.mode, 'right-two-row');
  assert.equal(result.slotW, (baseInput.targetViewportRight - baseInput.targetViewportLeft) / 7);
  assert.equal(result.handHeight, result.scaledCardH * 2);
});

test('moves hand below player boards when viewport minus known stack heights can fit a card', () => {
  const result = computeHandLayout({
    ...baseInput,
    viewportHeight: 1100,
    boardsLeft: 0,
    boardsHeight: 170,
    boardsViewportBottom: 907
  });

  assert.equal(result.mode, 'below-boards-row');
  assert.equal(result.handViewportLeft, 0);
  assert.equal(result.handViewportTop, 911);
  assert.equal(result.handAvailableW, 1788);
  assert.equal(result.handHeight, result.scaledCardH);
});

test('uses only viewport height minus status, central board, and farm board heights', () => {
  const enoughStackRemainder = computeHandLayout({
    ...baseInput,
    viewportHeight: 1100,
    boardsLeft: 0,
    boardsHeight: 170,
    boardsViewportBottom: 907
  });
  const notEnoughStackRemainder = computeHandLayout({
    ...baseInput,
    boardsLeft: 0,
    boardsHeight: 350
  });

  assert.equal(enoughStackRemainder.mode, 'below-boards-row');
  assert.equal(notEnoughStackRemainder.mode, 'right-two-row');
});

test('uses the round-8-to-14 slot width converted to card height as the below-board threshold', () => {
  const slotW = (baseInput.targetViewportRight - baseInput.targetViewportLeft) / 7;
  const rightSideCardH = baseInput.cardH * (slotW / baseInput.cardW);
  const almostEnough = computeHandLayout({
    ...baseInput,
    viewportHeight: baseInput.topStatusHeight + baseInput.centralHeight + 170 + 8 + rightSideCardH - 1,
    boardsLeft: 0,
    boardsHeight: 170,
    boardsViewportBottom: 907
  });
  const enough = computeHandLayout({
    ...baseInput,
    viewportHeight: baseInput.topStatusHeight + baseInput.centralHeight + 170 + 8 + rightSideCardH + 1,
    boardsLeft: 0,
    boardsHeight: 170,
    boardsViewportBottom: 907
  });

  assert.equal(almostEnough.mode, 'right-two-row');
  assert.equal(enough.mode, 'below-boards-row');
});

test('below-board hand size is limited by width when many cards are present', () => {
  const fewCards = computeHandLayout({
    ...baseInput,
    viewportHeight: 1300,
    cardCount: 4,
    boardsHeight: 170,
    boardsViewportBottom: 907
  });
  const manyCards = computeHandLayout({
    ...baseInput,
    viewportHeight: 1300,
    cardCount: 14,
    boardsHeight: 170,
    boardsViewportBottom: 907
  });

  assert.equal(fewCards.mode, 'below-boards-row');
  assert.equal(manyCards.mode, 'below-boards-row');
  assert.ok(manyCards.cardScale < fewCards.cardScale);
});

test('below-board hand size is capped at the configured maximum', () => {
  const result = computeHandLayout({
    ...baseInput,
    cardCount: 1,
    boardsHeight: 170,
    boardsViewportBottom: 907,
    viewportHeight: 1400,
    rightEdge: 2200,
    maxScale: 0.9
  });

  assert.equal(result.mode, 'below-boards-row');
  assert.equal(result.cardScale, 0.9);
});

test('hand layout measures player boards by their visual child rects', () => {
  assert.match(handLayoutSource, /function\s+prepareHandAncestors\s*\(/);
  assert.match(handLayoutSource, /closest\('#player-boards-left-column'\)/);
  assert.match(handLayoutSource, /leftColumn\.dataset\.bgaAgriV10HandAncestor\s*=\s*'1'/);
  assert.match(handLayoutSource, /leftColumn\.style\.setProperty\('display',\s*'block'/);
  assert.match(handLayoutSource, /leftColumn\.style\.setProperty\('position',\s*'absolute'/);
  assert.match(handLayoutSource, /prepareHandAncestors\(handContainer\)/);
  assert.match(handLayoutSource, /function\s+getPlayerBoardsVisualRect\s*\(/);
  assert.match(handLayoutSource, /const\s+boardRoots\s*=\s*\[\.\.\.playerBoards\.querySelectorAll\(':scope > \.player-board-resizable'\)\]/);
  assert.match(handLayoutSource, /\.\.\.board\.querySelectorAll\('\.player-board-wrapper'\)/);
  assert.match(handLayoutSource, /\.\.\.board\.querySelectorAll\('\.agricola-player-board'\)/);
  assert.match(handLayoutSource, /\.\.\.board\.querySelectorAll\('\.cards-wrapper'\)/);
  assert.doesNotMatch(handLayoutSource, /prevMode:\s*previousHandLayoutMode/);
  assert.match(handLayoutSource, /topStatusHeight:\s*getTopStatusHeight\(\)/);
  assert.match(handLayoutSource, /centralHeight:\s*centralRect\.height/);
  assert.match(handLayoutSource, /boardsHeight:\s*boardsRect\.height/);
  assert.match(handLayoutSource, /boardsViewportBottom:\s*boardsRect\.bottom/);
  assert.match(handLayoutSource, /function\s+reserveHandClipSpace\s*\(/);
  assert.match(handLayoutSource, /#overall-content/);
  assert.match(handLayoutSource, /bgaAgriV10HandClipOriginalStyle/);
  assert.match(handLayoutSource, /reserveHandClipSpace\(handViewportTop \+ handHeight\)/);
  assert.doesNotMatch(handLayoutSource, /const\s+shiftedBoardsRect\s*=\s*getPlayerBoardsVisualRect\(playerBoards\)/);
  assert.match(handLayoutSource, /handLayoutMode === 'right-two-row' \|\| handLayoutMode === 'right-one-row'/);
  assert.match(handLayoutSource, /handLayoutMode === 'below-boards-row' \|\| handLayoutMode === 'right-one-row'/);
  assert.match(handLayoutSource, /delete\s+handContainer\.dataset\.bgaAgriV10HandLayoutMode/);
});

test('empty spectator hand restores board gap before any compact positioning', () => {
  const layoutHandCardsBody = handLayoutSource.match(/function\s+layoutHandCards\s*\(\)\s*\{([\s\S]*?)\n  \}/)?.[1] || '';
  const emptyHandGuard = layoutHandCardsBody.match(/const\s+allCards\s*=\s*\[\.\.\.handContainer\.querySelectorAll\(':scope > \.player-card'\)\];[\s\S]*?if\s*\(!allCards\.length\)\s*\{([\s\S]*?)\n    \}/)?.[1] || '';

  assert.match(emptyHandGuard, /restoreHandBoardGap\(\)/);
  assert.match(emptyHandGuard, /scrubCompactHandInlineStyle\(handContainer\)/);
  assert.match(emptyHandGuard, /return/);

  const beforeEmptyHandGuard = layoutHandCardsBody.slice(0, layoutHandCardsBody.indexOf("const allCards = [...handContainer.querySelectorAll(':scope > .player-card')]"));
  assert.doesNotMatch(beforeEmptyHandGuard, /prepareHandAncestors\(handContainer\)/);
  assert.doesNotMatch(beforeEmptyHandGuard, /models\.computeHandLayout/);
});

test('hand active state is managed on alternative-hand-wrapper', () => {
  assert.match(handLayoutSource, /const\s+wrapper\s*=\s*handContainer\.closest\('#alternative-hand-wrapper'\);/);
  assert.match(handLayoutSource, /wrapper\.dataset\.bgaAgriV10HandActive\s*=\s*'1';/);
  assert.match(handLayoutSource, /delete\s+wrapper\.dataset\.bgaAgriV10HandActive;/);
  assert.match(
    handLayoutSource,
    /document\.querySelectorAll\('#alternative-hand-wrapper'\)\.forEach\(\s*wrapper\s*=>\s*\{[\s\S]*?delete\s+wrapper\.dataset\.bgaAgriV10HandActive;/
  );
});
