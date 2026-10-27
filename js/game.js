/* Pallanguzhi — UI, animation, Paati's turns, tutorial and rules. */
(function () {
  const PZ = window.PZ;
  const A = PZ.art;
  const sfx = PZ.sfx;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const owner = PZ.owner;
  const seeds = (n) => (n === 1 ? '1 seed' : n + ' seeds');

  /* ---------------- settings ---------------- */
  const settings = Object.assign({ level: 'medium', seed: 'manjadi', speed: 1, sound: true }, load());
  function load() {
    try { return JSON.parse(localStorage.getItem('pz-settings')) || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem('pz-settings', JSON.stringify(settings)); } catch (e) { /* private mode */ }
  }

  /* ---------------- mount art ---------------- */
  const stage = $('#stage');
  $('#defs').innerHTML = A.DEFS;
  stage.insertAdjacentHTML('beforeend', A.frame());
  $('.paati-slot').innerHTML = A.paati();
  const paatiEl = $('.paati-slot .paati');
  const face = () => A.paati().replace('viewBox="0 0 300 340"', 'viewBox="76 30 148 148"');
  $('.t-face').innerHTML = face();
  $('.end-face').innerHTML = face();
  $$('.paati').forEach((p) => (p.dataset.mood = 'normal'));
  $('.lamp-slot.l1').innerHTML = A.lamp(30);
  $('.lamp-slot.l2').innerHTML = A.lamp(26);
  $('.t-icon.learn').innerHTML = A.boardIcon();
  const ORN = `<svg viewBox="0 0 54 54"><g fill="none" stroke="#8E3420" stroke-width="1.6" stroke-linecap="round">
    <path d="M10 50 V20 Q10 10 20 10 H50"/><path d="M16 50 V24 Q16 16 24 16 H50" stroke="#C8902E" stroke-width="1"/>
    <path d="M24 30 C24 24 30 22 33 26 C36 30 31 34 28 31"/></g>
    <g fill="#8E3420"><circle cx="10" cy="10" r="2.6"/><circle cx="22" cy="22" r="1.6"/><circle cx="50" cy="10" r="1.6"/><circle cx="10" cy="50" r="1.6"/></g></svg>`;
  $$('.orn').forEach((o) => (o.innerHTML = ORN));
  $('.t-icon.friends').innerHTML = `<svg viewBox="0 0 120 66"><g stroke="#1E1714" stroke-width="2.5" fill="#E7A33A"><circle cx="42" cy="22" r="13"/><path d="M18 62c2-16 12-24 24-24s22 8 24 24z"/></g><g stroke="#1E1714" stroke-width="2.5" fill="#B4462B"><circle cx="80" cy="22" r="13"/><path d="M56 62c2-16 12-24 24-24s22 8 24 24z"/></g></svg>`;


  /* ---------------- stage scaling ---------------- */
  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    stage.style.setProperty('--s', s);
  }
  addEventListener('resize', fit);
  fit();

  /* ---------------- board geometry ---------------- */
  const BOARD = { x: 87, y: 333 }; // board padding-box origin in screen coords
  const pitLocal = (i) => ({ x: 197 + (i < 7 ? i : 13 - i) * 114, y: i < 7 ? 180 : 72 });
  const pitAt = (i) => { const p = pitLocal(i); return { x: BOARD.x + p.x, y: BOARD.y + p.y }; };
  const storeAt = (w) => ({ x: BOARD.x + (w === 1 ? 71 : 1009), y: BOARD.y + 126 });

  const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function pitSlot(i, k) {
    const layer = Math.floor(k / 16), kk = k % 16;
    const r = 6.1 * Math.sqrt(kk + 0.6);
    const a = kk * 2.39996 + layer * 1.3 + rnd(i) * 6.28;
    return {
      x: Math.cos(a) * r * 1.04 + (rnd(i * 31 + k) - 0.5) * 3,
      y: Math.sin(a) * r * 1.0 + (rnd(i * 17 + k * 3) - 0.5) * 3 - layer * 3.5,
      r: (rnd(i * 7 + k * 11) * 360) | 0,
    };
  }
  function storeSlot(w, k) {
    const layer = Math.floor(k / 34), kk = k % 34;
    const r = 7 * Math.sqrt(kk + 0.6);
    const a = kk * 2.39996 + layer * 0.9 + w;
    return {
      x: Math.cos(a) * r * 0.86 + (rnd(w * 50 + k) - 0.5) * 3,
      y: Math.sin(a) * r * 1.95 + (rnd(w * 90 + k) - 0.5) * 3 - layer * 4,
      r: (rnd(w * 13 + k * 7) * 360) | 0,
    };
  }

  const pitsWrap = $('.pits');
  const pitEls = [];
  for (let i = 0; i < 14; i++) {
    const p = pitLocal(i);
    const el = document.createElement('div');
    el.className = 'pit ' + (i < 7 ? 'bottom' : 'top');
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.dataset.i = i;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', (i < 7 ? 'Your kuzhi ' + (i + 1) : 'Paati’s kuzhi ' + (i - 6)));
    el.innerHTML = '<div class="seeds"></div><span class="count">5</span>';
    pitsWrap.appendChild(el);
    pitEls.push({ el, seeds: el.firstChild, count: el.lastChild });
  }
  pitsWrap.insertAdjacentHTML('afterbegin', '<div class="row-glow top"></div><div class="row-glow bottom"></div>');
  const storeEls = [0, 1].map((w) => {
    const el = $(`.store[data-store="${w}"]`);
    return { el, seeds: $('.store-seeds', el), n: $('.store-n', el), label: $(`.sl-n[data-score="${w}"]`) };
  });

  function makeSeed(slot) {
    const s = document.createElement('span');
    s.className = 'seed';
    s.style.left = slot.x.toFixed(1) + 'px';
    s.style.top = slot.y.toFixed(1) + 'px';
    s.style.setProperty('--r', slot.r + 'deg');
    return s;
  }

  function setPit(i, n, dropLast) {
    const box = pitEls[i].seeds;
    while (box.children.length > n) box.lastChild.remove();
    while (box.children.length < n) {
      const s = makeSeed(pitSlot(i, box.children.length));
      if (dropLast) s.classList.add('drop');
      box.appendChild(s);
    }
    const c = pitEls[i].count;
    if (c.textContent !== String(n)) {
      c.textContent = n;
      c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    }
    c.classList.toggle('zero', n === 0);
  }

  function setStore(w, n, bump) {
    const s = storeEls[w];
    const box = s.seeds;
    const show = Math.min(n, 70);
    while (box.children.length > show) box.lastChild.remove();
    while (box.children.length < show) box.appendChild(makeSeed(storeSlot(w, box.children.length)));
    s.n.textContent = n;
    s.label.textContent = n;
    if (bump) { s.n.classList.remove('bump'); void s.n.offsetWidth; s.n.classList.add('bump'); }
  }

  function renderAll() {
    for (let i = 0; i < 14; i++) setPit(i, G.view.pits[i]);
    setStore(0, G.view.store[0]);
    setStore(1, G.view.store[1]);
  }

  /* ---------------- flying seeds + hand ---------------- */
  const flyLayer = $('.fly-layer');
  const handEl = $('.hand');
  const handSeeds = $('.hand-seeds');
  const handN = $('.hand-n');
  let handPos = { x: 640, y: 500 };

  function fly(froms, to, { dur = 420, stagger = 18, arc = 60, toSlot } = {}) {
    if (!froms.length) return Promise.resolve();
    const anims = froms.map((f, k) => {
      const el = makeSeed({ x: f.x, y: f.y, r: (rnd(k + f.x) * 360) | 0 });
      flyLayer.appendChild(el);
      const t = toSlot ? toSlot(k) : to;
      const dx = t.x - f.x, dy = t.y - f.y;
      const a = el.animate(
        [
          { transform: 'translate(0,0) scale(1)' },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - arc}px) scale(1.25)`, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(1)` },
        ],
        { duration: dur, delay: k * stagger, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }
      );
      return a.finished.then(() => el.remove());
    });
    return Promise.all(anims);
  }

  function seedsOf(i) {
    const c = pitAt(i);
    return Array.from(pitEls[i].seeds.children).map((s) => ({ x: c.x + parseFloat(s.style.left), y: c.y + parseFloat(s.style.top) }));
  }

  function setHand(n, at, ms) {
    if (at) {
      handPos = at;
      handEl.style.setProperty('--hand-ms', (ms || 220) + 'ms');
      handEl.style.translate = `${at.x}px ${at.y}px`;
    }
    handN.textContent = n;
    const show = Math.min(n, 7);
    while (handSeeds.children.length > show) handSeeds.lastChild.remove();
    while (handSeeds.children.length < show) {
      const k = handSeeds.children.length;
      const a = k * 2.4, r = k ? 5 + k * 1.6 : 0;
      handSeeds.appendChild(makeSeed({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, r: k * 47 }));
    }
    handEl.classList.toggle('on', n > 0);
  }
  const handOver = (i) => { const c = pitAt(i); return { x: c.x, y: c.y - (i < 7 ? 52 : 48) }; };

  /* ---------------- Paati: mood + speech ---------------- */
  const bubble = $('.bubble');
  const bT = $('.bubble-t'), bE = $('.bubble-e'), bAct = $('.bubble-actions');
  let moodTimer = 0, sayId = 0;

  function setMood(m, ms) {
    clearTimeout(moodTimer);
    paatiEl.dataset.mood = m;
    if (ms) moodTimer = setTimeout(() => (paatiEl.dataset.mood = 'normal'), ms);
  }

  async function say(line, mood = 'normal', opts = {}) {
    if (!line) return;
    const id = ++sayId;
    bubble.classList.remove('thinking', 'pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');
    setMood(mood, opts.moodMs ?? (mood === 'normal' ? 0 : 2600));
    bE.textContent = line.e || '';
    bE.classList.remove('show');
    bAct.innerHTML = '';
    paatiEl.classList.add('talking');
    const txt = line.t;
    for (let k = 1; k <= txt.length; k += 2) {
      if (id !== sayId) return;
      bT.textContent = txt.slice(0, k);
      await sleep(18);
    }
    bT.textContent = txt;
    paatiEl.classList.remove('talking');
    bE.classList.add('show');
    if (opts.actions) {
      for (const a of opts.actions) {
        const b = document.createElement('button');
        b.className = 'btn small' + (a.ghost ? ' ghost' : '');
        b.textContent = a.label;
        b.addEventListener('click', (e) => { e.stopPropagation(); sfx.tap(); a.fn(); });
        bAct.appendChild(b);
      }
    }
  }
  function thinking(on) { bubble.classList.toggle('thinking', on); }

  let lastQuip = 0;
  function quip(kind, mood, gap = 2200) {
    const now = Date.now();
    if (now - lastQuip < gap) return;
    lastQuip = now;
    say(PZ.paatiLine(kind), mood);
  }

  /* ---------------- narration bar ---------------- */
  const nChip = $('.narrate-chip'), nText = $('.narrate-text'), nHand = $('.narrate-hand');
  function narrate(html, who) {
    if (who !== undefined) {
      nChip.textContent = who === 0 ? 'Your move' : who === 1 ? 'Paati’s move' : who;
      nChip.className = 'narrate-chip' + (who === 1 ? ' paati' : typeof who === 'string' ? ' learn' : '');
    }
    nText.innerHTML = html;
    nText.classList.remove('swap'); void nText.offsetWidth; nText.classList.add('swap');
  }

  /* ---------------- game state ---------------- */
  const G = {
    mode: 'menu',
    state: null,
    view: { pits: Array(14).fill(5), store: [0, 0] },
    awaitUser: false,
    animating: false,
    skip: false,
    games: 0,
    idleT: 0,
    tut: null,
    allowPit: null,
  };

  function syncView(st) {
    G.view.pits = st.pits.slice();
    G.view.store = st.store.slice();
  }

  /* ---------------- animation of a move ---------------- */
  const SP = () => settings.speed;

  async function animate(events, mover) {
    G.animating = true;
    G.skip = false;
    let drops = 0, chainQuip = false;
    const sum = { cap: [0, 0], pasu: [0, 0], nothing: false, over: false, relays: 0 };
    const v = G.view;
    nHand.textContent = '';

    for (const ev of events) {
      if (G.skip) { applyInstant(ev, sum); continue; }
      const step = Math.max(55, (250 / SP()) * (drops > 40 ? 0.42 : drops > 18 ? 0.65 : 1));

      switch (ev.t) {
        case 'pick': {
          const froms = seedsOf(ev.pit);
          flash(ev.pit);
          if (ev.first) {
            narrate(ev.by === 0
              ? `You scoop <b>${seeds(ev.n)}</b> and drop them one by one, anticlockwise →`
              : `Paati scoops <b>${seeds(ev.n)}</b> from her row…`, ev.by);
            const h = handOver(ev.pit);
            handEl.style.setProperty('--hand-ms', '0ms');
            handEl.style.translate = `${h.x}px ${h.y}px`;
            handPos = h;
          } else {
            sum.relays++;
            narrate(`Last seed landed — the next kuzhi has <b>${seeds(ev.n)}</b>. Scoop them up and keep sowing!`);
            setHand(0, handOver(ev.pit), step * 0.8);
            await sleep(step * 0.8);
          }
          v.pits[ev.pit] = 0;
          setPit(ev.pit, 0);
          sfx.scoop(ev.n);
          await fly(froms, handPos, { dur: 300 / Math.sqrt(SP()), stagger: 10, arc: 24 });
          setHand(ev.n);
          await sleep(ev.first ? step * 1.4 : step);
          break;
        }
        case 'sow': {
          drops++;
          setHand(ev.left + 1, handOver(ev.pit), step * 0.7);
          await sleep(step * 0.7);
          v.pits[ev.pit]++;
          setPit(ev.pit, v.pits[ev.pit], true);
          setHand(ev.left);
          sfx.tok(owner(ev.pit) === 0 ? 1 : 0.9);
          if (drops === 34 && !chainQuip) { chainQuip = true; quip('longChain', 'shock', 0); nHand.textContent = 'tap to skip ⏩'; }
          await sleep(step * 0.3);
          break;
        }
        case 'pasu': {
          sum.pasu[ev.owner] += 4;
          mark(ev.pit, 'mark-pasu');
          narrate(`<b>Pasu!</b> That kuzhi hit 4 — it’s on ${ev.owner === 0 ? 'your row, so the 4 seeds are <b>yours</b>' : 'Paati’s row, so <b>she</b> takes them'}.`);
          sfx.jackpot();
          pasuBurst(ev.pit, ev.owner);
          await sleep(480 / SP());
          const froms = seedsOf(ev.pit);
          v.pits[ev.pit] = 0;
          setPit(ev.pit, 0);
          await fly(froms, null, { dur: 520 / Math.sqrt(SP()), stagger: 40, arc: 70, toSlot: (k) => storeTarget(ev.owner, v.store[ev.owner] + k) });
          v.store[ev.owner] += 4;
          setStore(ev.owner, v.store[ev.owner], true);
          await sleep(200 / SP());
          break;
        }
        case 'empty': {
          setHand(0);
          mark(ev.pit, 'mark-empty');
          narrate('Last seed landed, and the next kuzhi is <b>empty</b>…');
          await sleep(650 / SP());
          break;
        }
        case 'capture': {
          sum.cap[ev.by] += ev.n;
          mark(ev.pit, 'mark-cap');
          narrate(ev.by === 0
            ? `…so you <b>capture ${ev.n === 1 ? 'the 1 seed' : 'all ' + ev.n + ' seeds'}</b> in the kuzhi after it!`
            : `…so Paati <b>grabs ${ev.n === 1 ? 'the 1 seed' : 'all ' + ev.n + ' seeds'}</b> in the kuzhi after it.`);
          await sleep(260 / SP());
          const froms = seedsOf(ev.pit);
          v.pits[ev.pit] = 0;
          setPit(ev.pit, 0);
          sfx.bell(ev.by === 0 ? 1046 : 784);
          await fly(froms, null, { dur: 620 / Math.sqrt(SP()), stagger: 26, arc: 90, toSlot: (k) => storeTarget(ev.by, v.store[ev.by] + k) });
          v.store[ev.by] += ev.n;
          setStore(ev.by, v.store[ev.by], true);
          await sleep(500 / SP());
          break;
        }
        case 'nothing': {
          sum.nothing = true;
          mark(ev.pit, 'mark-empty');
          narrate('…and the one after it is empty too. <b>Nothing to take</b> this time.');
          await sleep(900 / SP());
          break;
        }
        case 'sweep': {
          if (!sum.over) {
            sum.over = true;
            await sleep(400);
            narrate(`<b>${G.state && G.pendingStuck === 0 ? 'Your' : 'A'} row is empty</b> — round over! Seeds left on each row go to that row’s owner.`, 'Round over');
            await sleep(900);
          }
          const froms = seedsOf(ev.pit);
          v.pits[ev.pit] = 0;
          setPit(ev.pit, 0);
          fly(froms, null, { dur: 700, stagger: 22, arc: 80, toSlot: (k) => storeTarget(ev.owner, v.store[ev.owner] + k) }).then(() => {});
          v.store[ev.owner] += ev.n;
          await sleep(260);
          setStore(ev.owner, v.store[ev.owner], true);
          sfx.tok(0.8);
          break;
        }
        case 'over':
          sum.over = true;
          await sleep(900);
          break;
      }
    }

    setHand(0);
    nHand.textContent = '';
    await sleep(120);
    clearMarks();
    G.animating = false;
    return sum;
  }

  function applyInstant(ev, sum) {
    const v = G.view;
    if (ev.t === 'pick') { v.pits[ev.pit] = 0; if (!ev.first) sum.relays++; }
    else if (ev.t === 'sow') v.pits[ev.pit]++;
    else if (ev.t === 'pasu') { v.pits[ev.pit] = 0; v.store[ev.owner] += 4; sum.pasu[ev.owner] += 4; }
    else if (ev.t === 'capture') {
      v.pits[ev.pit] = 0; v.store[ev.by] += ev.n; sum.cap[ev.by] += ev.n;
      narrate(ev.by === 0 ? `Skipped ahead — you <b>captured ${seeds(ev.n)}</b> at the end.` : `Skipped ahead — Paati <b>grabbed ${seeds(ev.n)}</b> at the end.`);
    } else if (ev.t === 'nothing') { sum.nothing = true; narrate('Skipped ahead — the move ended with <b>nothing to take</b>.'); }
    else if (ev.t === 'sweep') { v.pits[ev.pit] = 0; v.store[ev.owner] += ev.n; sum.over = true; }
    else if (ev.t === 'over') sum.over = true;
    renderAll();
  }

  function pasuBurst(i, who) {
    const c = pitAt(i);
    const el = document.createElement('div');
    el.className = 'pasu-burst ' + (who === 0 ? 'you' : 'paati');
    el.style.left = c.x + 'px';
    el.style.top = c.y + 'px';
    let rays = '';
    for (let k = 0; k < 14; k++) rays += `<i style="--a:${k * 25.7}deg;--d:${(k % 3) * 40}ms"></i>`;
    el.innerHTML = `<div class="pb-rays">${rays}</div><div class="pb-badge"><b>Pasu!</b><span>+4 ${who === 0 ? 'for you' : 'for Paati'}</span></div>`;
    flyLayer.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  function storeTarget(w, k) {
    const c = storeAt(w);
    const s = storeSlot(w, Math.min(k, 69));
    return { x: c.x + s.x, y: c.y + s.y };
  }

  function flash(i) {
    const el = pitEls[i].el;
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
  function mark(i, cls) { pitEls[i].el.classList.add(cls); }
  function clearMarks() {
    pitEls.forEach((p) => p.el.classList.remove('mark-cap', 'mark-empty', 'mark-pasu', 'flash', 'target', 'dim'));
  }

  /* ---------------- interaction ---------------- */
  function setPlayable(list) {
    pitEls.forEach((p, i) => p.el.classList.toggle('playable', !!list && list.includes(i)));
    $('.row-glow.bottom').classList.toggle('on', !!list && list.length > 0);
  }

  function rowGlow(who) {
    $('.row-glow.bottom').classList.toggle('on', who === 0);
    $('.row-glow.top').classList.toggle('on', who === 1);
  }

  pitsWrap.addEventListener('click', (e) => {
    const p = e.target.closest('.pit');
    if (!p) return;
    sfx.unlock();
    onPit(+p.dataset.i);
  });

  // move preview on hover: shows where the first handful lands
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  pitsWrap.addEventListener('mouseover', (e) => {
    if (!finePointer) return;
    const p = e.target.closest('.pit.playable');
    clearPreview();
    if (!p) return;
    const i = +p.dataset.i, n = G.view.pits[i];
    for (let k = 1; k <= n; k++) {
      const j = (i + k) % 14;
      const dot = document.createElement('span');
      dot.className = 'pv' + (k === n ? ' last' : '');
      dot.style.animationDelay = k * 25 + 'ms';
      dot.style.translate = `${(k > 14 ? 8 : 0)}px ${(k > 14 ? 6 : 0)}px`;
      pitEls[j].el.appendChild(dot);
    }
  });
  pitsWrap.addEventListener('mouseleave', clearPreview);
  function clearPreview() { $$('.pv', pitsWrap).forEach((d) => d.remove()); }

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeRules(); return; }
    if (G.mode === 'menu') return;
    const k = parseInt(e.key, 10);
    if (k >= 1 && k <= 7) onPit(k - 1);
  });

  $('#screen-game').addEventListener('pointerdown', (e) => {
    if (G.animating && !e.target.closest('.g-tools, .bubble')) G.skip = true;
  });

  function onPit(i) {
    if (G.animating) return;
    if (G.mode === 'tutorial') {
      if (G.allowPit === i) { G.allowPit = null; pointer(null); tutMove(i); }
      return;
    }
    if (G.mode !== 'play' || !G.awaitUser) return;
    if (owner(i) !== 0) { quip('wrongSide', 'smug'); return; }
    if (G.view.pits[i] === 0) { quip('emptyTap', 'smug'); return; }
    playerMove(i);
  }

  async function playerMove(i) {
    G.awaitUser = false;
    clearTimeout(G.idleT);
    clearPreview();
    setPlayable(null);
    rowGlow(0);
    sfx.tap();
    await runMove(i);
  }

  async function runMove(i) {
    const mover = G.state.turn;
    const r = PZ.applyMove(G.state, i, true);
    G.pendingStuck = r.state.over ? r.state.turn : null;
    const sum = await animate(r.events, mover);
    G.state = r.state;
    syncView(G.state);
    renderAll();
    if (G.mode !== 'play') return;
    if (G.state.over) return endGame();
    await react(sum, mover);
    nextTurn();
  }

  async function react(sum, mover) {
    const you = mover === 0;
    const mine = sum.cap[mover];
    if (sum.pasu[1] && !you) return say(PZ.paatiLine('paatiPasu'), 'happy');
    if (sum.pasu[0] && you && mine < 6) return say(PZ.paatiLine('youPasu'), 'smug');
    if (sum.pasu[1] && you) return say(PZ.paatiLine('paatiPasu'), 'happy');
    if (you) {
      if (mine >= 6) return say(PZ.paatiLine('youCaptureBig'), 'shock');
      if (mine > 0 && Math.random() < 0.5) return say(PZ.paatiLine('youCaptureSmall'), 'smug');
      if (sum.nothing && Math.random() < 0.45) return say(PZ.paatiLine('youNothing'), 'happy');
    } else {
      if (mine >= 6) return say(PZ.paatiLine('paatiCaptureBig'), 'happy');
      if (mine > 0 && Math.random() < 0.45) return say(PZ.paatiLine('paatiCaptureSmall'), 'smug');
    }
    const d = G.state.store[1] - G.state.store[0];
    if (Math.random() < 0.18) {
      if (d >= 8) return say(PZ.paatiLine('winning'), 'smug');
      if (d <= -8) return say(PZ.paatiLine('losing'), 'think');
    }
  }

  function nextTurn() {
    if (G.state.over) return endGame();
    if (G.state.turn === 0) {
      G.awaitUser = true;
      const legal = PZ.legalMoves(G.state);
      setPlayable(legal);
      rowGlow(0);
      narrate('Your turn! Tap a glowing kuzhi on <b>your row</b> (bottom) to scoop its seeds.', 0);
      clearTimeout(G.idleT);
      G.idleT = setTimeout(() => G.awaitUser && say(PZ.paatiLine('idle'), 'smug'), 16000);
    } else paatiTurn();
  }

  async function paatiTurn() {
    rowGlow(1);
    narrate('Paati is thinking about her move…', 1);
    if (Math.random() < 0.6) say(PZ.paatiLine('thinking'), 'think', { moodMs: 0 });
    else setMood('think');
    thinking(true);
    const t0 = performance.now();
    await sleep(60);
    const m = PZ.chooseMove(G.state, settings.level);
    const wait = Math.max(0, (settings.level === 'hard' ? 1300 : 1000) / Math.sqrt(SP()) - (performance.now() - t0));
    await sleep(wait);
    if (G.mode !== 'play') return;
    thinking(false);
    setMood('normal');
    flash(m);
    pitEls[m].el.classList.add('target');
    await sleep(420 / SP());
    await runMove(m);
  }

  /* ---------------- start / end ---------------- */
  function showScreen(id) {
    $$('.screen').forEach((s) => s.classList.toggle('is-active', s.id === id));
  }

  const MOOD_LABEL = { easy: 'Chellam mood · easy', medium: 'Konjam serious · medium', hard: 'Paati mode · hard' };

  async function deal(state) {
    G.view.pits = Array(14).fill(0);
    G.view.store = state.store.slice();
    renderAll();
    const order = [...Array(14).keys()];
    for (let n = 1; n <= Math.max(...state.pits); n++) {
      for (const i of order) if (state.pits[i] >= n) { G.view.pits[i] = n; setPit(i, n, true); }
      sfx.tok(1.1);
      await sleep(70);
    }
    syncView(state);
    renderAll();
  }

  async function startGame() {
    closeEnd();
    G.mode = 'play';
    G.tut = null;
    pointer(null);
    clearMarks();
    setPlayable(null);
    showScreen('screen-game');
    $('.np-mood').textContent = MOOD_LABEL[settings.level];
    const first = G.games % 2 === 0 ? 0 : 1;
    G.games++;
    G.state = PZ.newState(5, first);
    narrate('Dealing 5 seeds into every kuzhi…', 'New game');
    say(PZ.paatiLine(first === 1 ? 'helloPaatiFirst' : 'hello'), 'happy');
    await deal(G.state);
    await sleep(900);
    if (G.mode === 'play') nextTurn();
  }

  function endGame() {
    G.awaitUser = false;
    setPlayable(null);
    rowGlow(-1);
    const [y, p] = G.state.store;
    const res = y > p ? 'win' : y < p ? 'lose' : 'tie';
    const line = PZ.paatiLine(res === 'win' ? 'youWin' : res === 'lose' ? 'paatiWin' : 'tie');
    const mood = res === 'win' ? 'shock' : res === 'lose' ? 'happy' : 'smug';
    say(line, mood, { moodMs: 0 });
    narrate(`Round over — you <b>${y}</b>, Paati <b>${p}</b>.`, 'Round over');
    sfx.fanfare(res !== 'lose');

    const end = $('#end');
    $('.end-face .paati').dataset.mood = res === 'win' ? 'sad' : res === 'lose' ? 'happy' : 'smug';
    $('.end-kicker').textContent = res === 'win' ? 'Paati is shocked' : res === 'lose' ? 'Paati wins, obviously' : 'Equal-equal';
    $('.end-title').textContent = res === 'win' ? 'You beat Paati!' : res === 'lose' ? 'Paati jeyichitaanga!' : 'Samam! A tie.';
    $('[data-end="0"]').textContent = y;
    $('[data-end="1"]').textContent = p;
    $('.end-line').textContent = line.t;
    $('.end-line-e').textContent = line.e;
    const petals = $('.petals');
    petals.innerHTML = '';
    if (res === 'win') {
      for (let k = 0; k < 46; k++) {
        const s = document.createElement('i');
        s.className = 'petal';
        s.style.left = Math.random() * 100 + '%';
        s.style.animationDuration = 3 + Math.random() * 3 + 's';
        s.style.animationDelay = Math.random() * 2 + 's';
        s.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
        s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        petals.appendChild(s);
      }
    }
    setTimeout(() => { if (G.mode === 'play') end.hidden = false; }, 1600);
  }
  function closeEnd() { $('#end').hidden = true; }

  function goHome() {
    G.mode = 'menu';
    G.awaitUser = false;
    G.skip = true;
    clearTimeout(G.idleT);
    closeEnd();
    pointer(null);
    sayId++;
    showScreen('screen-title');
    if (location.hash) history.replaceState(null, '', location.pathname);
  }

  /* ---------------- tutorial: Paati's pathshala ---------------- */
  const P = (you, paati, store = [0, 0]) => ({ pits: [...you, ...paati], store, turn: 0, over: false });
  const TUT = [
    {
      state: P([5, 5, 5, 5, 5, 5, 5], [5, 5, 5, 5, 5, 5, 5]),
      say: { t: 'Vaa kanna! Rendu nimishathula Pallanguzhi solli tharen.', e: 'Come! I’ll teach you Pallanguzhi in two minutes.' },
      narr: 'Welcome to <b>Paati’s pathshala</b>. Press <b>Next</b> in Paati’s speech bubble to continue.',
    },
    {
      state: P([5, 5, 5, 5, 5, 5, 5], [5, 5, 5, 5, 5, 5, 5]),
      glow: 'both',
      say: { t: 'Keela irukkura 7 kuzhi unnodadhu. Mela 7 ennodadhu.', e: 'The 7 pits at the bottom are yours. The 7 at the top are mine.' },
      narr: 'This is the board: <b>14 kuzhis</b> (pits). Each one starts with <b>5 seeds</b>, so 70 in all. The ends of the board hold your captured seeds.',
    },
    {
      title: 'Sowing',
      state: P([0, 3, 0, 0, 0, 0, 0], [2, 1, 2, 3, 1, 2, 1]),
      target: 1,
      say: { t: 'Indha kuzhi-a thodu. Ellaa seeds-um eduthu, oru kuzhi-ku onnu podu.', e: 'Tap this pit. Take all its seeds and drop one in each pit after it.' },
      narr: '<b>Sowing:</b> tap the glowing kuzhi. You’ll scoop its 3 seeds and drop one into each kuzhi going <b>anticlockwise</b> (left → right on your row).',
      post: { t: 'Paathiyaa? Onnu, onnu, onnu. Adhu dhaan vidhaippu.', e: 'See? One, one, one. That is sowing.' },
      postNarr: 'One seed per kuzhi. The move ended because the next kuzhi was empty, and the one after it was too. More on that soon.',
    },
    {
      title: 'Relay',
      state: P([2, 0, 0, 2, 0, 0, 0], [0, 2, 3, 1, 2, 3, 1]),
      target: 0,
      say: { t: 'Kadaisi seed vizhundha apram, adutha kuzhi-la seeds irundhaa? Adha-yum eduthu thodarndhu podu!', e: 'After the last seed, if the next pit has seeds, scoop those too and keep going!' },
      narr: '<b>Keep going:</b> when your last seed lands, look at the <b>next</b> kuzhi. If it has seeds, scoop them up and keep sowing. Tap the glowing kuzhi.',
      post: { t: 'Rail vandi maadhiri thodarndhu pogum. Romba fun!', e: 'It chains along like a train. Lots of fun!' },
      postNarr: 'The last seed landed next to a kuzhi with 2 seeds, so you scooped those and carried on. One move can wrap around the whole board!',
    },
    {
      title: 'Capture',
      state: P([0, 0, 0, 0, 2, 0, 0], [0, 6, 2, 1, 2, 3, 1]),
      target: 4,
      say: { t: 'Ippo dhaan important. Adutha kuzhi kaali-naa, adhukku apram irukkura kuzhi unnodadhu!', e: 'The important bit: if the next pit is empty, the pit after it is yours!' },
      narr: '<b>Capture:</b> if the kuzhi after your last seed is <b>empty</b>, you take every seed in the kuzhi <b>just beyond it</b>. Try it, and watch Paati’s 6 seeds.',
      post: { t: 'Aiyo! En 6 seeds-a eduthutta! Nalla student dhaan.', e: 'Oh no, you took my 6 seeds! Good student.' },
      postNarr: 'Captured seeds go into <b>your big kuzhi</b> at the right end of the board. That’s how you score. Then your turn ends.',
      postMood: 'shock',
    },
    {
      title: 'Pasu',
      state: P([0, 3, 1, 3, 0, 0, 0], [2, 1, 2, 1, 2, 1, 2]),
      target: 1,
      say: { t: 'Oru kuzhi-la sariyaa 4 seeds aana — adhu Pasu! Andha row-oda owner-ku pogum.', e: 'If a pit reaches exactly 4 seeds, that’s a Pasu! It goes to the owner of that row.' },
      narr: '<b>Pasu (the cow):</b> while sowing, any kuzhi that reaches <b>exactly 4</b> is taken right away by whoever owns that row. Tap to make one!',
      post: { t: 'Moo! Un pakkam pasu, adhanaala unakku dhaan. En pakkam aana, enakku!', e: 'Moo! The cow was on your side, so it’s yours. On my side, it would be mine!' },
      postNarr: 'Watch for 4s on <b>both</b> rows. Paati’s sowing can hand you a pasu too, and yours can hand her one.',
      postMood: 'happy',
    },
    {
      title: 'Winning',
      state: P([0, 2, 0, 1, 0, 0, 3], [0, 0, 0, 0, 0, 0, 0], [30, 34]),
      say: { t: 'Yaar row-la seeds illaiyo, avanga turn vandhaa — game over. Adhigam seeds irukkuravanga jeyippaanga.', e: 'When it’s someone’s turn and their row is empty, the game ends. Most seeds wins.' },
      narr: '<b>Winning:</b> when the player to move has an <b>empty row</b>, the round ends. Seeds left on a row go to its owner. More than <b>35 of 70</b> wins.',
    },
    {
      state: P([5, 5, 5, 5, 5, 5, 5], [5, 5, 5, 5, 5, 5, 5]),
      say: { t: 'Avlo dhaan! Ippo unakku theriyum. Vaa, Paati kooda oru game aadalaam?', e: 'That’s it! Now you know. Shall we play a real game?' },
      narr: 'Remember: <b>sow</b> → <b>keep going</b> if the next kuzhi has seeds → <b>capture</b> past an empty kuzhi. And watch for <b>pasu</b> 4s!',
      final: true,
    },
  ];

  async function startTutorial() {
    closeEnd();
    G.mode = 'tutorial';
    G.tut = 0;
    showScreen('screen-game');
    $('.np-mood').textContent = 'Teacher mode';
    tutStep(0);
  }

  async function tutStep(k) {
    if (G.mode !== 'tutorial') return;
    G.tut = k;
    const s = TUT[k];
    clearMarks();
    setPlayable(null);
    pointer(null);
    G.allowPit = null;
    G.state = PZ.clone(s.state);
    syncView(G.state);
    renderAll();
    rowGlow(s.glow === 'both' ? 0 : -1);
    if (s.glow === 'both') $('.row-glow.top').classList.add('on');
    narrate(s.narr, `Lesson ${k + 1}/${TUT.length}`);
    if (s.target != null) {
      pitEls[s.target].el.classList.add('target', 'playable');
      pitEls.forEach((p, i) => { if (i !== s.target && i < 7 && G.view.pits[i] === 0) p.el.classList.add('dim'); });
      await say(s.say, 'normal');
      if (G.tut !== k) return;
      G.allowPit = s.target;
      pointer(s.target);
    } else {
      const actions = s.final
        ? [{ label: 'Play Paati →', fn: startGame }, { label: 'Again', ghost: true, fn: () => tutStep(0) }]
        : [{ label: 'Next →', fn: () => tutStep(k + 1) }].concat(k > 0 ? [{ label: 'Back', ghost: true, fn: () => tutStep(k - 1) }] : []);
      await say(s.say, s.final ? 'happy' : 'normal', { actions });
    }
  }

  async function tutMove(i) {
    const k = G.tut;
    const s = TUT[k];
    clearMarks();
    setPlayable(null);
    sfx.tap();
    const speed = settings.speed;
    settings.speed = Math.min(speed, 1) * 0.8; // slower so the lesson reads
    const r = PZ.applyMove(G.state, i, true);
    await animate(r.events, 0);
    settings.speed = speed;
    G.state = r.state;
    if (G.mode !== 'tutorial' || G.tut !== k) return;
    narrate(s.postNarr, `Lesson ${k + 1}/${TUT.length}`);
    say(s.post, s.postMood || 'happy', {
      moodMs: 0,
      actions: [{ label: 'Next →', fn: () => tutStep(k + 1) }, { label: 'Try again', ghost: true, fn: () => tutStep(k) }],
    });
  }

  const pointerEl = $('.pointer');
  function pointer(i) {
    if (i == null) { pointerEl.classList.remove('on'); return; }
    const c = pitAt(i);
    pointerEl.style.left = c.x - 14 + 'px';
    pointerEl.style.top = c.y + 18 + 'px';
    pointerEl.classList.add('on');
  }

  /* ---------------- rules sheet ---------------- */
  const miniXY = (i) => ({ x: 80 + (i < 7 ? i : 13 - i) * 47, y: i < 7 ? 116 : 50 });
  function mini(pits, cls = {}, arrows = [], cap = '') {
    let h = '';
    pits.forEach((n, i) => {
      const p = miniXY(i);
      let seeds = '';
      for (let k = 0; k < Math.min(+n || 0, 12); k++) {
        const sl = pitSlot(i + 3, k);
        seeds += `<span class="seed" style="left:${(sl.x * 0.62).toFixed(1)}px;top:${(sl.y * 0.62).toFixed(1)}px;--r:${sl.r}deg"></span>`;
      }
      h += `<div class="mpit ${cls[i] || ''}" style="left:${p.x}px;top:${p.y}px"><div class="seeds">${seeds}</div>${n === '' ? '' : `<span class="mcount${+n === 0 ? ' zero' : ''}">${n}</span>`}</div>`;
    });
    let svg = '<svg class="flow" viewBox="0 0 440 166"><defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="#F4C46A"/></marker></defs>';
    arrows.forEach(([a, b, bend = 22]) => {
      const p = miniXY(a), q = miniXY(b);
      const off = (i) => (i < 7 ? 25 : -25);
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2 + (a < 7 && b < 7 ? bend : -bend);
      svg += `<path d="M${p.x} ${p.y + off(a)} Q${mx} ${my + off(a)} ${q.x} ${q.y + off(b)}" stroke="#F4C46A" stroke-width="2.2" fill="none" stroke-dasharray="4 4" stroke-linecap="round" marker-end="url(#ah)"/>`;
    });
    svg += '</svg>';
    return `<div class="rule-art"><div class="mini"><div class="mini-grain"></div><span class="mstore l"></span><span class="mstore r"></span>${h}${svg}</div><div class="mini-cap">${cap}</div></div>`;
  }

  const RULES = [
    {
      h: 'The board', ta: 'பல்லாங்குழி பலகை',
      p: ['Pallanguzhi is played on a wooden board with <b>14 kuzhis</b> (pits) in two rows of seven.',
        'The <b>bottom row is yours</b> and the <b>top row is Paati’s</b>. Every kuzhi starts with <b>5 seeds</b>.'],
      tip: '“Pallanguzhi” means “many pits”. Tamil homes have played it for centuries, often with manjadi seeds, tamarind seeds or cowrie shells.',
      art: mini(Array(14).fill(5), {}, [], 'Bottom row: yours · Top row: Paati’s'),
    },
    {
      h: 'Sowing', ta: 'விதைத்தல்',
      p: ['On your turn, pick any <b>non-empty kuzhi on your row</b> and scoop out all its seeds.',
        'Drop them <b>one by one</b> into the following kuzhis, <b>anticlockwise</b>: left to right along your row, then right to left along Paati’s.'],
      tip: 'Tip: on desktop, hover over a kuzhi to see where your seeds will land.',
      art: mini([0, 0, '', 1, 1, 1, 0, 2, 2, 2, 2, 2, 2, 2], { 2: 'hl', 3: 'hl', 4: 'hl', 5: 'hl' }, [[2, 3], [3, 4], [4, 5]], '3 seeds → one each into the next 3 kuzhis'),
    },
    {
      h: 'Keep going', ta: 'தொடர்ந்து ஆடு',
      p: ['When your last seed drops, look at the <b>next kuzhi</b>.',
        'If it has seeds, <b>scoop them all</b> and keep sowing from there. One move can wind around the board many times!'],
      tip: 'Long chains are where the fun (and the chaos) is. Tap anywhere to fast-forward a long move.',
      art: mini([0, 1, 1, 4, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2], { 2: 'hl', 3: 'hl' }, [[2, 3, 18], [3, 6, 30]], 'Last seed at ③ → next has 4 → scoop & continue'),
    },
    {
      h: 'Capture', ta: 'கைப்பற்றுதல்',
      p: ['If the kuzhi after your last seed is <b>empty</b>, skip over it and <b>take every seed</b> in the kuzhi just beyond.',
        'Those seeds go into your big kuzhi at the end of the board, and your turn ends. If both kuzhis are empty, you get nothing.'],
      tip: 'Set traps: leave an empty kuzhi right before a fat one on Paati’s row.',
      art: mini([0, 0, 0, 0, 0, 1, 1, 0, 7, 2, 2, 2, 2, 2], { 6: 'hl', 7: 'empty', 8: 'cap' }, [[6, 8, 40]], 'Last seed → empty → you take the 7'),
    },
    {
      h: 'Pasu · the cow', ta: 'பசு',
      p: ['While sowing, if any kuzhi reaches <b>exactly 4 seeds</b>, it’s a <b>pasu</b>!',
        'Those 4 seeds go straight to <b>whoever owns that row</b>, even in the middle of the other player’s move.'],
      tip: 'Paati counts 3s on your row very carefully. You should too.',
      art: mini([0, 0, 3, 1, 3, 0, 0, 2, 1, 2, 1, 2, 1, 2], { 4: 'pasu' }, [[2, 3], [3, 4]], '3 + 1 = 4 → pasu! The row owner takes it'),
    },
    {
      h: 'Winning', ta: 'வெற்றி',
      p: ['When it’s someone’s turn and <b>their row is empty</b>, the round ends.',
        'Seeds left on each row go to that row’s owner. Get <b>more than 35</b> of the 70 seeds to win.'],
      tip: 'In the traditional game, rounds continue and kuzhis a player can’t refill get “burnt”. Here we play one quick round.',
      art: mini([2, 0, 1, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0], { 7: 'empty', 8: 'empty', 9: 'empty', 10: 'empty', 11: 'empty', 12: 'empty', 13: 'empty' }, [], 'Paati’s row is empty on her turn → round over'),
    },
  ];
  let rulePage = 0;
  $('.rules-pages').innerHTML = RULES.map((r, k) => `
    <div class="rule-page" data-k="${k}">
      <div>
        <span class="rule-ta-num" aria-hidden="true">${'௧௨௩௪௫௬'[k]}</span>
        <div class="rule-num">Rule ${k + 1} of ${RULES.length}</div>
        <h3>${r.h}<span class="ta">${r.ta}</span></h3>
        ${r.p.map((x) => `<p>${x}</p>`).join('')}
        <div class="rule-tip">${r.tip}</div>
      </div>
      ${r.art}
    </div>`).join('');
  $('.rules-dots').innerHTML = RULES.map((_, k) => `<button data-k="${k}" aria-label="Rule ${k + 1}"><span class="seed"></span></button>`).join('');
  $('.rules-dots').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showRule(+b.dataset.k); });
  function showRule(k) {
    rulePage = Math.max(0, Math.min(RULES.length - 1, k));
    $$('.rule-page').forEach((p, i) => p.classList.toggle('on', i === rulePage));
    $$('.rules-dots button').forEach((b, i) => b.classList.toggle('on', i === rulePage));
    $('[data-action="rules-prev"]').disabled = rulePage === 0;
    $('[data-action="rules-next"]').textContent = rulePage === RULES.length - 1 ? 'Got it ✓' : 'Next →';
  }
  function openRules() { $('#rules').hidden = false; showRule(0); }
  function closeRules() { $('#rules').hidden = true; }

  /* ---------------- buttons + options ---------------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    sfx.unlock();
    const a = b.dataset.action;
    if (a === 'play' || a === 'again') { sfx.tap(); startGame(); }
    else if (a === 'learn') { sfx.tap(); startTutorial(); }
    else if (a === 'rules') { sfx.tap(); openRules(); }
    else if (a === 'close-rules') closeRules();
    else if (a === 'rules-prev') showRule(rulePage - 1);
    else if (a === 'rules-next') { if (rulePage === RULES.length - 1) closeRules(); else showRule(rulePage + 1); }
    else if (a === 'home') goHome();
    else if (a === 'sound') { settings.sound = !settings.sound; applySettings(); save(); }
    else if (a === 'speed') { settings.speed = settings.speed === 1 ? 2 : settings.speed === 2 ? 3 : 1; applySettings(); save(); }
  });
  $('#rules').addEventListener('click', (e) => { if (e.target.id === 'rules') closeRules(); });

  $$('.chips').forEach((group) => {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      sfx.unlock(); sfx.tok(1.2);
      settings[group.dataset.opt] = b.dataset.v;
      applySettings(); save();
    });
  });

  function applySettings() {
    $$('.chips').forEach((g) => $$('button', g).forEach((b) => b.classList.toggle('on', b.dataset.v === settings[g.dataset.opt])));
    document.body.dataset.seed = settings.seed;
    sfx.enabled = settings.sound;
    $('[data-action="sound"]').classList.toggle('muted', !settings.sound);
    $('.speed-label').textContent = settings.speed + '×';
  }

  // idle Paati on title — she blinks and her coffee steams; seed the board for the background
  applySettings();
  syncView(PZ.newState());
  renderAll();

  // deep links from the articles: /#play, /#learn, /#rules
  function route() {
    const h = location.hash.slice(1);
    if (h === 'play') startGame();
    else if (h === 'learn') startTutorial();
    else if (h === 'rules') openRules();
  }
  addEventListener('hashchange', route);
  route();
})();
