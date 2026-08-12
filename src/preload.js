'use strict';
const{contextBridge,ipcRenderer}=require('electron');
const invoke=(channel)=>(...args)=>ipcRenderer.invoke(channel,...args);
contextBridge.exposeInMainWorld('puzzleWorkbench',{
  getState:invoke('app:get-state'),
  puzzleNew:invoke('puzzle:new'),puzzleSwitch:invoke('puzzle:switch'),puzzleClose:invoke('puzzle:close'),puzzleNavigate:invoke('puzzle:navigate'),puzzleHistory:invoke('puzzle:history'),puzzleToggleCache:invoke('puzzle:toggle-cache'),puzzleRefreshCache:invoke('puzzle:refresh-cache'),
  canvasNavigate:invoke('canvas:navigate'),canvasHistory:invoke('canvas:history'),
  toolToggleDock:invoke('tool:toggle-dock'),toolNew:invoke('tool:new'),toolSwitch:invoke('tool:switch'),toolClose:invoke('tool:close'),toolNavigate:invoke('tool:navigate'),toolHistory:invoke('tool:history'),toolPopout:invoke('tool:popout'),toolDock:invoke('tool:dock'),toolFavorite:invoke('tool:favorite'),toolOpenFavorite:invoke('tool:open-favorite'),toolRemoveFavorite:invoke('tool:remove-favorite'),
  setSplitRatio:invoke('layout:set-split'),setToolWidth:invoke('layout:set-tool-width'),updateSettings:invoke('settings:update'),chooseDataLocation:invoke('data:choose-location'),restartApp:invoke('app:restart'),
  workspaceCreate:invoke('workspace:create'),workspaceSwitch:invoke('workspace:switch'),workspaceRename:invoke('workspace:rename'),workspaceDelete:invoke('workspace:delete'),
  onState:(callback)=>{const handler=(_e,value)=>callback(value);ipcRenderer.on('app:state',handler);return()=>ipcRenderer.removeListener('app:state',handler)}
});
