# Development milestones

## M1 — Desktop shell ✅

- Electron shell, Puzzle + Canvas main areas, URL bars, persistent session.
- Draggable Puzzle/Canvas splitter.
- Persistent state.
- Acceptance: both URLs and split ratio survive restart; unit/source checks pass.

## M2 — Puzzle multi-tab ✅

- Create, switch, close, and persist Puzzle tabs.
- Puzzle tabs remain alive when inactive.
- `target=_blank` puzzle links create Puzzle tabs.
- Acceptance: multiple tabs retain in-page state while switching.

## M3 — Tools system ✅

- Vertical right-side dock only (no bottom dock).
- Tool tabs and favorites.
- Pop-out Tool window with configurable opacity/always-on-top.
- Idle Tool sleeping and recreation from URL.
- Acceptance: inactive Tools release WebContents after timeout; active/pop-out Tool never sleeps.

## M4 — Puzzle offline cache ✅

- Automatic MHTML snapshot after successful Puzzle loads.
- Configurable retention.
- Manual Live/Cache switch.
- Automatic fallback when a remote Puzzle load fails and a fresh cache exists.
- Acceptance: cache key/freshness tests pass and fallback is wired to main-frame load failure.

## M5 — Persistence and settings ✅

- Settings dialog for opacity, Tool sleep timeout, cache retention, fallback behavior, and always-on-top.
- Restore Puzzle tabs, Canvas URL, Tools, favorites, and layout settings.
- Acceptance: state store writes atomically and migrations preserve defaults.

## M6 — Hunt workspaces ✅

- Optional event-level workspaces.
- Exactly one active workspace; switch/create/rename/delete.
- Only the active workspace owns live WebContents.
- Acceptance: workspace lifecycle tests pass.

## M7 — CI, packaging, Release

- CI source checks/unit tests.
- Linux Electron startup smoke test.
- Windows/macOS/Linux package build on PR.
- Automatic `v0.1.0` GitHub Release after validated merge to `main`.
- Acceptance: all three build jobs green and release assets published.
