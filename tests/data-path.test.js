'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const{DATA_DIR_NAME,dataRootFromParent,pathsOverlap,resolveDataRoot}=require('../src/core/data-path');

test('portable builds default beside the portable executable',()=>{
  const root=resolveDataRoot({defaultUserData:path.resolve('/default'),portableDir:path.resolve('/portable'),bootstrap:{}});
  assert.equal(root,path.join(path.resolve('/portable'),DATA_DIR_NAME));
});

test('bootstrap data root overrides portable and default locations',()=>{
  const chosen=path.resolve('/chosen');
  assert.equal(resolveDataRoot({defaultUserData:'/default',portableDir:'/portable',bootstrap:{dataRoot:chosen}}),chosen);
});

test('selected parent receives a dedicated app data directory',()=>{
  const parent=path.resolve('/disk/test-data');
  assert.equal(dataRootFromParent(parent),path.join(parent,DATA_DIR_NAME));
  const already=path.join(parent,DATA_DIR_NAME);
  assert.equal(dataRootFromParent(already),already);
});

test('migration rejects nested source and destination paths',()=>{
  const root=path.resolve('/data/root');
  assert.equal(pathsOverlap(root,path.join(root,'child')),true);
  assert.equal(pathsOverlap(path.join(root,'child'),root),true);
  assert.equal(pathsOverlap(root,path.resolve('/other/root')),false);
});
