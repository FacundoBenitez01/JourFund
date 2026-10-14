/* Objetivos → "Regla de consistencia": how big the best day is compared with total profit, against the firm's
   payout rule (funded accounts whose program has one) or a personal limit saved per account. Also says how much
   today can still make without breaking it, or how much more profit is needed to comply. */
(function(){'use strict';
const $=id=>document.getElementById(id),I=window.JourFundInsights,P=window.FTProtection,C=window.ftProtectionCloud;
const page=$('ftPageObjectives');if(!I||!page||!C)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',E=s=>P?P.escape(s):String(s);
const money=n=>new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
const pct=n=>new Intl.NumberFormat(loc(),{maximumFractionDigits:1}).format(n)+'%';
const dateTxt=d=>d?new Date(d+'T12:00:00').toLocaleDateString(loc(),{day:'numeric',month:'short'}):'';
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
const card=document.createElement('section');card.className='ft-quick-card jfin jfin-cons';card.id='jfConsistency';card.setAttribute('data-i18n-ignore','');
let editing=false;
function place(){const path=$('ft61Path');if(path&&card.previousElementSibling!==path)path.after(card);return !!path;}

function stageTrades(a){return a.status==='Funded'?a.pa?.trades||[]:a.phases?.[Math.max(0,(a.phase||1)-1)]?.trades||[];}
function source(a,today){
 // The firm's payout rule wins: same numbers as the Retiros checklist.
 if(a.status==='Funded'&&a.ruleSnapshot?.reward?.consistencyPct!=null&&window.FTRules){try{const r=FTRules.payout(a,today);if(r){const g=r.dayStats.grouped,best=Object.entries(g).filter(([,v])=>v>0).sort((x,y)=>y[1]-x[1])[0];
  return {kind:'firm',limit:Number(a.ruleSnapshot.reward.consistencyPct),grouped:g,profit:r.profit,bestDay:r.dayStats.bestDay,bestDate:best?.[0]||null,share:r.profit>0?r.consistency:null,from:r.start};}}catch{}}
 const limit=a.preferences?.consistencyPct;if(limit==null)return {kind:'none'};
 const list=stageTrades(a),c=I.consistency(list,limit),g={};for(const t of list)if(t.date)g[t.date]=(g[t.date]||0)+Number(t.pnl||0);
 return {kind:'personal',limit,grouped:g,profit:c.profit,bestDay:c.bestDay,bestDate:c.bestDate,share:c.share};
}
function form(a){const v=a.preferences?.consistencyPct;
 return '<form class="jfin-cons-form" id="jfConsForm"><label for="jfConsPct">'+E(T('Límite personal: ningún día puede ser más de (%) de la ganancia total','Personal limit: no day may be more than (%) of total profit','Limite pessoal: nenhum dia pode passar de (%) do lucro total'))+'</label><div class="jfin-cons-row"><input id="jfConsPct" type="number" inputmode="numeric" min="10" max="90" step="1" value="'+(v??40)+'"><button type="submit" class="btn primary">'+E(T('Guardar','Save','Salvar'))+'</button>'+(v!=null?'<button type="button" class="btn" data-cons="off">'+E(T('Quitar','Remove','Remover'))+'</button>':'')+'<button type="button" class="btn" data-cons="cancel">'+E(T('Cancelar','Cancel','Cancelar'))+'</button></div><p class="jfin-muted">'+E(T('Entre 10 y 90. Muchas firmas usan 30–50%. Se aplica solo a esta cuenta.','Between 10 and 90. Many firms use 30–50%. Applies to this account only.','Entre 10 e 90. Muitas empresas usam 30–50%. Vale só para esta conta.'))+'</p><p class="jfin-status" id="jfConsStatus" role="status"></p></form>';}

function render(){
 if(!ready()||!page.classList.contains('active')||!place())return;
 let a;try{a=acc();}catch{a=null;}if(!a||a.accountType==='personal'){card.hidden=true;return;}card.hidden=false;
 let today;try{today=FTLedger.day(a);}catch{today=new Date().toISOString().slice(0,10);}
 const s=source(a,today),head='<div class="jfin-head"><div><h3>'+E(T('Regla de consistencia','Consistency rule','Regra de consistência'))+'</h3><p>'+E(T('Que ningún día pese demasiado sobre tu ganancia total.','So no single day weighs too much on your total profit.','Para que nenhum dia pese demais no lucro total.'))+'</p></div>'+(s.kind!=='firm'&&!editing?'<button type="button" class="btn" data-cons="edit">'+E(s.kind==='personal'?T('Cambiar límite','Change limit','Alterar limite'):T('Poner un límite','Set a limit','Definir limite'))+'</button>':'')+'</div>';
 if(editing&&s.kind!=='firm'){card.innerHTML=head+form(a);return;}
 if(s.kind==='none'){card.innerHTML=head+'<p class="jfin-empty">'+E(T('Esta etapa de tu cuenta no tiene regla de consistencia de la firma. Si querés, poné un límite personal para no depender de un solo día bueno.','This stage has no firm consistency rule. You can set a personal limit so you do not depend on one big day.','Esta etapa não tem regra de consistência da empresa. Você pode definir um limite pessoal para não depender de um único dia bom.'))+'</p>';return;}
 const tag=s.kind==='firm'?T('Regla de la firma para retirar','Firm payout rule','Regra da empresa para saque')+' · '+(a.firm||''):T('Límite personal','Personal limit','Limite pessoal');
 let body='<p class="jfin-cons-tag">'+E(tag)+' · '+E(T('máx. ','max ','máx. ')+pct(s.limit))+(s.kind==='firm'&&s.from?' · '+E(T('desde ','since ','desde ')+dateTxt(s.from)):'')+'</p>';
 if(!(s.profit>0)||!(s.bestDay>0)){body+='<p class="jfin-empty">'+E(T('Todavía no hay ganancia neta en este período. Se mide cuando el total sea positivo.','No net profit in this period yet. It is measured once the total is positive.','Ainda não há lucro líquido neste período. É medido quando o total for positivo.'))+'</p>';card.innerHTML=head+body;return;}
 const share=s.share,ok=share<=s.limit+1e-8,needed=Math.max(0,s.bestDay/(s.limit/100)-s.profit),room=I.consistencyToday(s.grouped,s.limit,today);
 body+='<div class="jfin-cons-stats"><div><small>'+E(T('Mejor día','Best day','Melhor dia'))+'</small><b class="pos">'+E(money(s.bestDay))+'</b><small>'+E(dateTxt(s.bestDate))+'</small></div><div><small>'+E(T('Ganancia total','Total profit','Lucro total'))+'</small><b>'+E(money(s.profit))+'</b></div><div><small>'+E(T('Peso del mejor día','Best day share','Peso do melhor dia'))+'</small><b class="'+(ok?'pos':'neg')+'">'+E(pct(share))+'</b></div></div>'+
  '<div class="jfin-cons-meter" role="img" aria-label="'+E(pct(share)+' / '+pct(s.limit))+'"><i class="'+(ok?'pos':'neg')+'" style="width:'+Math.min(100,share).toFixed(1)+'%"></i><span style="left:'+Math.min(100,s.limit)+'%" title="'+E(pct(s.limit))+'"></span></div>';
 body+=ok?'<p class="jfin-cons-msg pos">✓ '+E(T('Cumplís la regla.','You meet the rule.','Você cumpre a regra.'))+(room!=null?' '+E(T('Hoy podés ganar hasta ','Today you can make up to ','Hoje você pode ganhar até ')+money(room)+T(' más sin que este día la rompa.',' more without this day breaking it.',' a mais sem que este dia a quebre.')):'')+'</p>'
  :'<p class="jfin-cons-msg neg">'+E(T('Tu mejor día pesa demasiado. Necesitás ganar ','Your best day weighs too much. You need ','Seu melhor dia pesa demais. Você precisa ganhar ')+money(needed)+T(' más en otros días (sin superar ',' more on other days (without beating ',' a mais em outros dias (sem passar de ')+money(s.bestDay)+T(' en uno solo) para cumplir.',' in one day) to comply.',' em um só dia) para cumprir.'))+'</p>';
 card.innerHTML=head+body;
}
function save(value){
 const st=$('jfConsStatus');try{const state=C.snapshot(),list=P.clone(state.accounts),a=list.find(x=>x.id===activeId);if(!a)throw Error('');
  const prefs={...(a.preferences||{})};if(value==null)delete prefs.consistencyPct;else prefs.consistencyPct=value;a.preferences=prefs;C.commit(list,state);editing=false;
  window.ft67Toast?.(T('Límite guardado','Limit saved','Limite salvo'),'','saved');render();}
 catch(e){if(st){st.className='jfin-status err';st.textContent=T('No se pudo guardar. Intentá de nuevo.','Could not save. Try again.','Não foi possível salvar. Tente de novo.');}}
}
card.addEventListener('click',e=>{const b=e.target.closest('[data-cons]');if(!b)return;const k=b.dataset.cons;
 if(k==='edit'){editing=true;render();$('jfConsPct')?.focus();}else if(k==='cancel'){editing=false;render();}else if(k==='off')save(null);});
card.addEventListener('submit',e=>{e.preventDefault();const v=Math.round(Number($('jfConsPct').value));if(!I.validConsistencyPct(v)||!Number.isFinite(v)){const st=$('jfConsStatus');st.className='jfin-status err';st.textContent=T('Elegí un número entre 10 y 90.','Choose a number between 10 and 90.','Escolha um número entre 10 e 90.');return;}save(v);});
const previous=window.render;if(typeof previous==='function')window.render=function(){const out=previous.apply(this,arguments);if(!editing)render();return out;};
window.addEventListener('jfLanguageChanged',render);
new MutationObserver(()=>{if(page.classList.contains('active'))render();}).observe(page,{attributes:true,attributeFilter:['class']});
window.JourFundConsistency={render};
render();
})();
