# Puzzle Hunt Workbench Roadmap

## M1 Desktop shell
- Electron application
- Two permanent main panels: Puzzle and Canvas
- URL input/navigation in each panel
- Persistent browser session

Acceptance:
- Open arbitrary URLs in both panels
- Back/forward/reload work independently
- Restart preserves panel URLs

## M2 Puzzle multi-tab
- Puzzle panel supports multiple tabs
- Tab switching keeps WebContents alive
- Tab close/reopen behavior tested

Acceptance:
- Five puzzle tabs can be opened and switched without reload

## M3 Tools
- Vertical tool dock
- Tool tabs
- URL based tools
- Favorites
- Pop-out transparent window
- Configurable opacity
- Sleeping inactive tools

Acceptance:
- Hidden tools consume minimal resources
- Pop-out opacity survives restart

## M4 Offline puzzle cache
- Capture puzzle pages
- Cache expiry configuration
- Offline fallback mode

Acceptance:
- Disconnect network and reopen cached puzzle

## M5 Persistence
- Settings
- Layout
- URLs
- Tool list

## M6 Hunt workspace
- Optional activity-level workspace
- One active workspace

## M7 Release
- GitHub Actions
- Windows/macOS/Linux build
- Automated GitHub Release
