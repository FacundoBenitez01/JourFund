/* "Comisión y swap" on the individual trade form. MT5 shows a position's Profit without commission and swap,
   which are charged separately; the balance includes them. Typing both lets the journal store the net result
   (t.pnl = profit + fees) and keep the fees apart (t.fees), so the balance matches the platform. */
(function(){'use strict';
const $=id=>document.getElementById(id),F=window.FT73,pnl=$('pnlInput');if(!F||!pnl||$('jfTradeFees'))return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',money=n=>new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const field=document.createElement('div');field.className='field full jf-fees';field.setAttribute('data-i18n-ignore','');
field.innerHTML='<label for="jfTradeFees"></label><input id="jfTradeFees" inputmode="decimal" autocomplete="off" maxlength="14" placeholder="-2.10"><p class="jf-fees-hint" id="jfFeesHint"></p>';
const input=field.querySelector('input'),hint=field.querySelector('#jfFeesHint');
const parse=v=>{const s=String(v||'').trim().replace(/\s/g,'').replace('−','-').replace(',','.');if(s===''||s==='-')return 0;const n=Number(s);return Number.isFinite(n)?n:NaN;};
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
// The main field shows the amount; Win/Loss/BE gives the sign (normalised by the form on save).
function gross(){const v=Number(String(pnl.value).replace(',','.'));if(!Number.isFinite(v))return null;const r=$('result')?.value;return r==='Loss'?-Math.abs(v):r==='Win'?Math.abs(v):v;}
function label(){field.querySelector('label').textContent=T('Comisión y swap (opcional)','Commission and swap (optional)','Comissão e swap (opcional)');paintHint();}
function paintHint(){const f=parse(input.value),g=gross();input.setAttribute('aria-invalid',String(Number.isNaN(f)));
 if(Number.isNaN(f)){hint.className='jf-fees-hint err';hint.textContent=T('Escribí un número, por ejemplo -2.10.','Enter a number, e.g. -2.10.','Digite um número, ex.: -2,10.');return;}
 if(!f){hint.className='jf-fees-hint';hint.textContent=T('Copialo de MT5 con su signo (la comisión suele ser negativa).','Copy it from MT5 with its sign (commission is usually negative).','Copie do MT5 com o sinal (a comissão costuma ser negativa).');return;}
 hint.className='jf-fees-hint on';hint.textContent=g==null?T('Se suma al resultado.','Added to the result.','Somado ao resultado.'):T('Resultado neto: ','Net result: ','Resultado líquido: ')+money(round(g+f));}
input.addEventListener('input',paintHint);$('result')?.addEventListener('change',paintHint);pnl.addEventListener('input',paintHint);document.addEventListener('click',e=>{if(e.target.closest('#modal [data-result]'))setTimeout(paintHint);});
const place=()=>{const host=pnl.closest('.field');if(host&&host.nextElementSibling!==field)host.after(field);};
const read=F.readIndividual;F.readIndividual=function(){const out=read.apply(this,arguments),f=parse(input.value);
 if(Number.isNaN(f))throw Error(T('Revisá la comisión y swap.','Check commission and swap.','Revise comissão e swap.'));
 if(f){const g=Number(pnl.value);if(Number.isFinite(g)){out.fees=round(f);out.pnl=round(g+f);}}else out.fees=undefined;return out;};
const load=F.load;F.load=function(record={}){const out=load.apply(this,arguments);place();
 // Editing: show the platform profit in the main field again and the fees here.
 if(record&&typeof record.fees==='number'&&Number.isFinite(record.fees)&&Number.isFinite(Number(record.pnl))){const g=round(Number(record.pnl)-record.fees);pnl.value=String(record.result==='Win'||record.result==='Loss'?Math.abs(g):g);input.value=String(record.fees);}else input.value='';paintHint();setTimeout(paintHint,50);return out;};
const open=window.openModal;if(typeof open==='function')window.openModal=function(){const out=open.apply(this,arguments);input.value='';place();paintHint();setTimeout(paintHint,50);return out;};
window.addEventListener('jfLanguageChanged',label);
place();label();
})();
