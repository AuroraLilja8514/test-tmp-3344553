# Puzzle Hunt Workbench

Puzzle Hunt Workbench is a desktop solving environment for puzzle hunts. It keeps the two things that need the most screen space—**puzzle pages** and a **working canvas**—visible side by side, while keeping web-based solving tools available in a vertical dock or a semi-transparent pop-out window.

## Core workflow

- **Puzzle**: persistent multi-tab browser. Tabs stay alive while you switch between them.
- **Canvas**: one persistent browser surface for Google Sheets, Google Docs, Excalidraw, Notion, or any URL you choose.
- **Tools**: a vertical right-side dock with tabs, favorites, adjustable width, and a pop-out mode.
- **Tool sleeping**: inactive tool tabs are destroyed after an adjustable idle timeout and recreated from their saved URL when selected again. Puzzle tabs and Canvas are not subjected to this policy.
- **Puzzle cache**: successful HTTP(S) puzzle loads are saved as local MHTML snapshots. Cache retention is configurable; when a hunt site is unreachable the app can automatically fall back to the most recent still-valid snapshot. You can also switch between Live and Cache manually.
- **Hunt workspaces**: optional activity-level workspaces. Only one hunt workspace is active at a time; each workspace remembers its Puzzle tabs, Canvas URL, Tools, and favorites.

## Tool pop-out opacity

The tool pop-out opacity is adjustable from 35% to 100%. Electron/OS support for window opacity can vary under some Linux window managers/Wayland configurations; Windows and macOS support the setting directly.

## Browser sessions

All Puzzle, Canvas, and Tool pages share the same persistent Electron session. This means logins and cookies survive restarts. Puzzle links opened with `target=_blank` become new Puzzle tabs; Canvas and Tool popups are allowed inside the app using the same session so OAuth/login flows can complete.

## Cache behavior

Puzzle snapshots are stored in the app's user-data directory as MHTML files. The cache is a resilience feature for temporary hunt-server outages—not a general archival crawler. Dynamic server-side behavior cannot run from an offline snapshot, but the rendered HTML and captured page resources remain available for reference.

## Development

```bash
npm install
npm run check
npm start
```

Linux smoke test:

```bash
PHW_SMOKE_TEST=1 xvfb-run -a npx electron .
```

Package the current platform:

```bash
npm run dist
```

## Release process

Pull requests to `main` run Windows, macOS, and Linux packaging without publishing. A successful push to `main` runs the same build matrix and automatically creates the GitHub Release matching `package.json` (currently `v0.1.0`) with the generated installers/artifacts.

This project is not affiliated with any puzzle hunt or tool website.
