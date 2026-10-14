const test=require('node:test'),assert=require('node:assert/strict'),I=require('../insights-engine.js');
const T=(date,pnl,extra={})=>({date,pnl,result:pnl>0?'Win':pnl<0?'Loss':'BE',asset:'EURUSD',risk:1,...extra});
test('sessions use entry time converted to UTC',()=>{
 assert.equal(I.session({time:'04:30',tzOffset:180}),'london'); // 04:30 Paraguay (UTC-3) = 07:30 UTC
 assert.equal(I.session({time:'10:00',tzOffset:180}),'newyork');
 assert.equal(I.session({time:'20:00',tzOffset:180}),'asia');
 assert.equal(I.session({date:'2026-10-01'}),null);
 assert.equal(I.weekday('2026-10-16'),'fri');});
test('breakdown buckets weekday, session and asset; highlight picks the worst losing group with 3+ trades',()=>{
 const list=[T('2026-10-16',-100),T('2026-10-16',-50),T('2026-10-09',-40),T('2026-10-13',200,{time:'05:00',tzOffset:180}),T('2026-10-13',50,{asset:'XAUUSD'})];
 const b=I.breakdown(list),fri=b.weekday.find(r=>r.key==='fri');
 assert.equal(fri.pnl,-190);assert.equal(fri.count,3);assert.equal(b.timed,1);assert.equal(b.session.find(r=>r.key==='london').pnl,200);
 assert.equal(b.weekday.length,5);assert.deepEqual(I.highlight(b),{kind:'weekday',...fri});});
test('metrics: expectancy, averages, streaks, R and drawdown',()=>{
 const m=I.metrics([T('2026-10-01',100),T('2026-10-02',100),T('2026-10-03',-50),T('2026-10-04',-50),T('2026-10-05',-50),T('2026-10-06',0)],10000);
 assert.equal(m.expectancy,8.33);assert.equal(m.avgWin,100);assert.equal(m.avgLoss,-50);assert.equal(m.maxWinStreak,2);assert.equal(m.maxLossStreak,3);assert.equal(m.maxDrawdown,-150);assert.equal(m.profitFactor,200/150);assert.equal(Math.round(m.avgR*100)/100,0.08);});
test('consistency share and amount needed to comply',()=>{
 const c=I.consistency([T('2026-10-13',480),T('2026-10-12',-140),T('2026-10-05',195),T('2026-10-06',515)],40);
 assert.equal(c.profit,1050);assert.equal(c.bestDay,515);assert.equal(Math.round(c.share),49);assert.equal(c.ok,false);assert.equal(c.needed,237.5);
 assert.equal(I.consistency([T('2026-10-13',100),T('2026-10-14',100),T('2026-10-15',100)],40).ok,true);
 assert.equal(I.consistency([T('2026-10-13',-10)],40).share,null);});
test('tilt guard: daily cap, losing streak and cooldown',()=>{
 const s={enabled:true,dailyPct:50,losses:3,cooldownMin:15},now=Date.now();
 assert.equal(I.tilt(s,[T('d',-200),T('d',-180)],750,now).reason,'daily');
 assert.equal(I.tilt(s,[T('d',-10,{recordedAt:1}),T('d',-10,{recordedAt:2}),T('d',-10,{recordedAt:3})],750,now).reason,'streak');
 assert.equal(I.tilt(s,[T('d',-10,{recordedAt:now-60000})],750,now).reason,'cooldown');
 assert.equal(I.tilt(s,[T('d',-10,{recordedAt:now-3600000})],750,now).active,false);
 assert.equal(I.tilt({...s,enabled:false},[T('d',-999)],750,now).active,false);
 assert(I.validTilt(s));assert(!I.validTilt({...s,dailyPct:5}));assert(!I.validTilt({...s,extra:1}));});
test('costs summary: spent, received, net, ROI and per firm',()=>{
 const accts=[{firm:'FTMO',status:'Funded',costs:[{id:'c1',type:'challenge',date:'2026-10-01',amount:250}]},{firm:'FundingPips',status:'Failed',costs:[{id:'c2',type:'challenge',date:'2026-10-02',amount:39},{id:'c3',type:'reset',date:'2026-10-05',amount:30}]}];
 const r=I.costs(accts,a=>a.firm==='FTMO'?[{id:'w1',date:'2026-10-10',amount:800}]:[]);
 assert.deepEqual([r.spent,r.received,r.net,Math.round(r.roi)],[319,800,481,151]);assert.equal(r.firms[0].firm,'FTMO');assert.equal(r.firms[1].failed,1);assert.equal(r.moves[0].kind,'payout');
 assert(I.validCosts(accts[1].costs));assert(!I.validCosts([{id:'x',type:'bribe',date:'2026-10-01',amount:1}]));});
test('exposure groups positions betting the same way on a currency',()=>{
 const e=I.exposure([{symbol:'XAUUSD',side:'buy',risk:150},{symbol:'EURUSD',side:'buy',risk:150},{symbol:'USDJPY',side:'sell',risk:150}],750);
 assert.equal(e.total,450);assert.equal(e.usedPct,60);assert.equal(e.clusters[0].currency,'USD');assert.equal(e.clusters[0].side,'short');assert.equal(e.clusters[0].count,3);
 assert.equal(I.exposure([{symbol:'EURUSD',side:'buy',risk:100},{symbol:'USDJPY',side:'buy',risk:100}],150).over,true);});
test('checklist stats and validation',()=>{
 const c={enabled:true,items:[{id:'a',text:'Tendencia'},{id:'b',text:'Noticias'}]};assert(I.validChecklist(c));assert(!I.validChecklist({...c,items:[{id:'a',text:''}]}));
 const ts=[T('d',100,{checklist:{total:2,done:['a','b'],missed:[]}}),T('d',-50,{checklist:{total:2,done:['a'],missed:['Noticias']}}),T('d',-50,{checklist:{total:2,done:['a'],missed:['Noticias']}}),T('d',80)];
 const s=I.checklistStats(ts);assert.equal(s.checked,3);assert.equal(Math.round(s.compliance),33);assert.equal(s.winFull,100);assert.equal(s.winPartial,0);assert.deepEqual(s.mostMissed,{text:'Noticias',count:2});
 assert(I.validTradeChecklist(ts[1].checklist));assert(!I.validTradeChecklist({total:2,done:['a','b','c'],missed:[]}));});
