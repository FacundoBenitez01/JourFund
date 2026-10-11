/* Error reporting to Sentry without the SDK: uncaught errors and rejected promises only.
   Sends no diary data, no user id and no email; the DSN is a public client key. Empty DSN = off. */
(function(){'use strict';
const DSN='';
const RELEASE='jourfund@v121';
if(!DSN||!window.fetch)return;
const m=/^https:\/\/([0-9a-f]+)@([^/]+)\/(\d+)$/.exec(DSN);if(!m)return;
const endpoint='https://'+m[2]+'/api/'+m[3]+'/envelope/?sentry_version=7&sentry_key='+m[1]+'&sentry_client=jourfund-mini%2F1.0';
// Expected messages shown to the user, browser noise and third-party scripts are not bugs.
const IGNORE=/^(Script error\.?|ResizeObserver loop.*|Iniciá sesión y esperá a que se carguen tus datos\.)$/;
const sent=new Set();let count=0;
const clean=s=>String(s||'').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,'[email]').replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g,'[token]').slice(0,2000);
const url=u=>{try{const x=new URL(u,location.href);return x.origin+x.pathname;}catch{return '';}};
function frames(stack){return String(stack||'').split('\n').map(l=>/(?:at\s+(?:(.*?)\s+\()?|@)(https?:\/\/[^)\s]+?):(\d+):(\d+)\)?\s*$/.exec(l)).filter(Boolean).slice(0,40).reverse().map(f=>({function:clean(f[1]||'?').slice(0,200),filename:url(f[2]),lineno:+f[3],colno:+f[4],in_app:f[2].indexOf(location.origin)===0}));}
function report(type,message,stack){
 message=clean(message);if(!message||count>=10||IGNORE.test(message))return;const key=type+'|'+message;if(sent.has(key))return;sent.add(key);count++;
 const id=crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+b.toString(16).padStart(2,'0'),'');
 const event={event_id:id,timestamp:Date.now()/1000,platform:'javascript',level:'error',release:RELEASE,environment:location.hostname==='jourfund.com'?'production':'development',
  request:{url:url(location.href)},tags:{page:(document.querySelector('.ft-page.active')||{}).id||'none',lang:document.documentElement.lang||'',online:String(navigator.onLine)},
  exception:{values:[{type:clean(type).slice(0,100),value:message,stacktrace:{frames:frames(stack)}}]}};
 const body=JSON.stringify({event_id:id,sent_at:new Date().toISOString()})+'\n'+JSON.stringify({type:'event'})+'\n'+JSON.stringify(event);
 fetch(endpoint,{method:'POST',body,keepalive:true,credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'}}).catch(()=>{});
}
window.addEventListener('error',e=>{if(e.filename&&e.filename.indexOf(location.origin)!==0)return;if(e.error)report(e.error.name||'Error',e.error.message||e.message,e.error.stack);else if(e.message)report('Error',e.message,'');});
window.addEventListener('unhandledrejection',e=>{const r=e.reason;report((r&&r.name)||'UnhandledRejection',(r&&r.message)||String(r),r&&r.stack);});
window.jfReportError=(err,context)=>{if(err)report((err.name||'Error')+(context?' · '+String(context).slice(0,40):''),err.message||String(err),err.stack);};
})();
