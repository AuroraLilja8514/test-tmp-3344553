# Architecture

Puzzle Hunt Workbench is an Electron desktop application built around three web-content roles:

- **Puzzle** — a persistent multi-tab browser. Puzzle tabs remain alive while switching tabs.
- **Canvas** — one persistent browser surface intended for Google Sheets/Docs, Excalidraw, Notion, or any other user-provided URL.
- **Tools** — a vertical auxiliary surface. Inactive tool tabs may be destroyed after an idle timeout and recreated from their saved URL when selected again.

All remote content uses the same persistent Electron session so logins survive application restarts. Remote pages run with Node integration disabled, sandboxing enabled, and context isolation enabled.

The local Electron renderer owns only chrome UI: URL bars, tab strips, splitters, settings, workspace controls, and status. Remote pages are separate `WebContentsView` instances positioned below that chrome.

## Milestone acceptance

- M1/M2: dual main area, draggable split, persistent URLs, multi-tab Puzzle browser.
- M3: vertical tool dock, pop-out, opacity setting, favorites, sleeping inactive tools.
- M4: MHTML puzzle snapshots, retention, automatic/manual offline fallback.
- M5: settings UI and complete restart restoration.
- M6: one active hunt workspace selected from multiple saved hunt workspaces.
- M7: clean CI, three-platform packaging, automated GitHub Release.
