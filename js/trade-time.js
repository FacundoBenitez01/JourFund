/* Optional entry time on the individual trade form ("Hora de entrada"), used for the per-session statistics.
   Stored as local "HH:MM" plus the device's UTC offset for that date (tzOffset, minutes as in getTimezoneOffset). */
(function(){'use strict';
const $=id=>document.getElementById(id),F=window.FT73,date=$('date');if(!F||!date||$('jfTradeTime'))return;
const field=document.createElement('div');field.className='field';
field.innerHTML='<label for="jfTradeTime">Hora de entrada (opcional)</label><input id="jfTradeTime" type="time" step="60">';
date.closest('.field').after(field);
const input=$('jfTradeTime');
const offset=(d,t)=>{const x=new Date(d+'T'+t+':00');return Number.isNaN(x.getTime())?new Date().getTimezoneOffset():x.getTimezoneOffset();};
const read=F.readIndividual;F.readIndividual=function(){const out=read.apply(this,arguments),t=input.value;
 if(/^([01]\d|2[0-3]):[0-5]\d$/.test(t)){out.time=t;out.tzOffset=offset($('date').value,t);}else{out.time=undefined;out.tzOffset=undefined;}return out;};
const load=F.load;F.load=function(record={}){const out=load.apply(this,arguments);place();input.value=record&&/^\d\d:\d\d$/.test(record.time||'')?record.time:'';return out;};
// The redesigned form (trade-form.js) re-orders the fields: keep the time right after the date every time it opens.
const place=()=>{const d=$('date').closest('.field');if(d&&d.nextElementSibling!==field)d.after(field);};
const open=window.openModal;if(typeof open==='function')window.openModal=function(){input.value='';place();return open.apply(this,arguments);};
place();
})();
