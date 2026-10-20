/* Objetivos · "Tu ascenso" (v171: desktop altimeter). The phase target drawn as a climb up the mountain scene:
   progress along the path with 25/50/75 % camps (dated when reached), what is left, the pass requirements,
   pace and suggested daily goal, distance to the target vs. to the max-loss floor, and what comes next.
   Uses only the account's own trades and rules (FTRules). Hidden for group mode and accounts without a target. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), R = window.FTRules, page = $('ftPageObjectives');
  const body = page?.querySelector('.ft-page-body');
  if (!R || !body) return;

  const lang = () => ['en', 'pt-BR'].includes(window.JourFundI18n?.language) ? window.JourFundI18n.language : 'es';
  const T = (es, en, pt) => lang() === 'en' ? en : lang() === 'pt-BR' ? pt : es;
  const loc = () => window.jfLocale?.() || 'es-AR';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n, d = 0) => new Intl.NumberFormat(loc(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const money = n => { const a = Math.abs(n), d = Math.round(a) === Math.round(a * 100) / 100 ? 0 : 2; return (n < 0 ? '−' : '') + '$' + num(a, d); };
  const signed = n => (n > 0 ? '+' : '') + money(n);
  const pct = n => num(n) + ' %';
  const D = s => new Date(s + 'T12:00:00Z'), iso = d => d.toISOString().slice(0, 10);
  const short = s => D(s).toLocaleDateString(loc(), { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '');
  const addTradingDays = (s, n) => { const d = D(s); while (n > 0) { d.setUTCDate(d.getUTCDate() + 1); const w = d.getUTCDay(); if (w !== 0 && w !== 6) n--; } return iso(d); };

  /* ---------- the numbers ---------- */
  function model() {
    let a; try { a = acc(); } catch { return null; }
    if (!a || a.accountType === 'personal' || page.classList.contains('ft70-group-mode')) return null;
    const funded = a.status === 'Funded', prof = a.ruleSnapshot || null, phase = a.phase || 1;
    let p, r; try { p = R.progress(a); } catch { return null; }
    try { r = R.risk(a, R.accountDay(a)); } catch { r = null; }
    if (!funded && !(p.target > 0)) return null;
    const target = p.target, have = p.pnl, left = Math.max(0, target - have), frac = funded ? 1 : Math.max(0, Math.min(1, have / target));
    // Camps: first day the running result reached 25/50/75 % of the target.
    const days = Object.entries(p.grouped || {}).sort((x, y) => x[0].localeCompare(y[0]));
    const camps = [.25, .5, .75].map(f => { let cum = 0, at = null; for (const [d, v] of days) { cum += v; if (cum >= target * f) { at = d; break; } } return { f, at: funded ? null : at, done: funded || frac >= f }; });
    // Daily limit never hit / max loss intact, checked at the close of every traded day.
    let dailyOk = true; for (const [d] of days) { try { const x = R.risk(a, d); if (x && x.dailyRemaining <= 0) dailyOk = false; } catch {} }
    const maxOk = !!r && !r.breached && r.maxRemaining > 0;
    const req = [];
    if (!funded) req.push({ k: 'target', ok: have >= target, top: pct(Number(a.targets?.[phase - 1] ?? prof?.evaluation?.targets?.[phase - 1] ?? 0)), name: T('Objetivo', 'Target', 'Meta'), sub: money(Math.max(0, have)) + '/' + money(target) });
    if (!funded && p.requiredDays > 0) req.push({ k: 'days', ok: p.days >= p.requiredDays, name: T('Días', 'Days', 'Dias'), sub: T(p.days + ' de ' + p.requiredDays, p.days + ' of ' + p.requiredDays, p.days + ' de ' + p.requiredDays) });
    if (!funded && p.bestDayPct != null) req.push({ k: 'cons', ok: p.bestDayOK, name: T('Consistencia', 'Consistency', 'Consistência'), sub: p.bestDayRatio == null ? '—' : pct(Math.round(p.bestDayRatio)) + ' / ' + pct(p.bestDayPct) });
    req.push({ k: 'daily', ok: dailyOk, name: T('Diario', 'Daily', 'Diário'), sub: dailyOk ? T('intacto', 'intact', 'intacto') : T('superado', 'breached', 'superado') });
    req.push({ k: 'max', ok: maxOk, name: T('Máxima', 'Max loss', 'Máxima'), sub: maxOk ? T('intacta', 'intact', 'intacta') : T('superada', 'breached', 'superada') });
    // Pace: average result per traded day of this phase.
    const traded = p.tradingDays || 0, avg = traded && have > 0 ? have / traded : 0;
    const daysLeft = !funded && left > 0 && avg > 0 ? Math.max(1, Math.ceil(left / avg)) : null;
    const reqLeft = Math.max(0, (p.requiredDays || 0) - (p.days || 0));
    const today = R.accountDay(a), eta = daysLeft ? addTradingDays(today, Math.max(daysLeft, reqLeft)) : null;
    const spread = Math.max(reqLeft, daysLeft || 5, 1), suggested = left > 0 ? Math.ceil(left / spread) : 0;
    const dailyBudget = r?.dailyBudget || 0;
    // What comes next.
    const count = prof?.count ?? a.targets?.length ?? 2, ev = prof?.evaluation, rw = prof?.reward || prof?.rewards?.[0];
    const next = [];
    if (!funded && phase < count) { const tp = Number(a.targets?.[phase] ?? ev?.targets?.[phase] ?? 0); next.push({ kick: T('Próxima cima', 'Next summit', 'Próximo cume'), title: T('Fase ', 'Phase ', 'Fase ') + (phase + 1), text: (tp ? pct(tp) + ' · ' + money(Number(a.capital) * tp / 100) : '') + (p.requiredDays ? ' · ' + T('mín. ', 'min. ', 'mín. ') + p.requiredDays + T(' días', ' days', ' dias') : '') }); }
    if (!funded) next.push({ kick: T('La meta', 'The goal', 'A meta'), title: T('Financiada', 'Funded', 'Financiada'), text: rw ? pct(rw.split) + (rw.days ? ' · ' + T('1.er retiro a los ', '1st payout after ', '1º saque após ') + rw.days + T(' días', ' days', ' dias') : '') : T('Consultá las condiciones de retiro', 'Check the payout terms', 'Confira as condições de saque') });
    return { a, funded, phase, count, target, have, left, frac, camps, req, avg, daysLeft, eta, suggested, dailyBudget, maxRemaining: r?.maxRemaining ?? null, next, goal: Number(a.preferences?.dailyGoal) || 0 };
  }

  /* ---------- the scene (all coordinates in a 390×450 box) ---------- */
  const TRAIL = 'M168 430 C 182 415, 190 400, 190 375 S 205 310, 222 275 S 245 205, 254 170 S 272 105, 284 72';
  const SCENE = '<svg class="jfa-svg" viewBox="0 0 390 450" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><defs>' +
    '<linearGradient id="jfaFade" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="#fff"/><stop offset=".95" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="jfaMask"><rect width="390" height="450" fill="url(#jfaFade)"/></mask>' +
    '<linearGradient id="jfaPath" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#f0e9ff"/></linearGradient><filter id="jfaGlow"><feGaussianBlur stdDeviation="4"/></filter></defs>' +
    '<image href="./objectives-scene.webp" x="-838.9" y="13.25" width="1258.1" height="419" preserveAspectRatio="none" mask="url(#jfaMask)"/>' +
    '<path class="jfa-trail" d="' + TRAIL + '"/>' +
    '<path class="jfa-done jfa-glow" d="' + TRAIL + '" pathLength="100" filter="url(#jfaGlow)"/><path class="jfa-done" d="' + TRAIL + '" pathLength="100"/></svg>';

  const box = document.createElement('section');
  box.id = 'jfAscent'; box.className = 'jfa'; box.setAttribute('data-i18n-ignore', ''); box.hidden = true;
  body.prepend(box);
  let lastKey = '';

  function paint(force) {
    const m = model();
    page.classList.toggle('jfa-on', !!m);
    if (!m) { box.hidden = true; lastKey = ''; return; }
    const key = JSON.stringify([lang(), m.a.id, m.phase, m.funded, m.have, m.target, m.req.map(x => x.ok), m.maxRemaining, m.goal]);
    if (!force && key === lastKey && !box.hidden) return;
    lastKey = key; box.hidden = false;
    const P = Math.round(m.frac * 100);
    const head = m.funded ? T('Objetivos · Financiada', 'Targets · Funded', 'Metas · Financiada') : T('Objetivos · Fase ', 'Targets · Phase ', 'Metas · Fase ') + m.phase;
    const summit = m.funded ? T('🏁 Cima alcanzada', '🏁 Summit reached', '🏁 Cume alcançado') : '🏁 ' + (m.phase < m.count ? T('Fase ', 'Phase ', 'Fase ') + (m.phase + 1) : T('Financiada', 'Funded', 'Financiada')) + ' · ' + money(m.target);
    const req = m.req.map(x => '<div class="' + (x.ok ? 'jfa-ok' : 'jfa-pd') + '"><b aria-hidden="true">' + (x.ok ? '✓' : esc(x.top || '•')) + '</b><span>' + esc(x.name) + '</span>' + esc(x.sub) + '<i class="jfa-sr">' + (x.ok ? T(' · cumplido', ' · done', ' · cumprido') : T(' · pendiente', ' · pending', ' · pendente')) + '</i></div>').join('');
    let eta = '';
    if (!m.funded && m.left > 0) {
      const sug = m.goal || m.suggested, share = m.dailyBudget > 0 ? Math.round(sug / m.dailyBudget * 100) : null;
      const goalTxt = (m.goal ? T('Tu meta diaria: ', 'Your daily goal: ', 'Sua meta diária: ') : T('Meta sugerida: ', 'Suggested goal: ', 'Meta sugerida: ')) + '<b>' + money(sug) + T(' por día', ' per day', ' por dia') + '</b>' + (share != null ? T(', el ', ', ', ', ') + pct(share) + T(' de tu límite diario.', ' of your daily limit.', ' do seu limite diário.') : '.');
      eta = '<div class="jfa-eta"><div class="jfa-n"><b>' + (m.daysLeft ? '≈' + m.daysLeft : '—') + '</b><small>' + T('días', 'days', 'dias') + '</small></div><div><p>' +
        (m.daysLeft ? T('A tu ritmo de ', 'At your pace of ', 'No seu ritmo de ') + '<b>' + money(Math.round(m.avg)) + T(' por día', ' per day', ' por dia') + '</b>' + T(' llegás a la cima ', ' you reach the summit ', ' você chega ao cume ') + '<b>' + T('cerca del ', 'around ', 'perto de ') + short(m.eta) + '</b>. ' : T('Todavía no hay un ritmo positivo en esta fase. ', 'No positive pace in this phase yet. ', 'Ainda não há ritmo positivo nesta fase. ')) +
        goalTxt + '</p><button type="button" class="jfa-link" data-jfa="goal">' + T('Editar meta diaria', 'Edit daily goal', 'Editar meta diária') + '</button></div></div>';
    }
    let tug = '';
    if (!m.funded && m.left > 0 && m.maxRemaining != null && m.maxRemaining > 0) {
      const w = m.maxRemaining / (m.maxRemaining + m.left) * 100, k = m.maxRemaining / m.left;
      tug = '<div class="jfa-tug"><span class="jfa-lbl">' + T('Entre la cima y el precipicio', 'Between the summit and the cliff', 'Entre o cume e o precipício') + '</span>' +
        '<div class="jfa-bar" role="img" aria-label="' + esc(T('Pérdida máxima disponible ', 'Max loss available ', 'Perda máxima disponível ') + money(m.maxRemaining) + ' · ' + T('objetivo ', 'target ', 'meta ') + money(m.left)) + '"><i class="jfa-l" style="width:' + w + '%"></i><i class="jfa-r" style="width:' + (100 - w) + '%"></i><i class="jfa-you" style="left:' + w + '%"></i></div>' +
        '<div class="jfa-lab"><span>' + T('Pérdida máxima', 'Max loss', 'Perda máxima') + '<b class="jfa-red">' + money(m.maxRemaining) + '</b></span><span>' + T('Objetivo', 'Target', 'Meta') + '<b class="jfa-grn">' + money(m.left) + '</b></span></div>' +
        '<p>' + (m.have <= 0 ? T('Tenés ', 'You have ', 'Você tem ') + money(m.maxRemaining) + T(' de margen hasta la pérdida máxima. Subí paso a paso.', ' of room before the max loss. Climb step by step.', ' de margem até a perda máxima. Suba passo a passo.') : k >= 1.2 ? T('Estás ', 'You are ', 'Você está ') + num(k, 1) + T(' veces más cerca de la cima. Cuidá lo ganado.', ' times closer to the summit. Protect your gains.', ' vezes mais perto do cume. Proteja o que ganhou.') : T('Estás casi tan cerca del piso como de la cima. Priorizá cuidar la cuenta.', 'You are almost as close to the floor as to the summit. Protect the account first.', 'Você está quase tão perto do piso quanto do cume. Priorize proteger a conta.')) + '</p></div>';
    }
    const next = m.next.length ? '<div class="jfa-next">' + m.next.map(n => '<div><small>' + esc(n.kick) + '</small><b>' + esc(n.title) + '</b><span>' + esc(n.text) + '</span></div>').join('') + '</div>' : '';
    const sub = m.funded ? T('Superaste la evaluación. Seguí tus retiros en Retiros.', 'You passed the evaluation. Track payouts in Withdrawals.', 'Você passou na avaliação. Acompanhe seus saques em Saques.')
      : (m.have >= 0 ? T('Llevás ', 'You have ', 'Você tem ') + '<b class="jfa-grn">' + signed(m.have) + '</b>' : T('Vas ', 'You are at ', 'Você está em ') + '<b class="jfa-red">' + signed(m.have) + '</b>') + T(' de ', ' of ', ' de ') + money(m.target) + T(' en ', ' on ', ' na ') + esc(m.a.program) + '.';
    box.innerHTML = '<div class="jfa-hero"><div class="jfa-scene">' + SCENE + '<div class="jfa-marks"></div><div class="jfa-ttl"><small>' + esc(head) + '</small><h2>' + T('Tu ascenso', 'Your climb', 'Sua subida') + '</h2></div></div>' +
      '<div class="jfa-side"><div class="jfa-alt"><div class="jfa-row"><b>' + P + '%</b>' + (m.funded ? '' : '<span>' + T('faltan', 'to go', 'faltam') + '<b>' + money(m.left) + '</b></span>') + '</div><p>' + sub + '</p></div>' +
      '<div class="jfa-reqs" style="--n:' + m.req.length + '">' + req + '</div></div></div>' + eta + tug + next;
    box.insertAdjacentHTML('afterbegin', desk(m, head, sub, P));
    // Camps, the summit flag and "you are here", placed along the trail.
    const svg = box.querySelector('.jfa-svg'), trail = box.querySelector('.jfa-trail'), marks = box.querySelector('.jfa-marks');
    const pos = f => { const L = trail.getTotalLength(), q = trail.getPointAtLength(L * f); return 'left:' + (q.x / 390 * 100) + '%;top:' + (q.y / 450 * 100) + '%'; };
    let html = m.camps.map(c => '<div class="jfa-camp' + (c.done ? ' is-done' : '') + '" style="' + pos(c.f) + '"><i></i><em>' + pct(c.f * 100) + (c.at ? ' · ' + esc(short(c.at)) : '') + '</em></div>').join('');
    if (!m.funded) html += '<div class="jfa-camp is-top" style="' + pos(1) + '"><em>' + esc(summit) + '</em></div>';
    html += '<div class="jfa-me' + (m.frac >= .8 ? ' is-left' : '') + '" style="' + pos(Math.max(.02, m.frac)) + '"><div class="jfa-dot"></div><div class="jfa-tag">' + (m.funded ? T('🏁 Cima alcanzada', '🏁 Summit reached', '🏁 Cume alcançado') : T('Vos estás acá', 'You are here', 'Você está aqui')) + '<small>' + (m.funded ? T('Financiada', 'Funded', 'Financiada') : signed(m.have) + ' · ' + P + ' %') + '</small></div></div>';
    marks.innerHTML = html;
    box.querySelectorAll('.jfa-done').forEach(el => { el.style.setProperty('--p', Math.max(.5, m.frac * 100)); });
    svg.classList.remove('go'); void svg.getBoundingClientRect(); svg.classList.add('go');
  }

  /* ---------- desktop: altimeter beside the panorama (option F) ---------- */
  function desk(m, head, sub, P) {
    const top = 14, bot = 226, y = f => bot - Math.max(0, Math.min(1, f)) * (bot - top), x = 52;
    const summit = m.funded ? T('Cima alcanzada', 'Summit reached', 'Cume alcançado') : (m.phase < m.count ? T('Cima · Fase ', 'Summit · Phase ', 'Cume · Fase ') + (m.phase + 1) : T('Cima · Financiada', 'Summit · Funded', 'Cume · Financiada'));
    const rows = [[1, summit, m.funded ? '' : money(m.target), 'jfa-a-top']].concat(m.camps.slice().reverse().map(c => [c.f, pct(c.f * 100), c.at ? short(c.at) : '', c.done ? 'jfa-a-done' : ''])).concat([[0, T('Campo base', 'Base camp', 'Acampamento base'), '$0', 'jfa-a-base']]);
    let g = '<defs><linearGradient id="jfaAlt" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#8b5cf6"/><stop offset="1" stop-color="#5ef0b6"/></linearGradient></defs>' +
      '<rect x="' + (x - 9) + '" y="' + top + '" width="18" height="' + (bot - top) + '" rx="9" class="jfa-a-rail"/>' +
      (m.frac > 0 ? '<rect class="jfa-a-fill" x="' + (x - 9) + '" y="' + y(m.frac) + '" width="18" height="' + (bot - y(m.frac)) + '" rx="9" fill="url(#jfaAlt)"/>' : '');
    for (let i = 0; i <= 12; i++) g += '<line x1="' + (x + 14) + '" x2="' + (x + (i % 3 ? 21 : 29)) + '" y1="' + y(i / 12) + '" y2="' + y(i / 12) + '" class="jfa-a-tick"/>';
    rows.forEach(([f, a, b, c]) => { g += '<text x="' + (x + 40) + '" y="' + (y(f) + 4) + '" class="' + c + '">' + esc(a) + (b ? ' <tspan>' + esc(b) + '</tspan>' : '') + '</text>'; });
    const my = y(Math.max(0, m.frac));
    g += '<circle cx="' + x + '" cy="' + my + '" r="19" class="jfa-a-halo"/><circle cx="' + x + '" cy="' + my + '" r="10" fill="#fff"/>';
    const altLabel = T('Vos estás acá: ', 'You are here: ', 'Você está aqui: ') + P + ' %';
    const pace = m.funded ? '' : m.left <= 0 ? T('Llegaste al objetivo de la fase.', 'You reached the phase target.', 'Você chegou à meta da fase.')
      : m.daysLeft ? T('A tu ritmo de ', 'At your pace of ', 'No seu ritmo de ') + '<b>' + money(Math.round(m.avg)) + T(' por día', ' per day', ' por dia') + '</b>' + T(', llegás ', ', you get there ', ', você chega ') + '<b>' + T('cerca del ', 'around ', 'perto de ') + short(m.eta) + '</b>.'
      : T('Todavía no hay un ritmo positivo en esta fase.', 'No positive pace in this phase yet.', 'Ainda não há ritmo positivo nesta fase.');
    const reqs = m.req.map(r => '<div class="' + (r.ok ? 'jfa-ok' : 'jfa-pd') + '"><b aria-hidden="true">' + (r.ok ? '✓' : esc(r.top || '•')) + '</b><span>' + esc(r.name) + '<small>' + esc(r.sub) + '</small></span><i class="jfa-sr">' + (r.ok ? T(' · cumplido', ' · done', ' · cumprido') : T(' · pendiente', ' · pending', ' · pendente')) + '</i></div>').join('');
    const big = m.funded ? T('Financiada', 'Funded', 'Financiada') : signed(m.have);
    return '<div class="jfa-desk"><div class="jfa-d-left"><div class="jfa-ttl"><small>' + esc(head) + '</small><h2>' + T('Tu ascenso', 'Your climb', 'Sua subida') + '</h2></div>' +
      '<svg class="jfa-alt-svg" viewBox="0 0 280 240" role="img" aria-label="' + esc(altLabel) + '">' + g + '<text x="' + (x - 22) + '" y="' + (my + 5) + '" class="jfa-a-me">' + P + '%</text></svg></div>' +
      '<div class="jfa-d-right"><div class="jfa-d-copy"><small>' + (m.funded ? T('Estado', 'Status', 'Status') : T('Altura actual', 'Current height', 'Altura atual')) + '</small>' +
      '<b class="' + (m.have < 0 && !m.funded ? 'jfa-red' : '') + '">' + esc(big) + '</b>' +
      '<p class="jfa-d-of">' + (m.funded ? sub : T('de ', 'of ', 'de ') + '<b>' + money(m.target) + '</b>' + (m.left > 0 ? T(' · faltan ', ' · ', ' · faltam ') + '<b class="jfa-grn">' + money(m.left) + '</b>' + T(' para la cima', ' to the summit', ' para o cume') : '')) + '</p>' +
      (pace ? '<p class="jfa-d-pace">' + pace + '</p>' : '') + '</div><div class="jfa-d-reqs">' + reqs + '</div></div></div>';
  }

  box.addEventListener('click', e => {
    if (!e.target.closest('[data-jfa="goal"]')) return;
    const f = $('ft59DailyGoal'); if (!f) return;
    f.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); f.focus({ preventScroll: true });
  });

  const refresh = () => { if (page.classList.contains('active') || !box.hidden) paint(); };
  const prev = window.render;
  if (typeof prev === 'function') window.render = function () { const out = prev.apply(this, arguments); try { refresh(); } catch (e) { console.warn('JourFund ascent', e); } return out; };
  new MutationObserver(() => { if (page.classList.contains('active')) paint(); }).observe(page, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('jfLanguageChanged', () => paint(true));
  window.addEventListener('ft67SyncStatus', refresh);
  paint();
})();
