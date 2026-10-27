# Pallanguzhi · play with Sheila Paati

The old Tamil seed game on a carved wooden board, played against Sheila Paati, an 86-year-old who has been unbeaten since 1952 and talks trash in Tanglish.

- Hands-on 2-minute tutorial (Paati's pathshala) and an illustrated rules sheet
- Three difficulty levels: Chellam, Konjam serious, Paati mode
- Manjadi, puli kottai or sozhi seeds
- Live narration of every sow, relay, capture and pasu
- Multiplayer coming soon

## Run it

No build step. It's plain HTML, CSS and JS, so open `index.html` or serve the folder:

```sh
python3 -m http.server 5173
```

## Rules played

5 seeds per kuzhi. Sow anticlockwise. If the kuzhi after your last seed has seeds, scoop them and keep going. If it's empty, capture the kuzhi after it. Any kuzhi that reaches exactly 4 while sowing is a **pasu**, which goes to the owner of that row. The round ends when the player to move has an empty row.

## Files

| Path | What |
| --- | --- |
| `js/engine.js` | rules + Paati's search (negamax, alpha-beta) |
| `js/game.js` | rendering, animation, tutorial, rules sheet |
| `js/art.js` | hand-built SVG: Paati, lamps, frame, board icon |
| `js/paati.js` | Paati's lines |
| `js/audio.js` | synthesized sounds (no audio files) |
| `assets/` | painted banana, lotus and sozhi cut-outs |
