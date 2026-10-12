/* "Eliminar esta cuenta" in Mi cuenta: deletes the signed-in user and all of their data through the
   delete-account Edge Function (images, notifications, devices, journal, login), then signs out here. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const page=$('ftPageMyAccount'),grid=page?.querySelector('.ft94-grid');
if(!grid)return;
const API='https://ztkthcqjxptsxgtwfcfx.supabase.co/functions/v1/delete-account',KEY='sb_publishable_fqjPJfR-EiAlDwk83M4oPg_A8wnDaSR';
const WORDS=['ELIMINAR','DELETE','EXCLUIR'];

const card=document.createElement('section');card.className='ft-quick-card jf-del-card';
card.innerHTML='<h3>Eliminar cuenta</h3><p class="sub">Borra tu usuario y todos tus datos de JourFund. No se puede deshacer.</p><button type="button" class="btn jf-del-open" id="jfDelOpen">Eliminar esta cuenta</button>';
grid.append(card);
// Mi cuenta is split into tabs later on: move the card to the end of the Access tab once it exists.
const place=()=>{const access=$('jf98AccessPanel');if(access&&card.parentElement!==access)access.append(card);};
place();window.addEventListener('load',place);document.addEventListener('DOMContentLoaded',place);

const dialog=document.createElement('dialog');dialog.id='jfDelDialog';dialog.setAttribute('aria-labelledby','jfDelTitle');
dialog.innerHTML='<form method="dialog" id="jfDelForm"><h3 id="jfDelTitle">¿Eliminar tu cuenta de JourFund?</h3>'+
 '<p>Se borran de forma permanente:</p><ul><li>Tus cuentas de fondeo, operaciones, retiros y objetivos</li><li>Las capturas de tus operaciones</li><li>Tus notificaciones y dispositivos con avisos</li><li>Tu usuario y tu acceso con correo o Google</li></ul>'+
 '<p class="jf-del-warn">Esta acción no se puede deshacer.</p>'+
 '<button type="button" class="btn" id="jfDelBackup">Exportar respaldo antes</button>'+
 '<label for="jfDelWord">Escribí ELIMINAR para confirmar</label><input id="jfDelWord" autocomplete="off" autocapitalize="characters" spellcheck="false">'+
 '<p id="jfDelError" class="jf-del-error" role="alert"></p>'+
 '<div class="jf-del-actions"><button type="button" class="btn" id="jfDelCancel">Cancelar</button><button type="submit" class="btn jf-del-confirm" id="jfDelConfirm" disabled>Eliminar definitivamente</button></div></form>';
document.body.append(dialog);

let busy=false;
const valid=()=>WORDS.includes($('jfDelWord').value.trim().toUpperCase());
function open(){if(!window.ftCloudSession?.user)return;$('jfDelWord').value='';$('jfDelError').textContent='';$('jfDelConfirm').disabled=true;dialog.showModal();setTimeout(()=>$('jfDelWord').focus(),50);}
function close(){if(!busy)dialog.close();}
$('jfDelOpen').onclick=open;$('jfDelCancel').onclick=close;
dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
$('jfDelWord').addEventListener('input',()=>{$('jfDelConfirm').disabled=!valid();});
$('jfDelBackup').onclick=()=>$('ftExportMine')?.click();

function clearLocal(uid){try{for(const k of Object.keys(localStorage))if(k.includes(uid))localStorage.removeItem(k);}catch{}}
async function dropPush(){try{const reg=await navigator.serviceWorker?.getRegistration?.();const sub=await reg?.pushManager?.getSubscription?.();await sub?.unsubscribe();}catch{}}

$('jfDelForm').addEventListener('submit',async e=>{
 e.preventDefault();if(busy||!valid())return;
 const c=window.ftCloud,uid=window.ftCloudSession?.user?.id;
 if(!c||!uid){$('jfDelError').textContent='Iniciá sesión de nuevo e intentá otra vez.';return;}
 if(navigator.onLine===false){$('jfDelError').textContent='Conectate a Internet para eliminar la cuenta.';return;}
 busy=true;$('jfDelConfirm').disabled=true;$('jfDelCancel').disabled=true;$('jfDelError').textContent='';$('jfDelConfirm').textContent='Eliminando…';
 try{
  if(window.JFSecurity&&!await window.JFSecurity.authorize(c,uid))throw Error('No se pudo confirmar tu identidad.');
  const {data}=await c.auth.getSession();const token=data?.session?.access_token;if(!token)throw Error('Tu sesión venció. Volvé a iniciar sesión.');
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY,Authorization:'Bearer '+token},body:JSON.stringify({confirm:'DELETE_MY_ACCOUNT'})});
  const out=await r.json().catch(()=>({}));if(!r.ok||!out.ok)throw Error(out.error||'No se pudo eliminar la cuenta. Intentá de nuevo en unos minutos.');
  await dropPush();clearLocal(uid);
  try{await c.auth.signOut({scope:'local'});}catch{}
  busy=false;dialog.close();
  setTimeout(()=>{const m=$('ftAuthMsg');$('ftCloudGate')?.classList.add('jf-auth-open');if(m){m.textContent='Tu cuenta y todos tus datos fueron eliminados.';m.className='ft-cloud-msg ok';}},400);
 }catch(err){
  busy=false;$('jfDelCancel').disabled=false;$('jfDelConfirm').disabled=!valid();$('jfDelConfirm').textContent='Eliminar definitivamente';
  $('jfDelError').textContent=err?.message||'No se pudo eliminar la cuenta.';
 }
});
})();
