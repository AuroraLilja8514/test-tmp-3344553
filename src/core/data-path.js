'use strict';
const fs=require('node:fs');
const path=require('node:path');

const DATA_DIR_NAME='Puzzle Hunt Workbench Data';
const BOOTSTRAP_FILE='.puzzle-hunt-workbench-bootstrap.json';

function cleanPath(value){return path.resolve(String(value||''))}
function pathsOverlap(a,b){
  const aa=cleanPath(a),bb=cleanPath(b);
  if(aa===bb)return true;
  const relAB=path.relative(aa,bb),relBA=path.relative(bb,aa);
  return relAB!==''&&!relAB.startsWith(`..${path.sep}`)&&relAB!=='..'&&!path.isAbsolute(relAB)
    || relBA!==''&&!relBA.startsWith(`..${path.sep}`)&&relBA!=='..'&&!path.isAbsolute(relBA);
}
function dataRootFromParent(parent){
  const selected=cleanPath(parent);
  return path.basename(selected)===DATA_DIR_NAME?selected:path.join(selected,DATA_DIR_NAME);
}
function bootstrapPath(appData){return path.join(cleanPath(appData),BOOTSTRAP_FILE)}
function readBootstrap(file){
  try{return JSON.parse(fs.readFileSync(file,'utf8'))}
  catch{return{}}
}
function writeBootstrap(file,value){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const tmp=`${file}.tmp`;
  fs.writeFileSync(tmp,`${JSON.stringify(value,null,2)}\n`,'utf8');
  fs.renameSync(tmp,file);
}
function resolveDataRoot({defaultUserData,portableDir,bootstrap={}}){
  if(bootstrap.dataRoot)return cleanPath(bootstrap.dataRoot);
  if(portableDir)return path.join(cleanPath(portableDir),DATA_DIR_NAME);
  return cleanPath(defaultUserData);
}
function migratePending(bootstrapFile,bootstrap){
  if(!bootstrap.pendingMigrationFrom||!bootstrap.dataRoot)return bootstrap;
  const source=cleanPath(bootstrap.pendingMigrationFrom),target=cleanPath(bootstrap.dataRoot);
  if(source!==target&&fs.existsSync(source)){
    if(pathsOverlap(source,target))throw new Error('Data migration source and destination must not contain each other.');
    fs.mkdirSync(target,{recursive:true});
    fs.cpSync(source,target,{recursive:true,force:true,errorOnExist:false});
  }else fs.mkdirSync(target,{recursive:true});
  const next={...bootstrap};delete next.pendingMigrationFrom;
  writeBootstrap(bootstrapFile,next);
  return next;
}
function prepareDataPaths(app,{portableDir=process.env.PORTABLE_EXECUTABLE_DIR}={}){
  const defaultUserData=app.getPath('userData');
  const file=bootstrapPath(app.getPath('appData'));
  let bootstrap=readBootstrap(file);
  bootstrap=migratePending(file,bootstrap);
  let dataRoot=resolveDataRoot({defaultUserData,portableDir,bootstrap});
  try{fs.mkdirSync(dataRoot,{recursive:true})}
  catch{dataRoot=cleanPath(defaultUserData);fs.mkdirSync(dataRoot,{recursive:true})}
  app.setPath('userData',dataRoot);
  app.setPath('sessionData',dataRoot);
  return{dataRoot,bootstrapFile:file,defaultUserData:cleanPath(defaultUserData),portableMode:Boolean(portableDir)};
}
function planDataMigration({bootstrapFile,currentDataRoot,targetParent}){
  const current=cleanPath(currentDataRoot),target=dataRootFromParent(targetParent);
  if(current===target)return{changed:false,dataRoot:current};
  if(pathsOverlap(current,target))throw new Error('Choose a folder outside the current data directory.');
  writeBootstrap(bootstrapFile,{version:1,dataRoot:target,pendingMigrationFrom:current});
  return{changed:true,dataRoot:target};
}

module.exports={DATA_DIR_NAME,bootstrapPath,dataRootFromParent,pathsOverlap,resolveDataRoot,prepareDataPaths,planDataMigration};
