'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeUserUrl, isRemoteHttpUrl } = require('../src/core/url');

test('normalizes bare hostnames to https', () => {
  assert.equal(normalizeUserUrl('example.com/a'), 'https://example.com/a');
});

test('keeps explicit schemes and blank pages', () => {
  assert.equal(normalizeUserUrl('http://example.com'), 'http://example.com');
  assert.equal(normalizeUserUrl('about:blank'), 'about:blank');
  assert.equal(normalizeUserUrl(''), 'about:blank');
});

test('detects remote HTTP URLs', () => {
  assert.equal(isRemoteHttpUrl('https://example.com'), true);
  assert.equal(isRemoteHttpUrl('file:///tmp/a.mhtml'), false);
});
