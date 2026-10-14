/* JourFund insights: pure calculations for statistics, consistency, tilt guard, costs, exposure and checklist.
   Never mutates accounts. Shared by the browser (window.JourFundInsights) and node tests. */
(function(root){
'use strict';
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const round=n=>Math.round(n*100)/100;
const WEEKDAYS=['mon','tue','wed','thu','fri','sat','sun'];

/* ---------- Trade time and sessions ---------- */
const TIME=/^([01]\d|2[0-3]):[0-5]\d$/;
function validTime(t){return t==null||TIME.test(t);}
function validOffset(o){return o==null||Number.isInteger(o)&&o>=-840&&o<=840;}
// Sessions by entry hour in UTC: Asia 21–07, London 07–12, New York 12–21.
function session(t){
 if(!t||!TIME.test(t.time||''))return null;
 const [h,m]=t.time.split(':').map(Number),offset=Number.isInteger(t.tzOffset)?t.tzOffset:0;
 const utc=((h*60+m+offset)%1440+1440)%1440/60;
 return utc>=7&&utc<12?'london':utc>=12&&utc<21?'newyork':'asia';
}
function weekday(date){const d=new Date(String(date)+'T12:00:00Z');return Number.isNaN(d.getTime())?null:WEEKDAYS[(d.getUTCDay()+6)%7];}

/* ---------- Order and buckets ---------- */
function ordered(list){return [...list].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.time||'').localeCompare(String(b.time||''))||num(a.recordedAt)-num(b.recordedAt));}
function bucket(list,keyOf,keys){
 const map=new Map((keys||[]).map(k=>[k,{key:k,pnl:0,count:0,wins:0,losses:0}]));
 for(const t of list){const k=keyOf(t);if(k==null)continue;if(!map.has(k))map.set(k,{key:k,pnl:0,count:0,wins:0,losses:0});const b=map.get(k),p=num(t.pnl);b.pnl+=p;b.count++;if(p>0&&t.result!=='BE')b.wins++;else if(p<0)b.losses++;}
 return [...map.values()].map(b=>({...b,pnl:round(b.pnl),winrate:b.wins+b.losses?b.wins/(b.wins+b.losses)*100:null}));
}
function breakdown(list){
 const timed=list.filter(t=>session(t));
 const assets=bucket(list,t=>String(t.asset||'').trim()||null).sort((a,b)=>Math.abs(b.pnl)-Math.abs(a.pnl)||b.count-a.count);
 return {weekday:bucket(list,t=>weekday(t.date),WEEKDAYS.slice(0,5)),
  session:bucket(timed,session,['asia','london','newyork']),asset:assets,timed:timed.length,total:list.length};
}
// The most useful sentence for the trader: a clearly losing weekday, session or asset (at least 3 trades).
function highlight(b){
 const worst=(rows,kind)=>rows.filter(r=>r.count>=3&&r.pnl<0).map(r=>({kind,...r})).sort((x,y)=>x.pnl-y.pnl)[0]||null;
 return [worst(b.weekday,'weekday'),worst(b.session,'session'),worst(b.asset,'asset')].filter(Boolean).sort((x,y)=>x.pnl-y.pnl)[0]||null;
}

/* ---------- Quality metrics ---------- */
function metrics(list,capital){
 const rows=ordered(list);let gross=0,loss=0,wins=0,losses=0,winSum=0,lossSum=0,run=0,best=0,worst=0,equity=0,peak=0,dd=0,rSum=0,rCount=0;
 for(const t of rows){const p=num(t.pnl);
  if(p>0&&t.result!=='BE'){wins++;winSum+=p;gross+=p;run=run>0?run+1:1;}else if(p<0){losses++;lossSum+=p;loss-=p;run=run<0?run-1:-1;}else run=0;
  best=Math.max(best,run);worst=Math.min(worst,run);
  equity+=p;peak=Math.max(peak,equity);dd=Math.min(dd,equity-peak);
  const risk=Number(t.risk),base=Number(t.multiCapital??capital);if(Number.isFinite(risk)&&risk>0&&risk<=100&&base>0){rSum+=p/(base*risk/100);rCount++;}}
 const n=rows.length;
 return {total:n,expectancy:n?round(rows.reduce((s,t)=>s+num(t.pnl),0)/n):null,avgWin:wins?round(winSum/wins):null,avgLoss:losses?round(lossSum/losses):null,
  profitFactor:loss>0?gross/loss:gross>0?Infinity:null,maxWinStreak:best,maxLossStreak:-worst,avgR:rCount?rSum/rCount:null,maxDrawdown:round(dd)};
}

/* ---------- Consistency (best day / net profit) ---------- */
function days(list){const g={};for(const t of list){g[t.date]=(g[t.date]||0)+num(t.pnl);}return g;}
function consistency(list,limitPct){
 const g=days(list),values=Object.entries(g),profit=round(values.reduce((s,[,v])=>s+v,0));
 const best=values.filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1])[0]||null,bestDay=best?round(best[1]):0;
 const share=profit>0&&bestDay>0?bestDay/profit*100:null,limit=Number(limitPct)>0?Number(limitPct):null;
 const needed=limit&&bestDay>0?Math.max(0,round(bestDay/(limit/100)-profit)):null;
 return {profit,bestDay,bestDate:best?best[0]:null,share,limit,ok:limit==null||share==null||share<=limit+1e-8,needed,tradingDays:values.length};
}

// grouped: {date: pnl}. How much more today can make before today alone breaks the limit (null = no cap or no profit yet).
function consistencyToday(grouped,limitPct,today){
 const L=Number(limitPct)/100;if(!(L>0&&L<1))return null;const now=num(grouped?.[today]),others=round(Object.entries(grouped||{}).filter(([d])=>d!==today).reduce((s,[,v])=>s+num(v),0));
 if(others<=0)return null;return Math.max(0,round(L*others/(1-L)-now));
}
function validConsistencyPct(v){return v==null||Number.isFinite(v)&&v>=10&&v<=90;}
/* ---------- Tilt guard ---------- */
const TILT_DEFAULT={enabled:false,dailyPct:50,losses:3,cooldownMin:0};
function validTilt(x){return x==null||typeof x==='object'&&!Array.isArray(x)&&typeof x.enabled==='boolean'&&[x.dailyPct,x.losses,x.cooldownMin].every(v=>v==null||Number.isFinite(v))&&(x.dailyPct==null||x.dailyPct>=10&&x.dailyPct<=100)&&(x.losses==null||Number.isInteger(x.losses)&&x.losses>=0&&x.losses<=20)&&(x.cooldownMin==null||Number.isInteger(x.cooldownMin)&&x.cooldownMin>=0&&x.cooldownMin<=240)&&Object.keys(x).every(k=>['enabled','dailyPct','losses','cooldownMin'].includes(k));}
// todayTrades: trades of the account's current day; dailyLimit: firm daily loss in money; now: ms.
function tilt(settings,todayTrades,dailyLimit,now){
 const s={...TILT_DEFAULT,...(settings||{})};if(!s.enabled)return {active:false,reason:null,settings:s};
 const rows=ordered(todayTrades),lost=Math.max(0,-rows.reduce((n,t)=>n+num(t.pnl),0)),cap=dailyLimit>0?dailyLimit*s.dailyPct/100:null;
 let streak=0;for(const t of rows){if(num(t.pnl)<0)streak++;else if(num(t.pnl)>0)streak=0;}
 const last=[...rows].reverse().find(t=>num(t.pnl)<0),lastAt=num(last?.recordedAt);
 const usedPct=dailyLimit>0?lost/dailyLimit*100:null;
 if(cap!=null&&lost>=cap-1e-8)return {active:true,reason:'daily',lost:round(lost),cap:round(cap),usedPct,streak,settings:s};
 if(s.losses>0&&streak>=s.losses)return {active:true,reason:'streak',lost:round(lost),cap:cap==null?null:round(cap),usedPct,streak,settings:s};
 if(s.cooldownMin>0&&last&&lastAt&&now-lastAt<s.cooldownMin*60000)return {active:true,reason:'cooldown',until:lastAt+s.cooldownMin*60000,lost:round(lost),cap:cap==null?null:round(cap),usedPct,streak,settings:s};
 return {active:false,reason:null,lost:round(lost),cap:cap==null?null:round(cap),usedPct,streak,settings:s};
}

/* ---------- Funding costs ---------- */
const COST_TYPES=['challenge','reset','activation','other'];
function validCost(c){return !!c&&typeof c==='object'&&!Array.isArray(c)&&typeof c.id==='string'&&/^[\w-]{1,80}$/.test(c.id)&&COST_TYPES.includes(c.type)&&/^\d{4}-\d{2}-\d{2}$/.test(String(c.date))&&Number.isFinite(c.amount)&&c.amount>=0&&c.amount<=1e7&&(c.note==null||typeof c.note==='string'&&c.note.length<=300)&&Object.keys(c).every(k=>['id','type','date','amount','note'].includes(k));}
function validCosts(list){return list==null||Array.isArray(list)&&list.length<=500&&list.every(validCost)&&new Set(list.map(c=>c.id)).size===list.length;}
// withdrawalsOf(a) returns the trader's received amounts (net payouts) for the account.
function costs(accounts,withdrawalsOf){
 const firms=new Map(),moves=[];let spent=0,received=0;
 for(const a of accounts||[]){
  const firm=String(a.firm||'—'),f=firms.get(firm)||{firm,spent:0,received:0,accounts:0,passed:0,failed:0};f.accounts++;
  if(a.status==='Funded'||a.status==='Completed')f.passed++;else if(a.status==='Failed')f.failed++;
  for(const c of a.costs||[]){f.spent+=num(c.amount);spent+=num(c.amount);moves.push({kind:'cost',type:c.type,date:c.date,amount:-num(c.amount),account:a,id:c.id,note:c.note||''});}
  for(const w of withdrawalsOf(a)||[]){f.received+=num(w.amount);received+=num(w.amount);moves.push({kind:'payout',date:w.date,amount:num(w.amount),account:a,id:w.id});}
  firms.set(firm,f);
 }
 const net=round(received-spent);
 return {spent:round(spent),received:round(received),net,roi:spent>0?net/spent*100:null,
  firms:[...firms.values()].filter(f=>f.spent||f.received||f.passed||f.failed).map(f=>({...f,spent:round(f.spent),received:round(f.received)})).sort((a,b)=>b.spent+b.received-(a.spent+a.received)),
  moves:moves.sort((a,b)=>String(b.date).localeCompare(String(a.date)))};
}

/* ---------- Open-risk exposure by currency ---------- */
const PAIR=/^([A-Z]{3})([A-Z]{3})$/;
const ALIAS={XAUUSD:['XAU','USD'],XAGUSD:['XAG','USD'],NAS100:['NAS','USD'],SP500:['SPX','USD'],US30:['DJI','USD'],GER40:['DAX','EUR'],UK100:['FTSE','GBP'],BTCUSD:['BTC','USD'],ETHUSD:['ETH','USD'],USOIL:['OIL','USD']};
function legs(symbol){const s=String(symbol||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(ALIAS[s])return ALIAS[s];const m=PAIR.exec(s.slice(0,6));return m?[m[1],m[2]]:null;}
// positions: [{symbol, side:'buy'|'sell', risk}] → total risk and the currencies several positions bet the same way on.
function exposure(positions,remaining){
 const total=round(positions.reduce((s,p)=>s+Math.max(0,num(p.risk)),0)),dir=new Map();
 for(const p of positions){const l=legs(p.symbol);if(!l)continue;const sign=p.side==='sell'?-1:1;[[l[0],sign],[l[1],-sign]].forEach(([cur,s])=>{const d=dir.get(cur)||{cur,long:0,short:0,risk:0,symbols:[]};if(s>0)d.long++;else d.short++;d.risk+=Math.max(0,num(p.risk));d.symbols.push(p.symbol);dir.set(cur,d);});}
 const clusters=[...dir.values()].filter(d=>d.long>=2&&d.short===0||d.short>=2&&d.long===0).map(d=>({currency:d.cur,side:d.long?'long':'short',count:d.long||d.short,risk:round(d.risk),symbols:[...new Set(d.symbols)]})).sort((a,b)=>b.count-a.count||b.risk-a.risk);
 return {total,remaining:Number.isFinite(remaining)?round(remaining):null,usedPct:remaining>0?total/remaining*100:null,over:remaining!=null&&total>remaining+1e-8,clusters};
}

/* ---------- Pre-trade checklist ---------- */
function validChecklist(c){return c==null||typeof c==='object'&&!Array.isArray(c)&&typeof c.enabled==='boolean'&&Array.isArray(c.items)&&c.items.length<=12&&c.items.every(i=>i&&typeof i==='object'&&typeof i.id==='string'&&/^[\w-]{1,40}$/.test(i.id)&&typeof i.text==='string'&&i.text.trim().length>0&&i.text.length<=80&&Object.keys(i).every(k=>['id','text'].includes(k)))&&new Set(c.items.map(i=>i.id)).size===c.items.length&&Object.keys(c).every(k=>['enabled','items'].includes(k));}
function validTradeChecklist(c){return c==null||typeof c==='object'&&!Array.isArray(c)&&Number.isInteger(c.total)&&c.total>=1&&c.total<=12&&Array.isArray(c.done)&&c.done.length<=c.total&&c.done.every(x=>typeof x==='string'&&/^[\w-]{1,40}$/.test(x))&&Array.isArray(c.missed)&&c.missed.length<=c.total&&c.missed.every(x=>typeof x==='string'&&x.length<=80)&&Object.keys(c).every(k=>['total','done','missed'].includes(k));}
function checklistStats(list){
 const rows=list.filter(t=>t.checklist&&t.checklist.total>0),full=rows.filter(t=>t.checklist.done.length>=t.checklist.total),partial=rows.filter(t=>t.checklist.done.length<t.checklist.total);
 const wr=ts=>{const w=ts.filter(t=>num(t.pnl)>0&&t.result!=='BE').length,l=ts.filter(t=>num(t.pnl)<0).length;return w+l?w/(w+l)*100:null;};
 const missed=new Map();for(const t of partial)for(const m of t.checklist.missed||[])missed.set(m,(missed.get(m)||0)+1);
 const top=[...missed.entries()].sort((a,b)=>b[1]-a[1])[0]||null;
 return {checked:rows.length,compliance:rows.length?full.length/rows.length*100:null,winFull:wr(full),winPartial:wr(partial),pnlFull:round(full.reduce((s,t)=>s+num(t.pnl),0)),pnlPartial:round(partial.reduce((s,t)=>s+num(t.pnl),0)),mostMissed:top?{text:top[0],count:top[1]}:null};
}

root.JourFundInsights={WEEKDAYS,validTime,validOffset,session,weekday,ordered,breakdown,highlight,metrics,consistency,consistencyToday,validConsistencyPct,TILT_DEFAULT,validTilt,tilt,COST_TYPES,validCost,validCosts,costs,legs,exposure,validChecklist,validTradeChecklist,checklistStats};
if(typeof module!=='undefined')module.exports=root.JourFundInsights;
})(typeof globalThis!=='undefined'?globalThis:window);
