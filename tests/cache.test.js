'use strict';const test=require('node:test'),assert=require('node:assert/strict');const{cacheFileName,isFreshCache}=require('../src/core/cache');
test('cache filenames are stable and filesystem safe',()=>{assert.equal(cacheFileName('https://example.com/a'),cacheFileName('https://example.com/a'));assert.match(cacheFileName('https://example.com/a'),/^[a-f0-9]+\.mhtml$/)});
test('cache freshness honors retention',()=>{const now=10*86400000;assert.equal(isFreshCache({path:'x',cachedAt:now-6*86400000},7,now),true);assert.equal(isFreshCache({path:'x',cachedAt:now-8*86400000},7,now),false)});
