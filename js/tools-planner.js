/* Herramientas → "Planificá sobre el gráfico" (v172). One place to plan a trade before taking it:
   entry, stop and target drawn on a price scale (drag the handles or type the prices), the ticket with the lot
   size from FTToolsEngine, the risk against the account's own daily limit, tilt guard and saved risk rule,
   upcoming high-impact news for the instrument, the pre-trade checklist and a hand-off to the trade form.
   Prices are entered by the user: there is no live price feed. Nothing is saved to the journal until the trade
   form is submitted; the recent calculations stay in this browser only. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), M = window.FTToolsEngine, R = window.FTRules, page = $('ftPageTools');
  if (!M || !R || !page) return;
  const lang = () => ['en', 'pt-BR'].includes(window.JourFundI18n?.language) ? window.JourFundI18n.language : 'es';
  const T = (es, en, pt) => lang() === 'en' ? en : lang() === 'pt-BR' ? pt : es;
  const loc = () => window.jfLocale?.() || 'es-AR';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n, d = 2) => new Intl.NumberFormat(loc(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const money = (n, d) => { const a = Math.abs(n), dd = d ?? (Math.round(a) === Math.round(a * 100) / 100 ? 0 : 2); return (n < 0 ? '−' : '') + '$' + num(a, dd); };
  // Plain number for inputs: no grouping, the locale's decimal mark (FTToolsEngine.parse accepts , or .).
  const raw = (n, d) => { const t = n.toFixed(d); return lang() === 'en' ? t : t.replace('.', ','); };
  const ready = () => !!window.ftCloudSession?.user?.id && document.body.classList.contains('ft-ready');
  const account = () => { try { return acc(); } catch { return null; } };
  const store = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch { return null; } };
  const uid = () => window.ftCloudSession?.user?.id || 'x';

  /* ---------- instruments: the Tools presets (USD-quoted) and the account's saved specifications ---------- */
  const LIST = ['XAUUSD', 'XAGUSD', 'NAS100', 'US30', 'EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'BTCUSD'];
  function spec(symbol) {
    const base = window.FTTools?.presets?.[symbol]; if (!base) return null;
    const saved = account()?.preferences?.toolsSpecs?.[symbol + '|USD'];
    const s = saved && saved.quote === 'USD' ? { ...base, ...saved } : base;
    if (s.quote !== 'USD') return null;
    const c = { contract: +s.contract, pip: +s.pip, tick: +s.tick, step: +s.step, min: +s.min, max: +s.max, method: s.method === 'tick' ? 'tick' : 'contract', tickValue: s.tickValue == null ? undefined : +s.tickValue, fx: 1, feeLot: +(s.feeLot || 0), feeFixed: +(s.feeFixed || 0) };
    try { M.config(c); } catch { return null; }
    return { ...c, symbol, label: base.label, saved: !!saved, digits: Math.max(0, Math.min(6, Math.round(-Math.log10(c.tick)))) };
  }
  const favKey = () => 'jourfund_planner_fav_' + uid(), histKey = () => 'jourfund_planner_hist_' + uid();
  const favorites = () => { const f = store(favKey()); return Array.isArray(f) ? f.filter(s => LIST.includes(s)) : ['XAUUSD', 'NAS100']; };

  /* ---------- state ---------- */
  let st = null, owner = '', lastCal = null, dragging = null, frozen = null;
  function reset(symbol) {
    const a = account(), rule = a?.preferences?.toolsRisk, pct = rule?.mode === 'percent' && rule.value > 0 && rule.value <= 3 ? rule.value : 1;
    st = { symbol: symbol || favorites()[0] || 'XAUUSD', side: 'buy', risk: pct, rulePct: rule?.mode === 'percent' ? rule.value : null, entry: null, stop: null, take: null, leverage: 100, lots: null, checks: new Set() };
  }
  window.addEventListener('ft89Calendar', e => { lastCal = e.detail?.calendar || null; if (st) paint(); });

  /* ---------- numbers ---------- */
  function model() {
    const a = account(), c = spec(st.symbol); if (!a || !c) return { error: T('Elegí un instrumento cotizado en USD.', 'Pick a USD-quoted instrument.', 'Escolha um instrumento cotado em USD.') };
    let balance = 0; try { balance = window.FTLedger.snapshot(a).balance; } catch {}
    const out = { a, c, balance, ok: false };
    let r = null; try { r = R.risk(a, window.FTLedger.day(a)); } catch {}
    out.daily = r && r.dailyBudget > 0 ? { budget: r.dailyBudget, left: Math.max(0, r.dailyRemaining), used: Math.max(0, r.dailyBudget - r.dailyRemaining) } : null;
    out.maxLeft = r?.maxRemaining ?? null;
    const tilt = a.preferences?.tilt; out.tilt = tilt?.enabled && tilt.dailyPct > 0 ? tilt.dailyPct : null;
    if (!(st.entry > 0) || !(st.stop > 0)) return out;
    try {
      const p = M.position(c, { balance, mode: 'percent', risk: st.risk, entry: st.entry, stop: st.stop, side: st.side });
      out.position = p;
      const lots = st.lots ?? p.lots; out.lots = lots;
      if (lots) {
        const f = c.method === 'tick' ? c.tickValue / c.tick : c.contract * c.fx, fees = c.feeLot * lots + c.feeFixed;
        out.perPoint = f * lots; out.risk = p.distance * f * lots + fees; out.riskPct = balance > 0 ? out.risk / balance * 100 : null; out.pips = p.distance / c.pip;
        if (st.take > 0 && (st.take - st.entry) * (st.side === 'buy' ? 1 : -1) > 0) { const lv = M.levels(c, { mode: 'price', lots, entry: st.entry, stop: st.stop, take: st.take, side: st.side }); out.reward = lv.reward; out.rr = lv.rr; out.takePips = lv.takePips; }
        try { out.margin = M.margin(c, { lots, mode: 'leverage', leverage: st.leverage, entry: st.entry }).margin; } catch {}
        out.ok = true;
      }
    } catch (e) { out.error = e.message; }
    return out;
  }
  function news(c) {
    if (!lastCal?.available || !Array.isArray(lastCal.events)) return null;
    const cur = c.symbol.length === 6 ? [c.symbol.slice(0, 3), c.symbol.slice(3)] : ['USD'], now = Date.now();
    return lastCal.events.filter(e => e.impact === 'High' && cur.includes(e.currency) && Date.parse(e.date) > now && Date.parse(e.date) - now < 4 * 3600e3).sort((x, y) => Date.parse(x.date) - Date.parse(y.date))[0] || null;
  }
  function checks(m) {
    const list = [], d = m.daily;
    if (st.rulePct != null) list.push(st.risk <= st.rulePct + 1e-9 ? ['ok', T('Dentro de tu regla del ', 'Within your ', 'Dentro da sua regra de ') + num(st.rulePct, st.rulePct % 1 ? 2 : 0) + ' %' + T('', ' rule', '')] : ['warn', T('Arriesgás más que tu regla del ', 'You risk more than your ', 'Você arrisca mais que sua regra de ') + num(st.rulePct, st.rulePct % 1 ? 2 : 0) + ' %' + T('', ' rule', '')]);
    if (d && m.ok) { const after = (d.used + m.risk) / d.budget * 100;
      if (m.risk > d.left) list.push(['bad', T('Supera lo que te queda del límite diario', 'Goes past what is left of the daily limit', 'Passa do que resta do limite diário')]);
      else if (m.tilt) list.push(after < m.tilt ? ['ok', T('Lejos de tu freno anti-tilt (', 'Clear of your tilt guard (', 'Longe do seu freio anti-tilt (') + m.tilt + ' %)'] : ['warn', T('Si toca el stop, llegás a tu freno anti-tilt', 'If it hits the stop, you reach your tilt guard', 'Se bater no stop, você chega ao freio anti-tilt')]);
      else list.push(after < 70 ? ['ok', T('Te queda margen en el límite diario', 'You still have room in the daily limit', 'Ainda há margem no limite diário')] : ['warn', T('Llegarías a la zona de aviso del límite diario', 'You would reach the daily limit alert zone', 'Você chegaria à zona de aviso do limite diário')]); }
    if (m.ok && m.maxLeft != null && m.risk > m.maxLeft) list.push(['bad', T('Supera tu margen hasta la pérdida máxima', 'Goes past your room to the max loss', 'Passa da sua margem até a perda máxima')]);
    const n = m.c && news(m.c); if (n) { const t = new Date(n.date).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }), mins = Math.round((Date.parse(n.date) - Date.now()) / 60000);
      list.push(['warn', T('Noticia ', 'High-impact ', 'Notícia ') + n.currency + T(' de impacto alto a las ', ' news at ', ' de alto impacto às ') + t + ' · ' + (mins < 60 ? mins + ' min' : Math.round(mins / 60) + ' h')]); }
    return list;
  }

  /* ---------- markup ---------- */
  const box = document.createElement('section');
  box.id = 'jfPlanner'; box.className = 'jfp'; box.setAttribute('data-i18n-ignore', ''); box.hidden = true;
  const hero = page.querySelector('.ft74-hero'); (hero ? hero.after(box) : page.prepend(box));
  function shell() {
    const favs = favorites();
    box.innerHTML = '<div class="jfp-top"><div><h2>' + T('Planificá sobre el gráfico', 'Plan on the chart', 'Planeje no gráfico') + '</h2><p>' + T('Marcá entrada, stop y objetivo. El ticket calcula el resto con las reglas de tu cuenta.', 'Mark entry, stop and target. The ticket works out the rest with your account rules.', 'Marque entrada, stop e alvo. O ticket calcula o resto com as regras da sua conta.') + '</p></div>' +
      '<div class="jfp-assets" role="group" aria-label="' + T('Instrumento', 'Instrument', 'Instrumento') + '">' + LIST.map(s => '<button type="button" class="jfp-asset' + (favs.includes(s) ? ' is-fav' : '') + '" data-sym="' + s + '" aria-pressed="false">' + (favs.includes(s) ? '★ ' : '') + s + '</button>').join('') + '</div></div>' +
      '<div class="jfp-grid"><div class="jfp-chart"><div class="jfp-ctop"><span class="jfp-ctitle" data-p="ctitle"></span><button type="button" class="jfp-mini" data-act="fav"></button><button type="button" class="jfp-mini" data-act="reset">↺ ' + T('Reiniciar', 'Reset', 'Reiniciar') + '</button></div>' +
      '<svg class="jfp-svg" data-p="svg" role="img"></svg><p class="jfp-hint">' + T('Arrastrá los puntos para mover entrada, stop y objetivo.', 'Drag the dots to move entry, stop and target.', 'Arraste os pontos para mover entrada, stop e alvo.') + '</p></div>' +
      '<div class="jfp-ticket"><div class="jfp-th"><b>Ticket</b><span data-p="bal"></span></div>' +
      '<div class="jfp-side" role="group"><button type="button" data-side="buy">▲ ' + T('Compra', 'Buy', 'Compra') + '</button><button type="button" data-side="sell">▼ ' + T('Venta', 'Sell', 'Venda') + '</button></div>' +
      '<div class="jfp-prices"><label>' + T('Entrada', 'Entry', 'Entrada') + '<input data-in="entry" inputmode="decimal" autocomplete="off"></label><label>Stop loss<input data-in="stop" inputmode="decimal" autocomplete="off"></label><label>' + T('Objetivo', 'Target', 'Alvo') + '<input data-in="take" inputmode="decimal" autocomplete="off" placeholder="' + T('Opcional', 'Optional', 'Opcional') + '"></label></div>' +
      '<div class="jfp-risk"><div class="jfp-rh"><label for="jfpRisk">' + T('Riesgo por operación', 'Risk per trade', 'Risco por operação') + '</label><b data-p="riskv"></b></div><input id="jfpRisk" type="range" min="0.25" max="3" step="0.05" data-in="risk"><div class="jfp-rs"><span>0,25 %</span><span data-p="rulemark"></span><span>3 %</span></div></div>' +
      '<div class="jfp-lots"><span>' + T('Tamaño de posición', 'Position size', 'Tamanho da posição') + '</span><div class="jfp-lrow"><button type="button" class="jfp-step" data-act="minus" aria-label="' + T('Menos lotes', 'Fewer lots', 'Menos lotes') + '">−</button><b data-p="lots">—</b><button type="button" class="jfp-step" data-act="plus" aria-label="' + T('Más lotes', 'More lots', 'Mais lotes') + '">+</button></div><small data-p="lotsub"></small></div>' +
      '<div class="jfp-stats"><div class="jfp-st is-loss"><span>' + T('Arriesgás', 'You risk', 'Você arrisca') + '</span><b data-p="risk">—</b></div><div class="jfp-st is-gain"><span>' + T('Ganás al objetivo', 'At the target', 'No alvo') + '</span><b data-p="reward">—</b></div>' +
      '<div class="jfp-st"><span>' + T('Margen', 'Margin', 'Margem') + '</span><b data-p="margin">—</b><select data-in="lev" aria-label="' + T('Apalancamiento', 'Leverage', 'Alavancagem') + '">' + [30, 50, 100, 200, 500].map(v => '<option value="' + v + '">1:' + v + '</option>').join('') + '</select></div><div class="jfp-st"><span>' + T('Valor por punto', 'Value per point', 'Valor por ponto') + '</span><b data-p="pp">—</b></div></div>' +
      '<div class="jfp-day"><div class="jfp-dh"><span>' + T('Tu límite diario si toca el stop', 'Your daily limit if the stop hits', 'Seu limite diário se bater no stop') + '</span><b data-p="dayleft"></b></div><div class="jfp-dbar" data-p="dbar"></div><div class="jfp-dlab" data-p="dlab"></div></div>' +
      '<ul class="jfp-checks" data-p="checks"></ul><div class="jfp-cl" data-p="cl"></div><p class="jfp-err" role="alert" data-p="err"></p>' +
      '<div class="jfp-cta"><button type="button" class="jfp-go" data-act="go">' + T('Registrar esta operación', 'Log this trade', 'Registrar esta operação') + '<span aria-hidden="true">↗</span></button></div><div class="jfp-hist" data-p="hist"></div></div></div>' +
      '<h3 class="jfp-more">' + T('Calculadoras', 'Calculators', 'Calculadoras') + '</h3>';
    bind();
  }
  const P = k => box.querySelector('[data-p="' + k + '"]'), I = k => box.querySelector('[data-in="' + k + '"]');

  /* ---------- the price scale ---------- */
  function drawChart(m) {
    const svg = P('svg'), r = svg.getBoundingClientRect(), W = Math.max(300, r.width), H = Math.max(260, r.height), c = m.c;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    const fmt = p => num(p, c ? c.digits : 2), L = 14, Rr = W - 92, top = 58, bot = H - 24;
    if (!c || !(st.entry > 0)) { svg.innerHTML = '<text x="' + W / 2 + '" y="' + H / 2 + '" text-anchor="middle" class="jfp-empty">' + esc(T('Escribí el precio de entrada en el ticket para empezar.', 'Type the entry price in the ticket to start.', 'Digite o preço de entrada no ticket para começar.')) + '</text>'; svg.setAttribute('aria-label', T('Gráfico sin operación', 'Chart without a trade', 'Gráfico sem operação')); return; }
    const pts = [st.entry, st.stop, st.take].filter(v => v > 0);
    let lo = Math.min(...pts), hi = Math.max(...pts); const span = (hi - lo) || st.entry * .002; lo -= span * .35; hi += span * .35;
    if (dragging && frozen) { lo = frozen[0]; hi = frozen[1]; }
    st.view = [lo, hi];
    const y = p => bot - (p - lo) / (hi - lo) * (bot - top), x0 = L + (Rr - L) * (W < 520 ? .1 : .38), x1 = Rr - 16, d = st.side === 'buy' ? 1 : -1;
    const stepRaw = (hi - lo) / 9, mag = Math.pow(10, Math.floor(Math.log10(stepRaw))), step = [1, 2, 2.5, 5, 10].map(k => k * mag).find(k => k >= stepRaw) || mag * 10;
    let s = '<defs><linearGradient id="jfpG" x1="0" y1="' + (d > 0 ? 0 : 1) + '" x2="0" y2="' + (d > 0 ? 1 : 0) + '"><stop stop-color="#35d39a" stop-opacity=".3"/><stop offset="1" stop-color="#35d39a" stop-opacity=".05"/></linearGradient><linearGradient id="jfpR" x1="0" y1="' + (d > 0 ? 0 : 1) + '" x2="0" y2="' + (d > 0 ? 1 : 0) + '"><stop stop-color="#ef626c" stop-opacity=".05"/><stop offset="1" stop-color="#ef626c" stop-opacity=".32"/></linearGradient></defs>';
    for (let p = Math.ceil(lo / step) * step; p <= hi; p += step) s += '<line x1="' + L + '" x2="' + Rr + '" y1="' + y(p) + '" y2="' + y(p) + '" class="jfp-gl"/><text x="' + (Rr + 10) + '" y="' + (y(p) + 4) + '" class="jfp-axis">' + fmt(p) + '</text>';
    const zone = (a, b, fill) => '<rect x="' + x0 + '" y="' + Math.min(y(a), y(b)) + '" width="' + (x1 - x0) + '" height="' + Math.abs(y(a) - y(b)) + '" fill="url(#' + fill + ')"/>';
    if (st.take > 0) s += zone(st.entry, st.take, 'jfpG');
    if (st.stop > 0) s += zone(st.entry, st.stop, 'jfpR');
    if (m.ok && st.take > 0 && st.stop > 0) { const one = Math.abs(st.entry - st.stop); for (let k = 1; k * one < Math.abs(st.take - st.entry) - one * .2 && k < 8; k++) { const p = st.entry + d * k * one; if (Math.abs(y(p) - y(st.take)) < 56 || Math.abs(y(p) - y(st.entry)) < 22) continue; s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y(p) + '" y2="' + y(p) + '" class="jfp-rl"/><text x="' + (x1 - 8) + '" y="' + (y(p) - 6) + '" text-anchor="end" class="jfp-rt">' + k + 'R · +' + esc(money(m.risk * k)) + '</text>'; } }
    const line = (p, cls) => '<line x1="' + (cls === 'jfp-le' ? L : x0) + '" x2="' + x1 + '" y1="' + y(p) + '" y2="' + y(p) + '" class="' + cls + '"/>';
    if (st.take > 0) s += line(st.take, 'jfp-lt'); if (st.stop > 0) s += line(st.stop, 'jfp-ls'); s += line(st.entry, 'jfp-le');
    const tag = (p, cls) => '<rect x="' + (Rr + 4) + '" y="' + (y(p) - 12) + '" width="86" height="24" rx="7" class="' + cls + '"/><text x="' + (Rr + 47) + '" y="' + (y(p) + 4) + '" text-anchor="middle" class="' + cls + 't">' + fmt(p) + '</text>';
    if (st.take > 0) s += tag(st.take, 'jfp-tt'); if (st.stop > 0) s += tag(st.stop, 'jfp-ts'); s += tag(st.entry, 'jfp-te');
    if (m.ok) {
      // Labels sit inside each zone, on the side of the line that faces the entry.
      const lab = (p, a, b) => y(st.entry) > y(p) ? [y(p) + a, y(p) + b] : [y(p) - b + 14, y(p) - a + 14];
      if (st.take > 0 && m.reward != null) { const [a, b] = lab(st.take, 24, 42); s += '<text x="' + (x0 + 14) + '" y="' + a + '" class="jfp-zt is-g">' + esc(T('Objetivo ', 'Target ', 'Alvo ') + '+' + money(m.reward)) + '</text><text x="' + (x0 + 14) + '" y="' + b + '" class="jfp-zs is-g">' + esc(num(m.rr, 1) + 'R · ' + num(m.takePips, 0) + ' pips') + '</text>'; }
      if (st.stop > 0) { const [a, b] = lab(st.stop, 24, 42); s += '<text x="' + (x0 + 14) + '" y="' + a + '" class="jfp-zt is-r">' + esc('Stop −' + money(m.risk).replace('−', '')) + '</text><text x="' + (x0 + 14) + '" y="' + b + '" class="jfp-zs is-r">' + esc('1R · ' + num(m.pips, 0) + ' pips') + '</text>'; }
    }
    const handle = (p, k) => '<g class="jfp-h" data-h="' + k + '" tabindex="0" role="slider" aria-label="' + esc(k === 'entry' ? T('Entrada', 'Entry', 'Entrada') : k === 'stop' ? 'Stop loss' : T('Objetivo', 'Target', 'Alvo')) + '" aria-valuenow="' + p + '"><circle cx="' + (k === 'entry' ? x0 : x1) + '" cy="' + y(p) + '" r="16" class="jfp-hh"/><circle cx="' + (k === 'entry' ? x0 : x1) + '" cy="' + y(p) + '" r="7.5" class="jfp-hc"/></g>';
    if (st.take > 0) s += handle(st.take, 'take'); if (st.stop > 0) s += handle(st.stop, 'stop'); s += handle(st.entry, 'entry');
    if (m.daily && m.ok) { const pct = Math.min(100, m.risk / m.daily.budget * 100), used = Math.min(100, m.daily.used / m.daily.budget * 100), w = 150;
      s += '<g transform="translate(' + (L + 4) + ' 6)"><rect width="' + (w + 150) + '" height="40" rx="12" class="jfp-hud"/><text x="12" y="14" class="jfp-hl">' + esc(T('Si toca el stop, del límite diario', 'If the stop hits, of the daily limit', 'Se bater no stop, do limite diário')) + '</text><rect x="12" y="23" width="' + w + '" height="6" rx="3" class="jfp-hb"/><rect x="12" y="23" width="' + (w * used / 100) + '" height="6" rx="3" class="jfp-hu"/><rect x="' + (12 + w * used / 100) + '" y="23" width="' + Math.max(2, w * pct / 100) + '" height="6" rx="3" class="jfp-hp"/>' +
        (m.tilt ? '<rect x="' + (12 + w * m.tilt / 100) + '" y="19" width="2" height="14" class="jfp-hf"/>' : '') + '<text x="' + (w + 22) + '" y="31" class="jfp-hv">' + num(pct, 0) + ' %</text></g>'; }
    svg.innerHTML = s;
    svg.setAttribute('aria-label', T('Entrada ', 'Entry ', 'Entrada ') + fmt(st.entry) + (st.stop ? ' · stop ' + fmt(st.stop) : '') + (st.take ? ' · ' + T('objetivo ', 'target ', 'alvo ') + fmt(st.take) : ''));
    st.y = y; st.inv = py => lo + (bot - py) / (bot - top) * (hi - lo);
  }

  /* ---------- paint ---------- */
  function paint() {
    if (!st || box.hidden) return;
    const m = model(), c = m.c;
    box.querySelectorAll('.jfp-asset').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sym === st.symbol)));
    box.querySelectorAll('[data-side]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.side === st.side)));
    P('ctitle').textContent = (c?.label || st.symbol) + (c?.saved ? ' · ' + T('tus especificaciones', 'your specifications', 'suas especificações') : '');
    box.querySelector('[data-act="fav"]').textContent = favorites().includes(st.symbol) ? '★ ' + T('Favorito', 'Favorite', 'Favorito') : '☆ ' + T('Marcar favorito', 'Add favorite', 'Favoritar');
    P('bal').innerHTML = T('Balance ', 'Balance ', 'Saldo ') + '<b>' + esc(money(m.balance || 0)) + '</b>';
    ['entry', 'stop', 'take'].forEach(k => { const el = I(k); if (document.activeElement !== el) el.value = st[k] > 0 ? raw(st[k], c ? c.digits : 2) : ''; });
    I('risk').value = st.risk; I('lev').value = String(st.leverage);
    P('riskv').innerHTML = esc(num(st.risk, 2)) + ' % <span>· ' + esc(money(m.balance * st.risk / 100, 2)) + '</span>';
    P('rulemark').textContent = st.rulePct != null ? T('Tu regla ', 'Your rule ', 'Sua regra ') + num(st.rulePct, st.rulePct % 1 ? 2 : 0) + ' %' : '';
    I('risk').style.setProperty('--v', ((st.risk - .25) / 2.75 * 100) + '%');
    const lotsTxt = m.ok ? num(m.lots, 2) : '—';
    P('lots').textContent = lotsTxt;
    P('lotsub').textContent = m.ok ? (st.lots != null ? T('Ajustado a mano · ', 'Set by hand · ', 'Ajustado à mão · ') + num(m.riskPct, 2) + ' %' : T('Exacto ', 'Exact ', 'Exato ') + num(m.position.raw, 4) + T(' · redondeado hacia abajo para no pasarte', ' · rounded down so you never go over', ' · arredondado para baixo para não passar')) : (m.position?.reason || T('Completá entrada y stop.', 'Fill in entry and stop.', 'Preencha entrada e stop.'));
    P('risk').innerHTML = m.ok ? esc('−' + money(m.risk, 2).replace('−', '')) + ' <small>' + esc(num(m.riskPct, 2)) + ' %</small>' : '—';
    P('reward').innerHTML = m.ok && m.reward != null ? esc('+' + money(m.reward, 2)) + ' <small>' + esc(num(m.rr, 1)) + 'R</small>' : '—';
    P('margin').textContent = m.ok && m.margin != null ? money(m.margin, 0) : '—';
    P('pp').innerHTML = m.ok ? esc(money(m.perPoint, 2)) + ' <small>/ 1,00</small>' : '—';
    const d = m.daily;
    if (d) { const used = d.used / d.budget * 100, this_ = m.ok ? Math.min(100 - used, m.risk / d.budget * 100) : 0;
      P('dayleft').innerHTML = esc(money(Math.max(0, d.left - (m.ok ? m.risk : 0)), 0)) + ' <span>' + T('te quedan de ', 'left of ', 'restam de ') + esc(money(d.budget, 0)) + '</span>';
      P('dbar').innerHTML = '<i class="u" style="width:' + used + '%"></i><i class="t" style="left:' + used + '%;width:' + this_ + '%"></i>' + (m.tilt ? '<i class="f" style="left:' + m.tilt + '%"></i>' : '') + '<i class="a" style="left:70%"></i>';
      P('dlab').innerHTML = '<span class="t">' + T('Esta operación ', 'This trade ', 'Esta operação ') + num(m.ok ? m.risk / d.budget * 100 : 0, 0) + ' %</span>' + (m.tilt ? '<span class="f" style="left:' + m.tilt + '%">' + T('Freno ', 'Guard ', 'Freio ') + m.tilt + ' %</span>' : '') + '<span class="a" style="left:70%">' + T('Aviso 70 %', 'Alert 70 %', 'Aviso 70 %') + '</span>';
      box.querySelector('.jfp-day').hidden = false;
    } else box.querySelector('.jfp-day').hidden = true;
    const list = checks(m);
    P('checks').innerHTML = list.map(([k, t]) => '<li class="is-' + k + '"><i aria-hidden="true">' + (k === 'ok' ? '✓' : '!') + '</i>' + esc(t) + '</li>').join('');
    P('checks').hidden = !list.length;
    const cl = m.a?.preferences?.checklist, items = cl?.enabled ? cl.items || [] : [];
    P('cl').innerHTML = items.length ? '<span>Checklist · ' + [...st.checks].filter(id => items.some(i => i.id === id)).length + T(' de ', ' of ', ' de ') + items.length + '</span><div>' + items.map(i => '<button type="button" class="jfp-ck" data-ck="' + esc(i.id) + '" aria-pressed="' + st.checks.has(i.id) + '"><b aria-hidden="true">' + (st.checks.has(i.id) ? '✓' : '') + '</b>' + esc(i.text) + '</button>').join('') + '</div>' : '';
    P('err').textContent = m.error && st.entry > 0 && st.stop > 0 ? m.error : '';
    box.querySelector('[data-act="go"]').disabled = !m.ok || !['Challenge', 'Funded'].includes(m.a?.status);
    const h = store(histKey()); P('hist').innerHTML = Array.isArray(h) && h.length ? '<span>' + T('Últimos cálculos', 'Recent plans', 'Últimos cálculos') + '</span>' + h.slice(0, 3).map(x => '<button type="button" data-hist="' + esc(JSON.stringify(x)) + '"><b class="' + (x.side === 'buy' ? 'g' : 'r') + '">' + (x.side === 'buy' ? '▲' : '▼') + '</b> ' + esc(x.symbol) + ' · ' + esc(num(x.risk, 2)) + ' %' + (x.rr ? ' · 1:' + esc(num(x.rr, 1)) : '') + '<em>' + esc(num(x.lots, 2)) + T(' lotes', ' lots', ' lotes') + '</em></button>').join('') : '';
    drawChart(m);
    st.m = m;
  }

  /* ---------- input ---------- */
  function defaults() {
    const c = spec(st.symbol); if (!c || !(st.entry > 0)) return;
    const d = st.side === 'buy' ? 1 : -1, round = p => Math.round(p / c.tick) * c.tick;
    if (!(st.stop > 0) || (st.entry - st.stop) * d <= 0) st.stop = round(st.entry - d * st.entry * .0025);
    if (st.take > 0 && (st.take - st.entry) * d <= 0) st.take = null;
    if (!(st.take > 0)) st.take = round(st.entry + d * Math.abs(st.entry - st.stop) * 3);
  }
  let bound = false;
  function bind() {
    bindSvg(); if (bound) return; bound = true;
    box.addEventListener('click', e => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.sym) { const s = t.dataset.sym; reset(s); paint(); return; }
      if (t.dataset.side) { if (st.side !== t.dataset.side) { st.side = t.dataset.side; if (st.entry > 0 && st.stop > 0) { const gap = Math.abs(st.entry - st.stop), tg = st.take ? Math.abs(st.take - st.entry) : gap * 3, d = st.side === 'buy' ? 1 : -1; st.stop = st.entry - d * gap; st.take = st.entry + d * tg; } st.lots = null; paint(); } return; }
      if (t.dataset.ck) { st.checks.has(t.dataset.ck) ? st.checks.delete(t.dataset.ck) : st.checks.add(t.dataset.ck); paint(); return; }
      if (t.dataset.hist) { try { const x = JSON.parse(t.dataset.hist); reset(x.symbol); Object.assign(st, { side: x.side, risk: x.risk, entry: x.entry, stop: x.stop, take: x.take || null }); paint(); } catch {} return; }
      const act = t.dataset.act;
      if (act === 'reset') { reset(st.symbol); paint(); }
      else if (act === 'fav') { const f = favorites(), i = f.indexOf(st.symbol); i >= 0 ? f.splice(i, 1) : f.push(st.symbol); store(favKey(), f); shell(); paint(); }
      else if ((act === 'plus' || act === 'minus') && st.m?.ok) { const c = st.m.c, v = Math.round(((st.lots ?? st.m.lots) + (act === 'plus' ? c.step : -c.step)) / c.step) * c.step; st.lots = Math.max(c.min, Math.min(c.max, Number(v.toFixed(8)))); paint(); }
      else if (act === 'go') go();
    });
    box.addEventListener('input', e => {
      const k = e.target.dataset.in; if (!k) return;
      if (k === 'risk') { st.risk = Number(e.target.value); st.lots = null; paint(); return; }
      if (k === 'lev') { st.leverage = Number(e.target.value); paint(); return; }
      const v = M.parse(e.target.value); st[k] = Number.isFinite(v) && v > 0 ? v : null; st.lots = null; paint();
    });
    box.addEventListener('change', e => { const k = e.target.dataset.in; if (k === 'entry') { defaults(); paint(); } if (k === 'lev') { st.leverage = Number(e.target.value); paint(); } });
  }
  function bindSvg() {
    const svg = P('svg');
    svg.addEventListener('pointerdown', e => { const g = e.target.closest('.jfp-h'); if (!g) return; e.preventDefault(); dragging = g.dataset.h; frozen = st.view.slice(); svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', e => { if (!dragging || !st.inv) return; const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, py = (e.clientY - r.top) * vb.height / r.height, c = st.m?.c; if (!c) return;
      let p = Math.round(st.inv(py) / c.tick) * c.tick; p = Number(p.toFixed(c.digits)); const d = st.side === 'buy' ? 1 : -1;
      if (dragging === 'entry') { const dlt = p - st.entry; st.entry = p; if (st.stop) st.stop = Number((st.stop + dlt).toFixed(c.digits)); if (st.take) st.take = Number((st.take + dlt).toFixed(c.digits)); }
      else if (dragging === 'stop' && (st.entry - p) * d > c.tick / 2) st.stop = p;
      else if (dragging === 'take' && (p - st.entry) * d > c.tick / 2) st.take = p;
      st.lots = null; paint(); });
    const end = () => { if (!dragging) return; dragging = null; frozen = null; paint(); };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    svg.addEventListener('keydown', e => { const g = e.target.closest('.jfp-h'); if (!g || !['ArrowUp', 'ArrowDown'].includes(e.key) || !st.m?.c) return; e.preventDefault(); const c = st.m.c, k = g.dataset.h, dir = e.key === 'ArrowUp' ? 1 : -1, d = st.side === 'buy' ? 1 : -1, stepP = c.tick * (e.shiftKey ? 100 : 10);
      const next = Number((st[k] + dir * stepP).toFixed(c.digits)); if (k === 'stop' && (st.entry - next) * d <= 0) return; if (k === 'take' && (next - st.entry) * d <= 0) return; if (k === 'entry') { st.stop && (st.stop = Number((st.stop + dir * stepP).toFixed(c.digits))); st.take && (st.take = Number((st.take + dir * stepP).toFixed(c.digits))); } st[k] = next; st.lots = null; paint(); box.querySelector('.jfp-h[data-h="' + k + '"]')?.focus(); });
    if (window.ResizeObserver) new ResizeObserver(() => { if (st && !box.hidden) drawChart(st.m || model()); }).observe(svg);
  }
  function go() {
    const m = st.m; if (!m?.ok) return;
    try {
      window.FTTools.usePlan({ symbol: st.symbol, lots: m.lots, risk: m.risk, entry: st.entry, stop: st.stop, take: st.take, ratio: m.rr || null, side: st.side, checklist: [...st.checks], digits: m.c.digits });
      const h = store(histKey()), list = (Array.isArray(h) ? h : []).filter(x => !(x.symbol === st.symbol && x.entry === st.entry && x.stop === st.stop));
      list.unshift({ symbol: st.symbol, side: st.side, risk: st.risk, rr: m.rr || null, lots: m.lots, entry: st.entry, stop: st.stop, take: st.take || null, at: Date.now() }); store(histKey(), list.slice(0, 5));
    } catch (e) { P('err').textContent = e.message; }
  }

  /* ---------- lifecycle ---------- */
  function update() {
    const on = ready() && !!account() && !!window.FTTools?.presets;
    if (!on) { box.hidden = true; return; }
    const key = uid() + '|' + activeId + '|' + lang();
    if (key !== owner) { const keepSym = st?.symbol; owner = key; reset(keepSym); shell(); }
    box.hidden = false; paint();
  }
  const prev = window.render;
  if (typeof prev === 'function') window.render = function () { const out = prev.apply(this, arguments); try { if (page.classList.contains('active') || !box.hidden) update(); } catch (e) { console.warn('JourFund planner', e); } return out; };
  new MutationObserver(() => { if (page.classList.contains('active')) update(); }).observe(page, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('jfLanguageChanged', () => { owner = ''; update(); });
  window.addEventListener('ft67SyncStatus', () => { if (!box.hidden) update(); });
  update();
})();
