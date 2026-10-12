/* JourFund Wrapped (v141): animated stories of the user's last completed week for the active account.
   Data comes from the same trades and rules the app already uses (FTRules). Slides without data are skipped.
   Opens from a banner on Inicio; nothing is saved to the cloud (only a "seen" flag in localStorage). */
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
      shareText: 'Mi semana en JourFund: {result} · {wr} win rate · mejor día {day} · canción: {song}. jourfund.com',
      states: { Bien: 'bien', Ansioso: 'ansioso', MOLESTO: 'molesto' },
      why: {
        comeback: 'Arrancaste en rojo y no paraste más: {g} de los {n} días siguientes cerraron en verde.',
        tiger: 'Ganaste {wr} de tus operaciones. Semana de campeón.',
        safe: 'Ganaste sin arriesgar de más: tu peor día usó el {pct} del límite.',
        good: 'Terminaste en verde y con calma.',
        pressure: 'Semana pesada: llegaste al {pct} de tu límite diario.',
        sun: 'No fue tu semana, pero viene una nueva.',
        flat: 'Semana en equilibrio. Dejala ser.'
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
      shareText: 'My week on JourFund: {result} · {wr} win rate · best day {day} · song: {song}. jourfund.com',
      states: { Bien: 'good', Ansioso: 'anxious', MOLESTO: 'upset' },
      why: {
        comeback: 'You started in the red and didn\'t stop: {g} of the next {n} days closed green.',
        tiger: 'You won {wr} of your trades. A champion\'s week.',
        safe: 'You won without overrisking: your worst day used {pct} of the limit.',
        good: 'You finished green and calm.',
        pressure: 'A heavy week: you reached {pct} of your daily limit.',
        sun: 'Not your week, but a new one is coming.',
        flat: 'A balanced week. Let it be.'
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
      shareText: 'Minha semana no JourFund: {result} · {wr} win rate · melhor dia {day} · música: {song}. jourfund.com',
      states: { Bien: 'bem', Ansioso: 'ansioso', MOLESTO: 'irritado' },
      why: {
        comeback: 'Você começou no vermelho e não parou mais: {g} dos {n} dias seguintes fecharam no verde.',
        tiger: 'Você ganhou {wr} das suas operações. Semana de campeão.',
        safe: 'Você ganhou sem arriscar demais: seu pior dia usou {pct} do limite.',
        good: 'Você terminou no verde e com calma.',
        pressure: 'Semana pesada: você chegou a {pct} do seu limite diário.',
        sun: 'Não foi sua semana, mas vem uma nova.',
        flat: 'Semana equilibrada. Deixe estar.'
      }
    }
  };
  const t = (key, vars = {}) => { let s = key.split('.').reduce((o, k) => o?.[k], S[lang()]) ?? key.split('.').reduce((o, k) => o?.[k], S.es) ?? key; return typeof s === 'string' ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : s; };
  const SONGS = {
    comeback: ["Don't Stop Me Now", 'Queen'], tiger: ['Eye of the Tiger', 'Survivor'], safe: ["Stayin' Alive", 'Bee Gees'],
    good: ['Feeling Good', 'Nina Simone'], pressure: ['Under Pressure', 'Queen & David Bowie'], sun: ['Here Comes the Sun', 'The Beatles'], flat: ['Let It Be', 'The Beatles']
  };

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
  function activeAccount() {
    try { const s = window.ftProtectionCloud.snapshot(); return s.accounts.find(a => a.id === s.activeId) || null; } catch { return null; }
  }
  function compute(a) {
    if (!a || a.accountType === 'personal') return null;
    const today = R.accountDay(a), start = add(monday(today), -7), end = add(start, 6);
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
    let usage = null, alerts = 0;
    for (const date of currentDays) {
      try { const r = R.risk(a, date); if (r && Number(r.dailyBudget) > 0) { const u = Math.max(0, Math.min(100, (r.dailyBudget - r.dailyRemaining) / r.dailyBudget * 100)); usage = Math.max(usage ?? 0, u); if (u >= 70) alerts++; } } catch {}
    }
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
      usage, alerts, moods: moodList.length >= 2 ? moodList.sort((x, y) => y.wr - x.wr) : null, goal,
      accountPct: Number(a.capital) > 0 ? pnl / Number(a.capital) * 100 : 0,
      mood, song: SONGS[mood], later: { g: later.filter(d => d.pnl > 0).length, n: later.length }
    };
  }
  const seenKey = w => 'jourfund_wrapped_' + (window.ftCloudSession?.user?.id || 'x') + '_' + w.account.id + '_' + w.start;

  /* ---------- canvas heroes (progress t from 0 to 1) ---------- */
  const FONT = '"Bricolage Grotesque", Inter, sans-serif';
  const ease = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 4);
  const back = x => { x = Math.max(0, Math.min(1, x)); return 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2); };
  const LOGO = ['M126 32C94 32 70 55 70 80V99L126 48Z', 'M20 166H53C56 190 69 203 92 203H126V222C126 234 119 240 107 240H91C50 240 23 211 20 166Z', 'M136 32H169V190C169 211 156 228 136 236Z', 'M136 32H226C220 57 207 68 186 68H169V104H200V138H136Z', 'M79 143H97V179H79Z', 'M107 116H125V159H107Z'];
  function fitFont(g, s, w, h) { let size = h; g.font = '800 ' + size + 'px ' + FONT; const m = g.measureText(s).width; if (m > w) size = size * w / m; return size; }
  function grad(g, x0, y0, x1, y1, c) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c[1]); gr.addColorStop(.55, c[0]); gr.addColorStop(1, c[2]); return gr; }
  function roundRect(g, x, y, w, h, r) { if (h <= 0) return; r = Math.max(0, Math.min(r, h / 2, w / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.arcTo(x, y, x + w, y, r); g.fill(); }
  const P = {
    text(g, [x0, y0, x1, y1], t, c, _, s) {
      const w = x1 - x0, h = y1 - y0, size = fitFont(g, s, w, h * .9), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      g.save(); g.font = '800 ' + size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
      const tw = g.measureText(s).width, rev = ease(t);
      g.beginPath(); g.rect(cx - tw / 2 - 20, y0 - 40, (tw + 40) * rev, h + 80); g.clip();
      g.translate(cx, cy + (1 - rev) * 30); const k = .92 + .08 * back(t); g.scale(k, k);
      g.fillStyle = grad(g, -tw / 2, -size / 2, tw / 2, size / 2, c); g.fillText(s, 0, size * .04); g.restore();
    },
    ring(g, [x0, y0, x1, y1], t, c, _, frac) {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.min(x1 - x0, y1 - y0) / 2 * .92, th = r * .2, rr = r - th / 2, e = ease(t);
      g.save(); g.lineWidth = th; g.lineCap = 'round';
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke();
      const end = -Math.PI / 2 + Math.PI * 2 * Math.max(.001, frac) * e;
      if (frac > 0) { g.strokeStyle = grad(g, cx - r, cy - r, cx + r, cy + r, c); g.beginPath(); g.arc(cx, cy, rr, -Math.PI / 2, end); g.stroke();
        g.fillStyle = c[1]; g.beginPath(); g.arc(cx + Math.cos(end) * rr, cy + Math.sin(end) * rr, th * .32, 0, Math.PI * 2); g.fill(); }
      const label = Math.round(frac * 100 * e) + '%', size = fitFont(g, '100%', r * 1.2, r * .62);
      g.globalAlpha = ease(t * 1.6); g.font = '800 ' + size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(label, cx, cy + size * .04); g.restore();
    },
    bars(g, [x0, y0, x1, y1], t, c, _, vals) {
      const up = Math.max(0, ...vals), down = Math.max(0, ...vals.map(v => -v)), span = (up + down) || 1, zero = y0 + (y1 - y0) * up / span;
      const n = vals.length, gap = (x1 - x0) * .05, bw = ((x1 - x0) - gap * (n - 1)) / n, top = vals.indexOf(Math.max(...vals));
      if (down > 0) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x0, zero - 1, x1 - x0, 2); }
      vals.forEach((v, i) => { const k = i === top ? back((t - .25) * 1.5) : ease((t - i * .08) * 1.6), h = Math.max(0, Math.abs(v) / span * (y1 - y0) * k), x = x0 + i * (bw + gap);
        g.fillStyle = i === top && v > 0 ? grad(g, x, zero - h, x + bw, zero, c) : v < 0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.42)';
        if (v >= 0) roundRect(g, x, zero - h, bw, h, Math.min(14, bw / 3));
        else { g.save(); g.translate(0, zero * 2); g.scale(1, -1); roundRect(g, x, zero - h, bw, h, Math.min(14, bw / 3)); g.restore(); } });
    },
    coin(g, [x0, y0, x1, y1], t, c, time, label) {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + Math.sin(time / 600) * 4, r = Math.min(x1 - x0, y1 - y0) / 2, e = ease(t), sx = Math.max(.04, Math.abs(Math.cos((1 - e) * Math.PI * 4)));
      g.save(); g.translate(cx, cy); g.scale(sx * (.5 + .5 * e), .5 + .5 * e);
      const rg = g.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r); rg.addColorStop(0, '#fff6cc'); rg.addColorStop(.42, '#f5c84a'); rg.addColorStop(.78, '#b5801a'); rg.addColorStop(1, '#6e4a08');
      g.fillStyle = rg; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,236,170,.55)'; g.lineWidth = r * .05; g.beginPath(); g.arc(0, 0, r * .84, 0, Math.PI * 2); g.stroke();
      const size = fitFont(g, label, r * 1.25, r * .55); g.font = '800 ' + size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#5a3c03'; g.fillText(label, 0, size * .06);
      const p = ((time / 2400) % 1) * 3 - 1, sh = g.createLinearGradient(-r, -r, r, r), cl = v => Math.max(0, Math.min(1, v));
      sh.addColorStop(cl(p - .1), 'rgba(255,255,255,0)'); sh.addColorStop(cl(p), 'rgba(255,255,255,.45)'); sh.addColorStop(cl(p + .1), 'rgba(255,255,255,0)');
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = sh; g.fillRect(-r, -r, r * 2, r * 2); g.restore();
    },
    shield(g, [x0, y0, x1, y1], t, c, _, ok) {
      const s = Math.min(x1 - x0, y1 - y0) / 24, k = back(t);
      g.save(); g.translate((x0 + x1) / 2, (y0 + y1) / 2); g.scale(s * k, s * k); g.translate(-12, -12);
      g.fillStyle = grad(g, 3, 2, 21, 22, c); g.fill(new Path2D('M12 2l8.5 3.4v6.3c0 5-3.6 8.7-8.5 10.3-4.9-1.6-8.5-5.3-8.5-10.3V5.4L12 2z'));
      g.strokeStyle = ok ? '#05303a' : '#3a0610'; g.lineWidth = 2.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([14, 14]); g.lineDashOffset = 14 - 14 * ease((t - .45) * 2);
      g.stroke(new Path2D(ok ? 'M8 12.2l2.7 2.7L16.3 9' : 'M12 7.5v6M12 16.6v.2')); g.restore();
    },
    word(g, [x0, y0, x1, y1], t, c, _, s) {
      const size = fitFont(g, s, x1 - x0, (y1 - y0) * .9); g.save(); g.font = '800 ' + size + 'px ' + FONT; g.textBaseline = 'middle';
      let x = (x0 + x1) / 2 - g.measureText(s).width / 2;
      [...s].forEach((ch, i) => { const cw = g.measureText(ch).width, k = back((t - i * .1) * 1.6), m = Math.min(1, k);
        g.save(); g.translate(x + cw / 2, (y0 + y1) / 2 + (1 - m) * 60); g.scale(k, k); g.rotate((1 - m) * .3); g.fillStyle = grad(g, -cw / 2, -size / 2, cw / 2, size / 2, c); g.fillText(ch, -cw / 2, size * .04); g.restore(); x += cw; });
      g.restore();
    },
    vinyl(g, [x0, y0, x1, y1], t, c, time) {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.min(x1 - x0, y1 - y0) / 2 * (.7 + .3 * back(t));
      g.save(); g.translate(cx, cy); g.rotate(time / 900);
      g.fillStyle = '#121016'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1; for (let k = .28; k < .98; k += .045) { g.beginPath(); g.arc(0, 0, r * k, 0, Math.PI * 2); g.stroke(); }
      if (g.createConicGradient) { const sh = g.createConicGradient(0, 0, 0); [[0, 0], [.08, .16], [.16, 0], [.5, 0], [.58, .12], [.66, 0]].forEach(([o, a]) => sh.addColorStop(o, 'rgba(255,255,255,' + a + ')')); g.fillStyle = sh; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = grad(g, -r * .25, -r * .25, r * .25, r * .25, c); g.beginPath(); g.arc(0, 0, r * .25, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.8)'; g.font = '700 ' + Math.round(r * .07) + 'px ' + FONT; g.textAlign = 'center'; g.fillText('JOURFUND', 0, -r * .1);
      g.fillStyle = '#0b0614'; g.beginPath(); g.arc(0, 0, r * .035, 0, Math.PI * 2); g.fill(); g.restore();
      g.save(); g.translate(cx + r * 1.02, cy - r * .95); g.rotate(-.55 + .55 * ease((t - .3) * 1.6));
      g.strokeStyle = '#d9d6e4'; g.lineWidth = Math.max(3, r * .035); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-r * .18, r * .9); g.lineTo(-r * .42, r * 1.12); g.stroke();
      g.fillStyle = '#d9d6e4'; g.beginPath(); g.arc(0, 0, r * .09, 0, Math.PI * 2); g.fill(); g.restore();
    },
    logo(g, [x0, y0, x1, y1], t, c) {
      const s = Math.min(x1 - x0, y1 - y0) / 215, from = [[-60, -40], [-70, 50], [0, 80], [70, -50], [-40, 60], [40, 70]];
      g.save(); g.translate((x0 + x1) / 2 - 123 * s, (y0 + y1) / 2 - 136 * s); g.scale(s, s);
      LOGO.forEach((d, i) => { const k = ease((t - i * .1) * 1.6); g.save(); g.globalAlpha = k; g.translate(from[i][0] * (1 - k), from[i][1] * (1 - k)); g.fillStyle = i < 2 ? '#fbf9ff' : grad(g, 136, 32, 226, 236, c); g.fill(new Path2D(d)); g.restore(); });
      g.restore();
    }
  };

  /* ---------- slides from the data ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const chips = list => '<div class="jfw-chips jfw-rise jfw-d2">' + list.map(([b, s]) => '<div class="jfw-chip"><b>' + esc(b) + '</b><span>' + esc(s) + '</span></div>').join('') + '</div>';
  const foot = () => '<p class="jfw-foot">' + esc(t('tap')) + '</p>';
  function slidesFor(w) {
    const out = [], green = w.pnl >= 0;
    out.push({ bg: green ? [18, 6, 46] : [40, 6, 18], cols: green ? ['#5ef0b6', '#c9ffe8', '#2fb886'] : ['#ff8a9a', '#ffd3da', '#e0475d'], box: [.08, .30, .92, .62], hero: ['text', signed(w.pnl)],
      html: '<div><p class="jfw-kick">' + esc(t('k1')) + '</p><h2 class="jfw-kin">' + esc(t(w.pnl === 0 ? 'h1z' : 'h1p')) + '</h2></div><div class="jfw-lower"><p class="jfw-line jfw-rise jfw-d2">' + esc(t('l1', { pct: spct(w.accountPct), n: w.count })) + '</p>' + foot() + '</div>' });
    if (w.decisive) out.push({ bg: [3, 40, 30], cols: ['#5ef0b6', '#eafff4', '#1fae7a'], box: [.14, .26, .86, .70], hero: ['ring', w.winRate / 100],
      html: '<div><p class="jfw-kick">' + esc(t('k2')) + '</p><h2 class="jfw-kin">' + esc(t('h2', { w: w.wins, d: w.decisive })) + '</h2></div><div class="jfw-lower">' + chips([[w.wins, t('won')], [w.losses, t('lost')], [w.be, t('be')]]) + '<p class="jfw-foot">' + esc(t('f2')) + '</p></div>' });
    if (w.best) out.push({ bg: [46, 20, 0], cols: ['#ffc14d', '#fff0b8', '#ff7a1a'], box: [.09, .40, .91, .70], hero: ['bars', w.days.map(d => d.pnl)],
      html: '<div><p class="jfw-kick">' + esc(t('k3')) + '</p><h2 class="jfw-kin">' + esc(weekday(w.best.date)) + '</h2><p class="jfw-big jfw-rise jfw-d1" style="color:#ffc14d">' + esc(signed(w.best.pnl)) + '</p></div><div class="jfw-lower"><div class="jfw-days jfw-rise jfw-d2">' +
        w.days.map(d => '<span' + (d.date === w.best.date ? ' class="hi"' : '') + '>' + esc(signed(d.pnl)) + '<em>' + esc(weekday(d.date, 'short')) + '</em></span>').join('') + '</div><p class="jfw-line jfw-rise jfw-d3">' + esc(t('l3', { pct: pct(w.best.share) })) + '</p>' + foot() + '</div>' });
    if (w.star) out.push({ bg: [20, 14, 3], cols: ['#f5d27a', '#fff1c2', '#b5801a'], box: [.24, .22, .76, .50], hero: ['coin', w.star.asset.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || '$'],
      html: '<div><p class="jfw-kick">' + esc(t('k4')) + '</p><h2 class="jfw-kin">' + esc(t('h4', { asset: w.star.asset })) + '</h2></div><div class="jfw-lower"><p class="jfw-big jfw-rise jfw-d1 jfw-center" style="color:#f5d27a;font-size:clamp(34px,10vw,44px)">' + esc(w.star.asset) + ' <span style="color:#5ef0b6">' + esc(signed(w.star.pnl)) + '</span></p>' +
        chips([[w.star.n, t('ops')], [w.star.wr == null ? '—' : pct(w.star.wr), t('wr')], [pct(w.star.share), t('ofGain')]]) + foot() + '</div>' });
    if (w.usage != null) { const ok = w.alerts === 0; out.push({ bg: ok ? [3, 38, 44] : [44, 10, 14], cols: ok ? ['#7ff5c6', '#e0fff3', '#2fb8a0'] : ['#ff8a9a', '#ffe0e4', '#e0475d'], box: [.22, .30, .78, .70], hero: ['shield', ok],
      html: '<div><p class="jfw-kick">' + esc(t('k5')) + '</p><h2 class="jfw-kin">' + esc(t(ok ? 'h5ok' : 'h5bad', { pct: pct(Math.max(1, Math.ceil(w.usage))) })) + '</h2></div><div class="jfw-lower">' + chips([[w.alerts, t('alerts')], [pct(Math.ceil(w.usage)), t('worst')], ['70 %', t('warn')]]) + '<p class="jfw-line jfw-rise jfw-d3">' + esc(t(ok ? 'l5ok' : 'l5bad')) + '</p>' + foot() + '</div>' }); }
    if (w.moods) { const top = w.moods[0], low = w.moods[w.moods.length - 1], name = st => t('states.' + st.state) || st.state.toLowerCase(), tie = Math.abs(top.wr - low.wr) < 10;
      out.push({ bg: [52, 6, 34], cols: ['#ffffff', '#ffe3f0', '#ff6fb5'], box: [.08, .32, .92, .62], hero: ['word', name(top).toUpperCase()],
        html: '<div><p class="jfw-kick">' + esc(t('k6')) + '</p><h2 class="jfw-kin">' + esc(t('h6', { state: name(top), wr: pct(top.wr) })) + '</h2></div><div class="jfw-lower">' + chips(w.moods.slice(0, 3).map(m => [m.n + (m.n === 1 ? ' op' : ' ops'), name(m) + ' · ' + signed(m.pnl)])) +
          '<p class="jfw-note jfw-rise jfw-d3">' + esc(tie ? t('mindTie') : t('mindBad', { state: name(low), wr: pct(low.wr) })) + '</p></div>' }); }
    const [song, artist] = w.song, why = t('why.' + w.mood, { g: w.later.g, n: w.later.n, wr: pct(w.winRate ?? 0), pct: pct(Math.ceil(w.usage ?? 0)) });
    out.push({ bg: [13, 6, 24], cols: ['#ff5fa8', '#ffb3d6', '#8b5cf6'], box: [.22, .19, .78, .47], hero: ['vinyl'],
      html: '<div><p class="jfw-kick">' + esc(t('k7')) + '</p></div><div class="jfw-lower"><p class="jfw-song jfw-rise jfw-d1">' + esc(song) + '</p><p class="jfw-artist jfw-rise jfw-d1">' + esc(artist) + '</p><div class="jfw-eq" aria-hidden="true">' + '<i></i>'.repeat(15) + '</div><p class="jfw-note jfw-rise jfw-d2">' + esc(why) + '</p>' +
        '<div class="jfw-center jfw-rise jfw-d3"><a class="jfw-btn jfw-live" href="https://open.spotify.com/search/' + encodeURIComponent(song + ' ' + artist) + '" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' + esc(t('listen')) + '</a></div></div>' });
    if (w.goal) { const f = Math.min(1, w.goal.have / w.goal.target), left = Math.max(0, w.goal.target - w.goal.have), key = f >= 1 ? 'done' : f >= .8 ? 'near' : f >= .4 ? 'half' : f > 0 ? 'low' : 'start', weeks = w.pnl > 0 && left > 0 ? Math.ceil(left / w.pnl) : null;
      out.push({ bg: [18, 10, 58], cols: ['#a78bfa', '#efe8ff', '#6d3cf0'], box: [.14, .25, .86, .70], hero: ['ring', f],
        html: '<div><p class="jfw-kick">' + esc(t('k8', { phase: w.goal.phase })) + '</p><h2 class="jfw-kin">' + esc(t('h8.' + key)) + '</h2></div><div class="jfw-lower"><p class="jfw-line jfw-rise jfw-d2">' + esc(t('l8', { have: money(w.goal.have), target: money(w.goal.target), left: money(left) })) + '</p>' +
          (f < 1 ? '<p class="jfw-note jfw-rise jfw-d3 jfw-tc">' + esc(weeks ? t('pace', { n: weeks === 1 ? t('week1') : t('weeks', { n: weeks }) }) : t('paceNo')) + '</p>' : '') + foot() + '</div>' }); }
    const tiles = [[w.winRate == null ? '—' : pct(w.winRate), t('wr')], [w.best ? weekday(w.best.date) : '—', t('bestDay')], [w.star ? w.star.asset : '—', t('star')], [w.usage == null ? '—' : pct(Math.ceil(w.usage)), t('maxLimit')]];
    out.push({ bg: [12, 9, 24], cols: ['#9464ef', '#c9b0ff', '#6a3be0'], box: [.33, .10, .67, .30], hero: ['logo'], share: true,
      html: '<div style="height:30%"></div><div class="jfw-lower"><div class="jfw-card"><div class="jfw-ch"><span>' + esc(t('k9')) + '</span><span>' + esc(range(w.start, w.end)) + '</span></div><p class="jfw-cbig' + (w.pnl < 0 ? ' neg' : '') + '" data-jfw-result>' + esc(spct(w.accountPct)) + '</p>' +
        '<div class="jfw-cg">' + tiles.map(([b, s]) => '<div><b>' + esc(b) + '</b><span>' + esc(s) + '</span></div>').join('') + '<div class="full">' + esc(t('song')) + ': <b>' + esc(song + ' · ' + artist) + '</b></div></div></div>' +
        '<div class="jfw-toggle jfw-live"><button class="jfw-sw" type="button" role="switch" aria-checked="false" data-jfw="amounts" aria-label="' + esc(t('showAmounts')) + '"></button><span>' + esc(t('showAmounts')) + '</span></div>' +
        '<div class="jfw-row jfw-live"><button class="jfw-btn" type="button" data-jfw="share">' + esc(t('share')) + '</button><button class="jfw-btn ghost" type="button" data-jfw="again">' + esc(t('again')) + '</button></div><p class="jfw-toast" role="status" data-jfw="toast"></p></div>' });
    return out;
  }

  /* ---------- player ---------- */
  let root = null, close = null;
  function ensureFont() {
    if (document.getElementById('jfwFont')) return;
    const l = document.createElement('link'); l.id = 'jfwFont'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap'; document.head.append(l);
  }
  function open(w) {
    if (root) return;
    ensureFont();
    const reduce = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
    const scenes = slidesFor(w), opener = document.activeElement;
    root = document.createElement('div'); root.className = 'jfw'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', t('aria')); root.setAttribute('data-i18n-ignore', '');
    root.innerHTML = '<div class="jfw-backdrop"></div><div class="jfw-stage" aria-roledescription="stories"><canvas aria-hidden="true"></canvas><div class="jfw-vig"></div><div class="jfw-grain"></div>' +
      '<div class="jfw-top"><div class="jfw-bars">' + scenes.map(() => '<i><b></b></i>').join('') + '</div><div class="jfw-head"><img src="./brand-icon.svg?v=92" alt="" width="22" height="22"><strong>JourFund</strong><span>' + esc(range(w.start, w.end)) + '</span>' +
      '<button class="jfw-ctl" type="button" data-jfw="pause" aria-label="' + esc(t('pause')) + '"></button><button class="jfw-ctl" type="button" data-jfw="close" aria-label="' + esc(t('close')) + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>' +
      '<button class="jfw-nav prev" type="button" data-jfw="prev" aria-label="' + esc(t('prev')) + '"></button><button class="jfw-nav next" type="button" data-jfw="next" aria-label="' + esc(t('next')) + '"></button>' +
      scenes.map(s => '<section class="jfw-slide">' + s.html + '</section>').join('') + '</div>';
    document.body.append(root); document.documentElement.classList.add('jfw-lock');
    const stage = root.querySelector('.jfw-stage'), canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d'), layer = document.createElement('canvas'), lg = layer.getContext('2d');
    const slides = [...root.querySelectorAll('.jfw-slide')], fills = [...root.querySelectorAll('.jfw-bars b')], pauseBtn = root.querySelector('[data-jfw="pause"]');
    root.querySelectorAll('.jfw-kin').forEach(el => { const txt = el.textContent; el.textContent = ''; let i = 0;
      txt.split(' ').forEach((word, k) => { if (k) el.append(' '); const box = document.createElement('span'); box.className = 'wd';
        [...word].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; s.style.animationDelay = (.25 + i++ * .025) + 's'; box.append(s); }); el.append(box); });
      el.setAttribute('aria-label', txt); });
    let W = 0, H = 0, DPR = 1, index = 0, started = 0, elapsed = 0, paused = reduce, shownAt = 0, alive = true, fromBg = scenes[0].bg, toBg = scenes[0].bg, bgT = 1;
    const orbs = Array.from({ length: 7 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: .18 + Math.random() * .22, sp: .00005 + Math.random() * .00008, ph: Math.random() * 6.28, c: i % 3 }));
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    function size() { const r = stage.getBoundingClientRect(); W = r.width; H = r.height; DPR = Math.min(2, devicePixelRatio || 1); canvas.width = layer.width = Math.round(W * DPR); canvas.height = layer.height = Math.round(H * DPR); }
    const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; };
    function frame(now) {
      if (!alive) return;
      if (bgT < 1) bgT = Math.min(1, bgT + .03);
      const sc = scenes[index], col = sc.cols, bg = fromBg.map((v, k) => Math.round(v + (toBg[k] - v) * bgT));
      pointer.x += (pointer.tx - pointer.x) * .08; pointer.y += (pointer.ty - pointer.y) * .08;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgb(' + bg.join(',') + ')'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      orbs.forEach(o => { const x = (o.x + Math.sin(now * o.sp + o.ph) * .12) * W, y = (o.y + Math.cos(now * o.sp * 1.3 + o.ph) * .1) * H, r = o.r * W * 1.4, gr = ctx.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, hexA(col[o.c], .16)); gr.addColorStop(1, hexA(col[o.c], 0)); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); });
      ctx.globalCompositeOperation = 'source-over';
      const tt = reduce ? 1 : Math.min(1, Math.max(0, (now - shownAt - 250) / 1500)), [a, b, c, d] = sc.box, [name, arg] = sc.hero;
      lg.setTransform(DPR, 0, 0, DPR, 0, 0); lg.clearRect(0, 0, W, H); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1;
      try { P[name](lg, [a * W, b * H, c * W, d * H], tt, col, now, arg); } catch {}
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.shadowColor = hexA(col[0], .55); ctx.shadowBlur = 40 * DPR; ctx.drawImage(layer, pointer.x * 14 * DPR, pointer.y * 14 * DPR); ctx.restore();
      if (!paused && index < scenes.length - 1) { const p = Math.min(1, (elapsed + now - started) / 7000); fills[index].style.width = p * 100 + '%'; if (p >= 1) show(index + 1); }
      else if (index === scenes.length - 1) fills[index].style.width = '100%';
      requestAnimationFrame(frame);
    }
    function show(i) {
      const next = Math.max(0, Math.min(scenes.length - 1, i));
      fromBg = scenes[index].bg; toBg = scenes[next].bg; bgT = reduce || next === index ? 1 : 0; index = next;
      slides.forEach((s, k) => { s.classList.remove('on'); s.setAttribute('aria-hidden', String(k !== index)); });
      void slides[index].offsetWidth; slides[index].classList.add('on');
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
    const onMove = e => { const r = stage.getBoundingClientRect(); pointer.tx = (e.clientX - r.left) / r.width - .5; pointer.ty = (e.clientY - r.top) / r.height - .5; };
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') show(index + 1); else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === ' ' && !e.target.closest('button,a')) { e.preventDefault(); setPaused(!paused); }
      else if (e.key === 'Tab') { const items = [...root.querySelectorAll('.jfw-ctl,.jfw-nav,.jfw-slide.on a,.jfw-slide.on button')]; if (!items.length) return; const f = items[0], l = items[items.length - 1];
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); } else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); } }
    };
    const onResize = () => size();
    stage.addEventListener('pointerdown', onDown); addEventListener('pointerup', onUp); stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', () => { pointer.tx = pointer.ty = 0; }); document.addEventListener('keydown', onKey, true); addEventListener('resize', onResize);
    root.addEventListener('click', e => {
      const act = e.target.closest('[data-jfw]')?.dataset.jfw; if (!act) { if (e.target.classList.contains('jfw-backdrop')) close(); return; }
      if (act === 'next' && !held) show(index + 1); else if (act === 'prev' && !held) show(index - 1);
      else if (act === 'pause') setPaused(!paused); else if (act === 'close') close(); else if (act === 'again') show(0);
      else if (act === 'amounts') { const sw = e.target.closest('[data-jfw="amounts"]'), on = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', String(on)); root.querySelector('[data-jfw-result]').textContent = on ? signed(w.pnl) : spct(w.accountPct); }
      else if (act === 'share') share();
    });
    function share() {
      const on = root.querySelector('[data-jfw="amounts"]').getAttribute('aria-checked') === 'true', toast = root.querySelector('[data-jfw="toast"]');
      const text = t('shareText', { result: on ? signed(w.pnl) : spct(w.accountPct), wr: w.winRate == null ? '—' : pct(w.winRate), day: w.best ? weekday(w.best.date) : '—', song: w.song[0] + ' (' + w.song[1] + ')' });
      if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
      navigator.clipboard?.writeText(text).then(() => { toast.textContent = t('copied'); }, () => { toast.textContent = t('copyFail'); });
    }
    close = () => {
      if (!root) return; alive = false;
      stage.removeEventListener('pointerdown', onDown); removeEventListener('pointerup', onUp); document.removeEventListener('keydown', onKey, true); removeEventListener('resize', onResize);
      root.remove(); root = null; document.documentElement.classList.remove('jfw-lock');
      (opener && document.contains(opener) ? opener : document.querySelector('#jfWrappedBanner button'))?.focus?.({ preventScroll: true });
    };
    try { localStorage.setItem(seenKey(w), '1'); } catch {}
    paintBanner();
    const go = () => { size(); show(0); setPaused(reduce); requestAnimationFrame(frame); root?.querySelector('[data-jfw="close"]')?.focus({ preventScroll: true }); };
    (document.fonts?.load ? Promise.race([document.fonts.load('800 100px "Bricolage Grotesque"'), new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(go, go);
  }

  /* ---------- banner on Inicio ---------- */
  let lastKey = '';
  function paintBanner() {
    const body = document.querySelector('#ftPageHome .ft-page-body');
    let el = document.getElementById('jfWrappedBanner');
    const w = document.body.classList.contains('ft-ready') ? compute(activeAccount()) : null;
    if (!w || !body) { el?.remove(); lastKey = ''; return; }
    let seen = false; try { seen = !!localStorage.getItem(seenKey(w)); } catch {}
    const key = [lang(), seenKey(w), seen, w.pnl, w.count].join('|');
    if (el && key === lastKey && el.parentElement === body) return;
    lastKey = key;
    if (!el) { el = document.createElement('section'); el.id = 'jfWrappedBanner'; el.className = 'jfw-banner'; el.setAttribute('data-i18n-ignore', ''); }
    el.innerHTML = '<div class="jfw-banner-art" aria-hidden="true"><i></i><i></i><i></i></div><div class="jfw-banner-copy">' + (seen ? '' : '<span class="jfw-new">' + esc(t('isNew')) + '</span>') +
      '<h3>' + esc(t('banner')) + '</h3><p>' + esc(t('bannerSub', { range: range(w.start, w.end) })) + '</p></div><button type="button" class="jfw-banner-btn">' + esc(t('bannerBtn')) + '</button>';
    el.querySelector('button').onclick = () => { const fresh = compute(activeAccount()); if (fresh) open(fresh); };
    if (el.parentElement !== body) body.prepend(el);
  }
  const previous = window.render;
  if (typeof previous === 'function') window.render = function () { const out = previous.apply(this, arguments); try { paintBanner(); } catch {} return out; };
  new MutationObserver(() => paintBanner()).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('jfLanguageChanged', () => { lastKey = ''; paintBanner(); });
  window.JourFundWrapped = { open: () => { const w = compute(activeAccount()); if (w) open(w); return !!w; }, compute: () => compute(activeAccount()) };
  paintBanner();
})();
