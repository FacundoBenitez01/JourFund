/* Checklist antes de operar. Built in Herramientas ("Mi checklist", saved to preferences.checklist of every account),
   ticked in the individual trade form (t.checklist = {total, done:[ids], missed:[texts]}) and measured in Estadísticas. */
(function(){'use strict';
const $=id=>document.getElementById(id),I=window.JourFundInsights,P=window.FTProtection,C=window.ftProtectionCloud,F=window.FT73;
if(!I||!P||!C)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es,E=s=>P.escape(s);
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
const MAX=12,ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 8 1.5 1.5L12 7M8 14l1.5 1.5L12 13M14 8.5h2.5M14 14.5h2.5"/></svg>';
const SUGGEST=()=>[T('La tendencia del marco mayor está a favor','Higher timeframe trend is with me','A tendência do tempo maior está a favor'),T('No hay noticias fuertes en los próximos 30 min','No high-impact news in the next 30 min','Sem notícias fortes nos próximos 30 min'),T('El stop está en un nivel lógico, no por dinero','Stop is at a logical level, not a money amount','O stop está num nível lógico, não por dinheiro'),T('Riesgo dentro de mi plan','Risk within my plan','Risco dentro do meu plano'),T('Estoy tranquilo, no busco recuperar','I am calm, not trying to win it back','Estou tranquilo, não quero recuperar')];
const current=()=>{try{return acc();}catch{return null;}};
const config=a=>{const c=a?.preferences?.checklist;return c&&c.enabled&&c.items?.length?c:null;};
const newId=()=>'k'+Date.now().toString(36).slice(-5)+Math.random().toString(36).slice(2,6);

/* ---------- Herramientas: builder ---------- */
const menu=document.querySelector('#ftPageTools .ft74-menu'),panel=$('ft74Panel');
let active=false,draft=null;
if(menu&&panel){
 const btn=document.createElement('button');btn.type='button';btn.className='ft74-tool';btn.id='jfChecklistTool';btn.dataset.jfinTool='checklist';btn.setAttribute('aria-pressed','false');
 const label=()=>{btn.innerHTML='<span class="ft74-icon">'+ICON+'</span><span><strong>'+E(T('Mi checklist','My checklist','Meu checklist'))+'</strong><small>'+E(T('Antes de cada operación','Before every trade','Antes de cada operação'))+'</small></span>';};
 label();menu.append(btn);
 const load=()=>{let c=null;try{c=C.snapshot().accounts.map(a=>a.preferences?.checklist).find(Boolean)||null;}catch{}return c?{enabled:c.enabled,items:c.items.map(i=>({...i}))}:{enabled:true,items:SUGGEST().slice(0,4).map(text=>({id:newId(),text}))};};
 const paint=()=>{
  if(!active)return;menu.querySelectorAll('[data-tool],[data-jfin-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  panel.innerHTML='<div class="jfin" id="jfChecklistBuilder" data-i18n-ignore><div class="ft74-panel-head"><span class="ft74-icon">'+ICON+'</span><div><h3 id="ft74Title">'+E(T('Mi checklist antes de operar','My pre-trade checklist','Meu checklist antes de operar'))+'</h3><p>'+E(T('Lo que tiene que cumplirse antes de entrar. Lo vas a tildar al registrar cada operación y en Estadísticas vas a ver si te conviene respetarlo.','What must be true before you enter. You tick it when logging each trade, and Statistics shows whether following it pays off.','O que precisa ser verdade antes de entrar. Você marca ao registrar cada operação e em Estatísticas vê se vale a pena seguir.'))+'</p></div></div>'+
   '<label class="jfin-switch" for="jfChkOn"><input id="jfChkOn" type="checkbox"'+(draft.enabled?' checked':'')+'><span>'+E(T('Mostrarlo en Nueva operación','Show it in New trade','Mostrar em Nova operação'))+'</span></label>'+
   '<ol class="jfin-chk-items">'+draft.items.map((it,i)=>'<li><label class="jfin-sr" for="jfChkItem'+i+'">'+E(T('Punto','Item','Item')+' '+(i+1))+'</label><input id="jfChkItem'+i+'" data-chk-i="'+i+'" maxlength="80" value="'+E(it.text)+'"><button type="button" class="jfin-x" data-chk-del="'+i+'" aria-label="'+E(T('Quitar punto','Remove item','Remover item'))+'">×</button></li>').join('')+'</ol>'+
   '<div class="ft74-actions"><button type="button" class="btn" id="jfChkAdd"'+(draft.items.length>=MAX?' disabled':'')+'>+ '+E(T('Agregar punto','Add item','Adicionar item'))+'</button><button type="button" class="btn primary" id="jfChkSave">'+E(T('Guardar checklist','Save checklist','Salvar checklist'))+'</button></div>'+
   '<p class="jfin-status" id="jfChkStatus" role="status"></p><p class="jfin-muted">'+E(T('Se aplica a todas tus cuentas. Hasta 12 puntos, cortos y que se puedan responder con sí o no.','Applies to all your accounts. Up to 12 short yes/no items.','Vale para todas as contas. Até 12 itens curtos de sim ou não.'))+'</p></div>';
 };
 btn.addEventListener('click',()=>{if(!ready())return;active=true;draft=load();paint();});
 menu.addEventListener('click',e=>{if(e.target.closest('[data-tool],[data-jfin-tool]:not(#jfChecklistTool)')){active=false;btn.setAttribute('aria-pressed','false');}},true);
 panel.addEventListener('input',e=>{if(!active)return;const i=e.target.dataset.chkI;if(i!=null)draft.items[+i].text=e.target.value;if(e.target.id==='jfChkOn')draft.enabled=e.target.checked;});
 panel.addEventListener('change',e=>{if(active&&e.target.id==='jfChkOn')draft.enabled=e.target.checked;});
 panel.addEventListener('click',e=>{if(!active)return;const d=e.target.closest('[data-chk-del]');
  if(d){draft.items.splice(+d.dataset.chkDel,1);paint();return;}
  if(e.target.closest('#jfChkAdd')&&draft.items.length<MAX){draft.items.push({id:newId(),text:''});paint();$('jfChkItem'+(draft.items.length-1))?.focus();return;}
  if(e.target.closest('#jfChkSave')){const st=$('jfChkStatus'),items=draft.items.map(i=>({id:i.id,text:i.text.trim()})).filter(i=>i.text),cfg={enabled:draft.enabled&&items.length>0,items};
   if(!I.validChecklist(cfg)){st.className='jfin-status err';st.textContent=T('Revisá los puntos: máximo 80 caracteres cada uno.','Check the items: 80 characters max each.','Revise os itens: no máximo 80 caracteres cada.');return;}
   try{const snap=C.snapshot(),list=P.clone(snap.accounts);for(const a of list)a.preferences={...(a.preferences||{}),checklist:cfg};C.commit(list,snap);draft={enabled:cfg.enabled,items:cfg.items.map(i=>({...i}))};paint();
    const s2=$('jfChkStatus');s2.className='jfin-status ok';s2.textContent=T('Guardado. Lo vas a ver al registrar una operación.','Saved. You will see it when logging a trade.','Salvo. Você vai ver ao registrar uma operação.');}
   catch{st.className='jfin-status err';st.textContent=T('No se pudo guardar. Intentá de nuevo.','Could not save. Try again.','Não foi possível salvar. Tente de novo.');}}});
 new MutationObserver(()=>{if(active&&!$('jfChecklistBuilder'))paint();}).observe(panel,{childList:true});
 window.addEventListener('jfLanguageChanged',()=>{label();if(active)paint();});
}

/* ---------- Trade form ---------- */
const date=$('date');
if(F&&date&&!$('jfTradeChecklist')){
 const field=document.createElement('fieldset');field.className='field jfin jfin-chk-field';field.id='jfTradeChecklist';field.setAttribute('data-i18n-ignore','');field.hidden=true;
 let shown=null,keep=null;
 const place=()=>{const after=$('jfTradeTime')?.closest('.field')||date.closest('.field');if(after&&after.nextElementSibling!==field)after.after(field);};
 function fill(done){const c=config(current());shown=c;if(!c){field.hidden=true;field.innerHTML='';return;}field.hidden=false;const set=new Set(done||[]);
  field.innerHTML='<legend>'+E(T('Checklist antes de operar','Pre-trade checklist','Checklist antes de operar'))+' <small id="jfChkCount"></small></legend>'+c.items.map((it,i)=>'<label class="jfin-chk-row" for="jfChk'+i+'"><input type="checkbox" id="jfChk'+i+'" data-chk-id="'+E(it.id)+'"'+(set.has(it.id)?' checked':'')+'><span>'+E(it.text)+'</span></label>').join('');count();}
 function count(){const all=field.querySelectorAll('input[data-chk-id]'),n=[...all].filter(x=>x.checked).length,el=$('jfChkCount');if(el){el.textContent=n+'/'+all.length;el.className=n===all.length?'pos':'';}}
 field.addEventListener('change',count);
 const read=F.readIndividual;F.readIndividual=function(){const out=read.apply(this,arguments);
  if(shown&&!field.hidden){const boxes=[...field.querySelectorAll('input[data-chk-id]')],done=boxes.filter(b=>b.checked).map(b=>b.dataset.chkId),missed=shown.items.filter(i=>!done.includes(i.id)).map(i=>i.text);out.checklist={total:shown.items.length,done,missed};}
  else out.checklist=keep||undefined;return out;};
 const loadRec=F.load;F.load=function(record={}){const out=loadRec.apply(this,arguments);place();
  // Only called when editing: trades logged without a checklist stay without one.
  keep=record?.checklist||null;if(record?.checklist)fill(record.checklist.done||[]);else{shown=null;field.hidden=true;field.innerHTML='';}return out;};
 const open=window.openModal;if(typeof open==='function')window.openModal=function(){const out=open.apply(this,arguments);keep=null;place();fill([]);return out;};
 window.addEventListener('jfLanguageChanged',()=>{if(!field.hidden){const done=[...field.querySelectorAll('input[data-chk-id]:checked')].map(b=>b.dataset.chkId);fill(done);}});
 place();
}
})();
