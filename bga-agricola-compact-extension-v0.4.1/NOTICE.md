# Code and Asset Notices

This notice records the external runtime references and distribution boundaries
for BGA PlayAgricolaOnline Mode.

## Project code

The JavaScript, CSS, PowerShell, test, manifest, and documentation files in
this repository are project files authored for this extension unless a notice
below says otherwise. They are released under the MIT License in [LICENSE](LICENSE).

The repository currently contains no vendored third-party JavaScript/CSS
library and no third-party runtime dependency. The extension does not copy or
redistribute Board Game Arena's application source code.

## Board Game Arena runtime references

This extension is an unofficial client-side layout enhancement for
[Board Game Arena](https://boardgamearena.com/)'s Agricola table. It reads and
positions elements from the live page, including BGA DOM IDs/classes such as
`#central-board`, `#player-boards`, `#hand-container`, `#right-side`, and
`#right-side-second-part`, `#logs_wrap`, and `#ActionFishing`. It also reads
BGA's live hand-position preference control `#preference_control_108` and the
active player-action-card DOM instead of copying BGA's preference code.

These selectors and preference identifiers are integration points, not copied
BGA source code. BGA's website, Agricola implementation, game artwork,
trademarks, and other platform content remain the property of their respective
owners. This project is not affiliated with or endorsed by Board Game Arena.

## Runtime-loaded board image

`content/85_original-ui-compact.js` looks for the live Agricola `central.png`
resource through the page's computed styles, Performance API entries, or the
page's `g_gamethemeurl` value. The extension uses that URL to reconstruct the
compact board background at runtime; it does not ship the image in the release
zip. The release build also excludes local BGA HTML snapshots and screenshots.

## Platform APIs and test APIs

- `manifest.json` uses Chrome Manifest V3 and the `storage` permission.
- `content/10_settings.js` uses the browser-provided `chrome.storage.local`
  API for user settings.
- The content scripts use standard DOM APIs and `MutationObserver`.
- Tests use Node's built-in `node:test`, `node:assert/strict`, and `node:fs`
  modules. No external test package is required.

The exact project-file ownership of these integrations is documented in the
[README source map](README.md#source-map--程式碼對照).
