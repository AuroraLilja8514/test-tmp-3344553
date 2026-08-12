'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('puzzleWorkbench', {
  getState: () => ipcRenderer.invoke('app:get-state'),
  puzzleNew: (url) => ipcRenderer.invoke('puzzle:new', url),
  puzzleSwitch: (tabId) => ipcRenderer.invoke('puzzle:switch', tabId),
  puzzleClose: (tabId) => ipcRenderer.invoke('puzzle:close', tabId),
  puzzleNavigate: (url) => ipcRenderer.invoke('puzzle:navigate', url),
  puzzleHistory: (action) => ipcRenderer.invoke('puzzle:history', action),
  canvasNavigate: (url) => ipcRenderer.invoke('canvas:navigate', url),
  canvasHistory: (action) => ipcRenderer.invoke('canvas:history', action),
  setSplitRatio: (ratio) => ipcRenderer.invoke('layout:set-split', ratio),
  onState: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('app:state', handler);
    return () => ipcRenderer.removeListener('app:state', handler);
  },
});
