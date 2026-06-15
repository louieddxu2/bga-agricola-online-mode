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
