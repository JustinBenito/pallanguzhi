/* Pallanguzhi rules engine + Sheila Paati's brain.
 *
 * Board indices run anticlockwise (the sowing direction):
 *   0..6   → your row, left → right (bottom of screen)
 *   7..13  → Paati's row, right → left (top of screen)
 *
 * Rules (classic Tamil Nadu version, single round):
 *  1. Every kuzhi starts with 5 seeds.
 *  2. Pick a non-empty kuzhi on your row, scoop every seed, sow one per kuzhi anticlockwise.
 *  3. Pasu: whenever a kuzhi reaches exactly 4 while sowing, the owner of that row takes them.
 *  4. When the last seed drops, look at the next kuzhi:
 *       has seeds  → scoop them and keep sowing (relay)
 *       empty      → capture everything in the kuzhi after it. Turn over.
 *  5. When the player to move has an empty row, the round ends. Each side keeps the seeds
 *     on its own row. Most seeds wins.
 */
(function () {
  const PZ = (window.PZ = window.PZ || {});
  const N = 14;
  const GUARD = 4000;

  const owner = (i) => (i < 7 ? 0 : 1);

  function newState(seeds = 5, turn = 0) {
    return { pits: Array(N).fill(seeds), store: [0, 0], turn, over: false };
  }

  function clone(s) {
    return { pits: s.pits.slice(), store: s.store.slice(), turn: s.turn, over: s.over };
  }

  function legalMoves(s, who = s.turn) {
    const out = [];
    for (let i = who * 7; i < who * 7 + 7; i++) if (s.pits[i] > 0) out.push(i);
    return out;
  }

  function sideTotal(s, who) {
    let t = 0;
    for (let i = who * 7; i < who * 7 + 7; i++) t += s.pits[i];
    return t;
  }

  // Applies a move. When `record` is true, returns the event list the UI animates.
  function applyMove(s, pit, record) {
    const st = clone(s);
    const ev = record ? [] : null;
    const me = st.turn;
    let hand = st.pits[pit];
    st.pits[pit] = 0;
    if (ev) ev.push({ t: 'pick', pit, n: hand, first: true, by: me });

    let pos = pit;
    let drops = 0;
    for (;;) {
      while (hand > 0 && drops < GUARD) {
        pos = (pos + 1) % N;
        st.pits[pos]++;
        hand--;
        drops++;
        if (ev) ev.push({ t: 'sow', pit: pos, left: hand, by: me });
        if (st.pits[pos] === 4) {
          const o = owner(pos);
          st.pits[pos] = 0;
          st.store[o] += 4;
          if (ev) ev.push({ t: 'pasu', pit: pos, owner: o, n: 4, by: me });
        }
      }
      if (drops >= GUARD) break;

      const next = (pos + 1) % N;
      if (st.pits[next] > 0) {
        hand = st.pits[next];
        st.pits[next] = 0;
        pos = next;
        if (ev) ev.push({ t: 'pick', pit: next, n: hand, relay: true, by: me });
        continue;
      }
      const cap = (next + 1) % N;
      const n = st.pits[cap];
      if (ev) ev.push({ t: 'empty', pit: next, by: me });
      if (n > 0) {
        st.pits[cap] = 0;
        st.store[me] += n;
        if (ev) ev.push({ t: 'capture', pit: cap, n, by: me });
      } else if (ev) ev.push({ t: 'nothing', pit: cap, by: me });
      break;
    }

    st.turn = 1 - me;
    if (legalMoves(st).length === 0) finish(st, ev);
    return { state: st, events: ev, drops };
  }

  function finish(st, ev) {
    st.over = true;
    for (let i = 0; i < N; i++) {
      if (st.pits[i] > 0) {
        const o = owner(i);
        if (ev) ev.push({ t: 'sweep', pit: i, n: st.pits[i], owner: o });
        st.store[o] += st.pits[i];
        st.pits[i] = 0;
      }
    }
    if (ev) ev.push({ t: 'over', store: st.store.slice(), stuck: st.turn });
  }

  /* ---------- Sheila Paati's brain: negamax with alpha-beta + iterative deepening ---------- */

  function evaluate(s, me) {
    // Seeds in the kitty are real. Seeds on your own row are "probably yours" at the end.
    const kitty = s.store[me] - s.store[1 - me];
    if (s.over) return kitty * 100;
    return kitty * 100 + (sideTotal(s, me) - sideTotal(s, 1 - me)) * 18;
  }

  function chooseMove(s, level) {
    const moves = legalMoves(s);
    if (moves.length === 1) return moves[0];
    const me = s.turn;

    if (level === 'easy') {
      // Chellam mode: Paati is "letting you win", mostly.
      if (Math.random() < 0.55) return moves[(Math.random() * moves.length) | 0];
      return bestAtDepth(s, me, 1, Infinity).move;
    }

    const maxDepth = level === 'hard' ? 14 : 3;
    const budget = level === 'hard' ? 650 : 200;
    const deadline = performance.now() + budget;
    let best = bestAtDepth(s, me, 1, Infinity);
    for (let d = 2; d <= maxDepth; d++) {
      const r = bestAtDepth(s, me, d, deadline);
      if (r.aborted) break;
      best = r;
    }
    // Medium Paati occasionally gets distracted by the TV serial.
    if (level === 'medium' && Math.random() < 0.18) return moves[(Math.random() * moves.length) | 0];
    return best.move;
  }

  function bestAtDepth(s, me, depth, deadline) {
    const ctx = { deadline, aborted: false, nodes: 0 };
    let bestMove = null;
    let bestVal = -Infinity;
    const moves = legalMoves(s);
    for (const m of moves) {
      const child = applyMove(s, m, false).state;
      const v = -negamax(child, depth - 1, -Infinity, -bestVal, ctx);
      if (ctx.aborted) return { aborted: true };
      // tiny jitter so equal moves aren't always the leftmost
      const jv = v + Math.random() * 0.5;
      if (jv > bestVal) {
        bestVal = jv;
        bestMove = m;
      }
    }
    return { move: bestMove, value: bestVal };
  }

  function negamax(s, depth, alpha, beta, ctx) {
    if ((++ctx.nodes & 255) === 0 && performance.now() > ctx.deadline) ctx.aborted = true;
    if (ctx.aborted) return 0;
    if (depth === 0 || s.over) return evaluate(s, s.turn);
    let best = -Infinity;
    for (const m of legalMoves(s)) {
      const v = -negamax(applyMove(s, m, false).state, depth - 1, -beta, -alpha, ctx);
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }

  Object.assign(PZ, { N, owner, newState, clone, legalMoves, sideTotal, applyMove, chooseMove });
})();
