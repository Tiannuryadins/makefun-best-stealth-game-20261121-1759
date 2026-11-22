// Shadow Courier — canvas renderer. All art is procedural: tiled floor,
// crates, bushes, shadows, guards with translucent vision cones, the
// courier, the exit gate and pickups. No image files.
import { mulberry32, levelSeed } from './rng.js';

const W = 960, H = 600;

function conePath(ctx, g) {
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.arc(g.x, g.y, g.range, g.dir - g.fov / 2, g.dir + g.fov / 2);
  ctx.closePath();
}

export function render(ctx, game) {
  const level = game.level;
  if (!level) return;
  const t = game.shotMode && game.frozenTime !== null ? game.frozenTime : game.time;
  ctx.clearRect(0, 0, W, H);

  // floor: dark tiles with seeded speckles
  ctx.fillStyle = '#20242e';
  ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(levelSeed(game.levelIndex));
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let i = 0; i < 130; i++) {
    const x = rng() * W, y = rng() * H;
    ctx.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.16)';
    ctx.fillRect(x, y, 3 + rng() * 5, 3 + rng() * 5);
  }
  // drifting leaves (frozen in shot mode)
  for (let i = 0; i < 10; i++) {
    const lx = ((rng() * W + t * 12 * (i % 3 + 1)) % W);
    const ly = (rng() * H + t * 6) % H;
    ctx.fillStyle = 'rgba(214,178,94,0.35)';
    ctx.beginPath(); ctx.ellipse(lx, ly, 4, 2.5, 0.6, 0, Math.PI * 2); ctx.fill();
  }

  // shadow zones: dark floor where detection fills half as fast
  for (const s of level.shadows) {
    ctx.fillStyle = 'rgba(8,10,20,0.55)';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(120,140,220,0.25)';
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w, s.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(150,170,255,0.5)';
    ctx.font = '11px sans-serif';
    ctx.fillText('BAYANGAN', s.x + 8, s.y + 16);
  }

  // exit gate
  const e = level.exit;
  const pulse = 0.55 + 0.25 * Math.sin(t * 3);
  ctx.fillStyle = `rgba(46,204,113,${pulse})`;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = '#2ecc71';
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x + 1.5, e.y + 1.5, e.w - 3, e.h - 3);
  ctx.fillStyle = '#eafff1';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 5);
  ctx.textAlign = 'left';

  // pickups: glowing documents
  for (const p of level.pickups) {
    if (p.taken) continue;
    const bob = Math.sin(t * 2 + p.x) * 2;
    ctx.fillStyle = 'rgba(241,196,15,0.25)';
    ctx.beginPath(); ctx.arc(p.x, p.y + bob, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7dc6f';
    ctx.fillRect(p.x - 7, p.y - 9 + bob, 14, 18);
    ctx.strokeStyle = '#7d6608';
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x - 7, p.y - 9 + bob, 14, 18);
    ctx.strokeStyle = '#7d6608';
    ctx.beginPath();
    ctx.moveTo(p.x - 4, p.y - 4 + bob); ctx.lineTo(p.x + 4, p.y - 4 + bob);
    ctx.moveTo(p.x - 4, p.y + bob); ctx.lineTo(p.x + 4, p.y + bob);
    ctx.moveTo(p.x - 4, p.y + 4 + bob); ctx.lineTo(p.x + 1, p.y + 4 + bob);
    ctx.stroke();
  }

  // walls: crates / hedges
  for (const w of level.walls) {
    ctx.fillStyle = '#5d4a2f';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#6e5a3a';
    ctx.fillRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
    ctx.strokeStyle = '#3a2d1c';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    if (w.w > w.h) {
      for (let x = w.x + 18; x < w.x + w.w - 6; x += 22) {
        ctx.beginPath(); ctx.moveTo(x, w.y + 3); ctx.lineTo(x, w.y + w.h - 3); ctx.stroke();
      }
    } else {
      for (let y = w.y + 18; y < w.y + w.h - 6; y += 22) {
        ctx.beginPath(); ctx.moveTo(w.x + 3, y); ctx.lineTo(w.x + w.w - 3, y); ctx.stroke();
      }
    }
  }

  // bushes: cover — dense green, hides the player
  for (const b of level.bushes) {
    ctx.fillStyle = '#1e5c2e';
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 14);
    ctx.fill();
    const brng = mulberry32(levelSeed(game.levelIndex) + b.x + b.y);
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = brng() > 0.5 ? '#2e7d43' : '#174a26';
      ctx.beginPath();
      ctx.arc(b.x + 6 + brng() * (b.w - 12), b.y + 6 + brng() * (b.h - 12), 5 + brng() * 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(180,255,200,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 14); ctx.stroke();
    ctx.fillStyle = 'rgba(220,255,230,0.75)';
    ctx.font = '11px sans-serif';
    ctx.fillText('SEMBUNYI', b.x + 8, b.y + 15);
  }

  // guards: vision cone, then body
  for (const g of game.guards) {
    conePath(ctx, g);
    ctx.fillStyle = g.sees ? 'rgba(231,76,60,0.34)' : 'rgba(241,196,15,0.20)';
    ctx.fill();
    ctx.strokeStyle = g.sees ? 'rgba(231,76,60,0.7)' : 'rgba(241,196,15,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // body
    ctx.fillStyle = g.sees ? '#c0392b' : '#8e44ad';
    ctx.beginPath(); ctx.arc(g.x, g.y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2c1a3a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // facing tick + eyes
    const fx = Math.cos(g.dir), fy = Math.sin(g.dir);
    ctx.fillStyle = '#f5d76e';
    ctx.beginPath(); ctx.arc(g.x + fx * 7, g.y + fy * 7, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(g.x + fx * 4 - fy * 5, g.y + fy * 4 + fx * 5, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(g.x + fx * 4 + fy * 5, g.y + fy * 4 - fx * 5, 2.5, 0, Math.PI * 2); ctx.fill();
    if (g.sees) {
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 22);
      ctx.textAlign = 'left';
    }
  }

  // click-to-move target marker
  if (game.moveTarget) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(game.moveTarget.x, game.moveTarget.y, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(game.moveTarget.x - 12, game.moveTarget.y); ctx.lineTo(game.moveTarget.x + 12, game.moveTarget.y);
    ctx.moveTo(game.moveTarget.x, game.moveTarget.y - 12); ctx.lineTo(game.moveTarget.x, game.moveTarget.y + 12);
    ctx.stroke();
  }

  // player: the courier, hooded, with parcel
  const p = game.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (game.hidden) { ctx.globalAlpha = 0.55; }
  ctx.fillStyle = '#1abc9c';
  ctx.beginPath(); ctx.arc(0, 0, PLAYER_R_DRAW, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0e6655';
  ctx.lineWidth = 2;
  ctx.stroke();
  // hood + face direction
  ctx.fillStyle = '#16a085';
  ctx.beginPath(); ctx.arc(Math.cos(p.dir) * 5, Math.sin(p.dir) * 5, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f4d03f';
  ctx.fillRect(Math.cos(p.dir) * 8 - 3, Math.sin(p.dir) * 8 - 3, 6, 6);
  ctx.restore();
  if (game.hidden) {
    ctx.fillStyle = 'rgba(220,255,230,0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TERSEMBUNYI', p.x, p.y - 22);
    ctx.textAlign = 'left';
  }

  // border
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // win banner (screenshot mode): drawn every frame so the loop never erases it
  if (game.winBanner) {
    ctx.fillStyle = 'rgba(10,14,10,0.72)';
    ctx.fillRect(180, 210, 600, 180);
    ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 3;
    ctx.strokeRect(182, 212, 596, 176);
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('LEVEL SELESAI!', 480, 285);
    ctx.fillStyle = '#f7dc6f'; ctx.font = 'bold 30px sans-serif';
    ctx.fillText('★★★', 480, 330);
    ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
    ctx.fillText(`Skor ${game.score} · Tanpa ketahuan`, 480, 362);
    ctx.textAlign = 'left';
  }
}

const PLAYER_R_DRAW = 13;
