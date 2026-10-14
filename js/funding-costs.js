/* Retiros → "Balance del fondeo": what you paid prop firms (challenges, resets, activations) against what you were
   paid out, across every account including lost ones. Costs are saved per account in a.costs[]. */
(function(){'use strict';
const $=id=>document.getElementById(id),I=window.JourFundInsights,P=window.FTProtection,C=window.ftProtectionCloud;
const page=$('ftPageWithdrawals');if(!I||!page||!C||!P)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',E=s=>P.escape(s);
const money=n=>new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n),signed=n=>(n>0?'+':'')+money(n);
const pct=n=>new Intl.NumberFormat(loc(),{maximumFractionDigits:0}).format(n)+'%';
const dateTxt=d=>d?new Date(d+'T12:00:00').toLocaleDateString(loc(),{day:'numeric',month:'short',year:'numeric'}):'';
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
const TYPE={challenge:['Challenge / evaluación','Challenge / evaluation','Desafio / avaliação'],reset:['Reinicio','Reset','Reinício'],activation:['Activación de fondeada','Funded activation','Ativação da conta financiada'],other:['Otro','Other','Outro']};
const typeName=k=>TYPE[k]?T(...TYPE[k]):k,accName=a=>(a.nickname||a.program||a.firm||'')+'';
const card=document.createElement('section');card.className='ft-quick-card jfin jfin-costs';card.id='jfCosts';card.setAttribute('data-i18n-ignore','');
let adding=false,armed=null;
function place(){const anchor=page.querySelector('.ft70-individual .ft61-payout-workspace');if(!anchor)return false;if(card.previousElementSibling!==anchor)anchor.after(card);return true;}
const list=()=>{try{return C.snapshot().accounts||[];}catch{return [];}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

function form(accts){let current='';try{current=activeId;}catch{}
 return '<form id="jfCostForm" class="jfin-cost-form"><div class="jfin-cost-fields">'+
  '<label for="jfCostAccount">'+E(T('Cuenta','Account','Conta'))+'<select id="jfCostAccount">'+accts.map(a=>'<option value="'+E(a.id)+'"'+(a.id===current?' selected':'')+'>'+E(accName(a)+' · '+(a.firm||'')+(a.status==='Failed'?' · '+T('perdida','lost','perdida'):''))+'</option>').join('')+'</select></label>'+
  '<label for="jfCostType">'+E(T('Tipo','Type','Tipo'))+'<select id="jfCostType">'+I.COST_TYPES.map(k=>'<option value="'+k+'">'+E(typeName(k))+'</option>').join('')+'</select></label>'+
  '<label for="jfCostDate">'+E(T('Fecha','Date','Data'))+'<input id="jfCostDate" type="date" value="'+today()+'" max="'+today()+'"></label>'+
  '<label for="jfCostAmount">'+E(T('Monto (USD)','Amount (USD)','Valor (USD)'))+'<input id="jfCostAmount" inputmode="decimal" maxlength="12" placeholder="99"></label>'+
  '<label for="jfCostNote" class="jfin-cost-note">'+E(T('Nota (opcional)','Note (optional)','Nota (opcional)'))+'<input id="jfCostNote" maxlength="300" placeholder="'+E(T('Ej.: cupón 20%','E.g. 20% coupon','Ex.: cupom 20%'))+'"></label>'+
  '</div><p class="jfin-status" id="jfCostStatus" role="status"></p><div class="jfin-actions"><button type="button" class="btn" data-cost="cancel">'+E(T('Cancelar','Cancel','Cancelar'))+'</button><button type="submit" class="btn primary">'+E(T('Guardar costo','Save cost','Salvar custo'))+'</button></div></form>';}

function render(){
 if(!ready()||!page.classList.contains('active')||!place())return;
 const accts=list();if(!accts.length){card.hidden=true;return;}card.hidden=false;
 const r=I.costs(accts.filter(a=>a.accountType!=='personal'),a=>a.pa?.withdrawals||[]),has=r.spent>0||r.received>0;
 let html='<div class="jfin-head"><div><h3>'+E(T('Balance del fondeo','Funding balance','Balanço do financiamento'))+'</h3><p>'+E(T('Lo que pagaste a las firmas contra lo que cobraste. Todas tus cuentas, también las perdidas.','What you paid the firms against what you were paid. All your accounts, lost ones included.','O que você pagou às empresas contra o que recebeu. Todas as contas, inclusive as perdidas.'))+'</p></div>'+(adding?'':'<button type="button" class="btn" data-cost="add">+ '+E(T('Agregar costo','Add cost','Adicionar custo'))+'</button>')+'</div>';
 if(adding)html+=form(accts);
 html+='<div class="jfin-tiles jfin-cost-tiles"><div class="jfin-tile"><small>'+E(T('Pagado a firmas','Paid to firms','Pago às empresas'))+'</small><b class="'+(r.spent?'neg':'')+'">'+E(r.spent?'-'+money(r.spent):money(0))+'</b></div><div class="jfin-tile"><small>'+E(T('Cobrado en retiros','Received in payouts','Recebido em saques'))+'</small><b class="'+(r.received?'pos':'')+'">'+E(money(r.received))+'</b></div><div class="jfin-tile"><small>'+E(T('Ganancia real','Real profit','Lucro real'))+'</small><b class="'+(r.net>0?'pos':r.net<0?'neg':'')+'">'+E(signed(r.net))+'</b></div><div class="jfin-tile"><small>'+E(T('Retorno','Return','Retorno'))+'</small><b class="'+(r.roi>0?'pos':r.roi<0?'neg':'')+'">'+E(r.roi==null?'—':(r.roi>0?'+':'')+pct(r.roi))+'</b></div></div>';
 if(!r.spent)html+='<p class="jfin-empty">'+E(T('Cargá lo que pagaste por cada challenge, reinicio o activación para ver tu ganancia real.','Add what you paid for each challenge, reset or activation to see your real profit.','Informe o que pagou por cada desafio, reinício ou ativação para ver seu lucro real.'))+'</p>';
 if(has&&r.firms.length)html+='<h3 class="jfin-sub">'+E(T('Por firma','By firm','Por empresa'))+'</h3><div class="jfin-table-wrap"><table class="jfin-table"><thead><tr><th>'+E(T('Firma','Firm','Empresa'))+'</th><th>'+E(T('Cuentas','Accounts','Contas'))+'</th><th>'+E(T('Pagado','Paid','Pago'))+'</th><th>'+E(T('Cobrado','Received','Recebido'))+'</th><th>'+E(T('Neto','Net','Líquido'))+'</th></tr></thead><tbody>'+
  r.firms.map(f=>{const net=Math.round((f.received-f.spent)*100)/100;return '<tr><td>'+E(f.firm)+'</td><td><span title="'+E(T('aprobadas / perdidas','passed / lost','aprovadas / perdidas'))+'">'+f.accounts+' <small class="jfin-muted">('+f.passed+'✓ '+f.failed+'✗)</small></span></td><td class="'+(f.spent?'neg':'')+'">'+E(f.spent?'-'+money(f.spent):'—')+'</td><td class="'+(f.received?'pos':'')+'">'+E(f.received?money(f.received):'—')+'</td><td class="'+(net>0?'pos':net<0?'neg':'')+'">'+E(signed(net))+'</td></tr>';}).join('')+'</tbody></table></div>';
 const moves=r.moves.slice(0,12);
 if(moves.length)html+='<h3 class="jfin-sub">'+E(T('Movimientos','Activity','Movimentos'))+'</h3><ul class="jfin-moves">'+moves.map(m=>'<li><span class="jfin-move-main"><b>'+E(m.kind==='payout'?T('Retiro cobrado','Payout received','Saque recebido'):typeName(m.type))+'</b><small>'+E(accName(m.account)+' · '+(m.account.firm||'')+' · '+dateTxt(m.date)+(m.note?' · '+m.note:''))+'</small></span><span class="jfin-move-amt '+(m.amount<0?'neg':'pos')+'">'+E(signed(m.amount))+'</span>'+(m.kind==='cost'?'<button type="button" class="jfin-x jfin-move-del'+(armed===m.id?' armed':'')+'" data-cost-del="'+E(m.id)+'" data-cost-acc="'+E(m.account.id)+'" aria-label="'+E(armed===m.id?T('Confirmar borrar','Confirm delete','Confirmar exclusão'):T('Borrar costo','Delete cost','Excluir custo'))+'">'+(armed===m.id?'✓':'×')+'</button>':'<span class="jfin-move-pad"></span>')+'</li>').join('')+'</ul>'+(r.moves.length>12?'<p class="jfin-muted">'+E(T('Mostrando los últimos 12. Todo está en Exportar a Excel.','Showing the latest 12. Everything is in Export to Excel.','Mostrando os 12 últimos. Tudo está em Exportar para Excel.'))+'</p>':'');
 card.innerHTML=html;
}
function mutate(fn){const state=C.snapshot(),accts=P.clone(state.accounts);fn(accts);C.commit(accts,state);}
card.addEventListener('click',e=>{const b=e.target.closest('[data-cost],[data-cost-del]');if(!b)return;
 if(b.dataset.cost==='add'){adding=true;armed=null;render();$('jfCostAmount')?.focus();return;}
 if(b.dataset.cost==='cancel'){adding=false;render();return;}
 const id=b.dataset.costDel;if(id){if(armed!==id){armed=id;render();return;}
  try{mutate(accts=>{const a=accts.find(x=>x.id===b.dataset.costAcc);if(a){a.costs=(a.costs||[]).filter(c=>c.id!==id);if(!a.costs.length)delete a.costs;}});armed=null;window.ft67Toast?.(T('Costo borrado','Cost deleted','Custo excluído'),'','saved');}catch{}render();}});
card.addEventListener('submit',e=>{e.preventDefault();const st=$('jfCostStatus'),fail=m=>{st.className='jfin-status err';st.textContent=m;};
 const amount=Number(String($('jfCostAmount').value).trim().replace(/\s/g,'').replace(',','.')),date=$('jfCostDate').value,note=$('jfCostNote').value.trim();
 if(!(amount>0)||amount>1e7)return fail(T('Ingresá un monto mayor a 0.','Enter an amount above 0.','Informe um valor maior que 0.'));
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return fail(T('Elegí una fecha.','Choose a date.','Escolha uma data.'));
 const cost={id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),type:$('jfCostType').value,date,amount:Math.round(amount*100)/100};if(note)cost.note=note;
 if(!I.validCost(cost))return fail(T('Revisá los datos.','Check the details.','Revise os dados.'));
 try{mutate(accts=>{const a=accts.find(x=>x.id===$('jfCostAccount').value);if(!a)throw Error('');a.costs=[...(a.costs||[]),cost];});adding=false;window.ft67Toast?.(T('Costo guardado','Cost saved','Custo salvo'),'','saved');render();}
 catch{fail(T('No se pudo guardar. Intentá de nuevo.','Could not save. Try again.','Não foi possível salvar. Tente de novo.'));}});
const previous=window.render;if(typeof previous==='function')window.render=function(){const out=previous.apply(this,arguments);if(!adding)render();else place();return out;};
window.addEventListener('jfLanguageChanged',()=>{if(!adding)render();});
new MutationObserver(()=>{if(page.classList.contains('active'))render();}).observe(page,{attributes:true,attributeFilter:['class']});
window.JourFundCosts={render};
render();
})();
