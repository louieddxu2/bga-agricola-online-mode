# Release Checklist

This project does not use screenshot tests. Local fixtures do not include the
full renderable BGA image set, so release confidence comes from syntax checks,
layout-model tests, manifest checks, and live BGA smoke testing.

## Required Checks

Run from the extension source directory:

```powershell
Get-ChildItem content -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
node --test tests\*.test.mjs
```

Before packaging, verify:

- `manifest.json` `version` matches `content/00_bootstrap.js` `VERSION`.
- `manifest.json` description reflects the current feature set.
- `manifest.json` lists every content script in dependency order.
- Compact mode can be enabled and disabled repeatedly without stale inline
  styles on hand cards, player action cards, or player boards.
- BGA hand preference restoration still returns the user's original setting.
- Player action cards only move when BGA preference 150 is enabled.
- Non-game player-status logs are hidden only in compact mode.

## Manual Live Smoke Test

On a live BGA Agricola table:

- Enable compact mode, reload, and confirm it opens cleanly.
- Toggle compact mode off and back on at least twice.
- Check hand cards in modal, board-bottom, and screen-bottom BGA preferences.
- Check player action cards when BGA's "player action cards" display option is
  enabled and disabled.
- Check games with other player boards beside and below the central board.
- Confirm the right history panel shows game moves but not friend online/offline
  status messages in compact mode.

## Build Release Zip

Run:

```powershell
.\scripts\build-release.ps1
```

The zip is written to `dist\` and intentionally includes only:

- `manifest.json`
- `content\`
- `styles\`
- `README.md`
- `RELEASE.md`

Do not package local BGA HTML snapshots, screenshots, tests, Codex attachments,
or handoff notes.
