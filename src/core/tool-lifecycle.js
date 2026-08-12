'use strict';
function shouldSleepTool({lastActiveAt,now=Date.now(),sleepMinutes=5,isActive=false,poppedOut=false}){if(isActive||poppedOut)return false;if(!Number.isFinite(lastActiveAt))return true;return now-lastActiveAt>=Math.max(1,Number(sleepMinutes)||5)*60000}
function toolOpacity(value){const n=Number(value);if(!Number.isFinite(n))return .88;return Math.min(1,Math.max(.35,n))}
module.exports={shouldSleepTool,toolOpacity};
