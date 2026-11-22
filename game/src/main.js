// Shadow Courier — bootstrap. Builds the game, wires the HUD and overlays,
// runs the animation loop, and supports screenshot mode (?shot=...) plus a
// headless self-test (?selftest=1) that reports PASS/FAIL in document.title.
import { ShadowCourierGame } from './game.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { LEVELS } from './levels.js';
import { sfx } from './audio.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const game = new ShadowCourierGame(document);
window.__shadowCourier = game; // play-test hook

const $ = (id) => document.getElementById(id);
const overlay = $('overlay');

function fmtTime(s) {
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

function updateHud() {
  const level = game.level;
  if (!level) return;
  $('level-name').textContent = `Level ${game.levelIndex + 1} · ${level.name}`;
  $('level-sub').textContent = level.sub;
  $('timer-text').textContent = fmtTime(Math.max(0, game.timeLeft));
  $('timer-bar').style.width = `${Math.max(0, (game.timeLeft / level.time) * 100)}%`;
  $('score').textContent = game.score;
  $('pickups').textContent = `${game.pickedCount}/${level.pickups.length}`;
  $('alert-fill').style.width = `${Math.round(game.alert * 100)}%`;
  $('alert-fill').className = game.alert > 0.66 ? 'high' : game.alert > 0.33 ? 'mid' : '';
  $('alert-text').textContent = game.spotted ? 'TERLIHAT!' : game.hidden ? 'TERSEMBUNYI' : game.alert > 0.01 ? 'CURIGA…' : 'AMAN';
  $('mute-btn').textContent = game.muted ? '✕' : '♪';
  $('pause-btn').textContent = game.phase === 'paused' ? '▶' : 'II';
  $('hud').classList.toggle('danger', game.spotted);
  renderOverlay();
}

function showOverlay(title, sub, bodyHtml, buttons) {
  $('overlay-title').textContent = title;
  $('overlay-sub').textContent = sub;
  $('overlay-body').innerHTML = bodyHtml;
  const box = $('overlay-buttons');
  box.innerHTML = '';
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = b.label;
    btn.addEventListener('click', () => { sfx.click(); b.fn(); });
    box.appendChild(btn);
  }
  overlay.classList.remove('hidden');
}

function renderOverlay() {
  if (game.shotMode) return; // screenshots show the level, not a menu
  switch (game.phase) {
    case 'title':
      showOverlay('SHADOW COURIER', 'Kurir bayangan — antar paketnya tanpa terlihat.',
        `<p>Penjaga berpatroli dengan <b>kerucut penglihatan</b> kuning. Kalau meter
        <b>ALERT</b> penuh, kamu ketahuan. Sembunyi di <b>semak hijau</b>, bergerak
        lewat <b>bayangan</b> (deteksi lebih lambat), kumpulkan dokumen (+150),
        lalu capai gerbang <b>EXIT</b> hijau.</p>
        <p>3 level: Taman Senja, Gudang Malam, Halaman Museum.</p>`,
        [
          { label: '▶ MULAI MISI', fn: () => { overlay.classList.add('hidden'); game.startCampaign(); } },
          { label: 'Level 2', fn: () => { overlay.classList.add('hidden'); game.score = 0; game.startLevel(1); } },
          { label: 'Level 3', fn: () => { overlay.classList.add('hidden'); game.score = 0; game.startLevel(2); } },
        ]);
      break;
    case 'paused':
      showOverlay('JEDA', 'Istirahat sejenak, kurir.',
        `<p>Skor ${game.score} · Level ${game.levelIndex + 1} · Sisa waktu ${fmtTime(game.timeLeft)}</p>`,
        [{ label: '▶ LANJUTKAN', fn: () => game.togglePause() }]);
      break;
    case 'levelDone':
      showOverlay('LEVEL SELESAI!', `${game.level.name} — paket terkirim tanpa ketahuan.`,
        `<p>Bintang: ${'★'.repeat(game.stars)}${'☆'.repeat(3 - game.stars)} · Dokumen ${game.pickedCount}/${game.level.pickups.length} · Skor ${game.score}</p>`,
        [{ label: '▶ LEVEL BERIKUTNYA', fn: () => { overlay.classList.add('hidden'); game.nextLevel(); } }]);
      break;
    case 'caught':
      showOverlay('KETAHUAN!', game.caughtBy === 'time' ? 'Waktu habis — paket tidak sampai.' : 'Penjaga melihatmu. Misi gagal.',
        `<p>Skor ${game.score} · Level ${game.levelIndex + 1} · ${game.level.name}</p>
         <p>Tip: tunggu penjaga berbalik, lalu bergerak lewat semak dan bayangan.</p>`,
        [
          { label: '↻ COBA LAGI', fn: () => { overlay.classList.add('hidden'); game.retryLevel(); } },
          { label: '🏠 MENU UTAMA', fn: () => { game.phase = 'title'; updateHud(); } },
        ]);
      break;
    case 'campaignDone':
      showOverlay('SEMUA PAKET TERKIRIM!', 'Kamu menyelesaikan ketiga level. Kurir legendaris.',
        `<p>Skor akhir: <b>${game.score}</b></p>`,
        [{ label: '↻ MAIN LAGI', fn: () => { overlay.classList.add('hidden'); game.startCampaign(); } }]);
      break;
    case 'playing':
      overlay.classList.add('hidden');
      break;
  }
}

game.onHud = updateHud;
bindInput(game, canvas, (k) => {
  if (k === 'escape') updateHud();
  if ((k === 'enter' || k === ' ') && game.phase !== 'playing' && game.phase !== 'paused') {
    const btn = document.querySelector('#overlay-buttons button');
    if (btn) btn.click();
  }
});
$('mute-btn').addEventListener('click', () => game.toggleMute());
$('pause-btn').addEventListener('click', () => { game.togglePause(); updateHud(); });

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  if (game.level) render(ctx, game);
  requestAnimationFrame(loop);
}

// --- screenshot mode: freeze a real mid-game state, deterministically
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  game.shotMode = true;
  game.frozenTime = 1.6;
  const levelIndex = { cover: 0, warehouse: 1, palace: 2, win: 0 }[shot] ?? 0;
  game.startLevel(levelIndex);
  game.phase = 'playing';
  const setups = {
    cover: { px: 345, py: 285, alert: 0.45, score: 150, time: 121, pick: 1 },
    warehouse: { px: 560, py: 240, alert: 0.62, score: 300, time: 141, pick: 2 },
    palace: { px: 545, py: 180, alert: 0.30, score: 450, time: 168, pick: 3 },
    win: { px: 880, py: 98, alert: 0, score: 0, time: 132, pick: 0 },
  };
  const s = setups[shot] ?? setups.cover;
  game.player.x = s.px; game.player.y = s.py;
  game.alert = s.alert;
  game.score = s.score;
  game.timeLeft = s.time;
  game.pickups.slice(0, s.pick).forEach((p) => { p.taken = true; });
  game.pickedCount = s.pick;
  // aim one guard at the player so its cone is visible in the shot
  const g = game.guards[0];
  g.x = shot === 'cover' ? 500 : shot === 'warehouse' ? 640 : shot === 'palace' ? 620 : 700;
  g.y = shot === 'cover' ? 210 : shot === 'warehouse' ? 120 : shot === 'palace' ? 90 : 200;
  g.dir = Math.atan2(game.player.y - g.y, game.player.x - g.x);
  g.sees = game.guardSees(g);
  game.spotted = g.sees;
  game.hidden = game.level.bushes.some((b) => game.player.x >= b.x && game.player.x <= b.x + b.w && game.player.y >= b.y && game.player.y <= b.y + b.h);
  if (shot === 'win') {
    game.level.pickups.forEach((p) => { p.taken = true; });
    game.pickedCount = game.level.pickups.length;
    game.levelComplete();
    game.score = 1420; // set after levelComplete so its bonuses don't inflate it
    game.phase = 'levelDone';
    game.shotMode = true; // keep frozen: overlay is hidden in shot mode
    overlay.classList.add('hidden');
    // the win banner is drawn on-canvas by render() (game.winBanner)
    game.winBanner = true;
  }
  updateHud();
  overlay.classList.add('hidden');
  render(ctx, game);
  window.__shotReady = true;
} else if (params.get('selftest')) {
  // headless self-test: drive the real logic, report in document.title
  const results = [];
  const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  try {
    game.startCampaign();
    check('phase playing after start', game.phase === 'playing');
    check('level 1 has 2 guards', game.guards.length === 2);
    check('level 1 has 3 pickups', game.pickups.length === 3);
    // guard sees player placed in front of it, in range, no wall
    const g = game.guards[0];
    g.x = 400; g.y = 300; g.dir = 0; g.pause = 99;
    game.player.x = 500; game.player.y = 300;
    check('guard sees player in cone', game.guardSees(g) === true);
    // wall blocks sight
    game.player.x = 500; game.player.y = 300;
    game.level.walls.push({ x: 440, y: 280, w: 20, h: 40 });
    check('wall blocks sight', game.guardSees(g) === false);
    game.level.walls.pop();
    // behind guard: not seen
    game.player.x = 300; game.player.y = 300;
    check('guard blind behind', game.guardSees(g) === false);
    // bush hides
    const b = game.level.bushes[0];
    game.player.x = b.x + b.w / 2; game.player.y = b.y + b.h / 2;
    g.x = b.x + b.w / 2 - 60; g.y = b.y + b.h / 2; g.dir = 0;
    check('bush hides player', game.guardSees(g) === false);
    // alert fills to caught
    game.player.x = 500; game.player.y = 300;
    g.x = 400; g.y = 300; g.dir = 0; g.pause = 99;
    game.alert = 0.98;
    game.update(0.1);
    check('caught when alert fills', game.phase === 'caught');
    // retry + exit completes level
    game.retryLevel();
    const e = game.level.exit;
    game.player.x = e.x + e.w / 2; game.player.y = e.y + e.h / 2;
    game.update(0.05);
    check('exit completes level', game.phase === 'levelDone');
    game.nextLevel();
    check('level 2 starts', game.phase === 'playing' && game.levelIndex === 1);
    check('level 2 has 3 guards', game.guards.length === 3);
    game.startLevel(2);
    check('level 3 has 4 guards', game.guards.length === 4);
  } catch (err) {
    results.push(`FAIL exception ${err.message}`);
  }
  document.title = `SELFTEST ${results.every((r) => r.startsWith('PASS')) ? 'PASS' : 'FAIL'} :: ${results.join(' | ')}`;
  game.phase = 'title';
  game.startLevel(0);
  updateHud();
} else {
  game.startLevel(0);
  game.phase = 'title';
  updateHud();
}
requestAnimationFrame(loop);
