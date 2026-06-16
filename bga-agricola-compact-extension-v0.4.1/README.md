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
