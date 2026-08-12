'use strict';

const crypto = require('node:crypto');

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function newPuzzleTab(url = 'about:blank') {
  return { id: id('puzzle'), url, onlineUrl: url, title: 'New Puzzle', offline: false, cacheAvailable: false };
}

function newToolTab(url = 'about:blank', name = 'New Tool') {
  return { id: id('tool'), url, title: name, sleeping: false, lastActiveAt: Date.now() };
}

function newWorkspace(name = 'Default Hunt') {
  const puzzle = newPuzzleTab();
  return {
    id: id('workspace'),
    name,
    puzzleTabs: [puzzle],
    activePuzzleTabId: puzzle.id,
    canvas: { url: 'about:blank', title: 'Canvas' },
    tools: {
      tabs: [],
      activeToolTabId: null,
      dockVisible: false,
      poppedOut: false,
      favorites: [],
    },
  };
}

function createDefaultState() {
  const workspace = newWorkspace();
  return {
    version: 1,
    settings: {
      splitRatio: 0.5,
      toolDockWidth: 360,
      toolPopoutOpacity: 0.88,
      toolAlwaysOnTop: true,
      toolSleepMinutes: 5,
      cacheRetentionDays: 7,
      autoOfflineFallback: true,
    },
    activeWorkspaceId: workspace.id,
    workspaces: { [workspace.id]: workspace },
    window: { width: 1440, height: 900, maximized: true },
  };
}

function migrateState(value) {
  if (!value || value.version !== 1 || !value.workspaces || !value.activeWorkspaceId) return createDefaultState();
  const defaults = createDefaultState();
  value.settings = { ...defaults.settings, ...(value.settings || {}) };
  value.window = { ...defaults.window, ...(value.window || {}) };
  if (!value.workspaces[value.activeWorkspaceId]) {
    const first = Object.keys(value.workspaces)[0];
    if (first) value.activeWorkspaceId = first;
    else return createDefaultState();
  }
  for (const workspace of Object.values(value.workspaces)) {
    if (!Array.isArray(workspace.puzzleTabs) || workspace.puzzleTabs.length === 0) {
      const puzzle = newPuzzleTab();
      workspace.puzzleTabs = [puzzle];
      workspace.activePuzzleTabId = puzzle.id;
    }
    workspace.tools ||= { tabs: [], activeToolTabId: null, dockVisible: false, poppedOut: false, favorites: [] };
    workspace.tools.tabs ||= [];
    workspace.tools.favorites ||= [];
    workspace.canvas ||= { url: 'about:blank', title: 'Canvas' };
  }
  return value;
}

module.exports = { createDefaultState, migrateState, newWorkspace, newPuzzleTab, newToolTab };
