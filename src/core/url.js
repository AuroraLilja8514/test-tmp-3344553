'use strict';

function normalizeUserUrl(input) {
  const value = String(input || '').trim();
  if (!value) return 'about:blank';
  if (/^(about:|file:|data:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function isRemoteHttpUrl(input) {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isLocalSnapshotUrl(input) {
  try {
    return new URL(input).protocol === 'file:';
  } catch {
    return false;
  }
}

module.exports = { normalizeUserUrl, isRemoteHttpUrl, isLocalSnapshotUrl };
