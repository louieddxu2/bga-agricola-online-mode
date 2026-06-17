# BGA Agricola Compact Panel - AI Handoff Notes

This document is the current handoff for continuing the BGA Agricola compact
panel work. It replaces older notes that were based on v0.12.35 and several
now-removed visual test scripts.

## Current State

Repository path:

```text
C:\code\bga-agricola-compact-extension-v0.4.1
```

Extension source path:

```text
bga-agricola-compact-extension-v0.4.1\
```

Current extension version:

```text
0.12.38
```

Current branch:

```text
master
```

Recent important commits:

- current implementation: horizontal compact toolbar is removed; the floating
  toggle becomes `收合 v<version>` when compact mode is open.
- `572ca7e fix: let right sidebar render naturally`
- `a31037e fix: restore stable compact card title scaling`
- current implementation: played-card side is widened from 30% to 33%, making
  card columns 10% wider.
- `13a8669 fix: size card title rows by six full-width chars` (later corrected)
- `33565a2 fix: enlarge and center compact card titles`
- `46fbf01 fix: adapt card titles and hide compact scrollbars`
- `04fe322 chore: remove obsolete visual test scripts`

The tracked zip package was removed because the extension has not been
released yet. Use the source folder directly while iterating.

## Product Direction

The current design direction is:

- Keep BGA's original DOM wherever possible.
- Do not clone the farm boards or played cards for the main compact layout.
- Keep BGA animation targets intact for resources, family members, and cards.
- Let BGA's right sidebar render naturally.
- Only intervene where compact layout requires a measured size or position.

The old visual test scripts were removed because they still asserted the older
clone-panel UI and repeatedly pulled changes in the wrong direction.

## Current Layout Behavior

### Top/Page Title

BGA's native `#page-title` / `#after-page-title` row is visible and used as the
real action/status row.

The custom duplicated `#bga-agri-v10-original-topline` is hidden in compact
mode and should not be reintroduced unless there is a new explicit reason.

### Central Board

`content/85_original-ui-compact.js` still owns the physical-board-like round
layout:

- Rounds are positioned by fixed central-board coordinates and action-space
anchors.
- The runtime round background layer is rebuilt from the live Agricola board
background image.
- The final harvest marker is aligned to the round-14 background area.

Avoid broad CSS/JS changes to `#central-board` children. Past regressions often
came from changing global positioning/z-index behavior around BGA's own action
card DOM.

### Player Boards

`content/50_farm-view.js` owns the original-DOM player board layout.

Key behavior:

- Uses BGA's real `#player-boards`.
- Lays four players across the viewport, each at `window.innerWidth / 4`.
- Splits each player column into:
  - 67% farm/resource area
  - 33% played-card area
- The played-card area is two columns:
  - occupations
  - improvements
- The 33% played-card side makes each card column 10% wider than the previous
  30% split. The farm side is smaller, so animal-capacity labels are slightly
  enlarged in scoped CSS.
- `.cards-wrapper` is inside `.player-board-holder`, not beside it.
- Cards are not moved out of BGA's DOM; they are positioned in place.

Do not revive cloned player-board or cloned hand-card rendering. The old clone
containers are intentionally removed in `content/60_card-columns.js`.

### Played Card Titles

Current intended behavior:

- Titles are single-line only.
- Titles should be enlarged.
- Titles should not shrink below the enlarged baseline.
- The current sizing path is based on the earlier version that successfully
  enlarged titles: estimate text width from title character weight, then choose
  an enlarged single-line font size.
- Do not force title row height/top positioning; that caused title text to spill
  upward outside the card.
- It is acceptable for the title to extend beyond BGA's original title strip,
  as long as it stays within the card width.

Implementation:

- `content/50_farm-view.js`
  - `cardTitleFontSize(unscaledCardW, boardScale)`
  - sets:
    - `--bga-agri-v10-card-title-font-size`
    - `--bga-agri-v10-card-title-height`
    - `--bga-agri-v10-card-title-width`
- `styles/original-ui.css`
  - scopes title rules to:
    `#player-boards .cards-wrapper > .player-card .card-title`
  - keeps titles centered, nowrap, and constrained to card width.

If title size still feels wrong, tune the multiplier and clamp in
`cardTitleFontSize()`:

```js
AC.utils.clamp((visibleCardW * 1.08) / weight, 15, 20)
```

Do not reintroduce forced title-row height/top positioning unless live testing
shows BGA's own title band is genuinely too short.

### Right Sidebar

Current intended behavior:

- Do not hide any right sidebar content.
- Let BGA's native right player list render naturally.
- It should appear above the history/log area.
- It should naturally push history/log content downward.
- The bottom edge of the history/log area should still align with the bottom of
  `#ActionFishing`.

Implementation:

- CSS no longer hides:
  - `#right-side-first-part`
  - `#player_boards`
  - `#player_boards_wrap`
- CSS no longer forces `#right-side-first-part` visible either; BGA owns it.
- `content/85_original-ui-compact.js` still runs `layoutRightLogLimit()`.
- `layoutRightLogLimit()`:
  - reads `#ActionFishing`
  - reads the natural `#logs_wrap` top after BGA/right-sidebar layout
  - sets `#logs_wrap` height so its bottom aligns with Fishing
  - does not hide or clip the whole right sidebar

If the native player list is missing, first inspect whether BGA has renamed or
restructured the right-side nodes. Do not solve this by adding more forced
display rules unless inspection proves BGA itself left an inline hidden state.

### Scrollbars

Current CSS hides visual scrollbars for known right-side/log/page containers in
compact mode while preserving scroll behavior where needed.

Be careful not to use `overflow: hidden` on broad right-side containers. The
current preference is:

- broad containers: no content hiding
- log container: scrollable, with hidden scrollbar visuals

## Files To Know

### `content/00_bootstrap.js`

Defines `window.AgriCompact`, IDs, utilities, and version.

Current version string should match `manifest.json`.

### `content/30_panel-shell.js`

Creates the floating toggle/collapse control. It no longer creates the
horizontal compact toolbar, and it no longer creates a cloned board/hand panel
as the main UI.

### `content/50_farm-view.js`

Most important current layout file for the bottom player boards:

- original player-board measurement
- farm/card split
- resource row rearrangement
- card stacking
- card title sizing variables
- restore logic for inline styles

### `content/60_card-columns.js`

Keeps old clone containers removed and schedules original-DOM board layout.

### `content/85_original-ui-compact.js`

Most important current layout file for:

- central board physical round layout
- runtime round background reconstruction
- right log bottom alignment
- enable/disable hooks around `AC.openPanel()` and `AC.closePanel()`

### `styles/original-ui.css`

Contains most compact-mode overrides for:

- topbar/page title behavior
- central board dimensions
- player board layout rules
- right log scrollbar hiding
- card title typography

This file has many historical sections. Prefer small scoped changes and delete
obsolete interventions when a feature should return to BGA's natural behavior.

## Verification

There is no trusted automated visual test suite at the moment.

Use low-risk syntax checks:

```powershell
Get-ChildItem content\*.js | ForEach-Object { node --check $_.FullName }
```

Use live BGA/manual screenshot checks for visual layout decisions.

The old root-level `run_visual_test.js`, `generate_test_html.js`, `inspect_*`,
and `find_*` scripts were removed because they targeted the old cloned compact
panel and produced misleading failures.

## Short-Term Goals

1. Confirm the right sidebar behavior live:
   - native player list visible
   - log/history below it
   - log/history bottom aligned with `#ActionFishing`

2. Confirm played-card title sizing live:
   - titles are large enough to read
   - titles stay single-line
   - title text is centered for both occupation and improvement cards
   - title text does not spill above the card

3. Continue reducing historical overrides that fight BGA's natural layout.

4. Avoid new clone-based UI work unless the user explicitly changes direction.

5. When making changes:
   - run relevant `node --check` syntax checks
   - summarize what will be committed
   - stage only relevant files
   - create a local commit
   - do not push unless explicitly requested

## Known Caution Areas

- Do not reintroduce old cloned board/hand panel assumptions.
- Do not use broad selectors that affect BGA popins, tooltips, or full-size
  card previews.
- Do not hide right sidebar containers to solve log alignment.
- Do not force `#right-side-first-part` unless live DOM inspection proves BGA
  left it hidden inline.
- Avoid changing `#central-board` stacking rules unless the background layer or
  round-card layout specifically requires it.
- The README has historical mojibake in older entries; avoid rewriting the
  entire README unless the user asks for cleanup.
