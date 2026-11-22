[![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/Tiannuryadins/makefun-best-stealth-game-20261121-1759/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/Tiannuryadins/makefun-best-stealth-game-20261121-1759/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

# Shadow Courier — Kurir Bayangan

A complete, original top-down stealth game that runs offline in a desktop
browser from static files. You are a courier who must deliver parcels
through guarded grounds — reach the green EXIT unseen.

[Play the bounty on make.fun](https://make.fun/bounty/best-stealth-game-20261121-1759)

## How to play

- **Move** with **WASD / arrow keys**, or **click** anywhere to walk there.
- Guards patrol with a **yellow vision cone**. If a guard sees you, the
  **ALERT meter** fills — when it is full, you are caught.
- Hide in the green **bushes** (guards cannot see you inside one) and move
  through **shadow zones** (detection fills half as fast). Walls block both
  movement and guard sight.
- Collect glowing **documents** (+150 points each), then reach the green
  **EXIT** gate before the timer runs out.
- **M** toggles sound, **Esc** pauses, **Enter** confirms menus.

## Levels

1. **Taman Senja** — 2 guards, 3 documents, 2:30 (dusk garden)
2. **Gudang Malam** — 3 guards, 4 documents, 3:00 (night warehouse)
3. **Halaman Museum** — 4 guards, 5 documents, 3:30 (museum grounds)

Finishing a level scores a time bonus (5 points/second left) plus a 300-point
no-spotted bonus; finishing all three shows the campaign score.

## Scoring

- Document: +150 · Time bonus: +5 per second left · Ghost bonus: +300
- Stars per level: 3 if more than half the time remains, 2 if more than a
  quarter, otherwise 1.

All art is drawn procedurally on canvas at run time — no image files, no
network. All sounds are synthesized with WebAudio — no audio files.

## Run it

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

or serve `game/` with any static server and open `index.html`. No build step.
