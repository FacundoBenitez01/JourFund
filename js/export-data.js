/* Mi cuenta → Datos y respaldos → "Exportar a Excel o CSV": trades (with reviews, time and checklist),
   withdrawals, funding costs and accounts. Built locally from the signed-in user's workspace; nothing is uploaded. */
(function(){'use strict';
const $=id=>document.getElementById(id),X=window.JourFundXlsx,C=window.ftProtectionCloud,P=window.FTProtection;
const host=document.querySelector('#ftPageMyAccount .ft94-backup-actions');if(!X||!C||!host)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es,E=s=>P?P.escape(s):String(s);
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
const btn=document.createElement('button');btn.type='button';btn.className='btn';btn.id='jfExportOpen';host.append(btn);
const dialog=document.createElement('dialog');dialog.id='jfExportDialog';dialog.className='jfin jfin-dialog';dialog.setAttribute('aria-labelledby','jfExportTitle');dialog.setAttribute('data-i18n-ignore','');document.body.append(dialog);
let pick={trades:true,withdrawals:true,reviews:true,costs:true},account='all',format='xlsx';
const label=()=>{btn.textContent=T('Exportar a Excel o CSV','Export to Excel or CSV','Exportar para Excel ou CSV');};label();window.addEventListener('jfLanguageChanged',label);

const stageName=(a,slot)=>slot==='pa'?T('Fondeada','Funded','Financiada'):T('Fase','Phase','Fase')+' '+(Number(slot)+1);
const accName=a=>(a.nickname||a.program||a.firm||a.id)+'';
const followed=v=>v===true||v==='yes'?T('Sí','Yes','Sim'):v===false||v==='no'?T('No','No','Não'):v==='partial'?T('Parcial','Partly','Parcial'):'';
const COST={challenge:['Challenge','Challenge','Desafio'],reset:['Reinicio','Reset','Reinício'],activation:['Activación','Activation','Ativação'],other:['Otro','Other','Outro']};

function sheets(list){
 const out=[];
 if(pick.trades){
  const head=[T('Cuenta','Account','Conta'),T('Firma','Firm','Empresa'),T('Etapa','Stage','Etapa'),T('Fecha','Date','Data'),T('Hora','Time','Hora'),T('Activo','Asset','Ativo'),T('Resultado','Result','Resultado'),'P&L',T('Riesgo (%)','Risk (%)','Risco (%)'),'R:R',T('Lotaje','Lots','Lotes'),T('Estado','State','Estado'),T('Nota','Note','Nota'),T('Checklist','Checklist','Checklist')];
  if(pick.reviews)head.push(T('Estrategia','Strategy','Estratégia'),T('Siguió el plan','Followed the plan','Seguiu o plano'),T('Errores','Mistakes','Erros'),T('Revisión','Review','Revisão'));
  const rows=[head];
  for(const a of list){const slots=[...(a.phases||[]).map((p,i)=>[String(i),p.trades||[]]),['pa',a.pa?.trades||[]]];
   for(const [slot,ts] of slots)for(const t of [...ts].sort((x,y)=>String(x.date).localeCompare(String(y.date))||String(x.time||'').localeCompare(String(y.time||'')))){
    const r=[accName(a),a.firm||'',stageName(a,slot),t.date||'',t.time||'',t.asset||'',t.result||'',Number(t.pnl)||0,Number.isFinite(Number(t.risk))?Number(t.risk):'',t.rr||'',t.lots??'',t.state||'',t.note||'',t.checklist?t.checklist.done.length+'/'+t.checklist.total:''];
    if(pick.reviews){const v=t.review||{};r.push(v.strategy||'',followed(v.followed),(v.errors||[]).join(', '),v.note||'');}
    rows.push(r);}}
  out.push({name:T('Operaciones','Trades','Operações'),rows});
 }
 if(pick.withdrawals){const rows=[[T('Cuenta','Account','Conta'),T('Firma','Firm','Empresa'),T('Fecha','Date','Data'),T('Monto recibido','Amount received','Valor recebido'),T('Descontado de la cuenta','Deducted from the account','Descontado da conta'),T('Nota','Note','Nota')]];
  for(const a of list)for(const w of a.pa?.withdrawals||[])rows.push([accName(a),a.firm||'',w.date||'',Number(w.amount)||0,w.accountDebit==null||w.accountDebit===''?'':Number(w.accountDebit),w.note||'']);
  out.push({name:T('Retiros','Withdrawals','Saques'),rows});}
 if(pick.costs){const rows=[[T('Cuenta','Account','Conta'),T('Firma','Firm','Empresa'),T('Tipo','Type','Tipo'),T('Fecha','Date','Data'),T('Monto','Amount','Valor'),T('Nota','Note','Nota')]];
  for(const a of list)for(const c of a.costs||[])rows.push([accName(a),a.firm||'',COST[c.type]?T(...COST[c.type]):c.type,c.date||'',Number(c.amount)||0,c.note||'']);
  out.push({name:T('Costos','Costs','Custos'),rows});}
 const acc=[[T('Cuenta','Account','Conta'),T('Firma','Firm','Empresa'),T('Programa','Program','Programa'),T('Capital','Capital','Capital'),T('Estado','Status','Status'),T('Fase','Phase','Fase')]];
 for(const a of list)acc.push([accName(a),a.firm||'',a.program||'',Number(a.capital)||0,a.status||'',a.status==='Funded'?'':Number(a.phase)||'']);
 out.push({name:T('Cuentas','Accounts','Contas'),rows:acc});
 return out;
}
function paint(){
 if(!ready())return;let list=[];try{list=C.snapshot().accounts;}catch{}
 const chip=(k,l)=>'<button type="button" class="jfin-chip'+(pick[k]?' on':'')+'" data-jfx-pick="'+k+'" aria-pressed="'+!!pick[k]+'">'+E(l)+'</button>';
 const accChip=(id,l)=>'<button type="button" class="jfin-chip'+(account===id?' on':'')+'" data-jfx-account="'+E(id)+'" aria-pressed="'+(account===id)+'">'+E(l)+'</button>';
 const fmtChip=(id,l)=>'<button type="button" class="jfin-chip'+(format===id?' on':'')+'" data-jfx-format="'+id+'" aria-pressed="'+(format===id)+'">'+E(l)+'</button>';
 dialog.innerHTML='<form method="dialog" id="jfExportForm"><header class="jfin-dialog-head"><h3 id="jfExportTitle">'+E(T('Exportar datos','Export data','Exportar dados'))+'</h3><button type="button" class="jfin-x" data-jfx-close aria-label="'+E(T('Cerrar','Close','Fechar'))+'">×</button></header><p class="jfin-muted">'+E(T('Tus datos son tuyos. El archivo se arma en tu dispositivo.','Your data is yours. The file is built on your device.','Seus dados são seus. O arquivo é gerado no seu dispositivo.'))+'</p>'+
  '<p class="jfin-label">'+E(T('Qué exportar','What to export','O que exportar'))+'</p><div class="jfin-chips">'+chip('trades',T('Operaciones','Trades','Operações'))+chip('reviews',T('Revisiones y etiquetas','Reviews and tags','Revisões e etiquetas'))+(format==='xlsx'?chip('withdrawals',T('Retiros','Withdrawals','Saques'))+chip('costs',T('Costos','Costs','Custos')):'')+'</div>'+
  '<p class="jfin-label">'+E(T('Cuentas','Accounts','Contas'))+'</p><div class="jfin-chips">'+accChip('all',T('Todas','All','Todas'))+list.map(a=>accChip(a.id,accName(a)+' · '+(a.firm||''))).join('')+'</div>'+
  '<p class="jfin-label">'+E(T('Formato','Format','Formato'))+'</p><div class="jfin-chips">'+fmtChip('xlsx','Excel (.xlsx)')+fmtChip('csv','CSV')+'</div>'+
  (format==='csv'?'<p class="jfin-muted">'+E(T('CSV incluye solo las operaciones. Para retiros y costos elegí Excel.','CSV includes trades only. Choose Excel for withdrawals and costs.','CSV inclui só as operações. Para saques e custos escolha Excel.'))+'</p>':'')+
  '<p class="jfin-status" id="jfExportStatus" role="status"></p><div class="jfin-actions"><button type="button" class="btn" data-jfx-close>'+E(T('Cancelar','Cancel','Cancelar'))+'</button><button type="submit" class="btn primary" id="jfExportGo">'+E(T('Descargar','Download','Baixar'))+'</button></div></form>';
}
function download(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
btn.addEventListener('click',()=>{if(!ready())return;paint();dialog.showModal();});
dialog.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.hasAttribute('data-jfx-close')){dialog.close();return;}
 if(t.dataset.jfxPick){pick[t.dataset.jfxPick]=!pick[t.dataset.jfxPick];paint();}
 else if(t.dataset.jfxAccount){account=t.dataset.jfxAccount;paint();}
 else if(t.dataset.jfxFormat){format=t.dataset.jfxFormat;paint();}});
dialog.addEventListener('submit',e=>{e.preventDefault();const status=$('jfExportStatus');
 try{const all=C.snapshot().accounts,list=account==='all'?all:all.filter(a=>a.id===account);if(!list.length)throw Error(T('Elegí al menos una cuenta.','Choose at least one account.','Escolha pelo menos uma conta.'));
  const day=new Date().toISOString().slice(0,10);
  if(format==='csv'){if(!pick.trades)throw Error(T('Para CSV elegí Operaciones.','For CSV choose Trades.','Para CSV escolha Operações.'));const s=sheets(list)[0],l=window.jfLocale?.()||'es-PY',dec=(1.5).toLocaleString(l).includes(',')?',':'.';
   download('jourfund-'+T('operaciones','trades','operacoes')+'-'+day+'.csv',new Blob([X.csv(s.rows,{separator:dec===','?';':',',decimal:dec})],{type:'text/csv;charset=utf-8'}));}
  else{const bytes=X.xlsx(sheets(list));download('jourfund-'+day+'.xlsx',new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));}
  status.className='jfin-status ok';status.textContent=T('Listo, se descargó el archivo.','Done, the file was downloaded.','Pronto, o arquivo foi baixado.');
 }catch(err){status.className='jfin-status err';status.textContent=err.message;}});
window.addEventListener('jfLanguageChanged',()=>{if(dialog.open)paint();});
})();
