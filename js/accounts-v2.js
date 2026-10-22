/* Cuentas → "Mis cuentas" (v2): the account in use on top with its phase progress, filters by status, one block per
   firm, groups, and an add flow that starts by choosing the firm (catalogue firms, other firm, personal capital),
   then program + size with the rules spelled out in money. Account creation still goes through the original form
   (window.ftOpenRuleAccount) so every rule option keeps working; "Opciones avanzadas" opens that form prefilled. */
(function(){'use strict';
const $=id=>document.getElementById(id),R=window.FTRules,L=window.FTLedger,M=window.FTMultiAccounts;
const host=$('ftMyAccounts');if(!host||!R||!L)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',E=s=>window.FTProtection?FTProtection.escape(s):String(s);
const money=(n,d)=>{const v=Number(n)||0,dec=d??(Number.isInteger(Math.round(v*100)/100)?0:2);return new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',minimumFractionDigits:dec,maximumFractionDigits:dec}).format(v);};
const signed=n=>(n>0?'+':'')+money(n);
const short=n=>{n=Number(n)||0;return n>=1000?'$'+(n/1000).toLocaleString('en-US',{maximumFractionDigits:1})+'K':money(n);};
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
const personal=a=>a?.accountType==='personal';
const COLORS={FTMO:'ftmo',FundedNext:'fn',FundingPips:'fp'};
const color=f=>COLORS[f]||'other';
const initials=f=>{const s=String(f||'').trim(),caps=s.replace(/[^A-Z]/g,'');if(caps.length>=2)return caps.slice(0,2);const w=s.split(/\s+/).filter(Boolean);return (w.length>1?w[0][0]+w[1][0]:s.slice(0,2)).toUpperCase()||'?';};
const logo=(f,cls='')=>'<span class="jfa-logo jfa-'+color(f)+' '+cls+'" aria-hidden="true">'+E(initials(f))+'</span>';
const programName=a=>{const p=String(a.nickname||a.program||'').trim(),cut=p.replace(/\s*[$€]?\s?\d[\d.,]*\s?[kK]?\s*$/,'').trim();return cut.length>=3?cut:p||a.firm;};
const firms=()=>[...new Set(R.defs.map(d=>d.firm))];
let filter='all';try{filter=localStorage.getItem('jf_acc_filter')||'all';}catch{}

function kind(a){if(personal(a))return 'personal';if(a.status==='Failed')return 'lost';if(a.status==='Funded')return 'funded';if(a.status==='Completed')return 'done';return 'live';}
function stageText(a){const k=kind(a);if(k==='personal')return T('Capital propio','Own capital','Capital próprio');if(k==='lost')return T('Perdida','Lost','Perdida');if(k==='funded')return T('Fondeada','Funded','Financiada');if(k==='done')return T('Finalizada','Completed','Finalizada');
 const n=Number(a.ruleSnapshot?.count??a.targets?.length)||0;return T('Fase ','Phase ','Fase ')+(Number(a.phase)||1)+(n>1?T(' de ',' of ',' de ')+n:'');}
function progress(a){if(kind(a)!=='live')return null;try{const p=R.progress(a);if(!(p.target>0))return null;return {pnl:p.pnl,target:p.target,pct:Math.max(0,Math.min(100,p.pnl/p.target*100))};}catch{return null;}}
function snap(a){try{return L.snapshot(a);}catch{return {balance:Number(a.capital)||0,pnl:0};}}

/* ---------- list ---------- */
const view=document.createElement('div');view.className='jfa';view.id='jfAccounts';view.setAttribute('data-i18n-ignore','');
function render(){
 if(!ready())return;if(view.parentElement!==host)host.prepend(view);host.classList.add('jfa-on');
 const add=$('ftAddPresetAccount');if(add)add.onclick=e=>{e?.preventDefault?.();openAdd();};
 const list=(typeof accounts!=='undefined'?accounts:[]).filter(a=>!a.multiGroup);let current=null;try{current=acc();}catch{}
 const counts={all:list.length,live:0,funded:0,lost:0,personal:0};for(const a of list){const k=kind(a);if(counts[k]!=null)counts[k]++;}
 if(filter!=='all'&&!counts[filter])filter='all';
 let html='<div class="jfa-hdr"><h3>'+E(T('Mis cuentas','My accounts','Minhas contas'))+'</h3><button type="button" class="jfa-plus" data-jfa="add" aria-label="'+E(T('Agregar cuenta','Add account','Adicionar conta'))+'">+</button></div>';
 if(current&&!current.multiGroup){const p=progress(current),v=snap(current);
  html+='<div class="jfa-hero"><span class="jfa-kick">'+E(T('En uso','In use','Em uso'))+'</span><div class="jfa-hrow">'+logo(personal(current)?'Capital':current.firm)+'<div><h4>'+E(programName(current))+' · '+E(money(current.capital,0))+'</h4><p>'+E((personal(current)?'':current.firm+' · ')+stageText(current))+'</p></div></div>'+
   (p?'<div class="jfa-bar"><i style="width:'+p.pct.toFixed(1)+'%"></i></div><div class="jfa-pline"><span>'+E(T('Objetivo de fase','Phase target','Meta da fase'))+'</span><span><b class="'+(p.pnl<0?'neg':'pos')+'">'+E(signed(p.pnl))+'</b> '+E(T('de','of','de'))+' '+E(money(p.target))+'</span></div>'
    :'<div class="jfa-pline jfa-pline-solo"><span>'+E(T('Balance','Balance','Saldo'))+' <b>'+E(money(v.balance))+'</b></span><span class="'+(v.pnl<0?'neg':v.pnl>0?'pos':'')+'">'+E(signed(v.pnl))+'</span></div>')+'</div>';}
 const chips=[['all',T('Todas','All','Todas')],['live',T('En curso','In progress','Em andamento')],['funded',T('Fondeadas','Funded','Financiadas')],['lost',T('Perdidas','Lost','Perdidas')],['personal',T('Propias','Own','Próprias')]].filter(([k])=>k==='all'||counts[k]);
 if(list.length>1)html+='<div class="jfa-seg" role="group" aria-label="'+E(T('Filtrar cuentas','Filter accounts','Filtrar contas'))+'">'+chips.map(([k,l])=>'<button type="button" class="'+(k===filter?'on':'')+'" data-jfa-filter="'+k+'" aria-pressed="'+(k===filter)+'">'+E(l)+' · '+counts[k]+'</button>').join('')+'</div>';
 const shown=list.filter(a=>filter==='all'||kind(a)===filter),blocks=new Map();
 for(const a of shown){const key=personal(a)?'__personal':a.firm||'—';if(!blocks.has(key))blocks.set(key,[]);blocks.get(key).push(a);}
 const order=[...blocks.keys()].sort((x,y)=>(x==='__personal')-(y==='__personal')||blocks.get(y).length-blocks.get(x).length||x.localeCompare(y));
 for(const key of order){const items=blocks.get(key),isP=key==='__personal',inUse=items.some(a=>a.id===current?.id);
  html+='<section class="jfa-firm"><div class="jfa-fhead">'+logo(isP?'Capital':key,'sm')+'<b>'+E(isP?T('Capital propio','Own capital','Capital próprio'):key)+'</b><small>'+items.length+' '+E(items.length===1?T('cuenta','account','conta'):T('cuentas','accounts','contas'))+(inUse?' · '+E(T('1 en uso','1 in use','1 em uso')):'')+'</small></div>'+
   items.map(a=>{const v=snap(a),p=progress(a),k=kind(a),use=a.id===current?.id;
    const meta=p?E(stageText(a))+' · '+Math.round(p.pct)+'% '+E(T('del objetivo','of target','da meta')):'<span class="jfa-dot jfa-d-'+k+'"></span><span class="jfa-st-'+k+'">'+E(stageText(a))+'</span>';
    return '<div class="jfa-row'+(use?' use':'')+'"><button type="button" class="jfa-pick" data-jfa-use="'+E(a.id)+'" aria-label="'+E(T('Usar ','Use ','Usar ')+programName(a))+'"><span class="jfa-t"><b>'+E(programName(a))+' · '+E(short(a.capital))+'</b>'+(use?'<em>'+E(T('En uso','In use','Em uso'))+'</em>':'')+'</span><span class="jfa-r '+(v.pnl<0?'neg':v.pnl>0?'pos':'')+'">'+E(signed(v.pnl))+'</span><span class="jfa-meta">'+meta+'</span>'+(p?'<span class="jfa-mini"><i style="width:'+p.pct.toFixed(1)+'%"></i></span>':'')+'</button><button type="button" class="jfa-more" data-jfa-more="'+E(a.id)+'" aria-label="'+E(T('Ver datos de la cuenta','Account details','Dados da conta'))+'">⋯</button></div>';}).join('')+'</section>';}
 if(!shown.length)html+='<p class="jfa-empty-text">'+E(T('No hay cuentas con este filtro.','No accounts with this filter.','Nenhuma conta com este filtro.'))+'</p>';
 const groups=M?.groups?.()||[];
 if(groups.length&&filter==='all')html+='<section class="jfa-firm"><div class="jfa-fhead"><span class="jfa-logo jfa-other sm">⇄</span><b>'+E(T('Multicuentas','Account groups','Multicontas'))+'</b><small>'+groups.length+'</small></div>'+groups.map(g=>'<div class="jfa-row"><button type="button" class="jfa-pick" data-jfa-group="'+E(g.id)+'"><span class="jfa-t"><b>'+E(g.name)+'</b></span><span class="jfa-r">'+E(money(g.accounts.reduce((s,a)=>s+snap(a).balance,0)))+'</span><span class="jfa-meta">'+g.accounts.length+' '+E(T('cuentas','accounts','contas'))+'</span></button></div>').join('')+'</section>';
 const have=new Set(list.map(a=>a.firm)),missing=firms().filter(f=>!have.has(f));
 if(filter==='all')for(const f of missing.slice(0,2))html+='<button type="button" class="jfa-invite" data-jfa-firm="'+E(f)+'">'+logo(f,'sm')+'<span>'+E(T('¿Operás en ','Trading with ','Opera na '))+'<b>'+E(f)+'</b>'+E(T('? Agregá tu cuenta','? Add your account','? Adicione sua conta'))+'</span></button>';
 view.innerHTML=html;
}
view.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.jfa==='add')return openAdd();
 if(b.dataset.jfaFilter){filter=b.dataset.jfaFilter;try{localStorage.setItem('jf_acc_filter',filter);}catch{}return render();}
 if(b.dataset.jfaUse){if(b.dataset.jfaUse!==activeId){activeId=b.dataset.jfaUse;save();window.render();}return;}
 if(b.dataset.jfaMore)return window.JFAccounts?.details?.(b.dataset.jfaMore);
 if(b.dataset.jfaGroup){M?.select?.(b.dataset.jfaGroup);window.ftGo?.('ftPageAccounts');return;}
 if(b.dataset.jfaFirm)return openAdd(b.dataset.jfaFirm);});

/* ---------- add flow ---------- */
const dlg=document.createElement('dialog');dlg.id='jfAddAccount';dlg.className='jfa-dlg';dlg.setAttribute('aria-label','');dlg.setAttribute('data-i18n-ignore','');document.body.append(dlg);
let step=1,firm=null,model=null,size=null,confirmed=false;
const defsOf=f=>R.defs.filter(d=>d.firm===f);
const tag=d=>d.name.replace(/^Challenge\s+/,'').replace(/\s*·\s*por invitación/,'').replace(/\s*·\s*Standard$/,'');
function ddText(d){const x=(d.evaluation||d.funded||{}).drawdown;return x==='static'?T('Drawdown estático','Static drawdown','Drawdown estático'):x==='trailing-eod'?T('Drawdown dinámico al cierre del día','End-of-day trailing drawdown','Drawdown dinâmico no fechamento'):x==='trailing-balance'?T('Drawdown dinámico sobre balance','Balance trailing drawdown','Drawdown dinâmico sobre saldo'):x==='trailing-equity'?T('Drawdown dinámico sobre equity','Equity trailing drawdown','Drawdown dinâmico sobre equity'):'';}
function paintAdd(){
 const mine=(typeof accounts!=='undefined'?accounts:[]);let html='';
 if(step===1){
  html='<div class="jfa-top"><button type="button" class="jfa-close" data-jfa-close aria-label="'+E(T('Cerrar','Close','Fechar'))+'">✕</button><span class="jfa-step">'+E(T('Paso 1 de 2','Step 1 of 2','Passo 1 de 2'))+'</span></div><h3 class="jfa-big">'+E(T('¿Con qué firma operás?','Which firm do you trade with?','Com qual empresa você opera?'))+'</h3><p class="jfa-lead">'+E(T('Elegí la firma y JourFund carga sus reglas por vos.','Pick the firm and JourFund loads its rules for you.','Escolha a empresa e o JourFund carrega as regras.'))+'</p>'+
  firms().map(f=>{const ds=defsOf(f),n=mine.filter(a=>a.firm===f).length;return '<button type="button" class="jfa-fcard jfa-fc-'+color(f)+'" data-jfa-pickfirm="'+E(f)+'">'+(n?'<span class="jfa-have">'+E(T('Tenés ','You have ','Você tem '))+n+'</span>':'')+logo(f,'lg')+'<span class="jfa-fc-body"><b>'+E(f)+'</b><small>'+ds.length+' '+E(ds.length===1?T('programa','program','programa'):T('programas','programs','programas'))+'</small><span class="jfa-tags">'+ds.slice(0,4).map(d=>'<i>'+E(tag(d))+'</i>').join('')+'</span></span><span class="jfa-go" aria-hidden="true">›</span></button>';}).join('')+
  '<div class="jfa-split"><button type="button" class="jfa-small" data-jfa-other><b>'+E(T('Otra firma','Another firm','Outra empresa'))+'</b>'+E(T('Cargás las reglas a mano','Enter the rules yourself','Você informa as regras'))+'</button><button type="button" class="jfa-small" data-jfa-own><b>'+E(T('Cuenta personal','Personal account','Conta pessoal'))+'</b>'+E(T('Tu capital, sin reglas','Your capital, no rules','Seu capital, sem regras'))+'</button></div>';
 }else{
  const ds=defsOf(firm),d=ds.find(x=>x.id===model)||ds[0];model=d.id;const sizes=d.sizes||[];if(!sizes.includes(size))size=sizes.includes(25000)?25000:sizes[Math.min(1,sizes.length-1)]??null;
  const ev=d.evaluation,fu=d.funded||{},cap=size||0,pc=(p)=>p==null?T('Sin límite','No limit','Sem limite'):p+'% · '+money(cap*p/100);
  const cells=[];if(ev){ev.targets.forEach((t,i)=>cells.push([T('Objetivo fase ','Phase target ','Meta fase ')+(i+1)+(ev.targets.length===1?'':''),t+'% · '+money(cap*t/100),'']));cells.push([T('Pérdida diaria','Daily loss','Perda diária'),pc(ev.dailyPct),'neg'],[T('Pérdida máxima','Max loss','Perda máxima'),pc(ev.maxPct),'neg']);}
  else cells.push([T('Tipo','Type','Tipo'),T('Financiada directa','Instant funding','Financiada direta'),''],[T('Pérdida diaria','Daily loss','Perda diária'),pc(fu.dailyPct),'neg'],[T('Pérdida máxima','Max loss','Perda máxima'),pc(fu.maxPct),'neg']);
  const extra=[ev&&Number(ev.days)>0?T('Mínimo ','Minimum ','Mínimo ')+'<b>'+ev.days+'</b>'+T(' días operados',' trading days',' dias operados'):'',ddText(d)].filter(Boolean).join(' · ');
  html='<div class="jfa-top"><button type="button" class="jfa-close" data-jfa-back aria-label="'+E(T('Volver','Back','Voltar'))+'">‹</button>'+logo(firm,'sm')+'<b>'+E(firm)+'</b><span class="jfa-step">'+E(T('Paso 2 de 2','Step 2 of 2','Passo 2 de 2'))+'</span></div>'+
  '<div class="jfa-tabs" role="group" aria-label="'+E(T('Programa','Program','Programa'))+'">'+ds.map(x=>'<button type="button" class="'+(x.id===model?'on':'')+'" data-jfa-model="'+E(x.id)+'" aria-pressed="'+(x.id===model)+'">'+E(tag(x))+'</button>').join('')+'</div>'+
  (sizes.length?'<p class="jfa-lbl">'+E(T('Tamaño','Size','Tamanho'))+'</p><div class="jfa-sizes">'+sizes.map(n=>'<button type="button" class="'+(n===size?'on':'')+'" data-jfa-size="'+n+'" aria-pressed="'+(n===size)+'">'+E(short(n).replace('$',''))+'</button>').join('')+'</div>'+
   '<p class="jfa-lbl">'+E(T('Reglas que vamos a seguir por vos','Rules we will track for you','Regras que vamos acompanhar'))+'</p><div class="jfa-rules"><div class="jfa-rgrid">'+cells.map(([l,v,c])=>'<div><small>'+E(l)+'</small><b class="'+c+'">'+E(v)+'</b></div>').join('')+'</div>'+(extra?'<p class="jfa-extra">'+extra+'</p>':'')+'</div>'
   :'<p class="jfa-lead">'+E(T('Este programa necesita datos de tu contrato. Seguí en el formulario completo.','This program needs details from your contract. Continue in the full form.','Este programa precisa de dados do contrato. Continue no formulário completo.'))+'</p>')+
  '<button type="button" class="jfa-adv" data-jfa-adv>'+E(T('Opciones avanzadas: versión de reglas, ciclo de retiro, hora del servidor','Advanced: rule version, payout cycle, server time','Avançado: versão das regras, ciclo de saque, horário do servidor'))+' ›</button>'+
  (sizes.length?'<label class="jfa-confirm" for="jfAddConfirm"><input type="checkbox" id="jfAddConfirm"'+(confirmed?' checked':'')+'><span>'+E(T('Confirmé el tamaño y el programa con mi contrato o dashboard de la firma.','I checked the size and program against my contract or the firm dashboard.','Confirmei o tamanho e o programa com meu contrato ou painel da empresa.'))+'</span></label>':'')+'<p class="jfa-err" id="jfAddError" role="alert"></p><button type="button" class="jfa-cta" data-jfa-create'+(sizes.length&&!confirmed?' disabled':'')+'>'+E(sizes.length?T('Agregar cuenta ','Add account ','Adicionar conta ')+firm+' · '+money(size,0):T('Continuar','Continue','Continuar'))+'</button>';
 }
 dlg.innerHTML=html;
}
function openAdd(f){if(!ready())return;confirmed=false;firm=f||null;model=null;size=null;step=f?2:1;paintAdd();if(!dlg.open)dlg.showModal();}
function fullForm(){dlg.close();window.ftOpenRuleAccount(model);if(size!=null&&$('ftPresetSize')){$('ftPresetSize').value=String(size);$('ftPresetSize').dispatchEvent(new Event('change',{bubbles:true}));}}
function create(){const d=R.defs.find(x=>x.id===model);if(!d||!(d.sizes||[]).length)return fullForm();
 const before=(typeof accounts!=='undefined'?accounts:[]).length;window.ftOpenRuleAccount(model);const sel=$('ftPresetSize');if(sel){sel.value=String(size);sel.dispatchEvent(new Event('change',{bubbles:true}));}
 const ok=$('ftPresetConfirm');if(ok)ok.checked=true;$('accountForm').requestSubmit();
 if(($('accountModal')?.classList.contains('show'))||(typeof accounts!=='undefined'?accounts:[]).length===before){dlg.close();return;} // the full form stays open showing what is missing
 dlg.close();window.ft67Toast?.(T('Cuenta agregada','Account added','Conta adicionada'),firm+' · '+money(size,0),'saved');}
dlg.addEventListener('change',e=>{if(e.target.id==='jfAddConfirm'){confirmed=e.target.checked;const c=dlg.querySelector('[data-jfa-create]');if(c)c.disabled=!confirmed;}});
dlg.addEventListener('click',e=>{if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.x||e.clientX>r.right||e.clientY<r.y||e.clientY>r.bottom)dlg.close();return;}
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-jfa-close'))return dlg.close();
 if(b.hasAttribute('data-jfa-back')){step=1;return paintAdd();}
 if(b.dataset.jfaPickfirm){firm=b.dataset.jfaPickfirm;model=null;size=null;step=2;return paintAdd();}
 if(b.hasAttribute('data-jfa-other')){dlg.close();return window.ftOpenRuleAccount('custom');}
 if(b.hasAttribute('data-jfa-own')){dlg.close();return window.JFAccounts?.ownForm?.();}
 if(b.dataset.jfaModel){model=b.dataset.jfaModel;return paintAdd();}
 if(b.dataset.jfaSize){size=Number(b.dataset.jfaSize);return paintAdd();}
 if(b.hasAttribute('data-jfa-adv'))return fullForm();
 if(b.hasAttribute('data-jfa-create'))return create();});

const prev=window.render;if(typeof prev==='function')window.render=function(){const out=prev.apply(this,arguments);try{render();}catch(e){console.warn(e);}return out;};
window.addEventListener('jfLanguageChanged',()=>{render();if(dlg.open)paintAdd();});
// Other modules repaint "Mis cuentas" on their own (sign-in finishing, sync, page switches) without calling
// window.render, and the app can become ready after the last render. Re-apply this view whenever that happens.
let queued=false;const soon=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;try{render();}catch(e){console.warn(e);}});};
new MutationObserver(soon).observe(document.body,{attributes:true,attributeFilter:['class']});
const pageEl=document.getElementById('ftPageAccounts');if(pageEl)new MutationObserver(()=>{if(pageEl.classList.contains('active'))soon();}).observe(pageEl,{attributes:true,attributeFilter:['class']});
new MutationObserver(()=>{if(!host.contains(view)||!host.classList.contains('jfa-on'))soon();}).observe(host,{childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')soon();});
window.JourFundAccountsV2={render,openAdd};
render();
})();
