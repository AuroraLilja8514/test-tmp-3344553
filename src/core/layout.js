'use strict';

const TOP_BAR_HEIGHT = 42;
const PANEL_CHROME_HEIGHT = 68;
const CONTENT_TOP = TOP_BAR_HEIGHT + PANEL_CHROME_HEIGHT;
const SPLITTER_WIDTH = 6;
const TOOL_SPLITTER_WIDTH = 6;
const MIN_MAIN_PANEL = 280;
const MIN_TOOL_WIDTH = 260;
const MAX_TOOL_WIDTH = 560;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function calculateLayout({ width, height, splitRatio = 0.5, toolVisible = false, toolWidth = 360 }) {
  const safeWidth = Math.max(640, Math.floor(width));
  const safeHeight = Math.max(CONTENT_TOP + 160, Math.floor(height));
  const contentHeight = safeHeight - CONTENT_TOP;

  let resolvedToolWidth = 0;
  let mainWidth = safeWidth;
  if (toolVisible) {
    const maximum = Math.max(MIN_TOOL_WIDTH, Math.min(MAX_TOOL_WIDTH, safeWidth - (MIN_MAIN_PANEL * 2) - SPLITTER_WIDTH - TOOL_SPLITTER_WIDTH));
    resolvedToolWidth = clamp(Math.round(toolWidth), MIN_TOOL_WIDTH, maximum);
    mainWidth = safeWidth - resolvedToolWidth - TOOL_SPLITTER_WIDTH;
  }

  const availableForPanels = mainWidth - SPLITTER_WIDTH;
  const minRatio = MIN_MAIN_PANEL / availableForPanels;
  const maxRatio = 1 - minRatio;
  const resolvedRatio = clamp(Number(splitRatio) || 0.5, minRatio, maxRatio);
  const puzzleWidth = Math.round(availableForPanels * resolvedRatio);
  const canvasWidth = availableForPanels - puzzleWidth;

  return {
    constants: { topBarHeight: TOP_BAR_HEIGHT, panelChromeHeight: PANEL_CHROME_HEIGHT, contentTop: CONTENT_TOP },
    splitRatio: resolvedRatio,
    toolWidth: resolvedToolWidth,
    puzzle: { x: 0, y: CONTENT_TOP, width: puzzleWidth, height: contentHeight },
    splitter: { x: puzzleWidth, y: TOP_BAR_HEIGHT, width: SPLITTER_WIDTH, height: safeHeight - TOP_BAR_HEIGHT },
    canvas: { x: puzzleWidth + SPLITTER_WIDTH, y: CONTENT_TOP, width: canvasWidth, height: contentHeight },
    toolSplitter: toolVisible
      ? { x: mainWidth, y: TOP_BAR_HEIGHT, width: TOOL_SPLITTER_WIDTH, height: safeHeight - TOP_BAR_HEIGHT }
      : null,
    tool: toolVisible
      ? { x: mainWidth + TOOL_SPLITTER_WIDTH, y: CONTENT_TOP, width: resolvedToolWidth, height: contentHeight }
      : null,
  };
}

module.exports = {
  calculateLayout,
  clamp,
  TOP_BAR_HEIGHT,
  PANEL_CHROME_HEIGHT,
  CONTENT_TOP,
  SPLITTER_WIDTH,
  TOOL_SPLITTER_WIDTH,
};
