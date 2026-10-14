/* Operaciones → Estadísticas: where you win and lose (weekday, session, asset), quality metrics and stage filter.
   Reads the active account only; never writes. Follows the period selected in the statistics panel. */
(function(){'use strict';
const $=id=>document.getElementById(id),I=window.JourFundInsights,P=window.FTProtection;
const chart=$('jf105Chart'),page=$('ftPageOps');if(!I||!chart||!page)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',E=s=>P?P.escape(s):String(s);
const money=n=>new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n),signed=n=>(n>0?'+':'')+money(n);
const dec=(n,d=2)=>new Intl.NumberFormat(loc(),{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
let scope='stage';try{scope=localStorage.getItem('jf_insights_scope')||'stage';}catch{}

const root=document.createElement('div');root.className='jfin jfin-block';root.id='jfInsights';root.setAttribute('data-i18n-ignore','');
(chart.closest('.jf105-chart')||chart).after(root);

const DAY={mon:['Lunes','Monday','Segunda'],tue:['Martes','Tuesday','Terça'],wed:['Miércoles','Wednesday','Quarta'],thu:['Jueves','Thursday','Quinta'],fri:['Viernes','Friday','Sexta'],sat:['Sábado','Saturday','Sábado'],sun:['Domingo','Sunday','Domingo']};
const SES={asia:['Asia','Asia','Ásia'],london:['Londres','London','Londres'],newyork:['Nueva York','New York','Nova York']};
const name=(map,k)=>map[k]?T(...map[k]):k;

function stageTrades(a,which){
 const phases=(a.phases||[]).map((p,i)=>({key:'p'+i,label:T('Fase','Phase','Fase')+' '+(i+1),trades:p.trades||[]})).filter((p,i)=>i<Math.max(1,a.ruleSnapshot?.count??a.phases.length)||p.trades.length);
 const funded={key:'pa',label:T('Fondeada','Funded','Financiada'),trades:a.pa?.trades||[]};
 if(which==='stage')return a.status==='Funded'?funded.trades:(a.phases?.[Math.max(0,(a.phase||1)-1)]?.trades||[]);
 if(which==='challenge')return phases.flatMap(p=>p.trades);
 if(which==='funded')return funded.trades;
 return [...phases.flatMap(p=>p.trades),...funded.trades];
}
function stages(a){return [...(a.phases||[]).map((p,i)=>({label:T('Fase','Phase','Fase')+' '+(i+1),trades:p.trades||[]})),{label:T('Fondeada','Funded','Financiada'),trades:a.pa?.trades||[]}].filter(s=>s.trades.length);}

function bars(rows,labelOf){
 const max=Math.max(1,...rows.map(r=>Math.abs(r.pnl)));
 return rows.map(r=>{const w=Math.abs(r.pnl)/max*50;return '<div class="jfin-bar"><span class="jfin-bar-name">'+E(labelOf(r.key))+'<small>'+r.count+' '+(r.count===1?'op':'ops')+'</small></span><span class="jfin-track"><i class="'+(r.pnl<0?'neg':'pos')+'" style="'+(r.pnl<0?'right:50%':'left:50%')+';width:'+w.toFixed(1)+'%"></i></span><span class="jfin-bar-val '+(r.pnl<0?'neg':r.pnl>0?'pos':'')+'">'+(r.count?signed(r.pnl):'—')+'</span></div>';}).join('');
}
function tile(label,value,cls,hint){return '<div class="jfin-tile"'+(hint?' title="'+E(hint)+'"':'')+'><small>'+E(label)+'</small><b class="'+(cls||'')+'">'+value+'</b></div>';}

function render(){
 if(!ready()||!page.classList.contains('active'))return;
 let a;try{a=acc();}catch{return;}if(!a)return;
 const month=$('jf105Month')?.value||'all',inMonth=t=>month==='all'||String(t.date||'').slice(0,7)===month;
 const list=stageTrades(a,scope).filter(inMonth),b=I.breakdown(list),m=I.metrics(list,a.capital),h=I.highlight(b);
 const scopes=[['stage',T('Etapa actual','Current stage','Etapa atual')],['challenge',T('Challenges','Challenges','Desafios')],['funded',T('Fondeada','Funded','Financiada')],['all',T('Todo','All','Tudo')]];
 const hl=h?'<p class="jfin-highlight">💡 '+E(h.kind==='weekday'?T('Los ','On ','Às ')+name(DAY,h.key).toLowerCase()+T(' perdés',' you lose',' você perde'):h.kind==='session'?T('En la sesión de ','In the ','Na sessão de ')+name(SES,h.key)+T(' perdés',' session you lose',' você perde'):T('Con ','With ','Com ')+h.key+T(' perdés',' you lose',' você perde'))+' '+E(money(-h.pnl))+' '+E(T('en','in','em'))+' '+h.count+' '+E(T('operaciones.','trades.','operações.'))+'</p>':'';
 const sessionBody=b.timed?bars(b.session,k=>name(SES,k)):'<p class="jfin-empty">'+E(T('Cargá la hora de entrada al registrar tus operaciones para ver cómo te va en cada sesión.','Add the entry time when logging trades to see how each session goes.','Informe o horário de entrada ao registrar operações para ver cada sessão.'))+'</p>';
 const assetRows=b.asset.slice(0,6);
 const st=stages(a).map(s=>{const x=I.metrics(s.trades.filter(inMonth),a.capital),w=s.trades.filter(inMonth),wins=w.filter(t=>t.pnl>0&&t.result!=='BE').length,losses=w.filter(t=>t.pnl<0).length,pnl=w.reduce((n,t)=>n+Number(t.pnl||0),0);return {label:s.label,count:x.total,wr:wins+losses?wins/(wins+losses)*100:null,pnl};});
 let failed=null;try{const others=(window.accounts||accounts).filter(x=>x.status==='Failed');if(others.length){const all=others.flatMap(x=>stageTrades(x,'all')).filter(inMonth),wins=all.filter(t=>t.pnl>0&&t.result!=='BE').length,losses=all.filter(t=>t.pnl<0).length;failed={label:T('Cuentas perdidas','Failed accounts','Contas perdidas')+' ('+others.length+')',count:all.length,wr:wins+losses?wins/(wins+losses)*100:null,pnl:all.reduce((n,t)=>n+Number(t.pnl||0),0)};}}catch{}
 const stageRows=[...st,...(failed?[failed]:[])];
 const cs=I.checklistStats(list),pctTxt=v=>v==null?'—':dec(v,0)+'%';
 const chk=cs.checked?'<h3 class="jfin-sub">'+E(T('Checklist antes de operar','Pre-trade checklist','Checklist antes de operar'))+'</h3><div class="jfin-tiles jfin-chk-tiles">'+
  tile(T('Cumplimiento','Compliance','Cumprimento'),pctTxt(cs.compliance),cs.compliance>=80?'pos':cs.compliance<50?'neg':'',T('Operaciones con el checklist completo, sobre las que lo tienen.','Trades with the full checklist, out of those that have one.','Operações com o checklist completo, sobre as que têm.'))+
  tile(T('Win rate completo','Win rate, complete','Win rate completo'),pctTxt(cs.winFull),'pos')+tile(T('Win rate incompleto','Win rate, incomplete','Win rate incompleto'),pctTxt(cs.winPartial),cs.winPartial!=null&&cs.winFull!=null&&cs.winPartial<cs.winFull?'neg':'')+
  tile(T('Resultado completo','Result, complete','Resultado completo'),signed(cs.pnlFull),cs.pnlFull>0?'pos':cs.pnlFull<0?'neg':'')+tile(T('Resultado incompleto','Result, incomplete','Resultado incompleto'),signed(cs.pnlPartial),cs.pnlPartial>0?'pos':cs.pnlPartial<0?'neg':'')+
  tile(T('Con checklist','With checklist','Com checklist'),cs.checked+' / '+list.length)+'</div>'+
  (cs.mostMissed?'<p class="jfin-highlight">📋 '+E(T('El punto que más salteás: ','The item you skip most: ','O item que você mais pula: ')+'“'+cs.mostMissed.text+'” ('+cs.mostMissed.count+' '+T('veces','times','vezes')+').')+'</p>':''):'';
 root.innerHTML='<div class="jfin-head"><div><h3>'+E(T('Dónde ganás y dónde perdés','Where you win and lose','Onde você ganha e perde'))+'</h3><p>'+E(T('Según el período elegido arriba.','For the period selected above.','Conforme o período escolhido acima.'))+'</p></div>'+
  '<div class="jfin-scopes" role="group" aria-label="'+E(T('Qué operaciones incluir','Which trades to include','Quais operações incluir'))+'">'+scopes.map(([k,l])=>'<button type="button" class="jfin-chip'+(k===scope?' on':'')+'" data-jfin-scope="'+k+'" aria-pressed="'+(k===scope)+'">'+E(l)+'</button>').join('')+'</div></div>'+
  (list.length?'<div class="jfin-grid"><div class="jfin-col"><h4>'+E(T('Por día de la semana','By weekday','Por dia da semana'))+'</h4>'+bars(b.weekday,k=>name(DAY,k))+'</div><div class="jfin-col"><h4>'+E(T('Por sesión','By session','Por sessão'))+'</h4>'+sessionBody+'</div><div class="jfin-col"><h4>'+E(T('Por activo','By asset','Por ativo'))+'</h4>'+bars(assetRows,k=>k)+'</div></div>'+hl+
  '<h3 class="jfin-sub">'+E(T('Calidad de tus operaciones','Trade quality','Qualidade das operações'))+'</h3><div class="jfin-tiles">'+
   tile(T('Expectativa por operación','Expectancy per trade','Expectativa por operação'),m.expectancy==null?'—':signed(m.expectancy),m.expectancy>0?'pos':m.expectancy<0?'neg':'',T('Lo que ganás o perdés en promedio por cada operación.','What you make or lose per trade on average.','Quanto você ganha ou perde em média por operação.'))+
   tile(T('Ganancia promedio','Average win','Ganho médio'),m.avgWin==null?'—':money(m.avgWin),'pos')+
   tile(T('Pérdida promedio','Average loss','Perda média'),m.avgLoss==null?'—':money(m.avgLoss),'neg')+
   tile(T('Racha ganadora máx.','Longest win streak','Maior sequência de ganhos'),String(m.maxWinStreak))+
   tile(T('R promedio','Average R','R médio'),m.avgR==null?'—':(m.avgR>0?'+':'')+dec(m.avgR)+'R',m.avgR>0?'pos':m.avgR<0?'neg':'',T('Resultado de cada operación medido en veces tu riesgo.','Each trade result measured in multiples of your risk.','Resultado de cada operação em múltiplos do risco.'))+
   tile(T('Mayor caída','Largest drawdown','Maior queda'),m.maxDrawdown<0?money(m.maxDrawdown):money(0),m.maxDrawdown<0?'neg':'',T('La caída más grande desde un máximo, sumando operaciones.','Largest fall from a peak, adding up trades.','Maior queda a partir de um pico, somando operações.'))+'</div>'+chk
  :'<p class="jfin-empty">'+E(T('No hay operaciones para mostrar con este filtro.','No trades to show with this filter.','Nenhuma operação para mostrar com este filtro.'))+'</p>')+
  (stageRows.length?'<h3 class="jfin-sub">'+E(T('Por etapa','By stage','Por etapa'))+'</h3><div class="jfin-table-wrap"><table class="jfin-table"><thead><tr><th>'+E(T('Etapa','Stage','Etapa'))+'</th><th>Ops</th><th>Win rate</th><th>'+E(T('Resultado','Result','Resultado'))+'</th></tr></thead><tbody>'+stageRows.map(r=>'<tr><td>'+E(r.label)+'</td><td>'+r.count+'</td><td>'+(r.wr==null?'—':dec(r.wr,0)+'%')+'</td><td class="'+(r.pnl<0?'neg':r.pnl>0?'pos':'')+'">'+signed(Math.round(r.pnl*100)/100)+'</td></tr>').join('')+'</tbody></table></div>':'');
}
root.addEventListener('click',e=>{const b=e.target.closest('[data-jfin-scope]');if(!b)return;scope=b.dataset.jfinScope;try{localStorage.setItem('jf_insights_scope',scope);}catch{}render();});
$('jf105Month')?.addEventListener('change',()=>setTimeout(render));
const previous=window.render;if(typeof previous==='function')window.render=function(){const out=previous.apply(this,arguments);render();return out;};
window.addEventListener('jfLanguageChanged',render);
new MutationObserver(()=>{if(page.classList.contains('active'))render();}).observe(page,{attributes:true,attributeFilter:['class']});
window.JourFundStatsInsights={render};
render();
})();
