/* Minimal XLSX and CSV writers (no dependencies). XLSX = stored (uncompressed) ZIP with inline-string sheets.
   Shared by the browser (window.JourFundXlsx) and node tests. */
(function(root){
'use strict';
const enc=s=>new TextEncoder().encode(s);
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(bytes){let c=0xFFFFFFFF;for(let i=0;i<bytes.length;i++)c=CRC[(c^bytes[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zip(files){
 const parts=[],central=[];let offset=0;
 const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
 for(const f of files){
  const name=enc(f.name),data=typeof f.data==='string'?enc(f.data):f.data,crc=crc32(data);
  const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0)]);
  parts.push(local,name,data);
  central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]),name);
  offset+=local.length+name.length+data.length;
 }
 const size=central.reduce((n,p)=>n+p.length,0);
 const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(size),...u32(offset),...u16(0)]);
 const all=[...parts,...central,end],out=new Uint8Array(all.reduce((n,p)=>n+p.length,0));let at=0;for(const p of all){out.set(p,at);at+=p.length;}return out;
}
// Strip characters XML 1.0 forbids; keep text intact otherwise.
const xml=s=>String(s).replace(/[^\x09\x0A\x0D\x20-퟿-�]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function col(i){let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26);}return s;}
function sheetXml(rows){
 const widths=[];rows.forEach(r=>r.forEach((v,i)=>{widths[i]=Math.min(60,Math.max(widths[i]||8,String(v??'').length+2));}));
 const cols=widths.length?'<cols>'+widths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+'</cols>':'';
 const body=rows.map((r,ri)=>'<row r="'+(ri+1)+'">'+r.map((v,ci)=>{const ref=col(ci)+(ri+1),style=ri===0?' s="1"':'';
  if(v==null||v==='')return '<c r="'+ref+'"'+style+'/>';
  if(typeof v==='number'&&Number.isFinite(v))return '<c r="'+ref+'"'+style+'><v>'+v+'</v></c>';
  return '<c r="'+ref+'"'+style+' t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is></c>';}).join('')+'</row>').join('');
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+cols+'<sheetData>'+body+'</sheetData></worksheet>';
}
// sheets: [{name, rows:[[header...],[...],...]}] → Uint8Array of a valid .xlsx
function xlsx(sheets){
 const safe=sheets.map((s,i)=>({...s,name:String(s.name||('Sheet'+(i+1))).replace(/[\\/?*[\]:]/g,' ').slice(0,31)}));
 const files=[
  {name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+safe.map((s,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+'</Types>'},
  {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
  {name:'xl/workbook.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+safe.map((s,i)=>'<sheet name="'+xml(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets></workbook>'},
  {name:'xl/_rels/workbook.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+safe.map((s,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+'<Relationship Id="rId'+(safe.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
  {name:'xl/styles.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>'},
  ...safe.map((s,i)=>({name:'xl/worksheets/sheet'+(i+1)+'.xml',data:sheetXml(s.rows)}))
 ];
 return zip(files);
}
// CSV for Excel: BOM, the locale's list separator and decimal mark, formula-looking text neutralised.
function csv(rows,{separator=',',decimal='.'}={}){
 const cell=v=>{if(v==null)return '';if(typeof v==='number'&&Number.isFinite(v))return String(v).replace('.',decimal);let s=String(v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return /["\n\r]|[;,]/.test(s)||s.includes(separator)?'"'+s.replace(/"/g,'""')+'"':s;};
 return '﻿'+rows.map(r=>r.map(cell).join(separator)).join('\r\n')+'\r\n';
}
root.JourFundXlsx={crc32,zip,xlsx,csv,col};
if(typeof module!=='undefined')module.exports=root.JourFundXlsx;
})(typeof globalThis!=='undefined'?globalThis:window);
