'use strict';const test=require('node:test'),assert=require('node:assert/strict');const{shouldSleepTool,toolOpacity}=require('../src/core/tool-lifecycle');
test('inactive tools sleep after timeout',()=>{const now=1e6;assert.equal(shouldSleepTool({lastActiveAt:now-360001,now,sleepMinutes:5}),true);assert.equal(shouldSleepTool({lastActiveAt:now-1000,now,sleepMinutes:5}),false)});
test('active and popout tools stay alive',()=>{assert.equal(shouldSleepTool({lastActiveAt:0,now:9e6,isActive:true}),false);assert.equal(shouldSleepTool({lastActiveAt:0,now:9e6,poppedOut:true}),false)});
test('opacity clamp',()=>{assert.equal(toolOpacity(.1),.35);assert.equal(toolOpacity(.77),.77);assert.equal(toolOpacity(2),1)});
