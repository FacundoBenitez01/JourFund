/* Review metadata never changes money, dates, risk or trade outcomes. */
(function(root){'use strict';
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
function name(x){return String(x??'').trim().replace(/\s+/g,' ');}
function valid(r){return object(r)&&r.version===1&&typeof r.strategy==='string'&&r.strategy.length<=60&&['yes','partial','no',null].includes(r.followed)&&Array.isArray(r.errors)&&r.errors.length<=10&&r.errors.every(x=>typeof x==='string'&&name(x)&&x.length<=60)&&new Set(r.errors).size===r.errors.length&&typeof r.note==='string'&&r.note.length<=1000&&Number.isFinite(r.reviewedAt)&&r.reviewedAt>0;}
function normalize(r){const out={version:1,strategy:name(r.strategy),followed:r.followed||null,errors:[...new Set((r.errors||[]).map(name).filter(Boolean))],note:String(r.note||'').trim(),reviewedAt:r.reviewedAt||Date.now()};if(!valid(out))throw Error('Revisión inválida.');return out;}
function pending(t){return !valid(t.review);}
function decisions(rows){const map=new Map();for(const r of rows){const key=r.t.multiBatchId?'batch:'+r.t.multiBatchId:'single:'+r.a.id+':'+r.slot+':'+r.index;let b=map.get(key);if(!b){b={key,rows:[],pnl:0};map.set(key,b);}b.rows.push(r);b.pnl+=Number(r.t.pnl)||0;}return [...map.values()];}
function summary(rows){const ds=decisions(rows);let wins=0,losses=0,bes=0;for(const d of ds){if(d.rows.every(r=>r.t.result==='BE')||Math.abs(d.pnl)<.005)bes++;else if(d.pnl>0)wins++;else losses++;}return {records:rows.length,total:ds.length,pnl:rows.reduce((n,r)=>n+(Number(r.t.pnl)||0),0),wins,losses,bes,winrate:wins+losses?wins/(wins+losses)*100:null};}
function filter(rows,{month='all',strategy='',error='',onlyPending=false}={}){return rows.filter(r=>(month==='all'||r.t.date?.slice(0,7)===month)&&(!strategy||(r.t.review?.strategy||'')===strategy)&&(!error||r.t.review?.errors?.includes(error))&&(!onlyPending||pending(r.t)));}
function buckets(rows,type){const map=new Map();for(const r of rows){const keys=type==='strategy'?[r.t.review?.strategy||'']:r.t.review?.errors||[];for(const key of keys){if(!map.has(key))map.set(key,[]);map.get(key).push(r);}}return [...map].map(([key,list])=>({key,...summary(list)})).sort((a,b)=>b.total-a.total||a.key.localeCompare(b.key));}
const api={name,valid,normalize,pending,decisions,summary,filter,buckets};root.JourFundReviewEngine=api;if(typeof module==='object')module.exports=api;
})(globalThis);
