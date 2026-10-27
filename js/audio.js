/* Tiny synthesized sound kit — no audio files. Seeds clack, bells ring, the pasu moos. */
(function () {
  const PZ = (window.PZ = window.PZ || {});
  let ctx = null, master = null, enabled = true, noiseBuf = null;

  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }

  // seed dropping into a wooden kuzhi
  function tok(pitch = 1) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime((620 + Math.random() * 260) * pitch, t);
    o.frequency.exponentialRampToValueAtTime(240 * pitch, t + 0.07);
    env(g, t, 0.003, 0.32, 0.08);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.12);
    const n = c.createBufferSource(), f = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 1400; f.Q.value = 1.2;
    env(ng, t, 0.001, 0.22, 0.03);
    n.connect(f).connect(ng).connect(master);
    n.start(t, Math.random() * 0.1, 0.05);
  }

  function scoop(n = 5) {
    for (let i = 0; i < Math.min(n, 7); i++) setTimeout(() => tok(1.25 + Math.random() * 0.3), i * 22);
  }

  // small temple bell — inharmonic partials
  function bell(base = 880, vol = 0.18) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime;
    [[1, 1], [2.76, 0.5], [5.4, 0.25], [8.9, 0.12]].forEach(([r, a]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = base * r;
      env(g, t, 0.004, vol * a, 1.6 / Math.sqrt(r));
      o.connect(g).connect(master); o.start(t); o.stop(t + 2);
    });
  }

  function moo() {
    const c = ensure(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(190, t); o.frequency.linearRampToValueAtTime(150, t + 0.55);
    lfo.frequency.value = 6; lg.gain.value = 5; lfo.connect(lg).connect(o.frequency);
    f.type = 'lowpass'; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(900, t + 0.2); f.frequency.linearRampToValueAtTime(380, t + 0.6);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1, t + 0.08); g.gain.linearRampToValueAtTime(0.0001, t + 0.65);
    o.connect(f).connect(g).connect(master);
    o.start(t); lfo.start(t); o.stop(t + 0.7); lfo.stop(t + 0.7);
  }

  // Pasu! A rich little jackpot: low thump, rising brass arpeggio, a shower of coins, and shimmer.
  function jackpot() {
    const c = ensure(); if (!c) return;
    const t = c.currentTime;
    const bus = c.createGain();
    bus.gain.value = 0.9;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    bus.connect(comp).connect(master);

    // thump
    const th = c.createOscillator(), thg = c.createGain();
    th.type = 'sine';
    th.frequency.setValueAtTime(150, t); th.frequency.exponentialRampToValueAtTime(55, t + 0.22);
    env(thg, t, 0.004, 0.35, 0.25);
    th.connect(thg).connect(bus); th.start(t); th.stop(t + 0.32);

    // rising arpeggio, each note a bright bell with a little detuned chorus
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      const st = t + 0.05 + i * 0.075;
      [[1, 0.16, 'triangle'], [2.01, 0.06, 'sine'], [3.99, 0.03, 'sine']].forEach(([r, v, type]) => {
        [-6, 6].forEach((cents) => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = type; o.frequency.value = f * r; o.detune.value = cents;
          env(g, st, 0.003, v * 0.6, i === notes.length - 1 ? 1.1 : 0.32);
          o.connect(g).connect(bus); o.start(st); o.stop(st + 1.3);
        });
      });
    });

    // final sustained major chord swell
    const chordT = t + 0.05 + notes.length * 0.075;
    [1046.5, 1318.5, 1568, 2093].forEach((f) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, chordT);
      g.gain.exponentialRampToValueAtTime(0.05, chordT + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, chordT + 1.2);
      o.connect(g).connect(bus); o.start(chordT); o.stop(chordT + 1.3);
    });

    // coin shower
    for (let i = 0; i < 18; i++) {
      const st = t + 0.12 + Math.random() * 0.75 + i * 0.012;
      const f = 2400 + Math.random() * 2600;
      [1, 1.47].forEach((r, j) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f * r;
        env(g, st, 0.001, j ? 0.025 : 0.055, 0.09 + Math.random() * 0.08);
        o.connect(g).connect(bus); o.start(st); o.stop(st + 0.25);
      });
    }

    // shimmer
    const n = c.createBufferSource(), hp = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = noiseBuf; n.loop = true;
    hp.type = 'highpass'; hp.frequency.value = 7000;
    ng.gain.setValueAtTime(0.0001, t + 0.1);
    ng.gain.exponentialRampToValueAtTime(0.05, t + 0.4);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    n.connect(hp).connect(ng).connect(bus); n.start(t + 0.1); n.stop(t + 1.4);
  }

  function tap() { tok(1.6); }

  function fanfare(win) {
    const notes = win ? [523, 659, 784, 1046] : [523, 494, 440, 392];
    notes.forEach((n, i) => setTimeout(() => bell(n, 0.14), i * 170));
  }

  PZ.sfx = {
    tok, scoop, bell, moo, jackpot, tap, fanfare,
    unlock: ensure,
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; if (!v && ctx) ctx.suspend(); if (v && ctx) ctx.resume(); },
  };
})();
