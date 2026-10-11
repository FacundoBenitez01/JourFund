// Replaces inline onclick attributes so the CSP can forbid inline scripts.
document.addEventListener('click',e=>{const el=e.target.closest('[data-jf-action]');if(!el)return;
const a=el.dataset.jfAction,smooth={behavior:'smooth',block:'start'};
if(a==='top')window.scrollTo({top:0,behavior:'smooth'});
else if(a==='focus-account')document.getElementById('account')?.focus();
else if(a==='open-pa')window.openPA?.();
else if(a==='reload')location.reload();
else if(a==='skip'){e.preventDefault();const app=document.getElementById('app');if(app){if(!app.hasAttribute('tabindex'))app.setAttribute('tabindex','-1');app.focus();app.scrollIntoView();}}
else if(a==='scroll-calendar')document.querySelector('.calendar-card')?.scrollIntoView(smooth);
else if(a==='landing-signup'||a==='landing-login')jfOpenAuth(a==='landing-signup'?'signup':'login',el);
else if(a==='landing-close')jfCloseAuth();
else if(a==='scroll-section4')document.querySelector('.section:nth-of-type(4)')?.scrollIntoView(smooth);});

/* Sign-in dialog of the public presentation: hidden until the visitor asks for it. */
let jfAuthOpener=null;
function jfOpenAuth(mode,opener){const g=document.getElementById('ftCloudGate');if(!g)return;jfAuthOpener=opener||null;document.getElementById(mode==='signup'?'ftSignupTab':'ftLoginTab')?.click();g.classList.add('jf-auth-open');setTimeout(()=>document.getElementById('ftAuthEmail')?.focus(),60);}
function jfCloseAuth(){const g=document.getElementById('ftCloudGate');if(!g||!g.classList.contains('jf-auth-open'))return;g.classList.remove('jf-auth-open');jfAuthOpener?.focus?.();jfAuthOpener=null;}
document.addEventListener('keydown',e=>{if(e.key==='Escape')jfCloseAuth();});
// Coming back from Google, an email link or a password reset: show the dialog with its message right away.
if(/(error|type=|access_token|code=)/.test(location.hash+location.search))document.getElementById('ftCloudGate')?.classList.add('jf-auth-open');
// Any error shown by the sign-in flow (for example a failed Google return) opens the dialog so it is seen.
(()=>{const m=document.getElementById('ftAuthMsg');if(!m)return;new MutationObserver(()=>{const g=document.getElementById('ftCloudGate');if(m.classList.contains('err')&&g?.dataset.state==='login')g.classList.add('jf-auth-open');}).observe(m,{attributes:true,attributeFilter:['class'],childList:true});})();
// Safety net: if landing.css never arrives, still show the access screen after 3 s.
setTimeout(()=>{const g=document.getElementById('ftCloudGate');if(g&&getComputedStyle(g).visibility==='hidden')g.style.visibility='visible';},3000);
// Legal links open the policy in the app's language.
(()=>{const P={es:['privacidad','condiciones'],en:['privacy','terms'],'pt-BR':['privacidade','termos']};
const fix=()=>{const l=document.documentElement.lang||'es';const k=P[l]?l:(l.startsWith('pt')?'pt-BR':l.startsWith('es')?'es':'en');
document.querySelectorAll('a[href$="privacidad.html"],a[href$="privacy.html"],a[href$="privacidade.html"]').forEach(a=>a.setAttribute('href','./'+P[k][0]+'.html'));
document.querySelectorAll('a[href$="condiciones.html"],a[href$="terms.html"],a[href$="termos.html"]').forEach(a=>a.setAttribute('href','./'+P[k][1]+'.html'));};
fix();window.addEventListener('jfLanguageChanged',fix);})();
