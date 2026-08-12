'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateLayout } = require('../src/core/layout');

test('two main panels fill the window when tools are hidden', () => {
  const result = calculateLayout({ width: 1200, height: 800, splitRatio: 0.5 });
  assert.equal(result.puzzle.width + result.splitter.width + result.canvas.width, 1200);
  assert.equal(result.tool, null);
});

test('vertical tool dock reserves only right-side width', () => {
  const result = calculateLayout({ width: 1500, height: 900, toolVisible: true, toolWidth: 360 });
  assert.equal(result.tool.width, 360);
  assert.equal(result.tool.x + result.tool.width, 1500);
  assert.equal(result.puzzle.width + result.splitter.width + result.canvas.width + 6 + result.tool.width, 1500);
});

test('split ratio is clamped to preserve usable puzzle and canvas areas', () => {
  const result = calculateLayout({ width: 900, height: 700, splitRatio: 0.99 });
  assert.ok(result.canvas.width >= 280);
  assert.ok(result.puzzle.width >= 280);
});
