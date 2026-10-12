// Run with Playwright installed; CHROMIUM_PATH optionally selects a local browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--no-zygote','--disable-dev-shm-usage','--disable-gpu']});
 try{for(const [width,height] of [[390,844],[1440,1000],[320,740],[844,390]]){
  const p=await browser.newPage({viewport:{width,height},locale:'es-PY',reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('jourfund_login_language','es');Object.defineProperty(navigator,'serviceWorker',{value:{ready:Promise.resolve({pushManager:{getSubscription:async()=>null}}),register:async()=>({}),addEventListener:()=>{}}});Object.defineProperty(window,'supabase',{get:()=>({createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})}})}),set:()=>{}});});
  await p.route('http://127.0.0.1:8764/**',r=>{const pathname=new URL(r.request().url()).pathname,file=path.join(ROOT,pathname==='/'?'index.html':pathname);const ext=path.extname(file);return r.fulfill({status:fs.existsSync(file)?200:404,body:fs.existsSync(file)?fs.readFileSync(file):'',contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'})[ext]||'application/octet-stream'});});
  await p.route('https://**/*',r=>r.fulfill({body:''}));
  await p.goto('http://127.0.0.1:8764/');
  await p.waitForFunction(()=>document.getElementById('ftCloudGate').dataset.state==='login');
  await p.waitForFunction(()=>!document.getElementById('ft57Splash'));
  assert((await p.locator('#jfLandingTitle').innerText()).includes('Bajo control.'));
  assert(await p.locator('#jfHeroPanel').isVisible());
  assert(await p.locator('#ftCloudGate').evaluate(g=>g.scrollWidth<=g.clientWidth+1),'No landing horizontal overflow at '+width);
  if(width<=700){const a=await p.locator('.jf-hero-copy').boundingBox(),b=await p.locator('.jf-hero-visual').boundingBox();assert(b.y>=a.y+a.height,'Mobile hero is stacked');}
  assert.equal(await p.locator('[data-jf-calc-out=lots]').innerText(),'0,15');
  await p.locator('#jfCalcRisk').press('ArrowRight');
  assert.equal(await p.locator('[data-jf-calc-out=lots]').innerText(),'0,18');
  await p.locator('[data-jf-inst=EURUSD]').click();assert.equal(await p.locator('[data-jf-calc-out=lots]').innerText(),'0,93');
  await p.locator('[data-jf-inst=XAUUSD]').click();assert.equal(await p.locator('[data-jf-calc-out=lots]').innerText(),'0,18');
  await p.locator('.jf-drawdown-details>summary').click();await p.locator('[data-jf-dd="0"]').click();assert.equal(await p.locator('[data-jf-dd-out=margin]').innerText(),'$2.300');
  await p.locator('.jf-drawdown-details>summary').click();
  await p.locator('#jfLanding [data-jf-action=landing-signup]').click();assert(await p.locator('#ftCloudGate').evaluate(g=>g.classList.contains('jf-auth-open')));assert.equal(await p.locator('#ftAuthSubmit').innerText(),'Crear cuenta');
  await p.locator('[data-jf-action=landing-close]').filter({visible:true}).last().click();assert.equal(await p.locator('#ftAuthForm').isVisible(),false);
  await p.locator('.jf-landing-nav [data-jf-action=landing-login]').click();assert.equal(await p.locator('#ftAuthSubmit').innerText(),'Entrar');await p.locator('.jf-auth-close').click();
  for(const [lang,word]of [['en','Under control.'],['pt-BR','Sob controle.']]){await p.evaluate(l=>{localStorage.setItem('jourfund_login_language',l);JourFundI18n.refresh();},lang);assert((await p.locator('#jfLandingTitle').innerText()).includes(word));assert(await p.locator('#ftCloudGate').evaluate(g=>g.scrollWidth<=g.clientWidth+1));}
  assert.deepEqual(errors,[]);
  if(process.env.SCREENSHOT_DIR){await p.evaluate(()=>{localStorage.setItem('jourfund_login_language','es');JourFundI18n.refresh();document.getElementById('ftCloudGate').scrollTop=0;});await p.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'landing-'+width+'.png')});}
  console.log('PASS landing layout, calculator, drawdown, auth dialogs, translations and no page errors:',width);await p.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
