/* "Reportar un problema o sugerencia" (Ajustes → Ayuda): saves the report in jf_feedback with the
   app version, the page the user was on and the device, so testers don't need a mail app. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const SCRIPT_V=(document.currentScript?.src.match(/[?&]v=(\d+)/)||[])[1]||'';
const icon='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M12 8v4"/><circle cx="12" cy="15.5" r=".6" fill="currentColor"/></svg>';
let lastPage='';
document.addEventListener('click',()=>{const id=document.querySelector('.ft-page.active')?.id;if(id&&id!=='ftPageSettings')lastPage=id;},true);

function mount(){
 const menu=document.querySelector('.jf98-settings-menu');if(!menu||menu.querySelector('.jf-fb-open'))return;
 const head=document.createElement('h3');head.textContent='Ayuda';
 const group=document.createElement('div');group.className='jf98-group';
 group.innerHTML='<button type="button" class="jf98-row jf-fb-open"><span class="jf98-row-icon">'+icon+'</span><span>Reportar un problema o sugerencia</span><span class="jf98-chevron" aria-hidden="true">›</span></button>';
 const foot=menu.querySelector('.jf98-footnote');menu.insertBefore(head,foot);menu.insertBefore(group,foot);
 group.querySelector('button').addEventListener('click',e=>{e.stopPropagation();open();});
}
// Desktop shows Ajustes as cards instead of the menu: add a small Help card there too.
function mountCard(){
 const body=document.querySelector('#ftPageSettings .ft-page-body');if(!body||body.querySelector('.jf-fb-card'))return;
 const card=document.createElement('section');card.className='ft-quick-card jf-fb-card';
 card.innerHTML='<h3>Ayuda</h3><p class="sub">¿Encontraste un error o tenés una idea? Contanos y lo revisamos.</p><button type="button" class="btn jf-fb-open-card">Reportar un problema o sugerencia</button>';
 body.append(card);card.querySelector('button').addEventListener('click',open);
}
const mountAll=()=>{mount();mountCard();};
mountAll();document.addEventListener('DOMContentLoaded',mountAll);window.addEventListener('load',mountAll);

const dialog=document.createElement('dialog');dialog.id='jfFeedbackDialog';dialog.setAttribute('aria-labelledby','jfFbTitle');
dialog.innerHTML='<form id="jfFbForm"><h3 id="jfFbTitle">Contanos qué pasó</h3>'+
 '<div class="jf-fb-kind" role="radiogroup" aria-label="Tipo"><label><input type="radio" name="jfFbKind" value="bug" checked><span>Problema</span></label><label><input type="radio" name="jfFbKind" value="idea"><span>Sugerencia</span></label></div>'+
 '<label for="jfFbText" class="jf-fb-label">Mensaje</label><textarea id="jfFbText" rows="6" maxlength="4000" placeholder="¿Qué estabas haciendo y qué pasó? Cuanto más detalle, mejor." required></textarea>'+
 '<p class="jf-fb-note">Se envía junto con la versión de la app, la pantalla y el tipo de dispositivo. También podés escribirnos a <a href="mailto:info@jourfund.com">info@jourfund.com</a>.</p>'+
 '<p id="jfFbStatus" class="jf-fb-status" role="status"></p>'+
 '<div class="jf-fb-actions"><button type="button" class="btn" id="jfFbCancel">Cancelar</button><button type="submit" class="btn primary" id="jfFbSend">Enviar</button></div></form>';
document.body.append(dialog);
let busy=false;
function open(){$('jfFbText').value='';$('jfFbStatus').textContent='';$('jfFbStatus').className='jf-fb-status';$('jfFbSend').disabled=false;$('jfFbSend').textContent='Enviar';dialog.querySelector('input[value="bug"]').checked=true;dialog.showModal();setTimeout(()=>$('jfFbText').focus(),50);}
$('jfFbText').addEventListener('input',()=>{if($('jfFbStatus').classList.contains('err'))status('',false);});
$('jfFbCancel').onclick=()=>{if(!busy)dialog.close();};
dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
async function version(){const pub=window.JF_VERSION||'';let build='';try{const k=(await caches.keys()).find(x=>x.startsWith('fundedtrack-'));if(k)build=k.replace('fundedtrack-','');}catch{}if(!build&&SCRIPT_V)build='v'+SCRIPT_V;return pub&&build?pub+' ('+build+')':pub||build;}
function status(text,bad){$('jfFbStatus').textContent=text;$('jfFbStatus').className='jf-fb-status '+(bad?'err':'ok');}
$('jfFbForm').addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 const message=$('jfFbText').value.trim();if(message.length<3){status('Escribí un poco más de detalle.',true);$('jfFbText').focus();return;}
 const c=window.ftCloud,uid=window.ftCloudSession?.user?.id;if(!c||!uid){status('Iniciá sesión de nuevo e intentá otra vez.',true);return;}
 if(navigator.onLine===false){status('Conectate a Internet para enviar el reporte.',true);return;}
 busy=true;$('jfFbSend').disabled=true;$('jfFbSend').textContent='Enviando…';
 try{
  const row={user_id:uid,kind:dialog.querySelector('input[name="jfFbKind"]:checked').value,message:message.slice(0,4000),page:(lastPage||document.querySelector('.ft-page.active')?.id||'').slice(0,80),app_version:(await version()).slice(0,40),device:(navigator.userAgent+' · '+innerWidth+'x'+innerHeight).slice(0,300),lang:(document.documentElement.lang||'').slice(0,10)};
  const {error}=await c.from('jf_feedback').insert(row);if(error)throw error;
  status('¡Gracias! Lo recibimos.',false);$('jfFbSend').textContent='Enviado';setTimeout(()=>{busy=false;dialog.close();},1400);
 }catch(err){busy=false;$('jfFbSend').disabled=false;$('jfFbSend').textContent='Enviar';status(/límite/i.test(err?.message||'')?'Llegaste al límite de reportes por hoy.':'No se pudo enviar. Revisá tu conexión e intentá de nuevo.',true);}
});
})();
