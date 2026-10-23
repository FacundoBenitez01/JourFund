/* JourFund Wrapped (v165): 3D animated stories of the user's last completed week for the active account.
   Data comes from the same trades and rules the app already uses (FTRules). Slides without data are skipped.
   Ready every Sunday. Opens from a banner on Inicio; nothing is saved to the cloud (only a "seen" flag in localStorage). */
(function () {
  'use strict';
  const R = window.FTRules;
  if (!R || !document.body) return;

  /* ---------- language ---------- */
  const lang = () => ['en', 'pt-BR'].includes(window.JourFundI18n?.language) ? window.JourFundI18n.language : 'es';
  const loc = () => window.jfLocale?.() || 'es-AR';
  const S = {
    es: {
      banner: 'Tu semana ya está lista', bannerSub: 'Mirá tu Wrapped del {range}', bannerBtn: 'Ver mi semana', isNew: 'Nuevo',
      tap: 'Tocá para seguir', close: 'Cerrar', pause: 'Pausar', play: 'Reproducir', prev: 'Historia anterior', next: 'Historia siguiente', aria: 'Tu semana en JourFund',
      k1: 'Tu semana en JourFund', h1p: 'Cerraste la semana en', h1n: 'Cerraste la semana en', h1z: 'Cerraste la semana en cero', l1: '{pct} sobre tu cuenta · {n} operaciones',
      k2: 'Win rate', h2: 'Ganaste {w} de cada {d}', won: 'ganadas', lost: 'perdidas', be: 'break even', f2: 'Los break even no cuentan en el win rate',
      k3: 'Tu mejor día', l3: 'El {pct} de tu ganancia salió de un solo día',
      k4: 'Tu activo estrella', h4: '{asset} te pagó', ops: 'operaciones', wr: 'win rate', ofGain: 'de tu ganancia',
      k5: 'Disciplina', h5ok: 'Nunca pasaste del {pct} de tu límite diario', h5bad: 'Llegaste al {pct} de tu límite diario', alerts: 'días en alerta', worst: 'tu peor día', warn: 'línea de aviso', l5ok: 'Tu cuenta, a salvo toda la semana.', l5bad: 'La semana que viene, cortá antes de llegar al 70 %.',
      k6: 'Tu mente', h6: 'Cuando estabas {state}, ganaste el {wr}', mindBad: 'Con {state} ganaste el {wr}. Si te pasa de nuevo, probá parar un rato.', mindTie: 'Tu estado no cambió mucho el resultado. Seguí anotándolo cada vez.',
      k7: 'La canción que te definió esta semana', listen: 'Escuchar en Spotify',
      k8: 'Objetivo de la fase {phase}', h8: { start: 'Arrancando', half: 'Vas por la mitad', near: 'Ya casi', done: 'Objetivo alcanzado', low: 'En camino' }, l8: '{have} de {target} · faltan {left}', pace: 'A este ritmo, pasás de fase en {n}', week1: '1 semana', weeks: '{n} semanas', paceNo: 'Una semana positiva te acerca al objetivo.',
      k9: 'Mi semana de trading', bestDay: 'mejor día', star: 'activo estrella', maxLimit: 'máx. del límite', song: 'Mi canción', showAmounts: 'Mostrar importes en dólares', share: 'Compartir', again: 'Ver de nuevo', copied: 'Resumen copiado', copyFail: 'No se pudo copiar en este navegador.',
      edition: 'Edición semanal', closed: 'Cerré la semana en', accuracy: '{wr} de acierto', wonOf: '{w} ganadas de {d}', dayMine: 'El {day} fue mío', dayShare: '{pct} de la ganancia en un día', dayAmt: '{amt} en un solo día', paid: '{asset} me pagó', starSub: 'Mi activo estrella', opsLine: '{n} operaciones', opsSub: 'Todas anotadas en mi diario', never1: 'NUNCA PASÉ', never2: 'DEL {pct}', reached1: 'LLEGUÉ AL', reached2: '{pct}', limitSub: 'DEL LÍMITE DIARIO', songOf: 'La canción de mi semana', phaseN: 'Fase {n}', funded: 'Fondeada', h3: 'El {day} hizo tu semana', safe: 'días a salvo', warnShort: 'aviso', zone: 'ZONA DE ALERTA', state: 'ESTADO', daysTraded: 'días operados', wk: 'SEM {n}', result: 'RESULTADO',
      igShare: 'Compartir en Instagram', save: 'Guardar imagen', saved: 'Imagen guardada. Abrí Instagram y subila a tu historia.', madeWith: 'Hecho con JourFund', onAccount: 'sobre mi cuenta', imgAlt: 'Imagen de tu semana para compartir', ready: 'Tu imagen para historias',
      shareText: 'Mi semana en JourFund: {result} · {wr} win rate · mejor día {day} · canción: {song}. jourfund.com',
      states: { Bien: 'bien', Ansioso: 'ansioso', MOLESTO: 'molesto' },
      why: {
        comeback: 'Arrancaste en rojo y no paraste más: {g} de los {n} días siguientes cerraron en verde.',
        tiger: 'Ganaste {wr} de tus operaciones. Semana de campeón.',
        safe: 'Ganaste sin arriesgar de más: tu peor día usó el {pct} del límite.',
        good: 'Terminaste en verde y con calma.',
        pressure: 'Semana pesada: llegaste al {pct} de tu límite diario.',
        sun: 'No fue tu semana, pero viene una nueva.',
        flat: 'Semana en equilibrio. Paciencia: la próxima se define.'
      }
    },
    en: {
      banner: 'Your week is ready', bannerSub: 'See your Wrapped for {range}', bannerBtn: 'See my week', isNew: 'New',
      tap: 'Tap to continue', close: 'Close', pause: 'Pause', play: 'Play', prev: 'Previous story', next: 'Next story', aria: 'Your week on JourFund',
      k1: 'Your week on JourFund', h1p: 'You closed the week at', h1n: 'You closed the week at', h1z: 'You closed the week flat', l1: '{pct} on your account · {n} trades',
      k2: 'Win rate', h2: 'You won {w} out of {d}', won: 'won', lost: 'lost', be: 'break even', f2: 'Break-even trades don\'t count toward win rate',
      k3: 'Your best day', l3: '{pct} of your profit came from a single day',
      k4: 'Your star asset', h4: '{asset} paid you', ops: 'trades', wr: 'win rate', ofGain: 'of your profit',
      k5: 'Discipline', h5ok: 'You never went past {pct} of your daily limit', h5bad: 'You reached {pct} of your daily limit', alerts: 'days on alert', worst: 'your worst day', warn: 'alert line', l5ok: 'Your account stayed safe all week.', l5bad: 'Next week, stop before you hit 70%.',
      k6: 'Your mind', h6: 'When you felt {state}, you won {wr}', mindBad: 'Feeling {state}, you won {wr}. If it happens again, take a break.', mindTie: 'Your mood didn\'t change the result much. Keep logging it.',
      k7: 'The song that defined your week', listen: 'Listen on Spotify',
      k8: 'Phase {phase} target', h8: { start: 'Getting started', half: 'Halfway there', near: 'Almost there', done: 'Target reached', low: 'On your way' }, l8: '{have} of {target} · {left} to go', pace: 'At this pace, you pass the phase in {n}', week1: '1 week', weeks: '{n} weeks', paceNo: 'A positive week gets you closer to the target.',
      k9: 'My trading week', bestDay: 'best day', star: 'star asset', maxLimit: 'max. of limit', song: 'My song', showAmounts: 'Show dollar amounts', share: 'Share', again: 'Watch again', copied: 'Summary copied', copyFail: 'Couldn\'t copy in this browser.',
      edition: 'Weekly edition', closed: 'I closed the week at', accuracy: '{wr} win rate', wonOf: '{w} wins out of {d}', dayMine: '{day} was mine', dayShare: '{pct} of the profit in one day', dayAmt: '{amt} in a single day', paid: '{asset} paid me', starSub: 'My star asset', opsLine: '{n} trades', opsSub: 'All logged in my journal', never1: 'NEVER WENT', never2: 'PAST {pct}', reached1: 'I REACHED', reached2: '{pct}', limitSub: 'OF THE DAILY LIMIT', songOf: 'The song of my week', phaseN: 'Phase {n}', funded: 'Funded', h3: '{day} made your week', safe: 'safe days', warnShort: 'alert', zone: 'ALERT ZONE', state: 'MOOD', daysTraded: 'days traded', wk: 'WK {n}', result: 'RESULT',
      igShare: 'Share on Instagram', save: 'Save image', saved: 'Image saved. Open Instagram and add it to your story.', madeWith: 'Made with JourFund', onAccount: 'on my account', imgAlt: 'Image of your week to share', ready: 'Your story image',
      shareText: 'My week on JourFund: {result} · {wr} win rate · best day {day} · song: {song}. jourfund.com',
      states: { Bien: 'good', Ansioso: 'anxious', MOLESTO: 'upset' },
      why: {
        comeback: 'You started in the red and didn\'t stop: {g} of the next {n} days closed green.',
        tiger: 'You won {wr} of your trades. A champion\'s week.',
        safe: 'You won without overrisking: your worst day used {pct} of the limit.',
        good: 'You finished green and calm.',
        pressure: 'A heavy week: you reached {pct} of your daily limit.',
        sun: 'Not your week, but a new one is coming.',
        flat: 'A balanced week. Patience: the next one decides.'
      }
    },
    'pt-BR': {
      banner: 'Sua semana está pronta', bannerSub: 'Veja seu Wrapped de {range}', bannerBtn: 'Ver minha semana', isNew: 'Novo',
      tap: 'Toque para continuar', close: 'Fechar', pause: 'Pausar', play: 'Reproduzir', prev: 'História anterior', next: 'Próxima história', aria: 'Sua semana no JourFund',
      k1: 'Sua semana no JourFund', h1p: 'Você fechou a semana em', h1n: 'Você fechou a semana em', h1z: 'Você fechou a semana no zero', l1: '{pct} sobre sua conta · {n} operações',
      k2: 'Win rate', h2: 'Você ganhou {w} de cada {d}', won: 'ganhas', lost: 'perdidas', be: 'break even', f2: 'Operações break even não contam no win rate',
      k3: 'Seu melhor dia', l3: '{pct} do seu lucro veio de um só dia',
      k4: 'Seu ativo estrela', h4: '{asset} te pagou', ops: 'operações', wr: 'win rate', ofGain: 'do seu lucro',
      k5: 'Disciplina', h5ok: 'Você nunca passou de {pct} do seu limite diário', h5bad: 'Você chegou a {pct} do seu limite diário', alerts: 'dias em alerta', worst: 'seu pior dia', warn: 'linha de aviso', l5ok: 'Sua conta ficou segura a semana toda.', l5bad: 'Na próxima semana, pare antes de chegar a 70%.',
      k6: 'Sua mente', h6: 'Quando você estava {state}, ganhou {wr}', mindBad: '{state}, você ganhou {wr}. Se acontecer de novo, faça uma pausa.', mindTie: 'Seu humor não mudou muito o resultado. Continue registrando.',
      k7: 'A música que definiu sua semana', listen: 'Ouvir no Spotify',
      k8: 'Meta da fase {phase}', h8: { start: 'Começando', half: 'Na metade', near: 'Quase lá', done: 'Meta alcançada', low: 'No caminho' }, l8: '{have} de {target} · faltam {left}', pace: 'Nesse ritmo, você passa de fase em {n}', week1: '1 semana', weeks: '{n} semanas', paceNo: 'Uma semana positiva te aproxima da meta.',
      k9: 'Minha semana de trading', bestDay: 'melhor dia', star: 'ativo estrela', maxLimit: 'máx. do limite', song: 'Minha música', showAmounts: 'Mostrar valores em dólares', share: 'Compartilhar', again: 'Ver de novo', copied: 'Resumo copiado', copyFail: 'Não foi possível copiar neste navegador.',
      edition: 'Edição semanal', closed: 'Fechei a semana em', accuracy: '{wr} de acerto', wonOf: '{w} ganhas de {d}', dayMine: 'Meu dia: {day}', dayShare: '{pct} do lucro em um dia', dayAmt: '{amt} em um só dia', paid: '{asset} me pagou', starSub: 'Meu ativo estrela', opsLine: '{n} operações', opsSub: 'Todas anotadas no meu diário', never1: 'NUNCA PASSEI', never2: 'DE {pct}', reached1: 'CHEGUEI A', reached2: '{pct}', limitSub: 'DO LIMITE DIÁRIO', songOf: 'A música da minha semana', phaseN: 'Fase {n}', funded: 'Financiada', h3: '{day} fez sua semana', safe: 'dias seguros', warnShort: 'aviso', zone: 'ZONA DE ALERTA', state: 'ESTADO', daysTraded: 'dias operados', wk: 'SEM {n}', result: 'RESULTADO',
      igShare: 'Compartilhar no Instagram', save: 'Salvar imagem', saved: 'Imagem salva. Abra o Instagram e poste nos seus stories.', madeWith: 'Feito com JourFund', onAccount: 'sobre minha conta', imgAlt: 'Imagem da sua semana para compartilhar', ready: 'Sua imagem para stories',
      shareText: 'Minha semana no JourFund: {result} · {wr} win rate · melhor dia {day} · música: {song}. jourfund.com',
      states: { Bien: 'bem', Ansioso: 'ansioso', MOLESTO: 'irritado' },
      why: {
        comeback: 'Você começou no vermelho e não parou mais: {g} dos {n} dias seguintes fecharam no verde.',
        tiger: 'Você ganhou {wr} das suas operações. Semana de campeão.',
        safe: 'Você ganhou sem arriscar demais: seu pior dia usou {pct} do limite.',
        good: 'Você terminou no verde e com calma.',
        pressure: 'Semana pesada: você chegou a {pct} do seu limite diário.',
        sun: 'Não foi sua semana, mas vem uma nova.',
        flat: 'Semana equilibrada. Paciência: a próxima decide.'
      }
    }
  };
  const t = (key, vars = {}) => { let s = key.split('.').reduce((o, k) => o?.[k], S[lang()]) ?? key.split('.').reduce((o, k) => o?.[k], S.es) ?? key; return typeof s === 'string' ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : s; };
  // Several songs per mood; the week number rotates through the list (offset per account), so the same mood doesn't repeat a song until the list runs out.
  const SONGS = {
    comeback: [["Don't Stop Me Now", 'Queen'], ['Remember the Name', 'Fort Minor'], ['Lose Yourself', 'Eminem'], ['Stronger', 'Kanye West'], ['Hall of Fame', 'The Script'], ['Titanium', 'David Guetta & Sia'], ["It's My Life", 'Bon Jovi'], ['Resistiré', 'Dúo Dinámico'], ['Gonna Fly Now', 'Bill Conti'], ['Unstoppable', 'Sia'], ['Fighter', 'Christina Aguilera'], ["I Won't Back Down", 'Tom Petty'], ['Survivor', "Destiny's Child"], ['Sobreviviré', 'Mónica Naranjo'], ['Color esperanza', 'Diego Torres'], ["Livin' on a Prayer", 'Bon Jovi']],
    tiger: [['Eye of the Tiger', 'Survivor'], ['We Are the Champions', 'Queen'], ['Thunderstruck', 'AC/DC'], ["Can't Hold Us", 'Macklemore & Ryan Lewis'], ['Believer', 'Imagine Dragons'], ["Till I Collapse", 'Eminem'], ['Power', 'Kanye West'], ['Seven Nation Army', 'The White Stripes'], ['All I Do Is Win', 'DJ Khaled'], ['The Final Countdown', 'Europe'], ['The Best', 'Tina Turner'], ['Gasolina', 'Daddy Yankee'], ['Danza Kuduro', 'Don Omar & Lucenzo'], ["Can't Stop", 'Red Hot Chili Peppers'], ['HUMBLE.', 'Kendrick Lamar']],
    safe: [["Stayin' Alive", 'Bee Gees'], ['Three Little Birds', 'Bob Marley'], ["Don't Worry, Be Happy", 'Bobby McFerrin'], ['Lovely Day', 'Bill Withers'], ['Easy', 'Commodores'], ['(Sittin\' On) The Dock of the Bay', 'Otis Redding'], ['Sunday Morning', 'Maroon 5'], ['Banana Pancakes', 'Jack Johnson'], ['Better Together', 'Jack Johnson'], ['Put Your Records On', 'Corinne Bailey Rae'], ['What a Wonderful World', 'Louis Armstrong'], ['Is This Love', 'Bob Marley'], ['Ojalá que llueva café', 'Juan Luis Guerra'], ['Valerie', 'Amy Winehouse'], ['Sunny', 'Bobby Hebb']],
    good: [['Feeling Good', 'Nina Simone'], ['Happy', 'Pharrell Williams'], ['Vivir mi vida', 'Marc Anthony'], ['Walking on Sunshine', 'Katrina & The Waves'], ['Uptown Funk', 'Mark Ronson & Bruno Mars'], ['September', 'Earth, Wind & Fire'], ['Celebration', 'Kool & The Gang'], ['La vida es un carnaval', 'Celia Cruz'], ['I Gotta Feeling', 'The Black Eyed Peas'], ["Can't Stop the Feeling!", 'Justin Timberlake'], ['Good Vibrations', 'The Beach Boys'], ['Dancing Queen', 'ABBA'], ['Suavemente', 'Elvis Crespo'], ['Bailando', 'Enrique Iglesias'], ['Despacito', 'Luis Fonsi'], ['Mr. Blue Sky', 'Electric Light Orchestra']],
    pressure: [['Under Pressure', 'Queen & David Bowie'], ['Stressed Out', 'Twenty One Pilots'], ['Breathe', 'Pink Floyd'], ['Calma', 'Pedro Capó'], ['Take It Easy', 'Eagles'], ['Numb', 'Linkin Park'], ['Pressure', 'Billy Joel'], ['In the End', 'Linkin Park'], ['Boulevard of Broken Dreams', 'Green Day'], ['Mad World', 'Gary Jules'], ['Bohemian Rhapsody', 'Queen'], ['The Sound of Silence', 'Simon & Garfunkel'], ['Everybody Hurts', 'R.E.M.'], ['Paint It Black', 'The Rolling Stones']],
    sun: [['Here Comes the Sun', 'The Beatles'], ['Better Days', 'OneRepublic'], ['Fix You', 'Coldplay'], ['Lean on Me', 'Bill Withers'], ['Keep Your Head Up', 'Andy Grammer'], ['Rise Up', 'Andra Day'], ['Brand New Day', 'Sting'], ["Don't Stop Believin'", 'Journey'], ['The Climb', 'Miley Cyrus'], ['Shake It Off', 'Taylor Swift'], ['Unwritten', 'Natasha Bedingfield'], ['I Will Survive', 'Gloria Gaynor'], ['Gracias a la vida', 'Mercedes Sosa'], ["Ain't No Mountain High Enough", 'Marvin Gaye & Tammi Terrell'], ['Brighter Than the Sun', 'Colbie Caillat']],
    flat: [['Let It Be', 'The Beatles'], ['Patience', "Guns N' Roses"], ['The Middle', 'Jimmy Eat World'], ['Waiting on the World to Change', 'John Mayer'], ['Hold On', 'Wilson Phillips'], ['Viva la Vida', 'Coldplay'], ['Imagine', 'John Lennon'], ['Clocks', 'Coldplay'], ['Time', 'Pink Floyd'], ['Somewhere Only We Know', 'Keane'], ['Smooth', 'Santana & Rob Thomas'], ['Fly Me to the Moon', 'Frank Sinatra'], ['Volver', 'Carlos Gardel'], ['Hey Jude', 'The Beatles']]
  };
  const pickSong = (mood, account, start) => { const list = SONGS[mood] || SONGS.flat; let h = 0; for (const ch of String(account)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const week = Math.floor(Date.parse(start + 'T00:00:00Z') / 604800000) || 0; return list[(h + week) % list.length]; };

  /* ---------- numbers and dates ---------- */
  const num = (n, d = 0) => new Intl.NumberFormat(loc(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const money = n => { const a = Math.abs(n), d = Math.round(a) === Math.round(a * 100) / 100 ? 0 : 2; return (n < 0 ? '−' : '') + '$' + num(a, d); };
  const signed = n => (n > 0 ? '+' : '') + money(n);
  const pct = (n, d = 0) => num(n, d) + '\u00a0%';
  const spct = n => (n > 0 ? '+' : n < 0 ? '−' : '') + num(Math.abs(n), 1) + '\u00a0%';
  const D = s => new Date(s + 'T12:00:00Z'), iso = d => d.toISOString().slice(0, 10), add = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const monday = s => add(s, -((D(s).getUTCDay() + 6) % 7));
  const weekday = (s, style = 'long') => { const w = D(s).toLocaleDateString(loc(), { weekday: style, timeZone: 'UTC' }); return w.charAt(0).toUpperCase() + w.slice(1).replace('.', ''); };
  const range = (a, b) => { const f = s => D(s).toLocaleDateString(loc(), { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', ''); return f(a) + ' – ' + f(b); };

  /* ---------- the week's numbers ---------- */
  // The active account if it traded last week; otherwise the account with the most trades that week.
  function pickWeek() {
    let s; try { s = window.ftProtectionCloud.snapshot(); } catch { return null; }
    const list = (s.accounts || []).map(a => { try { return compute(a); } catch { return null; } }).filter(Boolean);
    return list.find(w => w.account.id === s.activeId) || list.sort((x, y) => y.count - x.count)[0] || null;
  }
  const accountName = a => (a.nickname ? a.nickname + ' · ' : '') + a.firm + ' · ' + a.program;
  function compute(a) {
    if (!a || a.accountType === 'personal') return null;
    // Wrapped day is Sunday: that day shows the week that is closing (Mon–Sun); the rest of the week shows the last full week.
    const today = R.accountDay(a), start = D(today).getUTCDay() === 0 ? monday(today) : add(monday(today), -7), end = add(start, 6);
    const stages = (a.phases || []).map(p => p.trades || []).concat([a.pa?.trades || []]);
    const current = a.status === 'Funded' ? a.pa?.trades || [] : a.phases?.[(a.phase || 1) - 1]?.trades || [];
    const trades = [], currentDays = new Set();
    stages.forEach(ts => ts.forEach(tr => { if (/^\d{4}-\d{2}-\d{2}$/.test(tr.date || '') && tr.date >= start && tr.date <= end && Number.isFinite(Number(tr.pnl))) trades.push(tr); }));
    current.forEach(tr => { if (tr.date >= start && tr.date <= end) currentDays.add(tr.date); });
    if (!trades.length) return null;
    const cents = n => Math.round(Number(n) * 100);
    const byDay = new Map();
    trades.forEach(tr => byDay.set(tr.date, (byDay.get(tr.date) || 0) + cents(tr.pnl)));
    const days = [...byDay.entries()].sort((x, y) => x[0].localeCompare(y[0])).map(([date, c]) => ({ date, pnl: c / 100 }));
    const pnl = days.reduce((s, d) => s + d.pnl, 0);
    const wins = trades.filter(tr => tr.result === 'Win').length, losses = trades.filter(tr => tr.result === 'Loss').length;
    const decisive = wins + losses, winRate = decisive ? wins / decisive * 100 : null;
    const best = days.reduce((m, d) => d.pnl > (m?.pnl ?? 0) ? d : m, null);
    const grossDays = days.reduce((s, d) => s + Math.max(0, d.pnl), 0);
    const assets = new Map();
    trades.forEach(tr => { const k = String(tr.asset || '').trim() || '—', x = assets.get(k) || { asset: k, pnl: 0, n: 0, w: 0, l: 0 }; x.pnl += cents(tr.pnl) / 100; x.n++; if (tr.result === 'Win') x.w++; if (tr.result === 'Loss') x.l++; assets.set(k, x); });
    const assetList = [...assets.values()], gross = assetList.reduce((s, x) => s + Math.max(0, x.pnl), 0);
    const star = assetList.filter(x => x.pnl > 0).sort((x, y) => y.pnl - x.pnl)[0] || null;
    // Daily limit used, measured at each day's close with the account's own rules.
    let usage = null, alerts = 0, measured = 0;
    for (const date of currentDays) {
      try { const r = R.risk(a, date); if (r && Number(r.dailyBudget) > 0) { const u = Math.max(0, Math.min(100, (r.dailyBudget - r.dailyRemaining) / r.dailyBudget * 100)); usage = Math.max(usage ?? 0, u); measured++; if (u >= 70) alerts++; } } catch {}
    }
    const seq = trades.map((tr, i) => [tr, i]).filter(([tr]) => tr.result === 'Win' || tr.result === 'Loss')
      .sort((x, y) => (x[0].date + (x[0].time || '')).localeCompare(y[0].date + (y[0].time || '')) || x[1] - y[1]).map(([tr]) => tr.result === 'Win');
    const moods = new Map();
    trades.forEach(tr => { if (!tr.state) return; const x = moods.get(tr.state) || { state: tr.state, n: 0, w: 0, l: 0, pnl: 0 }; x.n++; if (tr.result === 'Win') x.w++; if (tr.result === 'Loss') x.l++; x.pnl += cents(tr.pnl) / 100; moods.set(tr.state, x); });
    const moodList = [...moods.values()].map(x => ({ ...x, wr: x.w + x.l ? x.w / (x.w + x.l) * 100 : null })).filter(x => x.wr != null);
    let goal = null;
    if (a.status === 'Challenge') { try { const p = R.progress(a); if (p.target > 0) goal = { have: Math.max(0, p.pnl), target: p.target, phase: a.phase || 1 }; } catch {} }
    const first = days[0], later = days.slice(1);
    let mood = 'flat';
    if (pnl > 0 && first.pnl < 0 && later.length) mood = 'comeback';
    else if (pnl > 0 && winRate != null && winRate >= 70 && decisive >= 3) mood = 'tiger';
    else if (pnl > 0 && usage != null && usage < 30) mood = 'safe';
    else if (pnl > 0) mood = 'good';
    else if (pnl < 0 && (alerts > 0 || (usage ?? 0) >= 70)) mood = 'pressure';
    else if (pnl < 0) mood = 'sun';
    return {
      account: a, start, end, days, pnl, count: trades.length, wins, losses, be: trades.length - decisive, decisive, winRate,
      best: best && days.length > 1 ? { ...best, share: grossDays > 0 ? best.pnl / grossDays * 100 : 0 } : null,
      star: star ? { ...star, share: gross > 0 ? star.pnl / gross * 100 : 0, wr: star.w + star.l ? star.w / (star.w + star.l) * 100 : null } : null,
      usage, alerts, measured, seq, moods: moodList.length >= 2 ? moodList.sort((x, y) => y.wr - x.wr) : null, goal,
      accountPct: Number(a.capital) > 0 ? pnl / Number(a.capital) * 100 : 0,
      mood, song: pickSong(mood, a.id, start), later: { g: later.filter(d => d.pnl > 0).length, n: later.length }
    };
  }
  const seenKey = w => 'jourfund_wrapped_' + (window.ftCloudSession?.user?.id || 'x') + '_' + w.account.id + '_' + w.start;

  /* ---------- motion helpers ---------- */
  const FONT = 'Geist, Inter, ui-sans-serif, system-ui, sans-serif';
  const LOGO = ['M126 32C94 32 70 55 70 80V99L126 48Z', 'M20 166H53C56 190 69 203 92 203H126V222C126 234 119 240 107 240H91C50 240 23 211 20 166Z', 'M136 32H169V190C169 211 156 228 136 236Z', 'M136 32H226C220 57 207 68 186 68H169V104H200V138H136Z', 'M79 143H97V179H79Z', 'M107 116H125V159H107Z'];
  function bez(a, b, c, d) {
    const cx = 3 * a, bx = 3 * (c - a) - cx, ax = 1 - cx - bx, cy = 3 * b, by = 3 * (d - b) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { x = Math.max(0, Math.min(1, x)); let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-5) break; t -= e / (dx(t) || 1e-6); } return sy(Math.max(0, Math.min(1, t))); };
  }
  const out = bez(.23, 1, .32, 1), io = bez(.77, 0, .175, 1), cl = x => Math.max(0, Math.min(1, x));
  const spring = (x, z = .45, w = 13) => { x = Math.max(0, x); return 1 - Math.exp(-z * w * x) * Math.cos(w * Math.sqrt(1 - z * z) * x); };
  const DUR = 6.5, TR = .6;

  /* ---------- 1080×1920 share image: the JourFund Weekly Pass ---------- */
  function isoWeek(s) { const th = D(add(s, 3 - ((D(s).getUTCDay() + 6) % 7))), y0 = Date.UTC(th.getUTCFullYear(), 0, 1); return Math.ceil(((th - y0) / 864e5 + 1) / 7); }
  const shortDay = s => weekday(s, 'short').toUpperCase().replace(/\./g, '');
  function passStats(w) {
    const list = [];
    if (w.winRate != null) list.push([pct(w.winRate), t('wr')]);
    if (w.best) list.push([shortDay(w.best.date), t('bestDay')]);
    if (w.usage != null) list.push([pct(Math.max(1, Math.ceil(w.usage))), t('maxLimit')]);
    if (list.length < 3) list.push([String(w.count), t('ops')]);
    if (list.length < 3) list.push([String(w.days.length), t('daysTraded')]);
    return list.slice(0, 3);
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function logoTile(g, x, y, size) {
    const s = size / 256; g.save(); g.translate(x, y); g.scale(s, s);
    const bg = g.createLinearGradient(0, 0, 256, 256); bg.addColorStop(0, '#21143e'); bg.addColorStop(1, '#0b0d1b');
    rr(g, 4, 4, 248, 248, 57); g.fillStyle = bg; g.fill(); g.strokeStyle = '#9464ef'; g.lineWidth = 2; g.stroke();
    g.translate(23, 14); g.scale(.83, .83);
    const pu = g.createLinearGradient(0, 32, 0, 240); pu.addColorStop(0, '#a576ff'); pu.addColorStop(1, '#8248ee');
    LOGO.forEach((d, i) => { g.fillStyle = i < 2 ? '#fbf9ff' : pu; g.fill(new Path2D(d)); });
    g.restore();
  }
  function passImage(w, amounts) {
    const wait = new Promise(r => setTimeout(r, 1500));
    const fonts = document.fonts?.load ? Promise.race([Promise.all(['800 100px Geist', '700 40px Geist', '600 30px Geist', '500 30px Geist'].map(f => document.fonts.load(f))), wait]).catch(() => {}) : Promise.resolve();
    return fonts.then(() => {
      const Wd = 1080, Ht = 1920, cv = document.createElement('canvas'); cv.width = Wd; cv.height = Ht;
      const g = cv.getContext('2d'), neg = w.pnl < 0, acc = neg ? '#ff8a9a' : '#5ef0b6';
      const sp = v => { if ('letterSpacing' in g) g.letterSpacing = v + 'px'; };
      const font = (wt, size, s = 0) => { g.font = wt + ' ' + size + 'px ' + FONT; sp(s); };
      const fit = (txt, wt, size, maxW, s = 0) => { font(wt, size, s); const m = g.measureText(txt).width; if (m > maxW) { size = Math.floor(size * maxW / m); font(wt, size, s * maxW / m); } return size; };
      const blob = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, c + '00'); g.fillStyle = gr; g.fillRect(0, 0, Wd, Ht); };
      // Background: deep indigo with violet and mint (or coral) auroras and a faded grid.
      const base = g.createLinearGradient(0, 0, 0, Ht); base.addColorStop(0, '#21143e'); base.addColorStop(1, '#0b0d1b'); g.fillStyle = base; g.fillRect(0, 0, Wd, Ht);
      blob(864, 154, 820, '#8248ee'); blob(0, 1344, 760, '#3a1d8a'); blob(1080, 1920, 680, neg ? '#7a2140' : '#1f6b58');
      const grid = document.createElement('canvas'); grid.width = Wd; grid.height = Ht; const gg = grid.getContext('2d');
      gg.strokeStyle = 'rgba(255,255,255,.05)'; gg.lineWidth = 1; for (let x = .5; x < Wd; x += 72) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, Ht); gg.stroke(); } for (let y = .5; y < Ht; y += 72) { gg.beginPath(); gg.moveTo(0, y); gg.lineTo(Wd, y); gg.stroke(); }
      const gm = gg.createRadialGradient(540, 864, 0, 540, 864, 890); gm.addColorStop(0, '#000'); gm.addColorStop(1, 'rgba(0,0,0,0)'); gg.globalCompositeOperation = 'destination-in'; gg.fillStyle = gm; gg.fillRect(0, 0, Wd, Ht); g.drawImage(grid, 0, 0);
      g.textBaseline = 'alphabetic'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.7)'; font('600', 30, 12.6); g.fillText('JOURFUND · WEEKLY PASS', Wd / 2 + 6, 156); g.textAlign = 'left';
      // The holographic card, drawn on its own layer so the ticket notches cut through it.
      const L = document.createElement('canvas'); L.width = Wd; L.height = Ht; const c = L.getContext('2d');
      const cx0 = 110, cy0 = 220, cw = 860, ch = 1340, ix = cx0 + 3, iy = cy0 + 3, iw = cw - 6, ih = ch - 6;
      const border = c.createLinearGradient(cx0, cy0, cx0 + cw, cy0 + ch); [['#fbf9ff', 0], ['#a576ff', .25], [acc, .5], ['#ff9ccc', .7], ['#8248ee', 1]].forEach(([col, o]) => border.addColorStop(o, col));
      rr(c, cx0, cy0, cw, ch, 72); c.fillStyle = border; c.fill();
      const inner = c.createLinearGradient(ix, iy, ix + iw * .36, iy + ih); inner.addColorStop(0, '#2a1a5c'); inner.addColorStop(.55, '#160f34'); inner.addColorStop(1, '#0e0b24');
      rr(c, ix, iy, iw, ih, 69); c.fillStyle = inner; c.fill();
      c.save(); rr(c, ix, iy, iw, ih, 69); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.035)'; c.lineWidth = 2; for (let d = -ih; d < iw + ih; d += 14) { c.beginPath(); c.moveTo(ix + d, iy); c.lineTo(ix + d - ih, iy + ih); c.stroke(); }
      const hv = [.906, .423], hl = 669, hc = [ix + iw / 2, iy + ih / 2], holo = c.createLinearGradient(hc[0] - hv[0] * hl, hc[1] - hv[1] * hl, hc[0] + hv[0] * hl, hc[1] + hv[1] * hl);
      [[0, 'rgba(165,118,255,0)'], [.2, 'rgba(165,118,255,0)'], [.35, 'rgba(165,118,255,.35)'], [.45, neg ? 'rgba(255,138,154,.26)' : 'rgba(94,240,182,.28)'], [.55, 'rgba(255,156,204,.25)'], [.7, 'rgba(255,156,204,0)'], [1, 'rgba(255,156,204,0)']].forEach(([o, col]) => holo.addColorStop(o, col));
      c.globalCompositeOperation = 'screen'; c.fillStyle = holo; c.fillRect(ix, iy, iw, ih); c.globalCompositeOperation = 'source-over';
      const X = ix + 70, R = ix + iw - 70, tf = (wt, size, s = 0) => { c.font = wt + ' ' + size + 'px ' + FONT; if ('letterSpacing' in c) c.letterSpacing = s + 'px'; };
      const cfit = (txt, wt, size, maxW, s = 0) => { tf(wt, size, s); const m = c.measureText(txt).width; if (m > maxW) { size = Math.floor(size * maxW / m); tf(wt, size, s * maxW / m); } return size; };
      // Brand row and week tag
      logoTile(c, X, iy + 66, 84); c.fillStyle = '#fff'; tf('800', 46, -1); c.textBaseline = 'middle'; c.fillText('JourFund', X + 106, iy + 110);
      const tag = t('wk', { n: isoWeek(w.start) }); tf('600', 24, 4.8); const tw = c.measureText(tag).width + 52;
      rr(c, R - tw, iy + 82, tw, 56, 28); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#fff'; c.fillText(tag, R - tw + 26 + 2.4, iy + 111);
      c.textBaseline = 'alphabetic';
      // Result
      const lbl = (range(w.start, w.end) + ' · ' + t('result')).toUpperCase(); c.fillStyle = '#cdb8ff'; cfit(lbl, '600', 28, R - X, 8.4); c.fillText(lbl, X, iy + 264);
      const big = amounts ? signed(w.pnl) : spct(w.accountPct), unit = amounts ? '' : '%', headTxt = unit ? big.replace(/\s?%$/, '') : big;
      tf('800', 150, -10); const uw = unit ? c.measureText(unit).width : 0;
      const size = cfit(headTxt, '800', 300, iw - 58 - 60 - uw, -21), by = iy + 280 + size * .8;
      const fillG = c.createLinearGradient(0, iy + 280 + size * .05, 0, iy + 280 + size * .85); fillG.addColorStop(0, '#fff'); fillG.addColorStop(.3, '#fff'); fillG.addColorStop(1, acc);
      c.fillStyle = fillG; c.fillText(headTxt, ix + 58, by); const hw = c.measureText(headTxt).width; if (unit) { tf('800', Math.round(size / 2), -10); c.fillText(unit, ix + 58 + hw + 4, by); }
      const ph = w.account.status === 'Funded' ? t('funded') : w.account.status === 'Challenge' ? t('phaseN', { n: w.account.phase || 1 }) : w.account.program;
      const lead = amounts ? spct(w.accountPct) : t('opsLine', { n: w.count }), rest = amounts ? ' · ' + t('opsLine', { n: w.count }) + ' · ' + ph : ' · ' + ph;
      tf('700', 38); const lw = c.measureText(lead).width; tf('500', 38); const scale = Math.min(1, (R - X) / (lw + c.measureText(rest).width));
      c.save(); c.translate(X + 2, iy + 640); c.scale(scale, scale); tf('700', 38); c.fillStyle = acc; c.fillText(lead, 0, 0); tf('500', 38); c.fillStyle = 'rgba(255,255,255,.75)'; c.fillText(rest, lw, 0); c.restore();
      // Three stats
      const sw = (R - X - 44) / 3; passStats(w).forEach(([b, s], i) => {
        const x = X + i * (sw + 22), y = iy + 700; rr(c, x, y, sw, 176, 36); c.fillStyle = 'rgba(255,255,255,.06)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#fff'; cfit(b, '800', 64, sw - 52, -2.5); c.fillText(b, x + 26, y + 98); c.fillStyle = 'rgba(255,255,255,.6)'; cfit(s, '500', 24, sw - 52); c.fillText(s, x + 26, y + 142);
      });
      // Sparkline of the week's running result
      const run = [0]; w.days.forEach(d => run.push(run[run.length - 1] + d.pnl));
      const lo = Math.min(...run), hi = Math.max(...run), sx = X + 10, sw2 = R - X - 20, top = iy + 935, hgt = 123;
      const pts = run.map((v, i) => [sx + sw2 * i / (run.length - 1), top + hgt - (hi === lo ? hgt / 2 : (v - lo) / (hi - lo) * hgt)]);
      const area = c.createLinearGradient(0, top, 0, top + 150); area.addColorStop(0, 'rgba(165,118,255,.35)'); area.addColorStop(1, 'rgba(165,118,255,0)');
      c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineTo(pts[pts.length - 1][0], top + 150); c.lineTo(pts[0][0], top + 150); c.closePath(); c.fillStyle = area; c.fill();
      const line = c.createLinearGradient(sx, 0, sx + sw2, 0); line.addColorStop(0, '#a576ff'); line.addColorStop(1, acc);
      c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = line; c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
      const lp = pts[pts.length - 1]; c.fillStyle = '#fff'; c.beginPath(); c.arc(lp[0], lp[1], 12, 0, Math.PI * 2); c.fill();
      // Perforation and the song stub
      const py = iy + 1110; c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 4; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(ix + 50, py); c.lineTo(ix + iw - 50, py); c.stroke(); c.setLineDash([]);
      const vx = X + 60, vy = iy + 1210; [[60, '#262046'], [58, '#151226'], [46, '#1d1838'], [38, '#151226'], [36, '#151226']].forEach(([r, col]) => { c.fillStyle = col; c.beginPath(); c.arc(vx, vy, r, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = '#a576ff'; c.beginPath(); c.arc(vx, vy, 18, 0, Math.PI * 2); c.fill(); c.fillStyle = '#0b0d1b'; c.beginPath(); c.arc(vx, vy, 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#cdb8ff'; const so = t('songOf').toUpperCase(); cfit(so, '600', 22, R - X - 150, 6.2); c.fillText(so, X + 150, vy - 12);
      const song = w.song[0] + ' · ' + w.song[1]; c.fillStyle = '#fff'; cfit(song, '700', 44, R - X - 150, -1); c.fillText(song, X + 150, vy + 42);
      c.restore();
      c.globalCompositeOperation = 'destination-out'; [cx0, cx0 + cw].forEach(x => { c.beginPath(); c.arc(x, py, 36, 0, Math.PI * 2); c.fill(); });
      g.save(); g.shadowColor = 'rgba(130,72,238,.7)'; g.shadowBlur = 140; g.shadowOffsetY = 60; g.drawImage(L, 0, 0); g.restore();
      // Footer
      g.textAlign = 'center'; g.fillStyle = '#fff'; fit(t('k9'), '800', 58, Wd - 160, -1.7); g.fillText(t('k9'), Wd / 2, 1738);
      g.fillStyle = 'rgba(255,255,255,.7)'; const mw = t('madeWith') + ' · jourfund.com'; fit(mw, '500', 30, Wd - 160); g.fillText(mw, Wd / 2, 1792);
      return new Promise(res => cv.toBlob(b => res(b), 'image/png'));
    });
  }

  /* ---------- slides from the data ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const head = (k, h) => '<p class="jfw-k">' + esc(k) + '</p>' + (h ? '<h2 class="jfw-h">' + h.split(' ').map(x => '<span class="w"><span>' + esc(x) + '</span></span>').join(' ') + '</h2>' : '');
  const kin = (style, rows) => '<div class="jfw-kin" style="' + style + '" aria-hidden="true">' + rows.map(([word, cls]) => '<div class="' + (cls || '') + '">' + esc(Array(6).fill(word).join('  ')) + '</div>').join('') + '</div>';
  const bold = (txt, key, val) => esc(txt).replace(esc(val), '<b>' + esc(val) + '</b>');
  const fs = (txt, max, width, k = .6) => Math.min(max, Math.floor(width / (String(txt).length * k)));
  const shortMoney = n => Math.abs(n) >= 10000 ? (n < 0 ? '−' : '+') + '$' + num(Math.abs(n) / 1000, 1) + 'k' : signed(n);
  function isoBar(x, y, w, h, c1, c2, c3) { const d = 12; return '<polygon points="' + [x, y, x + w, y, x + w, y + h, x, y + h] + '" fill="' + c1 + '"/><polygon points="' + [x + w, y, x + w + d, y - d, x + w + d, y + h - d, x + w, y + h] + '" fill="' + c2 + '"/><polygon points="' + [x, y, x + d, y - d, x + w + d, y - d, x + w, y] + '" fill="' + c3 + '"/>'; }
  const coinFace = (cls, inner) => '<div class="jfw-face ' + cls + '">' + inner + '</div>';

  function slidesFor(w) {
    const list = [], neg = w.pnl < 0, logo = '<img src="./brand-icon.svg?v=92" alt="">';
    // 1 · result
    { const money0 = signed(w.pnl), size = fs(money0, 104, 330, .62);
      list.push({ cls: 'v', html: kin('top:150px;font-size:118px;color:rgba(255,255,255,.35)', [[spct(w.accountPct), 'o'], [money0, 'o']]) + head(t('k1'), t(w.pnl === 0 ? 'h1z' : 'h1p')) +
        '<div class="jfw-n1" data-a="n" style="font-size:' + size + 'px">' + esc(money0) + '</div>' +
        '<div class="jfw-glass jfw-pill" data-a="p">' + esc(t('l1', { pct: '§', n: w.count })).replace('§', '<span class="' + (neg ? 'coral' : 'mint') + '">' + esc(spct(w.accountPct)) + '</span>') + '</div><p class="jfw-foot jfw-c jfw-hint" style="top:560px" data-a="f">' + esc(t('tap')) + '</p>',
        anim(lt, $) { $('f').style.opacity = .7 * cl((lt - 2.4) / .6); const n = $('n'), k = out(cl((lt - .3) / 1.6)); n.textContent = signed(Math.round(w.pnl * k * 100) / 100); n.style.opacity = cl((lt - .3) / .3); n.style.transform = 'scale(' + (.7 + .3 * spring(lt - .3)) + ')';
          const p = $('p'), s = spring(lt - 1.3, .5); p.style.opacity = cl((lt - 1.3) / .3); p.style.transform = 'translateY(' + (1 - s) * 40 + 'px) rotateX(' + (1 - cl(s)) * 60 + 'deg)'; } }); }
    // 2 · win rate with flip cards
    if (w.decisive) { const wr = w.winRate; let seq = w.seq.slice(0, 8);
      if (w.decisive > 8) { const k = Math.round(wr / 100 * 8); seq = Array.from({ length: 8 }, (_, i) => i < k); }
      const cards = seq.map((win, i) => '<div class="jfw-flip" style="left:' + (i % 4) * 82 + 'px;top:' + Math.floor(i / 4) * 88 + 'px"><i class="fr"></i><i class="bk ' + (win ? 'win' : 'loss') + '">' + (win ? '✓' : '✕') + '</i></div>').join('');
      list.push({ cls: 'd', html: kin('top:440px;font-size:130px;color:rgba(165,118,255,.5)', [[pct(wr), 'o']]) + head(t('k2'), t('h2', { w: w.wins, d: w.decisive })) +
        '<div class="jfw-n2" data-a="n">0</div><div class="jfw-cards" style="top:' + (seq.length > 4 ? 270 : 300) + 'px">' + cards + '</div>' +
        '<div class="jfw-foot" style="top:470px" data-a="f">' + esc(w.wins + ' ' + t('won') + ' · ' + w.losses + ' ' + t('lost') + ' · ' + w.be + ' ' + t('be')) + '<small>' + esc(t('f2')) + '</small></div>',
        anim(lt, $, el) { const n = $('n'); n.textContent = pct(wr * out(cl((lt - .2) / 1.8))); n.style.opacity = cl((lt - .2) / .4);
          el.querySelectorAll('.jfw-flip').forEach((c, i) => { c.style.transform = 'rotateY(' + 180 * spring(lt - .6 - i * .14, .5, 11) + 'deg)'; c.style.opacity = cl((lt - .4 - i * .14) / .3); });
          $('f').style.opacity = cl((lt - 2.2) / .5); } }); }
    // 3 · best day as isometric bars
    if (w.best) { const day = weekday(w.best.date), vals = w.days.map(d => d.pnl), up = Math.max(0, ...vals), down = Math.max(0, ...vals.map(v => -v)), span = up + down || 1;
      const n = w.days.length, step = Math.min(62, 320 / n), bw = Math.min(40, step * .68), x0 = 20 + (320 - step * (n - 1) - bw) / 2, base = 52 + 210 * up / span;
      list.push({ cls: 'l', html: kin('top:150px;font-size:170px;color:rgba(106,47,224,.22)', [[shortDay(w.best.date), 'o']]) + head(t('k3'), t('h3', { day: lang() === 'es' ? day.toLowerCase() : day })) +
        '<svg class="jfw-iso" data-a="svg" width="360" height="330" viewBox="0 0 360 330" aria-hidden="true"></svg><div class="jfw-foot" style="top:540px" data-a="f">' + bold(t('l3', { pct: pct(w.best.share) }), 'pct', pct(w.best.share)) + '</div>',
        anim(lt, $) { let h = '<line x1="10" x2="350" y1="' + base + '" y2="' + base + '" stroke="#1b0f3f" stroke-opacity=".2"/>';
          w.days.forEach((d, i) => { const k = spring(lt - .5 - i * .12, .55, 10), hh = Math.max(0, Math.abs(d.pnl) / span * 210 * k), x = x0 + i * step, top = d.date === w.best.date;
            h += d.pnl >= 0 ? isoBar(x, base - hh, bw, hh, top ? '#6a2fe0' : '#c9b5ff', top ? '#4a1bb3' : '#a98df0', top ? '#a576ff' : '#e2d6ff') : isoBar(x, base, bw, hh, '#ffb3bd', '#f28b99', '#ffd0d6');
            h += '<text x="' + (x + bw / 2) + '" y="' + (d.pnl < 0 ? base + hh + 22 : base + 22) + '" text-anchor="middle" font-weight="800" font-size="11" fill="#1b0f3f" opacity=".7">' + esc(shortDay(d.date)) + '</text>';
            if (k > .6) h += '<text x="' + (x + bw / 2 + 6) + '" y="' + (d.pnl >= 0 ? base - hh - 20 : base + hh + 40) + '" text-anchor="middle" font-weight="900" font-size="' + (top ? 15 : 10.5) + '" fill="' + (top ? '#4a1bb3' : d.pnl < 0 ? '#d6455a' : '#1b0f3f') + '">' + esc(shortMoney(d.pnl)) + '</text>'; });
          $('svg').innerHTML = h; $('f').style.opacity = cl((lt - 2.2) / .5); } }); }
    // 4 · star asset coin
    if (w.star) { const code = w.star.asset.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || '$';
      list.push({ cls: 'd', html: kin('top:470px;font-size:120px;color:rgba(255,214,140,.12)', [[w.star.asset], [code]]) + head(t('k4'), t('h4', { asset: w.star.asset })) +
        '<div class="jfw-coin" data-a="c">' + coinFace('gold', esc(code)) + coinFace('brand', logo) + '</div><div class="jfw-v4" data-a="v" style="font-size:' + fs(signed(w.star.pnl), 56, 320, .6) + 'px">' + esc(signed(w.star.pnl)) + '</div>' +
        '<div class="jfw-chips3" data-a="ch">' + [[w.star.n, t('ops')], [w.star.wr == null ? '—' : pct(w.star.wr), t('wr')], [pct(w.star.share), t('ofGain')]].map(([b, s]) => '<div class="jfw-glass"><b>' + esc(b) + '</b><span>' + esc(s) + '</span></div>').join('') + '</div>',
        anim(lt, $, el, T) { const c = $('c'), k = out(cl((lt - .2) / 1.4)); c.style.transform = 'rotateY(' + ((1 - k) * 720 + Math.sin(T * 1.5) * 12) + 'deg) scale(' + (.75 + .25 * spring(lt - .2, .5)) + ')'; c.style.opacity = cl((lt - .2) / .3);
          const v = $('v'); v.textContent = signed(Math.round(w.star.pnl * out(cl((lt - 1.2) / 1.1)) * 100) / 100); v.style.opacity = cl((lt - 1.1) / .3);
          $('ch').querySelectorAll('.jfw-glass').forEach((g, i) => { const s = spring(lt - 1.8 - i * .12, .55); g.style.transform = 'translateY(' + (1 - s) * 40 + 'px)'; g.style.opacity = cl((lt - 1.8 - i * .12) / .3); }); } }); }
    // 5 · discipline speedometer
    if (w.usage != null) { const ok = w.alerts === 0, used = Math.max(1, Math.ceil(w.usage)), target = Math.min(1, used / 100);
      list.push({ cls: ok ? 'v' : 'd', html: head(t('k5'), t(ok ? 'h5ok' : 'h5bad', { pct: pct(used) })) + '<svg class="jfw-gauge" data-a="g" width="320" height="200" viewBox="0 0 320 200" aria-hidden="true"></svg>' +
        '<div class="jfw-n5' + (ok ? '' : ' coral') + '" data-a="n">0</div><div class="jfw-glass jfw-panel" data-a="p"><div><b>' + w.alerts + '</b>' + esc(t('alerts')) + '</div><div><b>' + (w.measured - w.alerts) + '/' + w.measured + '</b>' + esc(t('safe')) + '</div><div><b>70 %</b>' + esc(t('warnShort')) + '</div></div>' +
        '<div class="jfw-foot jfw-c" style="top:556px" data-a="f"><b>' + esc(t(ok ? 'l5ok' : 'l5bad')) + '</b></div>',
        anim(lt, $) { const Rr = 130, cx = 160, cy = 160, p = a => [cx - Rr * Math.cos(a * Math.PI), cy - Rr * Math.sin(a * Math.PI)];
          const arc = (a0, a1, col) => { const [x0, y0] = p(a0), [x1, y1] = p(a1); return '<path d="M' + x0 + ' ' + y0 + ' A' + Rr + ' ' + Rr + ' 0 0 1 ' + x1 + ' ' + y1 + '" fill="none" stroke="' + col + '" stroke-width="22" stroke-linecap="round"/>'; };
          const nv = Math.max(0, target * spring(lt - .6, .32, 9)); let h = arc(0, 1, 'rgba(255,255,255,.18)') + arc(.7, 1, '#ff8a9a') + arc(0, Math.max(.001, Math.min(1, nv)), ok ? '#5ef0b6' : '#ffc14d');
          for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; h += '<line x1="' + (cx - (Rr - 26) * Math.cos(a)) + '" y1="' + (cy - (Rr - 26) * Math.sin(a)) + '" x2="' + (cx - (Rr - 36) * Math.cos(a)) + '" y2="' + (cy - (Rr - 36) * Math.sin(a)) + '" stroke="rgba(255,255,255,.5)" stroke-width="2"/>'; }
          const na = Math.min(1.04, nv) * Math.PI; h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx - (Rr - 18) * Math.cos(na)) + '" y2="' + (cy - (Rr - 18) * Math.sin(na)) + '" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + cy + '" r="12" fill="#fff"/>' +
            '<text x="' + (cx + Rr + 10) + '" y="' + (cy - Rr - 6) + '" text-anchor="end" font-size="10" font-weight="700" fill="#ffd0d6">' + esc(t('zone')) + '</text>';
          $('g').innerHTML = h; const n = $('n'); n.textContent = pct(Math.round(Math.min(used, nv * 100))); n.style.opacity = cl((lt - .6) / .3);
          const s = spring(lt - 1.9, .55), pn = $('p'); pn.style.transform = 'translateY(' + (1 - s) * 30 + 'px)'; pn.style.opacity = cl((lt - 1.9) / .3); $('f').style.opacity = cl((lt - 2.5) / .5); } }); }
    // 6 · mind as tilted slabs
    if (w.moods) { const top = w.moods[0], low = w.moods[w.moods.length - 1], name = st => t('states.' + st.state) || st.state.toLowerCase(), tie = Math.abs(top.wr - low.wr) < 10;
      const slab = (m, main) => { const nm = name(m).toUpperCase(); return '<div class="jfw-slab' + (main ? ' main' : '') + '" data-a="' + (main ? 'a' : 'b') + '"><small>' + esc(t('state')) + '</small><strong style="font-size:' + fs(nm, main ? 60 : 40, main ? 200 : 190, .66) + 'px">' + esc(nm) + '</strong><span><b class="' + (m.wr >= 50 ? 'mint' : 'coral') + '">' + esc(pct(m.wr)) + '</b>' + esc(m.n + (m.n === 1 ? ' op' : ' ops') + ' · ' + signed(m.pnl)) + '</span></div>'; };
      list.push({ cls: 'd', html: head(t('k6'), t('h6', { state: name(top), wr: pct(top.wr) })) + slab(top, true) + (low !== top ? slab(low, false) : '') +
        '<div class="jfw-foot" style="top:490px" data-a="f">' + esc((x => x.charAt(0).toUpperCase() + x.slice(1))(tie ? t('mindTie') : t('mindBad', { state: name(low), wr: pct(low.wr) }))) + '</div>',
        anim(lt, $) { [['a', .4, -3], ['b', .75, 2]].forEach(([id, d, r]) => { const e = $(id); if (!e) return; const s = spring(lt - d, .5, 10); e.style.transform = 'perspective(600px) translateY(' + (1 - s) * 80 + 'px) rotateX(' + (1 - cl(s)) * -50 + 'deg) rotate(' + r * cl(s) + 'deg)'; e.style.opacity = cl((lt - d) / .3); });
          $('f').style.opacity = cl((lt - 2.1) / .5); } }); }
    // 7 · song on a turntable
    { const [song, artist] = w.song, why = t('why.' + w.mood, { g: w.later.g, n: w.later.n, wr: pct(w.winRate ?? 0), pct: pct(Math.ceil(w.usage ?? 0)) });
      list.push({ cls: 'd', html: head(t('k7')) + '<div class="jfw-tt" data-a="tt"><div class="jfw-disc" data-a="disc"><i></i><span>' + logo + '</span></div></div>' +
        kin('top:384px;font-size:64px;color:#fff', [[song + ' ·']]) + '<p class="jfw-sr">' + esc(song) + '</p><div class="jfw-artist" data-a="ar">' + esc(artist) + '</div><div class="jfw-foot" style="top:486px;font-size:12px" data-a="f">' + esc(why) + '</div>' +
        '<a class="jfw-spot jfw-live" data-a="sp" href="https://open.spotify.com/search/' + encodeURIComponent(song + ' ' + artist) + '" target="_blank" rel="noopener noreferrer">' + esc(t('listen')) + '<span><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1.5l6 3.5-6 3.5z" fill="#fff"/></svg></span></a>',
        anim(lt, $, el, T) { const k = out(cl((lt - .1) / 1)), tt = $('tt'); tt.style.transform = 'rotateX(' + (58 + (1 - k) * 30) + 'deg) rotateZ(-18deg) scale(' + (.8 + .2 * k) + ')'; tt.style.opacity = k; $('disc').style.transform = 'rotate(' + T * 160 + 'deg)';
          el.querySelector('.jfw-kin').style.opacity = cl((lt - .6) / .5); $('ar').style.opacity = cl((lt - .9) / .4); $('f').style.opacity = cl((lt - 1.5) / .5);
          const s = spring(lt - 2, .5), sp = $('sp'); sp.style.transform = 'scale(' + (.85 + .15 * s) + ')'; sp.style.opacity = cl((lt - 2) / .3); } }); }
    // 8 · phase target as stairs
    if (w.goal) { const f = Math.min(1, w.goal.have / w.goal.target), left = Math.max(0, w.goal.target - w.goal.have), key = f >= 1 ? 'done' : f >= .8 ? 'near' : f >= .4 ? 'half' : f > 0 ? 'low' : 'start', weeks = w.pnl > 0 && left > 0 ? Math.ceil(left / w.pnl) : null;
      const l8 = t('l8', { have: money(w.goal.have), target: money(w.goal.target), left: money(left) }), pace = f < 1 ? (weeks ? t('pace', { n: weeks === 1 ? t('week1') : t('weeks', { n: weeks }) }) : t('paceNo')) : '';
      list.push({ cls: 'l', html: head(t('k8', { phase: w.goal.phase }).toUpperCase(), t('h8.' + key)) + '<svg class="jfw-stairs" data-a="svg" width="360" height="330" viewBox="0 0 360 330" aria-hidden="true"></svg><div class="jfw-n8" data-a="n">0</div>' +
        '<div class="jfw-foot" style="top:520px" data-a="f">' + esc(l8) + (pace ? '<br><b>' + esc(pace) + '</b>' : '') + '</div>',
        anim(lt, $) { const n = 8, ff = f * out(cl((lt - 1) / 1.6)), pos = ff * (n - 1); let h = '';
          for (let i = 0; i < n; i++) { const k = spring(lt - .3 - i * .07, .55, 11), x = 12 + i * 42, y = 300 - (i + 1) * 30, hh = (330 - y) * k, lit = i <= pos + .001 && ff > 0; h += isoBar(x, 330 - hh, 38, hh, lit ? '#8b5cf6' : '#cdb8ff', lit ? '#6a2fe0' : '#a98df0', '#efe8ff'); }
          const fx = 12 + (n - 1) * 42 + 26, fy = 300 - n * 30 - 14; h += '<line x1="' + fx + '" y1="' + fy + '" x2="' + fx + '" y2="' + (fy - 34) + '" stroke="#1b0f3f" stroke-width="3" stroke-linecap="round"/><path d="M' + fx + ' ' + (fy - 34) + 'h22l-6 8 6 8h-22z" fill="#5ef0b6" stroke="#1b0f3f" stroke-width="2" stroke-linejoin="round"/>';
          if (lt > 1) { const i = Math.round(pos), px = 12 + i * 42 + 19 + 6, py = 300 - (i + 1) * 30 - 14; h += '<circle cx="' + px + '" cy="' + py + '" r="10" fill="#fff" stroke="#4a1bb3" stroke-width="4"/>'; }
          $('svg').innerHTML = h; const nn = $('n'); nn.textContent = pct(ff * 100); nn.style.opacity = cl((lt - 1) / .3); $('f').style.opacity = cl((lt - 2.4) / .5); } }); }
    // 9 · the Weekly Pass to share
    list.push({ cls: 'd', share: true, html: '<div class="jfw-pass" data-a="pw"><div class="jfw-face"><img data-jfw-img alt="' + esc(t('imgAlt')) + '"><i data-a="sh"></i></div><div class="jfw-face back">' + logo + '</div></div>' +
      '<div class="jfw-actions jfw-live" data-a="bt"><button class="jfw-btn main" type="button" data-jfw="share"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>' + esc(t('igShare')) + '</button>' +
      '<div class="jfw-row"><button class="jfw-btn ghost" type="button" data-jfw="save">' + esc(t('save')) + '</button><button class="jfw-btn ghost" type="button" data-jfw="again">' + esc(t('again')) + '</button></div>' +
      '<div class="jfw-toggle"><button class="jfw-sw" type="button" role="switch" aria-checked="false" data-jfw="amounts" aria-label="' + esc(t('showAmounts')) + '"></button><span>' + esc(t('showAmounts')) + '</span></div><p class="jfw-toast" role="status" data-jfw="toast"></p></div>',
      anim(lt, $) { const k = out(cl((lt - .1) / 1.6)), pw = $('pw'); pw.style.transform = 'rotateY(' + (1 - k) * -540 + 'deg) translateZ(' + (1 - k) * -200 + 'px)'; pw.style.opacity = cl((lt - .1) / .3);
        $('sh').style.transform = 'translateX(' + ((lt * 60) % 300 - 150) + '%)'; const b = spring(lt - 1.6, .55), bt = $('bt'); bt.style.transform = 'translateY(' + (1 - b) * 60 + 'px)'; bt.style.opacity = cl((lt - 1.6) / .3); } });
    return list;
  }

  /* ---------- player ---------- */
  let root = null, close = null;
  function ensureFont() {
    if (document.getElementById('jfwFont')) return;
    const l = document.createElement('link'); l.id = 'jfwFont'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@400..900&display=swap'; document.head.append(l);
  }
  function open(w) {
    if (root) return;
    ensureFont();
    const reduce = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
    const scenes = slidesFor(w), opener = document.activeElement;
    root = document.createElement('div'); root.className = 'jfw'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', t('aria')); root.setAttribute('data-i18n-ignore', '');
    root.innerHTML = '<div class="jfw-backdrop"></div><div class="jfw-stage" aria-roledescription="stories"><div class="jfw-slides">' +
      scenes.map(s => '<section class="jfw-slide ' + s.cls + '"><div class="jfw-area"><div class="jfw-box">' + s.html + '</div></div></section>').join('') + '</div>' +
      '<div class="jfw-top"><div class="jfw-bars">' + scenes.map(() => '<i><b></b></i>').join('') + '</div><div class="jfw-head"><img src="./brand-icon.svg?v=92" alt="" width="20" height="20"><strong>JourFund</strong><span>' + esc(range(w.start, w.end)) + '<br>' + esc(w.account.nickname || w.account.program) + '</span>' +
      '<button class="jfw-ctl" type="button" data-jfw="pause" aria-label="' + esc(t('pause')) + '"></button><button class="jfw-ctl" type="button" data-jfw="close" aria-label="' + esc(t('close')) + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>' +
      '<button class="jfw-nav prev" type="button" data-jfw="prev" aria-label="' + esc(t('prev')) + '"></button><button class="jfw-nav next" type="button" data-jfw="next" aria-label="' + esc(t('next')) + '"></button></div>';
    document.body.append(root); document.documentElement.classList.add('jfw-lock');
    const stage = root.querySelector('.jfw-stage'), slides = [...root.querySelectorAll('.jfw-slide')], fills = [...root.querySelectorAll('.jfw-bars b')], pauseBtn = root.querySelector('[data-jfw="pause"]');
    const pick = el => k => el.querySelector('[data-a="' + k + '"]');
    // Headlines that run long in some languages shrink until they fit in three lines.
    function size() {
      const area = slides[0].querySelector('.jfw-area').getBoundingClientRect();
      stage.style.setProperty('--k', String(Math.max(.5, Math.min(area.width / 360, area.height / 640))));
    }
    let index = 0, leaving = null, dir = 1, started = 0, elapsed = 0, paused = reduce, shownAt = 0, alive = true;
    const t0 = performance.now();
    function frame(now) {
      if (!alive) return;
      const T = reduce ? 0 : (now - t0) / 1000, since = (now - shownAt) / 1000, el = slides[index];
      if (leaving) {
        const p = reduce ? 1 : io(since / TR), a = 1 - p;
        if (p >= 1) { leaving.classList.remove('out'); leaving.style.transform = leaving.style.filter = ''; el.style.transform = el.style.filter = ''; leaving = null; }
        else {
          leaving.style.transformOrigin = dir > 0 ? '100% 50%' : '0% 50%'; leaving.style.transform = 'translateX(' + -dir * p * 100 + '%) rotateY(' + -dir * p * 90 + 'deg)'; leaving.style.filter = 'brightness(' + (1 - p * .6) + ')';
          el.style.transformOrigin = dir > 0 ? '0% 50%' : '100% 50%'; el.style.transform = 'translateX(' + dir * a * 100 + '%) rotateY(' + dir * a * 90 + 'deg)'; el.style.filter = 'brightness(' + (.4 + .6 * p) + ')';
        }
      }
      const lt = reduce ? 99 : Math.max(0, since - (index ? TR * .6 : 0));
      el.querySelectorAll('.jfw-h .w>span').forEach((s, i) => { const k = out(cl((lt - .1 - i * .055) / .8)); s.style.transform = 'translateY(' + (1 - k) * 110 + '%) rotate(' + (1 - k) * 8 + 'deg)'; });
      el.querySelectorAll('.jfw-kin>div').forEach((r, i) => { r.style.transform = 'translateX(' + ((((i % 2 ? 1 : -1) * T * 38) % 220) - (i % 2 ? 220 : 0)) + 'px)'; });
      const kn = el.querySelector('.jfw-kin'); if (kn && index === 0) kn.style.opacity = cl((lt - .2) / .6);
      try { scenes[index].anim(lt, pick(el), el, T); } catch {}
      if (!paused && index < scenes.length - 1) { const pr = Math.min(1, (elapsed + now - started) / (DUR * 1000)); fills[index].style.width = pr * 100 + '%'; if (pr >= 1) show(index + 1); }
      else if (index === scenes.length - 1) fills[index].style.width = '100%';
      requestAnimationFrame(frame);
    }
    function show(i) {
      const next = Math.max(0, Math.min(scenes.length - 1, i));
      if (next !== index && started) { if (leaving && leaving !== slides[next]) { leaving.classList.remove('out'); leaving.style.transform = leaving.style.filter = ''; } leaving = reduce ? null : slides[index]; dir = next > index ? 1 : -1; }
      slides.forEach((s, k) => { s.classList.toggle('on', k === next); s.classList.toggle('out', s === leaving); s.setAttribute('aria-hidden', String(k !== next)); if (k !== next && s !== leaving) s.style.transform = s.style.filter = ''; });
      index = next; stage.classList.toggle('is-light', scenes[index].cls === 'l');
      fills.forEach((f, k) => { f.style.width = k < index ? '100%' : '0%'; });
      shownAt = performance.now(); elapsed = 0; started = shownAt;
    }
    function setPaused(v) {
      if (v !== paused) { if (v) elapsed += performance.now() - started; else started = performance.now(); paused = v; }
      pauseBtn.setAttribute('aria-label', t(paused ? 'play' : 'pause'));
      pauseBtn.innerHTML = paused ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>';
    }
    let hold = 0, held = false;
    const onDown = e => { if (e.target.closest('.jfw-live,.jfw-ctl')) return; hold = setTimeout(() => { held = true; setPaused(true); }, 240); };
    const onUp = () => { clearTimeout(hold); if (held) { setPaused(false); setTimeout(() => { held = false; }, 0); } };
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') show(index + 1); else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === ' ' && !e.target.closest('button,a')) { e.preventDefault(); setPaused(!paused); }
      else if (e.key === 'Tab') { const items = [...root.querySelectorAll('.jfw-ctl,.jfw-nav,.jfw-slide.on a,.jfw-slide.on button')]; if (!items.length) return; const f = items[0], l = items[items.length - 1];
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); } else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); } }
    };
    const onResize = () => size();
    stage.addEventListener('pointerdown', onDown); addEventListener('pointerup', onUp); document.addEventListener('keydown', onKey, true); addEventListener('resize', onResize);
    root.addEventListener('click', e => {
      const act = e.target.closest('[data-jfw]')?.dataset.jfw; if (!act) { if (e.target.classList.contains('jfw-backdrop')) close(); return; }
      if (act === 'next' && !held) show(index + 1); else if (act === 'prev' && !held) show(index - 1);
      else if (act === 'pause') setPaused(!paused); else if (act === 'close') close(); else if (act === 'again') show(0);
      else if (act === 'amounts') { const sw = e.target.closest('[data-jfw="amounts"]'), on = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', String(on)); render(on); }
      else if (act === 'share') share(); else if (act === 'save') save();
    });
    // The shareable Weekly Pass: rebuilt when the amounts switch changes.
    let blob = null, blobUrl = '', building = null;
    const imgEl = root.querySelector('[data-jfw-img]'), toast = () => root.querySelector('[data-jfw="toast"]');
    function render(on) {
      blob = null;
      building = passImage(w, on).then(b => { blob = b; if (blobUrl) URL.revokeObjectURL(blobUrl); blobUrl = URL.createObjectURL(b); if (imgEl) imgEl.src = blobUrl; return b; });
      return building;
    }
    const fileName = () => 'jourfund-weekly-pass-' + w.start + '.png';
    async function share() {
      const b = blob || await building; if (!b) return;
      const file = new File([b], fileName(), { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file] }); } catch {} return; }
      save();
    }
    async function save() {
      const b = blob || await building; if (!b) return;
      const a = document.createElement('a'); a.href = blobUrl; a.download = fileName(); document.body.append(a); a.click(); a.remove();
      toast().textContent = t('saved');
    }
    close = () => {
      if (!root) return; alive = false;
      document.fonts?.removeEventListener?.('loadingdone', refit); stage.removeEventListener('pointerdown', onDown); removeEventListener('pointerup', onUp); document.removeEventListener('keydown', onKey, true); removeEventListener('resize', onResize);
      root.remove(); root = null; document.documentElement.classList.remove('jfw-lock'); if (blobUrl) URL.revokeObjectURL(blobUrl);
      (opener && document.contains(opener) ? opener : document.querySelector('#jfWrappedBanner button'))?.focus?.({ preventScroll: true });
    };
    try { localStorage.setItem(seenKey(w), '1'); } catch {}
    paintBanner();
    const fitHeads = () => root?.querySelectorAll('.jfw-h').forEach(h => { let s = 30; h.style.fontSize = s + 'px'; while (h.scrollHeight > 66 && s > 20) { s -= 1; h.style.fontSize = s + 'px'; } });
    const refit = () => fitHeads();
    document.fonts?.addEventListener?.('loadingdone', refit); setTimeout(refit, 1600);
    const go = () => { if (!root) return; size(); fitHeads(); render(false); show(0); setPaused(reduce); requestAnimationFrame(frame); root.querySelector('[data-jfw="close"]')?.focus({ preventScroll: true }); };
    (document.fonts?.load ? Promise.race([document.fonts.load('800 30px Geist'), new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(go, go);
  }

  /* ---------- banner on Inicio ---------- */
  let lastKey = '';
  function paintBanner() {
    const body = document.querySelector('#ftPageHome .ft-page-body');
    let el = document.getElementById('jfWrappedBanner');
    const w = document.body.classList.contains('ft-ready') ? pickWeek() : null;
    if (!w || !body) { el?.remove(); lastKey = ''; return; }
    let seen = false; try { seen = !!localStorage.getItem(seenKey(w)); } catch {}
    const key = [lang(), seenKey(w), seen, w.pnl, w.count, accountName(w.account)].join('|');
    if (el && key === lastKey && el.parentElement === body) return;
    lastKey = key;
    if (!el) { el = document.createElement('section'); el.id = 'jfWrappedBanner'; el.className = 'jfw-banner'; el.setAttribute('data-i18n-ignore', ''); }
    el.innerHTML = '<div class="jfw-banner-art" aria-hidden="true"><i></i><i></i><i></i></div><div class="jfw-banner-copy">' + (seen ? '' : '<span class="jfw-new">' + esc(t('isNew')) + '</span>') +
      '<h3>' + esc(t('banner')) + '</h3><p>' + esc(t('bannerSub', { range: range(w.start, w.end) })) + '</p><p class="jfw-acct">' + esc(accountName(w.account)) + '</p></div><button type="button" class="jfw-banner-btn">' + esc(t('bannerBtn')) + '</button>';
    el.querySelector('button').onclick = () => { const fresh = pickWeek(); if (fresh) open(fresh); };
    if (el.parentElement !== body) body.prepend(el);
  }
  const previous = window.render;
  if (typeof previous === 'function') window.render = function () { const out = previous.apply(this, arguments); try { paintBanner(); } catch {} return out; };
  new MutationObserver(() => paintBanner()).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('jfLanguageChanged', () => { lastKey = ''; paintBanner(); });
  window.JourFundWrapped = { open: () => { const w = pickWeek(); if (w) open(w); return !!w; }, compute: pickWeek };
  paintBanner();
})();
