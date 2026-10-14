/* Herramientas → "Riesgo total del día": adds up the risk of the positions you have open (or plan to open),
   compares it with what the reference account still allows today, and flags currencies several positions bet on
   in the same direction. Drafts stay in this browser only (per user); nothing is saved to the journal. */
(function(){'use strict';
const $=id=>document.getElementById(id),I=window.JourFundInsights,P=window.FTProtection;
const menu=document.querySelector('#ftPageTools .ft74-menu'),panel=$('ft74Panel');if(!I||!menu||!panel)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',E=s=>P?P.escape(s):String(s);
const money=n=>new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
const pct=n=>new Intl.NumberFormat(loc(),{maximumFractionDigits:1}).format(n)+'%';
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
const uid=()=>window.ftCloudSession?.user?.id||'';
const SYMBOLS=['XAUUSD','XAGUSD','EURUSD','GBPUSD','AUDUSD','NZDUSD','USDJPY','USDCAD','USDCHF','EURJPY','GBPJPY','EURGBP','AUDJPY','NAS100','US30','SP500','GER40','UK100','BTCUSD','ETHUSD','USOIL'];
const MAX=10,ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16M6 16l4-5 3 3 5-7"/><circle cx="18" cy="7" r="2"/><path d="M4 4v16"/></svg>';
let active=false,rows=null;

const key=()=>'jf_exposure_'+uid();
function load(){try{const v=JSON.parse(localStorage.getItem(key())||'null');if(Array.isArray(v)&&v.length)return v.slice(0,MAX).map(r=>({symbol:String(r.symbol||'').slice(0,20),side:r.side==='sell'?'sell':'buy',risk:String(r.risk??'').slice(0,12)}));}catch{}return [{symbol:'',side:'buy',risk:''}];}
function store(){try{localStorage.setItem(key(),JSON.stringify(rows));}catch{}}

const btn=document.createElement('button');btn.type='button';btn.className='ft74-tool';btn.id='jfExposureTool';btn.dataset.jfinTool='exposure';btn.setAttribute('aria-pressed','false');
function label(){btn.innerHTML='<span class="ft74-icon">'+ICON+'</span><span><strong>'+E(T('Riesgo total del día','Total risk today','Risco total do dia'))+'</strong><small>'+E(T('Todas tus posiciones juntas','All your positions together','Todas as posições juntas'))+'</small></span>';}
label();menu.append(btn);

function room(){
 try{const a=acc();if(!a||!window.FTRules||!window.FTLedger)return null;const r=FTRules.risk(a,FTLedger.day(a));
  const limits=[r.dailyRemaining,r.maxRemaining].filter(Number.isFinite);return {remaining:limits.length?Math.max(0,Math.min(...limits)):null,daily:r.dailyRemaining,max:r.maxRemaining,balance:r.equity,dayPnl:r.dayPnl,name:(a.nickname||a.program||a.firm||'')+''};}catch{return null;}
}
function positions(){return rows.filter(r=>r.symbol.trim()&&Number(String(r.risk).replace(',','.'))>0).map(r=>({symbol:r.symbol.trim().toUpperCase(),side:r.side,risk:Number(String(r.risk).replace(',','.'))}));}

function result(){
 const out=$('jfExposureResult');if(!out)return;const ctx=room(),list=positions(),x=I.exposure(list,ctx?.remaining??NaN);
 if(!list.length){out.innerHTML='<p class="jfin-empty">'+E(T('Cargá el activo, la dirección y cuánto perdés si toca el stop en cada posición.','Enter the asset, direction and how much you lose at the stop for each position.','Informe o ativo, a direção e quanto perde no stop em cada posição.'))+'</p>';return;}
 const used=x.usedPct==null?null:Math.min(100,x.usedPct),level=x.over?'neg':used!=null&&used>=75?'warn':'pos';
 let html='<div class="jfin-exp-total"><div><small>'+E(T('Si todas tocan el stop','If every stop is hit','Se todos os stops forem atingidos'))+'</small><b class="neg">-'+E(money(x.total))+'</b>'+(ctx?.balance>0?'<small>'+E(pct(x.total/ctx.balance*100)+' '+T('del balance','of balance','do saldo'))+'</small>':'')+'</div>'+
  (x.remaining!=null?'<div><small>'+E(T('Margen que te queda hoy','Room left today','Margem que resta hoje'))+'</small><b>'+E(money(x.remaining))+'</b><small>'+E(ctx.name)+'</small></div>':'')+'</div>';
 if(used!=null)html+='<div class="jfin-meter" role="img" aria-label="'+E(pct(x.usedPct))+'"><i class="'+level+'" style="width:'+used.toFixed(1)+'%"></i></div><p class="jfin-meter-text '+level+'">'+E(x.over?T('Te pasás: si todas pierden, rompés la regla de hoy por ','Too much: if all of them lose, you break today\'s rule by ','Passou: se todas perderem, você quebra a regra de hoje por ')+money(x.total-x.remaining)+'.':T('Usás el ','You use ','Você usa ')+pct(x.usedPct)+T(' del margen de hoy.',' of today\'s room.',' da margem de hoje.'))+'</p>';
 else html+='<p class="jfin-muted">'+E(T('La cuenta de referencia no tiene límite diario ni máximo cargado.','The reference account has no daily or max loss limit set.','A conta de referência não tem limite diário nem máximo.'))+'</p>';
 for(const c of x.clusters){const dirTxt=c.side==='long'?T('a favor del ','for ','a favor do ')+c.currency:T('en contra del ','against ','contra o ')+c.currency;
  html+='<div class="jfin-exp-cluster">⚠️ '+E(c.count+' '+T('posiciones apuestan ','positions bet ','posições apostam ')+dirTxt+': '+c.symbols.join(', ')+'. '+T('Si el ','If ','Se o ')+c.currency+T(' se mueve en contra, pueden perder juntas (hasta ',' moves against you, they can lose together (up to ',' se mover contra, podem perder juntas (até ')+money(c.risk)+').')+'</div>';}
 out.innerHTML=html;
}
function paint(){
 if(!active)return;if(!rows)rows=load();
 menu.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed','false'));btn.setAttribute('aria-pressed','true');
 const side=v=>'<option value="buy"'+(v==='buy'?' selected':'')+'>'+E(T('Compra','Buy','Compra'))+'</option><option value="sell"'+(v==='sell'?' selected':'')+'>'+E(T('Venta','Sell','Venda'))+'</option>';
 panel.innerHTML='<div class="jfin" id="jfExposure" data-i18n-ignore><div class="ft74-panel-head"><span class="ft74-icon">'+ICON+'</span><div><h3 id="ft74Title">'+E(T('Riesgo total del día','Total risk today','Risco total do dia'))+'</h3><p>'+E(T('Sumá lo que arriesgás en todas tus posiciones abiertas y mirá si entra en lo que la cuenta te deja perder hoy.','Add up the risk of all your open positions and check it fits what the account lets you lose today.','Some o risco de todas as posições abertas e veja se cabe no que a conta permite perder hoje.'))+'</p></div></div>'+
  '<datalist id="jfExpSymbols">'+SYMBOLS.map(s=>'<option value="'+s+'">').join('')+'</datalist><div class="jfin-exp-rows">'+rows.map((r,i)=>
   '<div class="jfin-exp-row" data-row="'+i+'"><label class="ft74-field" for="jfExpSym'+i+'">'+E(T('Activo','Asset','Ativo'))+'<input id="jfExpSym'+i+'" data-f="symbol" list="jfExpSymbols" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" value="'+E(r.symbol)+'" placeholder="EURUSD"></label>'+
   '<label class="ft74-field" for="jfExpSide'+i+'">'+E(T('Dirección','Direction','Direção'))+'<select id="jfExpSide'+i+'" data-f="side">'+side(r.side)+'</select></label>'+
   '<label class="ft74-field" for="jfExpRisk'+i+'">'+E(T('Riesgo hasta el stop (USD)','Risk to stop (USD)','Risco até o stop (USD)'))+'<input id="jfExpRisk'+i+'" data-f="risk" inputmode="decimal" maxlength="12" value="'+E(r.risk)+'" placeholder="150"></label>'+
   '<button type="button" class="jfin-x" data-exp-del="'+i+'" aria-label="'+E(T('Quitar posición','Remove position','Remover posição'))+'">×</button></div>').join('')+'</div>'+
  '<div class="ft74-actions"><button type="button" class="btn" id="jfExpAdd"'+(rows.length>=MAX?' disabled':'')+'>+ '+E(T('Agregar posición','Add position','Adicionar posição'))+'</button><button type="button" class="btn" id="jfExpClear">'+E(T('Vaciar','Clear','Limpar'))+'</button></div>'+
  '<div class="jfin-exp-result" id="jfExposureResult" role="status" aria-live="polite"></div><p class="jfin-muted">'+E(T('Se guarda solo en este dispositivo. El margen sale de la cuenta de referencia elegida arriba.','Saved on this device only. The room comes from the reference account chosen above.','Salvo só neste dispositivo. A margem vem da conta de referência escolhida acima.'))+'</p></div>';
 result();
}
function open(){if(!ready())return;active=true;rows=load();paint();}
btn.addEventListener('click',open);
// Any other calculator takes the panel back.
menu.addEventListener('click',e=>{if(e.target.closest('[data-tool],[data-jfin-tool]:not(#jfExposureTool)')){active=false;btn.setAttribute('aria-pressed','false');}},true);
panel.addEventListener('input',e=>{if(!active)return;const row=e.target.closest('[data-row]'),f=e.target.dataset.f;if(!row||!f)return;rows[+row.dataset.row][f]=e.target.value;store();result();});
panel.addEventListener('change',e=>{if(active&&e.target.dataset.f==='side'){rows[+e.target.closest('[data-row]').dataset.row].side=e.target.value;store();result();}});
panel.addEventListener('click',e=>{if(!active)return;const d=e.target.closest('[data-exp-del]');
 if(d){rows.splice(+d.dataset.expDel,1);if(!rows.length)rows.push({symbol:'',side:'buy',risk:''});store();paint();return;}
 if(e.target.closest('#jfExpAdd')&&rows.length<MAX){rows.push({symbol:'',side:'buy',risk:''});store();paint();$('jfExpSym'+(rows.length-1))?.focus();return;}
 if(e.target.closest('#jfExpClear')){rows=[{symbol:'',side:'buy',risk:''}];store();paint();}});
// tools.js redraws its own form when the user or reference account changes; keep this tool on screen.
new MutationObserver(()=>{if(active&&!$('jfExposure'))paint();}).observe(panel,{childList:true});
const previous=window.render;if(typeof previous==='function')window.render=function(){const out=previous.apply(this,arguments);if(active)result();return out;};
window.addEventListener('jfLanguageChanged',()=>{label();if(active)paint();});
window.JourFundExposure={open};
})();
