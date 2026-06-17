# BGA Agricola Compact Panel v0.12.37-wider-played-cards

Changes in this build:

- Gives the played-card side 33% of each player column, up from 30%, making each played-card column 10% wider.
- Shrinks the farm/resource side from 70% to 67%.
- Slightly enlarges farm animal-capacity labels inside the original player boards.

---

# BGA Agricola Compact Panel v0.12.36-adaptive-card-title-scrollbar

Changes in this build:

- Sizes played-card title text from the measured card column width and title length instead of using a fixed 150% title scale.
- Extends compact-mode scrollbar hiding to the outer page/right-side containers, not only the log/history panels.

---

# BGA Agricola Compact Panel v0.12.35-native-title-right-players

基於 v0.12.34。

本版移除自訂重複狀態列的建立與定時更新流程，保留 BGA 原生 `#page-title` 橫列。右側原生玩家列表 `#right-side-first-part` 還原顯示；它會自然推擠底下的遊戲歷程。`#right-side-second-part/#logs_wrap` 的高度仍由 JS 依 `#ActionFishing` 下緣限制，讓遊戲歷程下邊界維持在中央版圖釣魚格下緣。

---

# BGA Agricola Compact Panel v0.12.34-keep-page-title

基於 v0.12.33。

本版恢復 BGA 原生 `#page-title` 橫列，保留原本的狀態文字與行動按鈕插槽（確認、重置、特殊行動等）。只維持隱藏最上方白色 `#topbar` 設定列，並隱藏本擴充先前建立的重複狀態列 `#bga-agri-v10-original-topline`。

---

# BGA Agricola Compact Panel v0.12.33-card-title-scale

基於 v0.12.32。

本版只放大右側小卡片的卡片名稱文字：`#player-boards .cards-wrapper > .player-card .card-title { font-size: 150%; }`。不放大整張卡、不改卡片堆疊、不影響 BGA 原生完整卡片預覽。

---

# BGA Agricola Compact Panel v0.12.32-hide-scrollbars

基於 v0.12.31。

本版只隱藏右側紀錄欄相關容器的可見滑動條，保持內容仍可滾動：`#right-side-second-part`、`#logs_wrap`、`#logs`、`#log_history`、`.log_history`。玩家面板與資源列排版維持 v0.12.31 穩定狀態。

---

# BGA Agricola Compact Panel v0.12.31-first-row-normal

基於 v0.12.26。

本版撤回 v0.12.27～v0.12.30 對第一列的 2 倍放大實驗，讓 BGA 原本的玩家名稱 / 米寶 / 起始玩家標記維持原生位置與大小。第二、第三列仍維持 v0.12.26：玩家配件 + 動物、主要資源皆 2 倍顯示，動物列禁止換行，右邊界不侵入卡片欄。

---

# BGA Agricola Compact Panel v0.12.26 - Animal No-Wrap

Changes in this build:

- Keeps v0.12.25 two-row native panel and 2x row scaling.
- Gives the animal side of row 1 more width: personal pieces 52%, animals 48%.
- Forces personal pieces, animals, and primary resources to stay on one line.
- Begging remains in the primary resource row with wood/clay/stone/reed/grain/vegetable/food.

# BGA Agricola Compact Panel v0.12.25 - Resource Rows ×2

Changes in this build:

- Keeps v0.12.24 stable native BGA panel layout.
- Scales only the second and third resource rows by 2x.
- Compensates each row width by the same factor so the visual right edge still stops at the farm-board boundary.
- The first BGA row is left unchanged in this build.
- Keeps no-hover behavior and dynamic right-side card stacking.

# BGA Agricola Compact Panel v0.12.24 - Native Panel Two Rows

Changes in this build:

- Uses v0.12.12 no-hover as the clean base, avoiding the previous fake background and counter-scale experiments.
- Leaves BGA's original first row alone.
- Uses the native `.agricola-player-pannel` as the frame for the lower resource area.
- Expands that native panel to two rows:
  - row 1: personal pieces + animals
  - row 2: primary resources
- Keeps all left-side rows constrained to the farm-board width.
- Does not add fake background; does not scale icons.

# BGA Agricola Compact Panel v0.12.12 - No Custom Card Hover

Changes in this build:

- Removes the custom `.player-card:hover { z-index: 9999 }` rule.
- Keeps BGA's native hover/preview behavior for stacked cards.
- Keeps v0.12.11 dynamic card stacking and original-DOM layout.

# BGA Agricola Compact Panel v0.12.11 - Dynamic Card Stack

Changes in this build:

- Keeps original BGA card DOM in the original `.cards-wrapper`; no card nodes are moved or cloned.
- Positions `.cards-wrapper` to the right of `.agricola-player-board`, as in v0.12.10.
- Computes an exact stack step independently for occupation and improvement columns.
- The vertical card band starts at the farm-board top edge and ends at the farm-board bottom edge.
- For each column with `n` cards and mini-card height `h` inside available height `H`:
  - If `n <= 1`, step is `0`.
  - Otherwise `step = min(h, max(0, (H - h) / (n - 1)))`.
  - Overlap ratio is `(h - step) / h`.
- Hover raises the corresponding card above neighboring stacked cards; click preview remains BGA's original behavior.

# BGA Agricola Compact Panel v0.12.10 - Holder Card Side Layout

Changes in this build:

- Uses the actual runtime DOM structure: `.cards-wrapper` is inside `.player-board-holder`, not a sibling of it.
- Keeps DOM nodes in place; no card/farm nodes are moved or cloned.
- Positions the original `.cards-wrapper` absolutely inside `.player-board-holder`, to the right of `.agricola-player-board`.
- Forces `.cards-wrapper` to grid layout for occupation/improvement columns, because BGA's computed display can remain `flex`.
- Computes each player column as viewport width / 4, then splits it as 70% farm and 30% cards.
- Shrinks BGA mini-card CSS variables so each card fits within its 15% occupation/development column.
- Keeps the stable v0.12 central round layout and the low runtime background layer.

# BGA Agricola Compact Panel v0.10.37 - Harvest Overlap

Changes in this build:

- Places the stage 6 harvest icon so it overlaps the bottom border of the round-14 background tile.
- Uses half the harvest-slot height as the overlap offset, matching the visual style under round 13.
- Keeps v0.10.36 background and anchor behavior.

# BGA Agricola Compact Panel v0.10.36 - Harvest 14 Background Alignment

Changes in this build:

- Moves stage 6 harvest to sit below the stretched round-14 background tile.
- Uses the same top-row background stretch calculation for the harvest-14 vertical position.
- Keeps v0.10.35 reduced top stretch and harvest z-index fix.

# BGA Agricola Compact Panel v0.10.35 - Top Stretch + Harvest Z Fix

Changes in this build:

- Reduces top-row background stretch; it now extends down only modestly instead of reaching the second row.
- Keeps round cards unscaled and unmoved.
- Raises harvest icons above the visible debug background tiles so the stage 6 harvest position can be checked.
- Stage 6 harvest remains directly below round 14.

# BGA Agricola Compact Panel v0.10.34 - Top Row Stretch

Changes in this build:

- Top-row background tiles now stretch downward toward the second horizontal row.
- Round cards themselves are not moved or scaled.
- Non-top row stretching remains reduced from v0.10.33.
- Stage 6 harvest remains below round 14.

# BGA Agricola Compact Panel v0.10.33 - Reduced Stretch

Changes in this build:

- Reduces non-top background stretching.
- Non-top row background tiles now stretch only to the adjacent row spacing, not across the entire top-to-bottom band.
- Actual round cards remain centered inside the stretched background tiles.
- Keeps the stage 6 harvest fix from v0.10.32.

# BGA Agricola Compact Panel v0.10.32 - Stretched Background Rows + Final Harvest Fix

Changes in this build:

- Keeps original round 6 / Natural Birth as the crop source.
- Vertically stretches non-top row background tiles while leaving the actual round cards centered and unscaled.
- Moves the stage 6 harvest icon below round 14 instead of aligning it to the Forest/Clay Pit row.
- Keeps the visible diagnostic overlay for checking the crop result.

# BGA Agricola Compact Panel v0.10.31 - Turn 6 Background Source

Changes in this build:

- Changes the runtime crop source from round 1 to the original round 6 area.
- Source coordinates use BGA board coordinates x=493, y=156, matching the Natural Birth / 自然生育 cell from the screenshot.
- Keeps the strong visible diagnostic overlay from v0.10.30 so the crop effect can be inspected.

# BGA Agricola Compact Panel v0.10.30 - Strong Background Preview

Changes in this build:

- Makes the runtime-cropped round background tiles strongly visible for verification.
- Uses a slightly larger crop rectangle around the first-round source area so copied board art can appear around card edges.
- Keeps the visible BG status badge and numbered red outlines.
- This is a diagnostic build; it intentionally draws the crop layer above the board.

# BGA Agricola Compact Panel v0.10.29 - Visible Background Debug

Changes in this build:

- Adds a visible BG status badge on the central board.
- Shows BG source and tile count when the runtime crop layer is created.
- Shows `BG not found` directly on the board if no source image is found.
- Temporarily draws red dashed, numbered debug outlines above the board for the 14 round background tiles.
- Keeps v0.10.28 background source fallback detection.

# BGA Agricola Compact Panel v0.10.28 - Background Fallback

Changes in this build:

- Improves runtime round-background image detection.
- Still first tries computed background-image on board elements.
- Falls back to resource performance entries for central.png.
- Falls back to parsing inline g_gamethemeurl and building img/central.png.
- Logs a clear `[AgriCompact] round background image not found` warning only if all sources fail.
- Keeps v0.10.27 CSS crop layer and v0.10.26 anchor fixes.

# BGA Agricola Compact Panel v0.10.27 - Runtime Crop Background

Changes in this build:

- Adds a runtime background layer for round spaces.
- Reads the live BGA board background image from the page.
- Uses screenshot-derived 830x795 board coordinates.
- Crops the first-round source rectangle and repeats it under rounds 1-14 with CSS background-position.
- Removes that background layer when compact/original UI mode is disabled.
- Keeps v0.10.26 anchor fixes.

# BGA Agricola Compact Panel v0.10.26 - Anchor Fix

Changes in this build:

- Moves rounds 9 / 11 / 13 to the same vertical anchor as round 3.
- Places harvest 9 / 11 / 13 below that corrected second-card row.
- Clears inline left/top positions when compact/original UI mode is disabled, so the original BGA layout can return.
- Keeps v0.10.25 Forest/Clay Pit and Reed Bank/Fishing anchor logic.

# BGA Agricola Compact Panel v0.10.25 - Anchor Round Layout

Changes in this build:

- Adds runtime physical-round layout based on fixed action anchors.
- Round 3 is vertically centered beside Forest + Clay Pit.
- Round 4 is vertically centered beside Reed Bank + Fishing.
- Rounds are moved without scaling the action card images.
- Keeps v0.10.24 minimal transparent preview and v0.10.22 resource emphasis.

# BGA Agricola Compact Panel v0.10.24 - Minimal Preview

Changes in this build:

- Removes the visible preview close X.
- Removes the visible 「操作原卡」 button from the preview overlay.
- Keeps outside-click-to-close behavior; Escape also closes the preview.
- Makes the preview overlay transparent instead of dimming the page.
- Keeps v0.10.23 cloned-card chrome cleanup and v0.10.22 resource emphasis.

# BGA Agricola Compact Panel v0.10.23 - Clean Card Preview

Changes in this build:

- Removes non-functional BGA card chrome from cloned cards: help markers, rulings `?`, built-in zoom icon, card stats, cloned close icons.
- Keeps our own preview overlay close button and 「操作原卡」 button.
- Keeps v0.10.22 resource emphasis changes.
- Keeps v0.10.21 physical-board-like round layout.

# BGA Agricola Compact Panel v0.10.22 - Resource Emphasis

Changes in this build:

- Moves sheep / boar / cattle from the second resource row to the right side of the first player row.
- Frees the second row for primary resources only.
- Enlarges primary resource counts and slightly enlarges their icons while keeping row height fixed.
- Keeps the v0.10.21 physical-board-like round layout changes.

# BGA Agricola Compact Panel v0.10.21 physical round layout

本版嘗試將 BGA 中央回合格改成接近實體版的排列。

修改檔案：
- styles/original-ui.css

核心邏輯：
- BGA 原本是橫向印回合。
- 實體版是階段內往下印，收成後換欄。
- 不搬 DOM，只覆蓋 #turn_1 ~ #turn_14 以及 #harvest-slot-* 的 left/top。

嘗試排列：
- 第 1、2 回合保留 BGA 原本位置。
- 第 3、4 回合改到第 2 回合下方。
- 第 5~7 回合在下一欄往下。
- 第 8~9、10~11、12~13、14 各自往右分欄。
- 收成符號改到各階段下方。

背景：
- 暫時保留 central.png，但不隨新寬度拉伸。
- 如果視覺不佳，下一版可改成隱藏中央背景。


## v0.10.40-bg-takeover-left-crop

- 第一橫列背景上緣改為對齊左側「擴建農場」行動格上方。
- 第一橫列回合卡改為在背景帶內垂直置中，卡片本身不縮放。
- 第六季收成符號仍疊在第 14 回合背景底邊紅線上。


## v0.10.40-bg-takeover-left-crop

- 關閉 #central-board 原本整張背景圖。
- 用同一張 BGA 背景圖重建左側裁切區，顯示到第 1 回合右邊界。
- 右側維持使用第 6 回合來源裁切出的自訂回合背景拼貼。
- 關閉功能時會恢復原本背景圖設定。


Update in v0.10.41: switch replacement round background crop source from original round 6 to original round 2 for cleaner surroundings.


Update in v0.10.42: hide original right-side player boards, move status/round/phases into an upper-right multi-line info card, and omit the return-to-table button.


Update in v0.10.43: move the multi-line status box into #right-side-second-part above #logs_wrap, and hide the right-side player boards.


Update in v0.10.44: detect hand cards both from #alternative-hand-wrapper and from #player-boards/#player-boards-left-column #hand-container, for BGA layouts where the hand is rendered below the farm/player board area.


Update in v0.10.45: improve second-row primary resource alignment by using fixed icon slots and centering the numeric labels vertically.


Update in v0.10.46: reduce and compress spacing in the second-row primary resources so width pressure is handled by gaps before clipping.


Update in v0.10.47: display food as current/harvest-needed in the compact resource row using BGA's resource_food[data-harvest] attribute.


Update in v0.10.48: set the played-card area left padding to 0 so cards sit flush against the left boundary.


Update in v0.10.49: set played-card area padding to 0 on all sides.


Update in v0.10.50: set the played-card two-column gap to 0 and replace the card item border with an inset shadow so the border no longer consumes width and clips the right edge.


Update in v0.11.0: prototype original-DOM player board mode. The extension no longer renders cloned farm/card player panels as the main bottom area. Instead, BGA's real #player-boards is kept visible and fixed at the bottom, while the central round-card reconstruction remains in place. This is intended to test whether BGA's family/resource movement animations stay understandable when the original player boards are repositioned instead of cloned.


Update in v0.11.1: remove the cloned hand/board containers from the panel HTML entirely. Earlier v0.11.0 still created hidden clone containers; this version uses a toolbar-only shell and aggressively removes stale .bga-agri-v10-player / hand-card clones so the real BGA #player-boards can be tested without clone overlays.


## v0.12.9-grid-card-side-no-dom

- Removed the prototype's extremely high z-index from the moved original `#player-boards`; it now stays at `z-index: auto` so BGA's own flying animations are less likely to be hidden behind the player boards.
- Adjusted original-player-board scaling to use viewport width divided by four as the primary width target.
- Kept the central round-card reconstruction unchanged.
- Card layout/reflow is intentionally not addressed in this version.


## v0.12.9-grid-card-side-no-dom

- Keeps the `#player-boards` z-index at `auto` from v0.11.2.
- Fixes the overly large original-player-board scaling by measuring the real `.player-board-wrapper` natural width/height instead of using the old fixed fallback width.
- Still targets viewport width divided by four for the bottom four-column layout.
- Card layout is intentionally not redesigned in this version.


## v0.12.9-grid-card-side-no-dom

- Hides the BGA middle menu/footer chrome that appears between the central board and the fixed original player boards: `#maingameview_menufooter`, `#overall-footer`, and `#overall-footer-spacer`.
- Limits the right-side action log column so its bottom stops at the bottom of `#ActionFishing`, preventing it from covering the moved player boards.
- Keeps the original DOM player-board route, the v0.11.3 natural-width scaling, and the central round-card reconstruction unchanged.


## v0.12.9-grid-card-side-no-dom

- Moves the compact toolbar 6px above the top edge of the fixed original `#player-boards` area, including all right-side toolbar buttons.
- Makes the fixed `#player-boards` container and each player slot background transparent, so the beige sheet no longer blocks BGA's flying animations.
- Does not change card layout.
- Per-player wheel scrolling is intentionally not implemented yet because the current scaled absolute-wrapper layout does not naturally produce scroll height; it needs a separate spacer/scroll design.


## v0.12.9-grid-card-side-no-dom

- Positions the compact toolbar from the actual top edge of the moved `#player-boards`, rather than relying only on the board-height variable.
- Raises the toolbar 12px above the measured top edge of the player boards.
- Changes moved `#player-boards` and each `.player-board-resizable` slot to `overflow: visible` so BGA's flying family-member/resource animations are not clipped by the fixed bottom player-board containers.
- Keeps transparent player-board backgrounds from v0.11.5.
- Card layout and per-player wheel scrolling are still not changed.


## v0.12.9-grid-card-side-no-dom

- Keeps the v0.11.6 fixed-original-player-board route.
- Changes `#player-boards .cards-wrapper` from `overflow: hidden` to `overflow: visible`.
- Also allows overflow through `.player-board-wrapper`, `.player-board-holder`, and `.player-card` under `#player-boards`, aiming to preserve development-card/card-play animations.
- This may let cards visually overflow; this prototype prioritizes animation visibility over final card layout.


## v0.12.9-grid-card-side-no-dom

- Starts a new normal-flow original-DOM prototype.
- `#player-boards` is no longer fixed to the viewport bottom. It is restored to normal document flow (`position: static`, `z-index: auto`) to better preserve BGA's native animation behavior.
- On open, older prototype inline sizing/transform on original player boards is restored.
- Keeps middle BGA menu/footer hiding, right-log limiting, and central round-card reconstruction.
- Does not redesign card layout or per-player scrolling.


## v0.12.9-grid-card-side-no-dom

- Fixes v0.12.0 layout regression: the previous normal-flow override forced `width:auto`, `height:auto`, and `position:static` on BGA child player-board elements, stretching resource rows across the page.
- Keeps only the root `#player-boards` normal-flow override and preserves BGA's own child layout/inline sizes.
- Still restores any inline sizing/transform left by v0.11.x prototypes on open.


## v0.12.9-grid-card-side-no-dom

- Keeps `#player-boards` in normal document flow, not fixed to the viewport.
- Arranges the original BGA player boards as a four-column horizontal row.
- Scales each original `.player-board-wrapper` to fit one quarter of the current `#player-boards` width while preserving its internal BGA layout.
- Cleans stale v0.11 inline styles before measuring and applying the row scale.


## v0.12.9-grid-card-side-no-dom

- Directly uses `window.innerWidth / 4` as each player's target width.
- CSS sets the original `#player-boards` row to `width: 100vw` and `grid-template-columns: repeat(4, 25vw)`.
- Keeps the normal-flow original DOM route; `#player-boards` is still not fixed to the viewport.


## v0.12.9-grid-card-side-no-dom

- Reverts to the v0.12.3 central-board / round-card behavior. No v0.12.4/v0.12.5 central-board z-index or direct-child positioning fixes are included.
- Keeps the normal-flow original player-board route and viewport-width / 4 player columns.
- Adds only the CSS-only played-card split:
  - occupations in the left column;
  - minor/major improvements in the right column.


## v0.12.9-grid-card-side-no-dom

- Applies the central-board background-layer fix in the intended minimal way:
  - `#central-board` gets a local isolated stacking context.
  - the inserted runtime background layer uses `z-index: -1`.
  - no BGA action-card/resource child positioning is changed.
- Moves each original BGA `cards-wrapper` to the right side of its original `player-board-holder` by CSS/inline positioning, without moving card DOM or cloning cards.
- Keeps occupation/improvement two-column split inside the right-side card area.


## v0.12.9-grid-card-side-no-dom

- Recalculates each player's visual width as exactly `window.innerWidth / 4`.
- Splits that player width into three no-gap visual columns:
  - farm area: 70%;
  - occupation cards: 15%;
  - improvement cards: 15%.
- The farm is scaled down based on the 70% farm area; cards are positioned to the right, still inside the original `cards-wrapper`.
- Removes margin/padding/gap between farm and the two card columns.


## v0.12.9-grid-card-side-no-dom

- Does not move or clone card DOM nodes.
- Uses CSS grid layout on the existing original `.player-board-wrapper`:
  - left grid column: original `.player-board-holder` farm area;
  - right grid column: original `.cards-wrapper`.
- Uses non-direct selectors for `.player-board-holder` and `.cards-wrapper` to handle BGA structure variations.
- Keeps the visual total at `window.innerWidth / 4`, with farm 70% and the two card columns sharing the remaining 30%.
