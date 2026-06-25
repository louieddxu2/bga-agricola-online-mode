# Agricola Online Mode (農家樂線上排版助手)

[繁體中文](#繁體中文) | [English](#english)

---

## 繁體中文

這是一個專為 [Board Game Arena (BGA)](https://boardgamearena.com/) 設計的 Chrome / Chromium 瀏覽器擴充功能。它重新整理了農家樂（Agricola）的遊戲桌排版，提供更乾淨、更直覺且好上手的體驗——同時完全保留 BGA 原本的互動、動畫與懸停提示（tooltip）。

### 功能特點

| 調整前 | 調整後 |
|--------|-------|
| 玩家個人板、手牌、行動卡和遊戲記錄散落在長長的網頁上，需要頻繁上下滾動。 | 所有資訊都整合在單一視窗內：中央圖板在上方、農莊板塊在下方，手牌和行動卡整齊排列在中間。 |

**主要功能：**
- **農莊板塊**：緊湊地排列在視窗底部，並依比例縮放以適應螢幕。
- **手牌區域**：當垂直空間足夠時顯示在中央圖板下方，否則會移至右側。
- **已打出卡牌**（職業與改善）：從每位玩家的板塊向下延伸，善用剩餘空間。
- **行動卡**：放置在中央圖板的卡牌會顯示在右側的專屬欄位中。
- **遊戲記錄**：過濾掉好友上線/下線等雜音，只顯示具備遊戲意義的步驟。
- 保留所有 BGA 原有的懸停提示（tooltips）、拖放操作（drag-and-drop）、動畫以及卡牌點擊互動。
- 隨時可以使用右下角的 **Agricola Online Mode** 按鈕切換開啟或關閉緊湊排版。

---

### 安裝方式 (手動安裝，無需透過 Web Store)

1. **下載**：至 [Releases](../../releases) 頁面下載最新版的 `bga-agricola-online-mode-v*.zip`，並將其解壓縮到電腦中的固定資料夾。
2. 開啟 Chrome 瀏覽器，進入 `chrome://extensions/`（擴充功能管理頁面）。
3. 開啟右上角的 **「開發者模式」** (Developer mode) 開關。
4. 點擊左上角的 **「載入解壓縮開發中擴充功能」** (Load unpacked)，並選擇您剛剛解壓縮的資料夾。
5. 進入 BGA 的任何一局農家樂遊戲——**Agricola Online Mode** 按鈕將會出現在網頁的右下角。

> ⚠️ **注意**：因為這是手動載入的擴充功能，Chrome 在每次啟動時都會提醒您「開發者模式正在運行」，這是正常且安全的現象，直接關閉該提示即可。

---

### 使用方式

- 點擊 **Agricola Online Mode** 按鈕即可啟用緊湊排版。
- 點擊控制面板上的 **收合 v1.0.0** 可隨時還原為 BGA 原本的排版。
- 使用面板內部的 ▲▼ 按鈕，可以自由調整遊戲板塊與手牌的卡片大小。

---

### 相容性

| 瀏覽器 | 支援狀態 |
|---------|--------|
| Chrome 120+ | ✅ 支援 |
| Edge (Chromium) | ✅ 支援 |
| Firefox | ❌ 不支援 (Manifest V3 規格差異) |

本套件適用於 **BGA Agricola (農家樂)**（支援所有擴充）。本功能僅修改遊戲桌面排版，遊戲大廳、個人檔案等其他 BGA 頁面不受影響。

---

### 更新步驟

從 [Releases](../../releases) 下載新的 zip 檔，覆蓋原安裝資料夾中的檔案，然後到 `chrome://extensions/` 點擊該擴充功能卡片上的 **↺ 重新整理 (refresh)** 圖示即可。

---

## English

A Chrome / Chromium browser extension for [Board Game Arena](https://boardgamearena.com/) that reorganises the Agricola table layout for a cleaner, more playable experience — without losing any of BGA's original interactions, animations, or tooltips.

### What it does

| Before | After |
|--------|-------|
| Boards, hand, action cards and log are scattered across a wide scrolling page | Everything fits in a single viewport: central board top, farm boards bottom, hand and action cards in between |

**Key features:**
- **Farm boards** are arranged in a compact row at the bottom of the viewport, scaled to fit.
- **Hand cards** sit below the central board when there is enough vertical room, or to the right side otherwise.
- **Played cards** (occupations & improvements) extend downward from each player board into available space.
- **Action cards** played on the central board are shown in a dedicated column on the right.
- **Game log** is filtered to show only meaningful game moves — not friend online/offline noise.
- All BGA tooltips, drag-and-drop, animations, and card interactions remain fully functional.
- Toggle the compact layout on/off at any time with the **Agricola Online Mode** button.

---

### Installation (manual, no Web Store required)

1. **Download** the latest `bga-agricola-online-mode-v*.zip` from the [Releases](../../releases) page and unzip it to a permanent folder on your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the folder you just unzipped.
5. Navigate to any Agricola game on BGA — the **Agricola Online Mode** button will appear in the bottom-right corner of the page.

> ⚠️ **Note:** Because this is a manually loaded extension, Chrome will remind you on startup that developer mode is active. This is normal and harmless.

---

### Usage

- Click **Agricola Online Mode** to enable the compact layout.
- Click **收合 v1.0.0** to return to the original BGA layout.
- Use the ▲▼ buttons inside the panel to adjust board and hand card sizes to your preference.

---

### Compatibility

| Browser | Status |
|---------|--------|
| Chrome 120+ | ✅ Supported |
| Edge (Chromium) | ✅ Should work |
| Firefox | ❌ Not supported (Manifest V3 differences) |

Works with **BGA Agricola** (all expansions). Only the table view is modified; lobby, profile, and other BGA pages are untouched.

---

### Updating

Download the new zip from [Releases](../../releases), replace the contents of your installation folder, then go to `chrome://extensions/` and click the **↺ refresh** icon on the extension card.

---

## Development / 開發

```powershell
# Syntax-check all content scripts
Get-ChildItem bga-agricola-compact-extension-v0.4.1\content -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }

# Run layout-model and CSS-scope tests
node --test bga-agricola-compact-extension-v0.4.1\tests\*.test.mjs

# Build a release zip (output goes to dist\)
.\bga-agricola-compact-extension-v0.4.1\scripts\build-release.ps1
```

See [RELEASE.md](bga-agricola-compact-extension-v0.4.1/RELEASE.md) for the full release checklist.

---

## License / 授權

MIT — see [LICENSE](LICENSE) for details.
