# Puzzle Hunt Workbench v0.1.1

Portable and storage-control update.

Highlights:

- Windows now publishes clearly named **Setup** and **Portable** executables;
- the Windows Setup build is an assisted installer and allows choosing the installation directory;
- Windows Portable defaults its application data to a `Puzzle Hunt Workbench Data` folder beside the portable executable;
- Settings now shows the active application-data directory and can move it to a user-selected location;
- data relocation is performed safely on restart, before Electron creates browser sessions;
- workspace state, puzzle MHTML cache, cookies, login/session data and Chromium storage move together;
- macOS `.zip` and Linux `.AppImage` / `.tar.gz` remain no-installer distribution options;
- data-location rules are covered by unit tests.

The application is unsigned/not notarized, so operating systems may show an unknown-publisher warning on first launch.

## v0.1.0

First complete release: persistent Puzzle + Canvas areas, multi-tab Puzzle browsing, vertical sleeping Tools, semi-transparent Tool pop-out, MHTML offline fallback, persistent browser session, and activity-level workspaces.
