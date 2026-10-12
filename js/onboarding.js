/* JourFund first-run guide (v133).
   Shown once, right after a new user's workspace loads with only the untouched template accounts.
   Step 1 welcome, step 2 add the funded account from the rules catalogue, step 3 log the first trade,
   step 4 show the real margin. Everything is saved through ftProtectionCloud.commit like any other edit. */
(function () {
  'use strict';
  const R = window.FTRules;
  if (!R || !document.body) return;

  const TEMPLATE_IDS = new Set(['fn6', 'fn15', 'fn25', 'fn50', 'fp5']);
  const FIRMS = [
    { firm: 'FundedNext', code: 'FN', tone: 'fn', programs: ['fn-stellar-2', 'fn-stellar-1', 'fn-stellar-lite', 'fn-stellar-instant'] },
    { firm: 'FTMO', code: 'FT', tone: 'ft', programs: ['ftmo-2-standard', 'ftmo-1-standard', 'ftmo-2-swing'] },
    { firm: 'FundingPips', code: 'FP', tone: 'fp', programs: ['fp-2-standard', 'fp-2-pro', 'fp-1-flex', 'fp-2-flex', 'fp-zero'] }
  ];
  const RISKS = [0.5, 1, 2];
  const t = text => window.JourFundI18n?.t?.(text) ?? text;
  const locale = () => window.jfLocale?.() || 'es-AR';
  const money = n => '$' + new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(Math.round(n));
  const short = n => n >= 1000 ? '$' + new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(n / 1000) + 'K' : money(n);
  const pct = n => new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(n) + ' %';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => window.ftCloudSession?.user?.id || null;
  const doneKey = id => 'jourfund_onboarding_' + id;

  let root = null, step = 0, opener = null;
  const pick = { firm: 0, program: FIRMS[0].programs[0], size: 15000, phase: '1', asset: 'XAUUSD', result: 'Loss', amount: '150', risk: 1 };
  let created = null; // { accountId, trade }

  /* ---------- When to show ---------- */
  function pristine(list) {
    return Array.isArray(list) && list.length > 0 && list.every(a =>
      TEMPLATE_IDS.has(a.id) &&
      !a.preferences?.onboarding &&
      (a.phases || []).every(p => !(p.trades || []).length) &&
      !(a.pa?.trades || []).length && !(a.pa?.withdrawals || []).length);
  }
  function shouldShow() {
    const id = uid();
    if (!id || root || !document.body.classList.contains('ft-ready')) return false;
    try { if (localStorage.getItem(doneKey(id))) return false; } catch {}
    let state;
    try { state = window.ftProtectionCloud.snapshot(); } catch { return false; }
    return !state.conflict && pristine(state.accounts);
  }

  /* ---------- Building the account and the trade ---------- */
  const def = id => R.defs.find(d => d.id === id);
  const firm = () => FIRMS[pick.firm];
  function phaseOptions(id) {
    const count = def(id).count;
    const list = [];
    for (let i = 1; i <= count; i++) list.push({ value: String(i), label: t('Fase') + ' ' + i });
    list.push({ value: 'funded', label: t('Fondeada') });
    return list;
  }
  function buildAccount() {
    const p = R.profile(pick.program, {});
    const capital = pick.size;
    const funded = pick.phase === 'funded' || p.count === 0;
    const phase = funded ? Math.max(1, p.count) : Number(pick.phase);
    const a = {
      id: 'account_' + (crypto.randomUUID?.() || Date.now() + '_' + Math.random().toString(36).slice(2)),
      firm: p.firm, program: p.name + ' ' + short(capital), capital, riskPct: null,
      phase, status: funded ? 'Funded' : 'Challenge',
      phases: Array.from({ length: Math.max(1, p.count) }, () => ({ trades: [] })),
      pa: { goalPct: 10, withdrawals: [], trades: [] },
      nickname: '', serverOffset: 3, modelId: p.id, ruleSnapshot: p
    };
    const today = R.accountDay(a);
    a.createdOn = today;
    if (funded) a.fundedOn = today;
    if (!funded && phase > 1) a.phaseStartedOn = today;
    const e = R.effective(a);
    a.targets = p.evaluation?.targets?.slice() || [0];
    a.dailyPct = e.dailyPct; a.maxPct = e.maxPct; a.days = e.days || 0;
    return a;
  }
  function rulesSummary(a) {
    const e = R.effective(a);
    const target = a.status === 'Funded' ? null : a.capital * Number(a.targets[a.phase - 1] || 0) / 100;
    return {
      daily: e.dailyPct == null ? null : a.capital * e.dailyPct / 100,
      max: a.capital * e.maxPct / 100,
      target, days: a.status === 'Funded' ? null : e.days || 0
    };
  }
  function tradeFrom(a) {
    const amount = Math.round(Math.abs(Number(String(pick.amount).replace(',', '.'))) * 100) / 100;
    const pnl = pick.result === 'Loss' ? -amount : pick.result === 'Win' ? amount : 0;
    return {
      date: R.accountDay(a), asset: pick.asset, result: pick.result, pnl,
      risk: pick.risk, rr: '', state: 'Bien', note: '', lots: null, images: [],
      id: 't_' + (crypto.randomUUID?.() || Date.now()), recordedAt: Date.now()
    };
  }

  /* ---------- Saving ---------- */
  function markDone(list) {
    const at = new Date().toISOString();
    return list.map(a => ({ ...a, preferences: { ...(a.preferences || {}), onboarding: { done: true, at } } }));
  }
  function rememberDone() { try { localStorage.setItem(doneKey(uid()), '1'); } catch {} }
  function commit(list) {
    const cloud = window.ftProtectionCloud, state = cloud.snapshot();
    cloud.commit(markDone(list), state);
    rememberDone();
  }

  /* ---------- Rendering ---------- */
  const check = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
  const brand = '<img src="./brand-icon.svg?v=92" alt="" width="62" height="62">';
  const chip = (group, value, label, on) => '<button type="button" class="jf-ob-chip" data-ob-set="' + group + '" data-ob-value="' + esc(value) + '" aria-pressed="' + on + '">' + esc(label) + '</button>';
  const top = (back, label, filled) => '<div class="jf-ob-top">' + (back ? '<button type="button" class="jf-ob-link" data-ob="back">← ' + esc(t('Atrás')) + '</button>' : '<span></span>') +
    (label ? '<span>' + esc(label) + '</span>' : '<button type="button" class="jf-ob-link" data-ob="skip">' + esc(t('Saltar')) + '</button>') + '</div>' +
    (filled ? '<div class="jf-ob-prog" aria-hidden="true"><i class="on"></i><i' + (filled > 1 ? ' class="on"' : '') + '></i></div>' : '');

  function screenWelcome() {
    return top(false, '', 0) +
      '<div class="jf-ob-hero"><div class="jf-ob-badge">' + brand + '</div>' +
      '<h2 id="jfObTitle">' + esc(t('¡Bienvenido a JourFund!')) + '<br>' + esc(t('Armemos tu panel')) + '</h2>' +
      '<p class="jf-ob-sub">' + esc(t('En dos pasos vas a ver cuánto podés perder hoy sin quemar tu cuenta.')) + '</p></div>' +
      '<ol class="jf-ob-steps">' +
      '<li><span class="n">1</span><div><b>' + esc(t('Cargá tu cuenta de fondeo')) + '</b><small>' + esc(t('Firma, tamaño y fase · 30 seg')) + '</small></div></li>' +
      '<li><span class="n">2</span><div><b>' + esc(t('Registrá tu primera operación')) + '</b><small>' + esc(t('O empezá con el día en cero · 30 seg')) + '</small></div></li>' +
      '<li class="soft"><span class="n ok">' + check + '</span><div><b>' + esc(t('Mirá tu margen real')) + '</b><small>' + esc(t('Pérdida diaria, máxima y objetivo')) + '</small></div></li></ol>' +
      '<div class="jf-ob-actions"><button type="button" class="jf-ob-btn" data-ob="next">' + esc(t('Empezar')) + ' →</button></div>';
  }

  function screenAccount() {
    const f = firm(), d = def(pick.program), a = buildAccount(), r = rulesSummary(a);
    const firms = FIRMS.map((x, i) => '<button type="button" class="jf-ob-firm" data-ob-set="firm" data-ob-value="' + i + '" aria-pressed="' + (i === pick.firm) + '">' +
      '<span class="jf-ob-logo ' + x.tone + '" aria-hidden="true">' + x.code + '</span><span class="txt"><b>' + esc(x.firm) + '</b><small>' + esc(t('Reglas cargadas')) + '</small></span><span class="radio" aria-hidden="true"></span></button>').join('');
    const programs = f.programs.map(id => chip('program', id, def(id).name, id === pick.program)).join('');
    const sizes = d.sizes.map(s => chip('size', s, short(s), s === pick.size)).join('');
    const phases = phaseOptions(pick.program).map(o => chip('phase', o.value, o.label, o.value === pick.phase)).join('');
    const item = (label, value) => '<li>' + esc(t(label)) + ' <b>' + esc(value) + '</b></li>';
    return top(true, t('Paso 1 de 2'), 1) +
      '<h2 id="jfObTitle">' + esc(t('¿Con qué firma operás?')) + '</h2>' +
      '<div class="jf-ob-firms" role="group" aria-label="' + esc(t('Firma')) + '">' + firms + '</div>' +
      '<p class="jf-ob-hint">' + check + ' ' + esc(t('Las tres vienen con sus reglas cargadas')) + '</p>' +
      '<p class="jf-ob-label">' + esc(t('Programa')) + '</p><div class="jf-ob-chips" role="group" aria-label="' + esc(t('Programa')) + '">' + programs + '</div>' +
      '<p class="jf-ob-label">' + esc(t('Tamaño')) + '</p><div class="jf-ob-chips" role="group" aria-label="' + esc(t('Tamaño')) + '">' + sizes + '</div>' +
      '<p class="jf-ob-label">' + esc(t('Fase')) + '</p><div class="jf-ob-chips" role="group" aria-label="' + esc(t('Fase')) + '">' + phases + '</div>' +
      '<div class="jf-ob-rules" aria-live="polite"><p>' + check + ' ' + esc(t('Reglas de')) + ' ' + esc(f.firm) + ' ' + esc(t('aplicadas')) + '</p><ul>' +
      (r.daily == null ? item('Pérdida diaria', t('Sin límite')) : item('Pérdida diaria', money(r.daily))) +
      item('Pérdida máx.', money(r.max)) +
      (r.target == null ? item('Objetivo', t('Fondeada')) : item('Objetivo', money(r.target))) +
      (r.days == null ? '' : item('Días mín.', String(r.days))) +
      '</ul><small>' + esc(t('Podés revisar edición y ciclo de retiro en Editar reglas.')) + '</small></div>' +
      '<div class="jf-ob-actions"><button type="button" class="jf-ob-btn" data-ob="saveAccount">' + esc(t('Guardar y seguir')) + '</button>' +
      '<button type="button" class="jf-ob-btn2" data-ob="manual">' + esc(t('Mi firma no está en la lista')) + '</button></div>';
  }

  function assetOptions() {
    const source = document.getElementById('asset');
    if (!source) return '<option value="XAUUSD">XAUUSD</option>';
    return [...source.querySelectorAll('optgroup,option')].filter(n => n.tagName === 'OPTGROUP' || !n.parentElement || n.parentElement.tagName !== 'OPTGROUP')
      .map(n => n.tagName === 'OPTGROUP'
        ? '<optgroup label="' + esc(n.label) + '">' + [...n.children].map(o => '<option value="' + esc(o.value) + '"' + (o.value === pick.asset ? ' selected' : '') + '>' + esc(o.textContent) + '</option>').join('') + '</optgroup>'
        : '<option value="' + esc(n.value) + '"' + (n.value === pick.asset ? ' selected' : '') + '>' + esc(n.textContent) + '</option>').join('');
  }
  function screenTrade() {
    const results = [['Win', 'Ganancia'], ['Loss', 'Pérdida'], ['BE', 'Break even']].map(([v, l]) =>
      '<button type="button" class="jf-ob-seg ' + v.toLowerCase() + '" data-ob-set="result" data-ob-value="' + v + '" aria-pressed="' + (pick.result === v) + '">' + esc(t(l)) + '</button>').join('');
    const risks = RISKS.map(r => chip('risk', r, pct(r), r === pick.risk)).join('');
    return top(true, t('Paso 2 de 2'), 2) +
      '<h2 id="jfObTitle">' + esc(t('Tu primera operación')) + '</h2>' +
      '<p class="jf-ob-sub">' + esc(t('Con una sola ya ves cómo se mueve tu margen.')) + '</p>' +
      '<label class="jf-ob-label" for="jfObAsset">' + esc(t('Par o instrumento')) + '</label><select id="jfObAsset" class="jf-ob-field">' + assetOptions() + '</select>' +
      '<p class="jf-ob-label" id="jfObResultLabel">' + esc(t('Resultado')) + '</p><div class="jf-ob-segs" role="group" aria-labelledby="jfObResultLabel">' + results + '</div>' +
      '<div class="jf-ob-two"><div><label class="jf-ob-label" for="jfObAmount">' + esc(t('Monto')) + ' ($)</label><input id="jfObAmount" class="jf-ob-field" type="number" inputmode="decimal" min="0" step="any" value="' + esc(pick.result === 'BE' ? '0' : pick.amount) + '"' + (pick.result === 'BE' ? ' disabled' : '') + '></div>' +
      '<div><p class="jf-ob-label">' + esc(t('Fecha')) + '</p><div class="jf-ob-field jf-ob-static">' + esc(t('Hoy')) + '</div></div></div>' +
      '<p class="jf-ob-label" id="jfObRiskLabel">' + esc(t('Riesgo de la operación')) + '</p><div class="jf-ob-chips" role="group" aria-labelledby="jfObRiskLabel">' + risks + '</div>' +
      '<p class="jf-ob-error" id="jfObError" role="alert"></p>' +
      '<div class="jf-ob-tip">💡 ' + esc(t('Si todavía no operaste hoy, tocá “Empezar en cero” y cargala cuando cierres.')) + '</div>' +
      '<div class="jf-ob-actions"><button type="button" class="jf-ob-btn" data-ob="saveTrade">' + esc(t('Registrar operación')) + '</button>' +
      '<button type="button" class="jf-ob-btn2" data-ob="zero">' + esc(t('Empezar en cero')) + '</button></div>';
  }

  function screenDone() {
    let a;
    try { a = window.ftProtectionCloud.snapshot().accounts.find(x => x.id === created?.accountId); } catch {}
    if (!a) return screenWelcome();
    const day = R.accountDay(a), risk = R.risk(a, day), s = a.status === 'Funded' ? null : R.progress(a);
    const budget = risk.dailyBudget, left = risk.dailyRemaining, used = budget == null ? 0 : Math.max(0, budget - left);
    const lit = budget ? Math.min(10, Math.round(used / budget * 10)) : 0;
    const bars = Array.from({ length: 10 }, (_, i) => '<i' + (i < lit ? ' class="on"' : '') + '></i>').join('');
    const tile = (label, value, extra) => '<div><span>' + esc(t(label)) + '</span><strong>' + esc(value) + (extra ? '<small> ' + esc(extra) + '</small>' : '') + '</strong></div>';
    const confetti = '<div class="jf-ob-confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>';
    return confetti +
      '<p class="jf-ob-ok">' + check + ' ' + esc(t('Cuenta lista')) + ' · ' + esc(a.firm) + ' ' + esc(short(a.capital)) + ' · ' + esc(a.status === 'Funded' ? t('Fondeada') : t('Fase') + ' ' + a.phase) + '</p>' +
      '<h2 id="jfObTitle">' + esc(t(budget == null ? 'Hoy todavía tenés de margen' : 'Hoy todavía podés perder')) + '</h2>' +
      '<div class="jf-ob-card"><p class="jf-ob-big">' + esc(money(budget == null ? risk.maxRemaining : left)) + '</p>' +
      (budget == null ? '' : '<div class="jf-ob-bars" aria-hidden="true">' + bars + '</div><div class="jf-ob-used"><span>' + esc(t('Usaste')) + ' <b>' + esc(money(used)) + '</b> ' + esc(t('de')) + ' ' + esc(money(budget)) + '</span><span>' + esc(t('Aviso al 70 %')) + '</span></div>') +
      '<div class="jf-ob-tiles">' + tile('Pérd. máx.', money(risk.maxRemaining)) +
      (s ? tile('Objetivo', money(Math.max(0, s.pnl)), '/ ' + money(s.target)) + tile('Días', String(s.days), '/ ' + s.requiredDays) : tile('Balance', money(risk.balance))) + '</div></div>' +
      '<p class="jf-ob-label strong">' + esc(t('Para sacarle el jugo')) + '</p><ul class="jf-ob-check">' +
      '<li class="ok"><span>' + check + '</span>' + esc(t('Cargar tu cuenta de fondeo')) + '</li>' +
      '<li class="' + (created.trade ? 'ok' : '') + '"><span>' + (created.trade ? check : '') + '</span>' + esc(t('Registrar tu primera operación')) + '</li>' +
      '<li><span></span>' + esc(t('Activar avisos al celular')) + '</li>' +
      '<li><span></span>' + esc(t('Instalar JourFund como app')) + '</li></ul>' +
      '<div class="jf-ob-actions"><button type="button" class="jf-ob-btn" data-ob="finish">' + esc(t('Ir a mi panel')) + '</button></div>';
  }

  function paint(focusTitle) {
    const screens = [screenWelcome, screenAccount, screenTrade, screenDone];
    const panel = root.querySelector('.jf-ob-panel');
    panel.innerHTML = screens[step]();
    panel.dataset.step = String(step);
    panel.scrollTop = 0;
    if (focusTitle) { const h = panel.querySelector('h2'); h?.setAttribute('tabindex', '-1'); h?.focus({ preventScroll: true }); }
  }

  /* ---------- Interaction ---------- */
  function readTradeInputs() {
    const asset = root.querySelector('#jfObAsset'), amount = root.querySelector('#jfObAmount');
    if (asset) pick.asset = asset.value;
    if (amount && !amount.disabled) pick.amount = amount.value;
  }
  function onClick(e) {
    const set = e.target.closest('[data-ob-set]');
    if (set) {
      const key = set.dataset.obSet, value = set.dataset.obValue;
      if (step === 2) readTradeInputs();
      if (key === 'firm') { pick.firm = Number(value); pick.program = firm().programs[0]; }
      else if (key === 'program') pick.program = value;
      else if (key === 'size') pick.size = Number(value);
      else if (key === 'phase') pick.phase = value;
      else if (key === 'result') pick.result = value;
      else if (key === 'risk') pick.risk = Number(value);
      if (key === 'firm' || key === 'program') {
        const d = def(pick.program);
        if (!d.sizes.includes(pick.size)) pick.size = d.sizes.find(s => s >= 15000) || d.sizes[0];
        if (!phaseOptions(pick.program).some(o => o.value === pick.phase)) pick.phase = phaseOptions(pick.program)[0].value;
      }
      paint(false);
      root.querySelector('[data-ob-set="' + key + '"][data-ob-value="' + CSS.escape(String(value)) + '"]')?.focus({ preventScroll: true });
      return;
    }
    const action = e.target.closest('[data-ob]')?.dataset.ob;
    if (!action) return;
    try {
      if (action === 'next') { step = 1; paint(true); }
      else if (action === 'back') { if (step === 2) readTradeInputs(); step = Math.max(0, step - 1); paint(true); }
      else if (action === 'skip') { skip(); }
      else if (action === 'manual') { skip(); window.ftOpenRuleAccount?.(); }
      else if (action === 'saveAccount') { step = 2; paint(true); }
      else if (action === 'saveTrade' || action === 'zero') saveAll(action === 'saveTrade');
      else if (action === 'finish') close();
    } catch (error) {
      const box = root.querySelector('#jfObError');
      if (box) box.textContent = t(error.message || 'No se pudo guardar. Probá de nuevo.');
      else window.ft67Toast?.(t('No se pudo guardar'), t(error.message || ''));
    }
  }
  function saveAll(withTrade) {
    readTradeInputs();
    const a = buildAccount();
    let trade = null;
    if (withTrade) {
      const amount = Number(String(pick.amount).replace(',', '.'));
      if (pick.result !== 'BE' && (!Number.isFinite(amount) || amount <= 0)) throw Error('Escribí el monto de la operación.');
      trade = tradeFrom(a);
      (a.status === 'Funded' ? a.pa.trades : a.phases[a.phase - 1].trades).push(trade);
    }
    // The template accounts are empty examples; the user's real account replaces them.
    commit([a]);
    created = { accountId: a.id, trade };
    step = 3; paint(true);
  }
  function skip() {
    try {
      const state = window.ftProtectionCloud.snapshot();
      window.ftProtectionCloud.commit(markDone(state.accounts), state);
    } catch {}
    rememberDone();
    close();
  }
  function close() {
    if (!root) return;
    root.remove(); root = null;
    document.documentElement.classList.remove('jf-ob-lock');
    document.removeEventListener('keydown', onKey, true);
    (opener && document.contains(opener) ? opener : document.querySelector('main, #app'))?.focus?.({ preventScroll: true });
    window.render?.();
  }
  function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape' && step < 3) { e.preventDefault(); skip(); return; }
    if (e.key !== 'Tab') return;
    const items = [...root.querySelectorAll('button:not([disabled]),select,input:not([disabled]),[tabindex="-1"]')].filter(x => x.offsetParent !== null && x.tabIndex !== -1);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    opener = document.activeElement;
    step = 0; created = null;
    root = document.createElement('div');
    root.id = 'jfOnboarding';
    root.className = 'jf-ob';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'jfObTitle');
    root.innerHTML = '<div class="jf-ob-backdrop"></div><div class="jf-ob-panel"></div>';
    root.addEventListener('click', onClick);
    root.addEventListener('change', e => { if (e.target.id === 'jfObAsset') pick.asset = e.target.value; });
    root.addEventListener('input', e => { if (e.target.id === 'jfObAmount') pick.amount = e.target.value; });
    document.body.append(root);
    document.documentElement.classList.add('jf-ob-lock');
    document.addEventListener('keydown', onKey, true);
    paint(true);
  }

  // Wait for the startup splash so the guide's entrance is seen.
  function splashOn() { const sp = document.getElementById('ft57Splash'); return !!sp && sp.isConnected && !sp.classList.contains('ft57-done'); }
  function maybeShow() {
    if (!shouldShow()) return;
    if (splashOn()) { setTimeout(maybeShow, 400); return; }
    open();
  }
  new MutationObserver(maybeShow).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('ft67SyncStatus', maybeShow);
  window.addEventListener('jfLanguageChanged', () => { if (root) paint(false); });
  window.JourFundOnboarding = { open: () => { if (!root && uid()) open(); }, check: maybeShow };
  maybeShow();
})();
