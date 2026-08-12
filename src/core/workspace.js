'use strict';
const{newWorkspace}=require('./default-state');
function createWorkspaceInState(state,name){const workspace=newWorkspace(String(name||'New Hunt').trim()||'New Hunt');state.workspaces[workspace.id]=workspace;state.activeWorkspaceId=workspace.id;return workspace}
function renameWorkspace(state,id,name){const ws=state.workspaces[id];if(!ws)return false;ws.name=String(name||'').trim()||ws.name;return true}
function deleteWorkspaceFromState(state,id){if(!state.workspaces[id])return false;const ids=Object.keys(state.workspaces);if(ids.length<=1)return false;delete state.workspaces[id];if(state.activeWorkspaceId===id)state.activeWorkspaceId=Object.keys(state.workspaces)[0];return true}
module.exports={createWorkspaceInState,renameWorkspace,deleteWorkspaceFromState};
