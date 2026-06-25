# Agricola Online Mode

A Chrome / Chromium browser extension for [Board Game Arena](https://boardgamearena.com/) that reorganises the Agricola table layout for a cleaner, more playable experience — without losing any of BGA's original interactions, animations, or tooltips.

---

## What it does

| Before | After |
|--------|-------|
| Boards, hand, action cards and log are scattered across a wide scrolling page | Everything fits in a single viewport: central board top, farm boards bottom, hand and action cards in between |

**Key features**

- **Farm boards** are arranged in a compact row at the bottom of the viewport, scaled to fit.
- **Hand cards** sit below the central board when there is enough vertical room, or to the right side otherwise.
- **Played cards** (occupations & improvements) extend downward from each player board into available space.
- **Action cards** played on the central board are shown in a dedicated column on the right.
- **Game log** is filtered to show only meaningful game moves — not friend online/offline noise.
- All BGA tooltips, drag-and-drop, animations, and card interactions remain fully functional.
- Toggle the compact layout on/off at any time with the **Agricola Online Mode** button.

---

## Installation (manual, no Web Store required)

1. **Download** the latest `bga-agricola-online-mode-v*.zip` from the [Releases](../../releases) page and unzip it to a permanent folder on your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the folder you just unzipped.
5. Navigate to any Agricola game on BGA — the **Agricola Online Mode** button will appear in the bottom-right corner of the page.

> **Note:** Because this is a manually loaded extension, Chrome will remind you on startup that developer mode is active. This is normal and harmless.

---

## Usage

- Click **Agricola Online Mode** to enable the compact layout.
- Click **收合 v1.0.0** to return to the original BGA layout.
- Use the ▲▼ buttons inside the panel to adjust board and hand card sizes to your preference.

---

## Compatibility

| Browser | Status |
|---------|--------|
| Chrome 120+ | ✅ Supported |
| Edge (Chromium) | ✅ Should work |
| Firefox | ❌ Not supported (Manifest V3 differences) |

Works with **BGA Agricola** (all expansions). Only the table view is modified; lobby, profile, and other BGA pages are untouched.

---

## Updating

Download the new zip from [Releases](../../releases), replace the contents of your installation folder, then go to `chrome://extensions/` and click the **↺ refresh** icon on the extension card.

---

## Development

```powershell
# Syntax-check all content scripts
Get-ChildItem content -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }

# Run layout-model and CSS-scope tests
node --test tests\*.test.mjs

# Build a release zip (output goes to dist\)
.\scripts\build-release.ps1
```

See [RELEASE.md](RELEASE.md) for the full release checklist.

---

## Licence

MIT — see [LICENSE](LICENSE) for details.
