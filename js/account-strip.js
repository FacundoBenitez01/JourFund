/* Cuentas: header card of the active account — firm initials, program, firm · capital · stage, status chip,
   balance / result / trades and a quieter "Reiniciar cuenta". Keeps the original #accountName/#accountStatus
   (other scripts write to them) hidden, and moves the existing reset button so its handler keeps working. */
(function(){'use strict';
const $=id=>document.getElementById(id),strip=$('accountStrip');if(!strip||strip.dataset.jfs)return;strip.dataset.jfs='1';
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',E=s=>window.FTProtection?FTProtection.escape(s):String(s);
const money=(n,d=0)=>new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
const legacy=document.createElement('div');legacy.hidden=true;legacy.className='jfs-legacy';
const view=document.createElement('div');view.className='jfs';view.setAttribute('data-i18n-ignore','');
strip.classList.add('jfs-strip');
function adopt(){for(const id of ['accountName','accountStatus']){const el=$(id);if(el&&el.parentElement!==legacy)legacy.append(el);}if(legacy.parentElement!==strip)strip.prepend(legacy);if(view.parentElement!==strip)strip.append(view);}
const initials=f=>{const s=String(f||'').trim(),caps=s.replace(/[^A-Z]/g,'');if(caps.length>=2)return caps.slice(0,2);const w=s.split(/\s+/).filter(Boolean);return (w.length>1?w[0][0]+w[1][0]:s.slice(0,2)).toUpperCase()||'JF';};
function title(a){const p=String(a.nickname||a.program||a.firm||'').trim();
 // Programs are often named with their size ("Stellar 2-Step $15K"); the capital is already shown on the second line.
 const cut=p.replace(/\s*[$€]?\s?\d[\d.,]*\s?[kK]?\s*$/,'').trim();return cut.length>=3?cut:p;}
function stage(a){if(a.status==='Funded')return T('Fondeada','Funded','Financiada');if(a.status==='Failed')return T('Perdida','Lost','Perdida');if(a.status==='Completed')return T('Finalizada','Completed','Finalizada');
 const n=Number(a.ruleSnapshot?.count??a.targets?.length)||0,ph=Number(a.phase)||1;return T('Fase ','Phase ','Fase ')+ph+(n>1?T(' de ',' of ',' de ')+n:'');}
function status(a){if(a.status==='Failed')return ['neg',T('Perdida','Lost','Perdida')];if(a.status==='Completed')return ['muted',T('Finalizada','Completed','Finalizada')];if(a.status==='Funded')return ['funded',T('Fondeada','Funded','Financiada')];return ['pos',T('Activa','Active','Ativa')];}
function render(){
 let a,ts;try{a=acc();ts=trades();}catch{return;}if(!a)return;adopt();
 const reset=strip.querySelector('[data-reset-account]');
 const pnl=ts.reduce((s,t)=>s+Number(t.pnl||0),0),bal=Number(a.capital)+pnl,[cls,label]=status(a);
 view.innerHTML='<div class="jfs-logo" aria-hidden="true">'+E(initials(a.firm))+'</div>'+
  '<div class="jfs-title"><div class="jfs-row"><h3>'+E(title(a))+'</h3><span class="jfs-status '+cls+'"><i></i>'+E(label)+'</span></div>'+
  '<p><b>'+E(a.firm||'')+'</b><span class="jfs-dot">·</span>'+E(money(Number(a.capital)||0))+'<span class="jfs-dot">·</span>'+E(stage(a))+'</p></div>'+
  '<div class="jfs-foot"><div class="jfs-meta"><span>'+E(T('Balance','Balance','Saldo'))+'<b>'+E(money(bal,Number.isInteger(Math.round(bal*100)/100)?0:2))+'</b></span><span>'+E(T('Resultado','Result','Resultado'))+'<b class="'+(pnl>0?'pos':pnl<0?'neg':'')+'">'+E((pnl>0?'+':'')+money(pnl,Number.isInteger(Math.round(pnl*100)/100)?0:2))+'</b></span><span class="jfs-ops">'+E(T('Operaciones','Trades','Operações'))+'<b>'+ts.length+'</b></span></div><div class="jfs-actions"></div></div>';
 if(reset){reset.classList.add('jfs-reset');reset.setAttribute('data-i18n-ignore','');reset.innerHTML=ICON+'<span>'+E(T('Reiniciar','Reset','Reiniciar'))+'</span><em class="jfs-long">'+E(T(' cuenta',' account',' conta'))+'</em>';reset.setAttribute('aria-label',T('Reiniciar cuenta','Reset account','Reiniciar conta'));view.querySelector('.jfs-actions').append(reset);}
}
const prev=window.render;if(typeof prev==='function')window.render=function(){const out=prev.apply(this,arguments);try{render();}catch{}return out;};
window.addEventListener('jfLanguageChanged',render);
window.JourFundAccountStrip={render};
render();
})();
