/* Small polyfills for older Safari/iOS (before 15.4/16): without them a single call such as list.at(-1) throws
   and stops the rest of the screen from drawing. */
(function(){'use strict';
function at(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;return n<0||n>=this.length?undefined:this[n];}
for(const C of [Array,String])if(!C.prototype.at)Object.defineProperty(C.prototype,'at',{value:at,writable:true,configurable:true});
if(!Array.prototype.findLast)Object.defineProperty(Array.prototype,'findLast',{value:function(f,t){for(let i=this.length-1;i>=0;i--)if(f.call(t,this[i],i,this))return this[i];},writable:true,configurable:true});
if(!Array.prototype.findLastIndex)Object.defineProperty(Array.prototype,'findLastIndex',{value:function(f,t){for(let i=this.length-1;i>=0;i--)if(f.call(t,this[i],i,this))return i;return -1;},writable:true,configurable:true});
if(!Object.hasOwn)Object.defineProperty(Object,'hasOwn',{value:(o,k)=>Object.prototype.hasOwnProperty.call(o,k),writable:true,configurable:true});
if(!String.prototype.replaceAll)Object.defineProperty(String.prototype,'replaceAll',{value:function(a,b){return a instanceof RegExp?this.replace(a,b):this.split(a).join(typeof b==='function'?b(a):b);},writable:true,configurable:true});
})();
