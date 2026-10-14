/* Freno anti-tilt. Per-account settings (a.preferences.tilt) in Cuentas; Inicio shows "Día cerrado" when today's loss
   reaches the chosen share of the firm's daily limit, after N losses in a row, or during a pause after a loss.
   It never blocks logging trades: the trade form only shows a reminder. */
(function(){'use strict';
const $=id=>document.getElementById(id),I=window.JourFundInsights,P=window.FTProtection,C=window.ftProtectionCloud;
if(!I||!P||!C)return;
const lang=()=>window.JourFundI18n?.language||'es',T=(es,en,pt)=>lang()==='en'?en:lang()==='pt-BR'?pt:es;
const loc=()=>window.jfLocale?.()||'es-PY',E=s=>P.escape(s);
const money=n=>new Intl.NumberFormat(loc(),{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
const clock=ms=>new Date(ms).toLocaleTimeString(loc(),{hour:'2-digit',minute:'2-digit'});
const ready=()=>!!window.ftCloudSession?.user?.id&&document.body.classList.contains('ft-ready');
const current=()=>{try{return acc();}catch{return null;}};

function state(a,now=Date.now()){
 if(!a)return null;const s=a.preferences?.tilt;if(!s?.enabled)return {active:false,enabled:false};
 let day,limit=null;try{day=FTLedger.day(a);}catch{day=new Date().toISOString().slice(0,10);}
 try{limit=FTRules.risk(a,day).dailyBudget;}catch{}
 const ts=(a.status==='Funded'?a.pa?.trades:a.phases?.[Math.max(0,(a.phase||1)-1)]?.trades)||[];
 return {...I.tilt(s,ts.filter(t=>t.date===day),limit,now),enabled:true,limit};
}
function reasonText(x){
 if(x.reason==='daily')return T('Perdiste ','You lost ','Você perdeu ')+money(x.lost)+T(', tu tope del día es ',', your cap for today is ',', seu teto do dia é ')+money(x.cap)+' ('+x.settings.dailyPct+'% '+T('del límite diario de la firma','of the firm\'s daily limit','do limite diário da empresa')+').';
 if(x.reason==='streak')return x.streak+' '+T('pérdidas seguidas. Tu regla es frenar en ','losses in a row. Your rule is to stop at ','perdas seguidas. Sua regra é parar em ')+x.settings.losses+'.';
 if(x.reason==='cooldown')return T('Pausa después de una pérdida, hasta las ','Break after a loss, until ','Pausa depois de uma perda, até ')+clock(x.until)+'.';
 return '';
}

/* ---------- Inicio ---------- */
const home=$('ftPageHome'),banner=document.createElement('section');banner.className='jfin jfin-tilt';banner.id='jfTiltHome';banner.setAttribute('data-i18n-ignore','');banner.hidden=true;
let timer=null;
function renderHome(){
 if(!home)return;const anchor=home.querySelector('.ft-home-overview');if(!anchor||!ready())return;if(banner.previousElementSibling!==anchor)anchor.after(banner);
 const a=current(),x=state(a);clearTimeout(timer);
 if(!x?.enabled){banner.hidden=true;return;}banner.hidden=false;
 if(x.active){banner.className='jfin jfin-tilt closed';banner.innerHTML='<div class="jfin-tilt-icon" aria-hidden="true">⏸</div><div><h3>'+E(x.reason==='cooldown'?T('Pausa activa','Break in progress','Pausa ativa'):T('Día cerrado','Day closed','Dia encerrado'))+'</h3><p>'+E(reasonText(x))+'</p><p class="jfin-muted">'+E(x.reason==='cooldown'?T('Respirá, revisá la operación y volvé con la cabeza fría.','Breathe, review the trade and come back with a clear head.','Respire, revise a operação e volte com a cabeça fria.'):T('Lo decidiste vos, con la cabeza fría. Mañana es otro día.','You decided this with a clear head. Tomorrow is another day.','Você decidiu isso com a cabeça fria. Amanhã é outro dia.'))+'</p></div><button type="button" class="btn" data-tilt-go>'+E(T('Ajustar freno','Adjust guard','Ajustar freio'))+'</button>';
  if(x.reason==='cooldown')timer=setTimeout(renderHome,Math.max(1000,x.until-Date.now()+500));}
 else{const left=[];if(x.cap!=null)left.push(T('te quedan ','','restam ')+money(Math.max(0,x.cap-x.lost))+T(' antes de cerrar el día',' left before the day closes',' antes de encerrar o dia'));if(x.settings.losses>0)left.push(T('pérdidas seguidas: ','losses in a row: ','perdas seguidas: ')+x.streak+'/'+x.settings.losses);
  banner.className='jfin jfin-tilt open';banner.innerHTML='<div class="jfin-tilt-icon" aria-hidden="true">🛡</div><div><h3>'+E(T('Freno anti-tilt activo','Tilt guard on','Freio anti-tilt ativo'))+'</h3><p>'+E(left.join(' · ')||T('Sin límites cargados.','No limits set.','Sem limites definidos.'))+'</p></div><button type="button" class="btn" data-tilt-go>'+E(T('Ajustar','Adjust','Ajustar'))+'</button>';}
}
banner.addEventListener('click',e=>{if(e.target.closest('[data-tilt-go]')){window.ftGo?.('ftPageAccounts');setTimeout(()=>$('jfTiltSettings')?.scrollIntoView({behavior:'smooth',block:'center'}),350);}});

/* ---------- Cuentas: settings for the active account ---------- */
const accounts=$('ftPageAccounts'),card=document.createElement('section');card.className='ft-quick-card jfin jfin-tilt-card';card.id='jfTiltSettings';card.setAttribute('data-i18n-ignore','');
let dirty=false;
function renderSettings(){
 if(!accounts||!ready())return;const anchor=$('ftMyAccounts');if(!anchor)return;if(card.previousElementSibling!==anchor)anchor.after(card);
 if(dirty&&card.contains(document.activeElement))return;
 const a=current();if(!a){card.hidden=true;return;}card.hidden=false;dirty=false;
 const s={...I.TILT_DEFAULT,...(a.preferences?.tilt||{})},x=state(a),limit=x?.limit??(()=>{try{return FTRules.risk(a,FTLedger.day(a)).dailyBudget;}catch{return null;}})();
 const num=(id,label,v,min,max,hint)=>'<label for="'+id+'">'+E(label)+'<input id="'+id+'" type="number" inputmode="numeric" min="'+min+'" max="'+max+'" step="1" value="'+v+'"><small>'+E(hint)+'</small></label>';
 card.innerHTML='<div class="jfin-head"><div><h3>'+E(T('Freno anti-tilt','Tilt guard','Freio anti-tilt'))+'</h3><p>'+E(T('Definí ahora, con la cabeza fría, cuándo cortar el día. Para ','Decide now, with a clear head, when to stop for the day. For ','Defina agora, com a cabeça fria, quando parar o dia. Para '))+'<b>'+E((a.nickname||a.program||'')+' · '+(a.firm||''))+'</b>.</p></div></div>'+
  '<form id="jfTiltForm" class="jfin-tilt-form"><label class="jfin-switch" for="jfTiltOn"><input id="jfTiltOn" type="checkbox"'+(s.enabled?' checked':'')+'><span>'+E(T('Activar el freno en esta cuenta','Turn the guard on for this account','Ativar o freio nesta conta'))+'</span></label>'+
  '<div class="jfin-tilt-fields">'+
   num('jfTiltPct',T('Cerrar el día al perder (% del límite diario)','Close the day after losing (% of daily limit)','Encerrar o dia ao perder (% do limite diário)'),s.dailyPct,10,100,limit>0?'= '+money(limit*s.dailyPct/100)+' '+T('de','of','de')+' '+money(limit):T('Esta cuenta no tiene límite diario.','This account has no daily limit.','Esta conta não tem limite diário.'))+
   num('jfTiltLosses',T('Pérdidas seguidas para frenar','Losses in a row to stop','Perdas seguidas para parar'),s.losses,0,20,T('0 = no usar','0 = off','0 = desligado'))+
   num('jfTiltPause',T('Pausa después de una pérdida (min)','Break after a loss (min)','Pausa depois de uma perda (min)'),s.cooldownMin,0,240,T('0 = sin pausa','0 = no break','0 = sem pausa'))+
  '</div><p class="jfin-status" id="jfTiltStatus" role="status"></p><div class="jfin-actions"><button type="submit" class="btn primary">'+E(T('Guardar freno','Save guard','Salvar freio'))+'</button></div></form>';
}
card.addEventListener('input',e=>{dirty=true;if(e.target.id==='jfTiltPct'){const a=current();let limit=null;try{limit=FTRules.risk(a,FTLedger.day(a)).dailyBudget;}catch{}const v=Number(e.target.value),hint=e.target.parentElement.querySelector('small');if(limit>0&&hint&&v>=10&&v<=100)hint.textContent='= '+money(limit*v/100)+' '+T('de','of','de')+' '+money(limit);}});
card.addEventListener('submit',e=>{e.preventDefault();const st=$('jfTiltStatus'),fail=m=>{st.className='jfin-status err';st.textContent=m;};
 const tilt={enabled:$('jfTiltOn').checked,dailyPct:Math.round(Number($('jfTiltPct').value)),losses:Math.round(Number($('jfTiltLosses').value)),cooldownMin:Math.round(Number($('jfTiltPause').value))};
 if(!I.validTilt(tilt))return fail(T('Revisá los valores: % entre 10 y 100, pérdidas 0–20, pausa 0–240 min.','Check the values: % between 10 and 100, losses 0–20, break 0–240 min.','Revise os valores: % entre 10 e 100, perdas 0–20, pausa 0–240 min.'));
 try{const snap=C.snapshot(),list=P.clone(snap.accounts),a=list.find(x=>x.id===activeId);if(!a)throw Error('');a.preferences={...(a.preferences||{}),tilt};C.commit(list,snap);dirty=false;
  window.ft67Toast?.(tilt.enabled?T('Freno activado','Guard on','Freio ativado'):T('Freno guardado','Guard saved','Freio salvo'),'','saved');renderSettings();renderHome();}
 catch{fail(T('No se pudo guardar. Intentá de nuevo.','Could not save. Try again.','Não foi possível salvar. Tente de novo.'));}});

/* ---------- Trade form reminder ---------- */
const note=document.createElement('div');note.className='jfin jfin-tilt-note';note.id='jfTiltNote';note.setAttribute('role','alert');note.setAttribute('data-i18n-ignore','');note.hidden=true;
const open=window.openModal;if(typeof open==='function')window.openModal=function(){const out=open.apply(this,arguments);try{
 const form=$('date')?.closest('form');const x=state(current());if(form&&x?.active){form.prepend(note);note.hidden=false;note.textContent='⏸ '+(x.reason==='cooldown'?T('Estás en pausa. ','You are on a break. ','Você está em pausa. '):T('Tu freno cerró el día. ','Your guard closed the day. ','Seu freio encerrou o dia. '))+reasonText(x)+' '+T('Podés registrar operaciones que ya tomaste.','You can still log trades you already took.','Você ainda pode registrar operações que já fez.');}else note.hidden=true;}catch{}return out;};

const prev=window.render;if(typeof prev==='function')window.render=function(){const out=prev.apply(this,arguments);renderHome();renderSettings();return out;};
window.addEventListener('jfLanguageChanged',()=>{renderHome();dirty=false;renderSettings();});
for(const pg of [home,accounts])if(pg)new MutationObserver(()=>{if(pg.classList.contains('active')){renderHome();renderSettings();}}).observe(pg,{attributes:true,attributeFilter:['class']});
window.JourFundTilt={state,renderHome,renderSettings};
renderHome();renderSettings();
})();
