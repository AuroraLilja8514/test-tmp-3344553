'use strict';

const api = window.puzzleWorkbench;
let snapshot = null;
let dragging = false;

const $ = (id) => document.getElementById(id);
const puzzleChrome = $('puzzleChrome');
const splitter = $('splitter');
const canvasChrome = $('canvasChrome');

function activeWorkspace() {
  return snapshot.state.workspaces[snapshot.state.activeWorkspaceId];
}

function activePuzzle() {
  const ws = activeWorkspace();
  return ws.puzzleTabs.find((tab) => tab.id === ws.activePuzzleTabId) || ws.puzzleTabs[0];
}

function renderTabs() {
  const ws = activeWorkspace();
  const container = $('puzzleTabs');
  container.replaceChildren();
  for (const tab of ws.puzzleTabs) {
    const item = document.createElement('div');
    item.className = `tab${tab.id === ws.activePuzzleTabId ? ' active' : ''}`;
    item.title = tab.url;
    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.title || 'Puzzle';
    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = 'Close tab';
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      api.puzzleClose(tab.id);
    });
    item.addEventListener('click', () => api.puzzleSwitch(tab.id));
    item.append(title, close);
    container.append(item);
  }
}

function render() {
  if (!snapshot) return;
  const ws = activeWorkspace();
  const puzzle = activePuzzle();
  $('puzzleUrl').value = puzzle.url === 'about:blank' ? '' : puzzle.url;
  $('canvasUrl').value = ws.canvas.url === 'about:blank' ? '' : ws.canvas.url;
  $('puzzleBack').disabled = !snapshot.navigation?.puzzle?.canGoBack;
  $('puzzleForward').disabled = !snapshot.navigation?.puzzle?.canGoForward;
  $('canvasBack').disabled = !snapshot.navigation?.canvas?.canGoBack;
  $('canvasForward').disabled = !snapshot.navigation?.canvas?.canGoForward;
  renderTabs();

  const ratio = snapshot.state.settings.splitRatio;
  puzzleChrome.style.width = `calc(${ratio * 100}% - 3px)`;
  canvasChrome.style.width = `calc(${(1 - ratio) * 100}% - 3px)`;
  canvasChrome.style.flex = 'none';
  $('statusText').textContent = `${ws.puzzleTabs.length} puzzle tab${ws.puzzleTabs.length === 1 ? '' : 's'} · split ${Math.round(ratio * 100)}/${Math.round((1 - ratio) * 100)}`;
}

$('puzzleUrlForm').addEventListener('submit', (event) => { event.preventDefault(); api.puzzleNavigate($('puzzleUrl').value); });
$('canvasUrlForm').addEventListener('submit', (event) => { event.preventDefault(); api.canvasNavigate($('canvasUrl').value); });
$('newPuzzleTab').addEventListener('click', () => api.puzzleNew('about:blank'));
$('puzzleBack').addEventListener('click', () => api.puzzleHistory('back'));
$('puzzleForward').addEventListener('click', () => api.puzzleHistory('forward'));
$('puzzleReload').addEventListener('click', () => api.puzzleHistory('reload'));
$('canvasBack').addEventListener('click', () => api.canvasHistory('back'));
$('canvasForward').addEventListener('click', () => api.canvasHistory('forward'));
$('canvasReload').addEventListener('click', () => api.canvasHistory('reload'));

splitter.addEventListener('mousedown', () => { dragging = true; splitter.classList.add('dragging'); });
window.addEventListener('mousemove', (event) => {
  if (!dragging) return;
  const ratio = Math.max(0.1, Math.min(0.9, event.clientX / window.innerWidth));
  puzzleChrome.style.width = `calc(${ratio * 100}% - 3px)`;
  canvasChrome.style.width = `calc(${(1 - ratio) * 100}% - 3px)`;
});
window.addEventListener('mouseup', (event) => {
  if (!dragging) return;
  dragging = false;
  splitter.classList.remove('dragging');
  api.setSplitRatio(event.clientX / window.innerWidth);
});

api.onState((next) => { snapshot = next; render(); });
api.getState().then((initial) => { snapshot = initial; render(); });
