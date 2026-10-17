/* Service worker registration + updates. Phones keep the PWA open in the background for days, so a release would
   only show after a full close. Check for a new version whenever the app comes back to the screen (and every 30 min),
   and when the new version takes over, reload once — but never while a form or dialog is open. */
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
 const hadController=!!navigator.serviceWorker.controller;let pending=false,reloaded=false;
 const busy=()=>!!document.querySelector('#modal.show,#accountModal.show,dialog[open]')||(document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName));
 const reload=()=>{if(reloaded)return;if(busy()){pending=true;return;}reloaded=true;location.reload();};
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController)reload();});
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
  const check=()=>reg.update().catch(()=>{});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')return;if(pending)return reload();check();});
  setInterval(()=>{if(document.visibilityState==='visible')check();},30*60*1000);
 }).catch(()=>{}));
 // A reload postponed because a form was open happens as soon as it closes.
 document.addEventListener('click',()=>{if(pending)setTimeout(()=>{if(pending&&!busy())reload();},400);},true);
}
