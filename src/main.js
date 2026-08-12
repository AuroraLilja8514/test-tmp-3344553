'use strict';

const path = require('node:path');
const { app, BrowserWindow, WebContentsView, ipcMain, session, shell } = require('electron');
const { StateStore } = require('./core/state-store');
const { newPuzzleTab } = require('./core/default-state');
const { normalizeUserUrl, isRemoteHttpUrl } = require('./core/url');
const { calculateLayout } = require('./core/layout');

const SESSION_PARTITION = 'persist:puzzle-hunt-workbench';

let mainWindow = null;
let sharedSession = null;
let stateStore = null;
let state = null;
let canvasView = null;
let puzzleViews = new Map();
let currentLayout = null;
let closing = false;

function workspace() {
  return state.workspaces[state.activeWorkspaceId];
}

function activePuzzleTab() {
  return workspace().puzzleTabs.find((tab) => tab.id === workspace().activePuzzleTabId) || workspace().puzzleTabs[0];
}

function sendState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const puzzle = activePuzzleTab();
  const activeView = puzzleViews.get(puzzle?.id);
  const canvasHistory = canvasView?.webContents.navigationHistory;
  const puzzleHistory = activeView?.webContents.navigationHistory;
  mainWindow.webContents.send('app:state', {
    state,
    navigation: {
      puzzle: {
        canGoBack: Boolean(puzzleHistory?.canGoBack()),
        canGoForward: Boolean(puzzleHistory?.canGoForward()),
      },
      canvas: {
        canGoBack: Boolean(canvasHistory?.canGoBack()),
        canGoForward: Boolean(canvasHistory?.canGoForward()),
      },
    },
    layout: currentLayout,
    platform: process.platform,
  });
}

async function persistAndBroadcast() {
  await stateStore.save(state);
  sendState();
}

function safeRemotePreferences() {
  return {
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true,
    allowRunningInsecureContent: false,
    backgroundThrottling: true,
    session: sharedSession,
  };
}

function attachNavigationMetadata(view, metadata, kind) {
  const contents = view.webContents;
  contents.setWindowOpenHandler(({ url }) => {
    if (kind === 'puzzle' && isRemoteHttpUrl(url)) {
      queueMicrotask(() => createPuzzleTab(url));
      return { action: 'deny' };
    }
    if (isRemoteHttpUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  const updateUrl = (_event, url) => {
    metadata.url = url;
    if (kind === 'puzzle' && isRemoteHttpUrl(url)) metadata.onlineUrl = url;
    persistAndBroadcast().catch(console.error);
  };
  contents.on('did-navigate', updateUrl);
  contents.on('did-navigate-in-page', updateUrl);
  contents.on('page-title-updated', (_event, title) => {
    metadata.title = title || (kind === 'puzzle' ? 'Puzzle' : 'Canvas');
    persistAndBroadcast().catch(console.error);
  });
  contents.on('did-start-loading', sendState);
  contents.on('did-stop-loading', sendState);
}

function createPuzzleView(tab) {
  const view = new WebContentsView({ webPreferences: safeRemotePreferences() });
  attachNavigationMetadata(view, tab, 'puzzle');
  puzzleViews.set(tab.id, view);
  view.webContents.loadURL(normalizeUserUrl(tab.url)).catch(() => {});
  return view;
}

function createCanvasView() {
  canvasView = new WebContentsView({ webPreferences: safeRemotePreferences() });
  attachNavigationMetadata(canvasView, workspace().canvas, 'canvas');
  canvasView.webContents.loadURL(normalizeUserUrl(workspace().canvas.url)).catch(() => {});
}

function ensurePuzzleViews() {
  for (const tab of workspace().puzzleTabs) {
    if (!puzzleViews.has(tab.id)) createPuzzleView(tab);
  }
}

function detachView(view) {
  if (!view || !mainWindow || mainWindow.isDestroyed()) return;
  try { mainWindow.contentView.removeChildView(view); } catch {}
}

function attachActiveViews() {
  for (const view of puzzleViews.values()) detachView(view);
  const active = puzzleViews.get(activePuzzleTab().id);
  if (active) mainWindow.contentView.addChildView(active);
  if (canvasView) {
    detachView(canvasView);
    mainWindow.contentView.addChildView(canvasView);
  }
  applyLayout();
}

function applyLayout() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [width, height] = mainWindow.getContentSize();
  currentLayout = calculateLayout({
    width,
    height,
    splitRatio: state.settings.splitRatio,
    toolVisible: false,
  });
  const active = puzzleViews.get(activePuzzleTab().id);
  if (active) active.setBounds(currentLayout.puzzle);
  if (canvasView) canvasView.setBounds(currentLayout.canvas);
  sendState();
}

async function createPuzzleTab(url = 'about:blank') {
  const tab = newPuzzleTab(normalizeUserUrl(url));
  workspace().puzzleTabs.push(tab);
  workspace().activePuzzleTabId = tab.id;
  createPuzzleView(tab);
  attachActiveViews();
  await persistAndBroadcast();
  return tab.id;
}

async function switchPuzzleTab(tabId) {
  if (!workspace().puzzleTabs.some((tab) => tab.id === tabId)) return false;
  workspace().activePuzzleTabId = tabId;
  attachActiveViews();
  await persistAndBroadcast();
  return true;
}

async function closePuzzleTab(tabId) {
  const tabs = workspace().puzzleTabs;
  const index = tabs.findIndex((tab) => tab.id === tabId);
  if (index < 0) return false;
  if (tabs.length === 1) {
    const tab = tabs[0];
    tab.url = 'about:blank';
    tab.onlineUrl = 'about:blank';
    tab.title = 'New Puzzle';
    const view = puzzleViews.get(tab.id);
    view?.webContents.loadURL('about:blank').catch(() => {});
    await persistAndBroadcast();
    return true;
  }
  const wasActive = workspace().activePuzzleTabId === tabId;
  const [removed] = tabs.splice(index, 1);
  const view = puzzleViews.get(removed.id);
  detachView(view);
  if (view && !view.webContents.isDestroyed()) view.webContents.close();
  puzzleViews.delete(removed.id);
  if (wasActive) workspace().activePuzzleTabId = tabs[Math.min(index, tabs.length - 1)].id;
  attachActiveViews();
  await persistAndBroadcast();
  return true;
}

function navigateContents(contents, action) {
  if (!contents || contents.isDestroyed()) return;
  const history = contents.navigationHistory;
  if (action === 'back' && history.canGoBack()) history.goBack();
  else if (action === 'forward' && history.canGoForward()) history.goForward();
  else if (action === 'reload') contents.reload();
  else if (action === 'reload-hard') contents.reloadIgnoringCache();
}

function registerIpc() {
  ipcMain.handle('app:get-state', () => ({ state, navigation: {}, layout: currentLayout, platform: process.platform }));
  ipcMain.handle('puzzle:new', (_event, url) => createPuzzleTab(url));
  ipcMain.handle('puzzle:switch', (_event, tabId) => switchPuzzleTab(tabId));
  ipcMain.handle('puzzle:close', (_event, tabId) => closePuzzleTab(tabId));
  ipcMain.handle('puzzle:navigate', async (_event, url) => {
    const normalized = normalizeUserUrl(url);
    const tab = activePuzzleTab();
    tab.url = normalized;
    tab.onlineUrl = normalized;
    await persistAndBroadcast();
    await puzzleViews.get(tab.id).webContents.loadURL(normalized).catch(() => {});
  });
  ipcMain.handle('puzzle:history', (_event, action) => navigateContents(puzzleViews.get(activePuzzleTab().id)?.webContents, action));
  ipcMain.handle('canvas:navigate', async (_event, url) => {
    const normalized = normalizeUserUrl(url);
    workspace().canvas.url = normalized;
    await persistAndBroadcast();
    await canvasView.webContents.loadURL(normalized).catch(() => {});
  });
  ipcMain.handle('canvas:history', (_event, action) => navigateContents(canvasView?.webContents, action));
  ipcMain.handle('layout:set-split', async (_event, ratio) => {
    state.settings.splitRatio = Math.max(0.1, Math.min(0.9, Number(ratio) || 0.5));
    applyLayout();
    await persistAndBroadcast();
  });
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: state.window.width,
    height: state.window.height,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'Puzzle Hunt Workbench',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  await mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  ensurePuzzleViews();
  createCanvasView();
  attachActiveViews();

  mainWindow.on('resize', applyLayout);
  mainWindow.on('maximize', () => { state.window.maximized = true; stateStore.save(state).catch(console.error); });
  mainWindow.on('unmaximize', () => { state.window.maximized = false; stateStore.save(state).catch(console.error); });
  mainWindow.on('close', (event) => {
    if (closing) return;
    event.preventDefault();
    closing = true;
    const [width, height] = mainWindow.getSize();
    state.window.width = width;
    state.window.height = height;
    stateStore.save(state).finally(() => mainWindow.destroy());
  });
  mainWindow.on('closed', () => {
    for (const view of puzzleViews.values()) if (!view.webContents.isDestroyed()) view.webContents.close();
    puzzleViews.clear();
    if (canvasView && !canvasView.webContents.isDestroyed()) canvasView.webContents.close();
    canvasView = null;
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    if (state.window.maximized) mainWindow.maximize();
    mainWindow.show();
    applyLayout();
  });
}

app.whenReady().then(async () => {
  stateStore = new StateStore(path.join(app.getPath('userData'), 'state.json'));
  state = await stateStore.load();
  sharedSession = session.fromPartition(SESSION_PARTITION, { cache: true });
  registerIpc();
  await createMainWindow();
}).catch((error) => {
  console.error(error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
