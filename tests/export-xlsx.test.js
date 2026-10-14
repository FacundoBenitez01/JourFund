const test=require('node:test'),assert=require('node:assert/strict'),X=require('../export-xlsx.js'),fs=require('fs'),os=require('os'),path=require('path'),{execFileSync}=require('child_process');
test('crc32 and column names',()=>{assert.equal(X.crc32(new TextEncoder().encode('hello')),0x3610a686);assert.equal(X.col(0),'A');assert.equal(X.col(25),'Z');assert.equal(X.col(26),'AA');assert.equal(X.col(701),'ZZ');});
test('csv uses BOM, separator, decimal mark and neutralises formulas',()=>{const out=X.csv([['Activo','P&L','Nota'],['EURUSD',-12.5,'=HYPERLINK("x")'],['GBPUSD',3,'a;b']],{separator:';',decimal:','});
 assert(out.startsWith('﻿'));assert(out.includes('EURUSD;-12,5;"\'=HYPERLINK(""x"")"'));assert(out.includes('GBPUSD;3;"a;b"'));});
test('xlsx opens as a valid workbook with sheets, numbers and unicode',()=>{
 const bytes=X.xlsx([{name:'Operaciones',rows:[['Fecha','Activo','P&L','Nota'],['2026-10-13','XAUUSD',-150,'Ansioso · <test> & "quote"'],['2026-10-14','NAS100',240.5,'']]},{name:'Retiros/2026',rows:[['Fecha','Monto'],['2026-10-10',870]]}]);
 const file=path.join(os.tmpdir(),'jf-test-'+process.pid+'.xlsx');fs.writeFileSync(file,bytes);
 let out;try{out=execFileSync('python3',['-c','import sys,zipfile,openpyxl;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;wb=openpyxl.load_workbook(sys.argv[1]);print(wb.sheetnames);ws=wb["Operaciones"];print([c.value for c in ws[2]]);print(ws["C3"].value,type(ws["C3"].value).__name__);print(wb.worksheets[1]["B2"].value)',file]).toString();}
 catch(e){if(/No module named/.test(String(e.stderr||'')))return;throw e;}finally{fs.rmSync(file,{force:true});}
 assert(out.includes("['Operaciones', 'Retiros 2026']"));assert(out.includes("['2026-10-13', 'XAUUSD', -150, 'Ansioso · <test> & \"quote\"']"));assert(out.includes('240.5 float'));assert(out.includes('870'));});
