/* JourFund public landing: animated hero example, drawdown explainer and lot calculator (v125).
   Runs only while the landing is on screen. The markup already shows a complete static state,
   so nothing breaks if this file fails or the visitor prefers reduced motion. */
(function () {
  'use strict';
  const gate = document.getElementById('ftCloudGate');
  if (!gate || !document.getElementById('jfLanding')) return;

  const reduceMotion = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
  const locale = () => window.jfLocale?.() || 'es-AR';
  const t = text => window.JourFundI18n?.t?.(text) ?? text;
  const money = n => '$' + new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(Math.round(n));
  const decimal = (n, digits) => new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  const isShown = () => gate.dataset.state === 'login' && !document.hidden;
  const $ = (sel, root = gate) => root.querySelector(sel);

  /* ---------- Hero example: two trades come in and the margin counts down ---------- */
  const PHASES = [
    { daily: 750, max: 2140, goal: 640, used: 0 },
    { daily: 600, max: 1990, goal: 490, used: 150 },
    { daily: 520, max: 1910, goal: 410, used: 230 },
    { daily: 520, max: 1910, goal: 410, used: 230 }
  ];
  const SCHEDULE = [0, 1600, 3800, 5400];
  const hero = name => $('[data-jf-hero="' + name + '"]');
  let current = { ...PHASES[2] }, heroTimers = [], raf = 0, heroRunning = false, heroPlayed = false;

  function paint(values) {
    hero('daily').textContent = money(values.daily);
    if (hero('max')) hero('max').textContent = money(values.max);
    hero('goal').textContent = money(values.goal);
    hero('used').textContent = money(values.used);
    hero('goalbar').style.width = Math.round(values.goal / 1200 * 100) + '%';
  }
  function showPhase(i) {
    const target = PHASES[i], from = { ...current }, start = performance.now(), duration = i === 0 ? 500 : 900;
    hero('empty').hidden = i !== 0;
    hero('t1').hidden = i < 1;
    hero('t2').hidden = i < 2;
    if (hero('tip')) hero('tip').hidden = i < 3;
    const lit = Math.round(target.used / 75);
    hero('segs').querySelectorAll('i').forEach((seg, n) => { seg.style.transitionDelay = (n * 0.09) + 's'; seg.classList.toggle('on', n < lit); });
    if (i === 1 || i === 2) { const big = hero('daily'); big.classList.remove('jf-hit'); void big.offsetWidth; big.classList.add('jf-hit'); }
    cancelAnimationFrame(raf);
    const step = now => {
      const p = Math.min(1, (now - start) / duration), e = 1 - Math.pow(1 - p, 4);
      Object.keys(target).forEach(k => { current[k] = from[k] + (target[k] - from[k]) * e; });
      paint(current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function runHero() {
    SCHEDULE.forEach((at, i) => heroTimers.push(setTimeout(() => showPhase(i), at)));

  }
  function startHero() { if (heroRunning || heroPlayed || reduceMotion) return; heroRunning = true; heroPlayed = true; runHero(); }
  function stopHero() {
    if (!heroRunning) return;
    heroRunning = false; heroTimers.forEach(clearTimeout); heroTimers = []; cancelAnimationFrame(raf);
    current = { ...PHASES[2] }; showPhase(3);
  }

  /* ---------- Drawdown explainer: same balance, three ways to measure the floor ---------- */
  const BAL = [15000, 15300, 15150, 15700, 15450, 16000, 15600, 15800];
  const FLOORS = [
    [13500, 13500, 13500, 13500, 13500, 13500, 13500, 13500],
    [13500, 13800, 13800, 14200, 14200, 14500, 14500, 14500],
    [13500, 13920, 13920, 14320, 14320, 14620, 14620, 14620]
  ];
  const x = i => 60 + i * 76;
  const y = v => Math.round((250 - (v - 13000) * (220 / 3500)) * 10) / 10;
  const svgNS = 'http://www.w3.org/2000/svg';
  const ddPath = name => $('[data-jf-dd-path="' + name + '"]');
  const ddTabs = [...gate.querySelectorAll('[data-jf-dd]')];
  let ddIndex = 1, ddTouched = false, ddTimer = 0;
  const last = BAL.length - 1;
  const balD = BAL.map((v, i) => (i ? 'L' : 'M') + x(i) + ' ' + y(v)).join(' ');

  function buildChartOnce() {
    ddPath('bal').setAttribute('d', balD);
    const dots = ddPath('dots'), days = ddPath('days');
    BAL.forEach((v, i) => {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', x(i)); c.setAttribute('cy', y(v)); c.setAttribute('r', '3.5'); c.setAttribute('class', 'jf-dd-dot');
      dots.append(c);
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', x(i)); label.setAttribute('y', '282'); label.setAttribute('text-anchor', 'middle');
      label.textContent = t('Día') + ' ' + (i + 1);
      days.append(label);
    });
  }
  function showDrawdown(index) {
    ddIndex = index;
    const fl = FLOORS[index];
    let floorD = 'M' + x(0) + ' ' + y(fl[0]);
    for (let j = 1; j < fl.length; j++) floorD += ' L' + x(j) + ' ' + y(fl[j - 1]) + ' L' + x(j) + ' ' + y(fl[j]);
    let areaD = balD;
    for (let k = last; k >= 0; k--) { areaD += ' L' + x(k) + ' ' + y(fl[k]); if (k > 0) areaD += ' L' + x(k) + ' ' + y(fl[k - 1]); }
    const bx = x(last) + 18, margin = BAL[last] - fl[last];
    ddPath('floor').setAttribute('d', floorD);
    ddPath('area').setAttribute('d', areaD + ' Z');
    ddPath('bracket').setAttribute('d', 'M' + (bx - 6) + ' ' + y(BAL[last]) + ' L' + bx + ' ' + y(BAL[last]) + ' L' + bx + ' ' + y(fl[last]) + ' L' + (bx - 6) + ' ' + y(fl[last]));
    const marginOut = $('[data-jf-dd-out="margin"]');
    marginOut.textContent = money(margin);
    marginOut.classList.toggle('jf-warn', margin < 1500);
    marginOut.classList.toggle('jf-ok', margin >= 1500);
    $('[data-jf-dd-out="floor"]').textContent = money(fl[last]);
    ddTabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
  }
  ddTabs.forEach((tab, i) => tab.addEventListener('click', () => { ddTouched = true; showDrawdown(i); }));
  const ddDetails = $('.jf-drawdown-details');
  function startDrawdown() {
    if (ddTimer || reduceMotion || ddTouched || !ddDetails?.open) return;
    ddTimer = setInterval(() => { if (!ddTouched && isShown()) showDrawdown((ddIndex + 1) % 3); }, 4000);
  }
  function stopDrawdown() { clearInterval(ddTimer); ddTimer = 0; }
  ddDetails?.addEventListener('toggle', () => { if (ddDetails.open && isShown()) startDrawdown(); else stopDrawdown(); });

  /* ---------- Lot calculator ---------- */
  const INSTRUMENTS = {
    XAUUSD: { perLot: 100, label: 'Distancia del stop (en $ de precio)', unit: '$', min: 1, max: 50, def: 10 },
    EURUSD: { perLot: 10, label: 'Distancia del stop (en pips)', unit: 'pips', min: 5, max: 100, def: 20 }
  };
  const calcOut = name => $('[data-jf-calc-out="' + name + '"]');
  const balInput = $('#jfCalcBal'), riskInput = $('#jfCalcRisk'), stopInput = $('#jfCalcStop');
  const instButtons = [...gate.querySelectorAll('[data-jf-inst]')];
  let instrument = 'XAUUSD';

  function updateCalc() {
    const spec = INSTRUMENTS[instrument];
    const balance = Number(balInput.value), risk = Number(riskInput.value), stop = Number(stopInput.value);
    const riskUsd = balance * risk / 100;
    const lots = Math.max(0, Math.floor(riskUsd / (stop * spec.perLot) * 100) / 100);
    const share = riskUsd / (balance * 0.05) * 100;
    calcOut('bal').textContent = money(balance);
    calcOut('risk').textContent = new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(risk) + ' %';
    calcOut('stop').textContent = spec.unit === '$' ? '$' + stop : stop + ' pips';
    calcOut('lots').textContent = decimal(lots, 2);
    calcOut('usd').textContent = money(riskUsd);
    const shareOut = calcOut('share');
    shareOut.textContent = Math.round(share) + ' %';
    shareOut.classList.toggle('jf-ok', share <= 25);
    shareOut.classList.toggle('jf-warn', share > 25 && share <= 50);
    shareOut.classList.toggle('jf-bad', share > 50);
  }
  function chooseInstrument(key) {
    instrument = key;
    const spec = INSTRUMENTS[key];
    instButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.jfInst === key)));
    stopInput.min = spec.min; stopInput.max = spec.max; stopInput.value = spec.def;
    calcOut('stopLabel').textContent = t(spec.label);
    updateCalc();
  }
  [balInput, riskInput, stopInput].forEach(input => input.addEventListener('input', updateCalc));
  instButtons.forEach(b => b.addEventListener('click', () => chooseInstrument(b.dataset.jfInst)));

  /* ---------- Start and stop with the landing ---------- */
  function sync() {
    if (isShown() && splashDone) { startHero(); startDrawdown(); } else { stopHero(); stopDrawdown(); }
  }
  /* Hold every landing animation until the startup splash has gone, so the entrance is seen. */
  let splashDone = !document.getElementById('ft57Splash');
  if (!splashDone) {
    gate.classList.add('jf-wait');
    const release = force => {
      const splash = document.getElementById('ft57Splash');
      if (force !== true && splash && !splash.classList.contains('ft57-done') && splash.isConnected) return;
      splashDone = true; gate.classList.remove('jf-wait'); splashWatch.disconnect(); clearTimeout(splashTimeout); sync();
    };
    const splashWatch = new MutationObserver(release);
    splashWatch.observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['class'] });
    const splashEl = document.getElementById('ft57Splash');
    if (splashEl) splashWatch.observe(splashEl, { attributes: true, attributeFilter: ['class'] });
    const splashTimeout = setTimeout(() => release(true), 8000);
  }

  buildChartOnce();
  showDrawdown(ddIndex);
  updateCalc();
  new MutationObserver(sync).observe(gate, { attributes: true, attributeFilter: ['data-state'] });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('jfLanguageChanged', () => {
    ddPath('days').querySelectorAll('text').forEach((label, i) => { label.textContent = t('Día') + ' ' + (i + 1); });
    calcOut('stopLabel').textContent = t(INSTRUMENTS[instrument].label);
    paint(current); showDrawdown(ddIndex); updateCalc();
  });
  sync();
})();
