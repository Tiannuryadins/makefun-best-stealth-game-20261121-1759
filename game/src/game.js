// Shadow Courier — state machine: title, playing, paused, levelDone,
// caught, campaignDone. Owns movement, guard patrols, vision-cone
// detection, pickups, timer and score. Rendering lives in render.js.
import { LEVELS } from './levels.js';
import { inRect, hasLineOfSight, moveCircle, dist, angleDiff } from './geom.js';
import { sfx, setMuted } from './audio.js';

export const BOUNDS = { x: 0, y: 0, w: 960, h: 600 };
const PLAYER_R = 13;
const PLAYER_SPEED = 165;

export class ShadowCourierGame {
  constructor(doc) {
    this.doc = doc;
    this.phase = 'title'; // title | playing | paused | levelDone | caught | campaignDone
    this.levelIndex = 0;
    this.score = 0;
    this.timeLeft = 0;
    this.alert = 0; // 0..1, fills while a guard sees you
    this.hidden = false;
    this.spotted = false; // any guard currently sees you
    this.shotMode = false;
    this.frozenTime = null;
    this.time = 0;
    this.keys = {};
    this.moveTarget = null; // click-to-move target {x,y}
    this.stepAcc = 0;
    this.pickedCount = 0;
    this.stars = 0;
    this.onHud = null; // callback wired by main.js
    this.level = null;
    this.player = { x: 70, y: 530, dir: -Math.PI / 2 };
    this.guards = [];
    this.pickups = [];
    this.caughtBy = null;
    this.muted = false;
  }

  startLevel(i) {
    this.levelIndex = i;
    this.level = LEVELS[i];
    this.timeLeft = this.level.time;
    this.alert = 0;
    this.spotted = false;
    this.hidden = false;
    this.caughtBy = null;
    this.pickedCount = 0;
    this.moveTarget = null;
    this.player = { x: this.level.player.x, y: this.level.player.y, dir: -Math.PI / 2 };
    this.guards = this.level.guards.map((g) => ({
      ...g, x: g.waypoints[0].x, y: g.waypoints[0].y,
      wp: 1, dir: 0, pause: 0, sees: false, state: 'patrol',
    }));
    this.pickups = this.level.pickups.map((p) => ({ ...p, taken: false }));
    this.phase = 'playing';
    this.updateHud();
  }

  startCampaign() {
    this.score = 0;
    this.startLevel(0);
  }

  togglePause() {
    if (this.phase === 'playing') { this.phase = 'paused'; this.updateHud(); }
    else if (this.phase === 'paused') { this.phase = 'playing'; this.updateHud(); }
  }

  toggleMute() {
    this.muted = !this.muted;
    setMuted(this.muted);
    this.updateHud();
  }

  // --- detection ---------------------------------------------------------
  guardSees(g) {
    const p = this.player;
    const d = dist(g.x, g.y, p.x, p.y);
    if (d > g.range) return false;
    const ang = Math.atan2(p.y - g.y, p.x - g.x);
    if (Math.abs(angleDiff(ang, g.dir)) > g.fov / 2) return false;
    if (!hasLineOfSight(g.x, g.y, p.x, p.y, this.level.walls)) return false;
    if (this.level.bushes.some((b) => inRect(p.x, p.y, b))) return false; // hidden in cover
    return true;
  }

  inShadow(x, y) {
    return this.level.shadows.some((s) => inRect(x, y, s));
  }

  update(dt) {
    if (this.phase !== 'playing' || this.shotMode) return;
    this.time += dt;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) { this.timeLeft = 0; this.caught('time'); return; }

    // --- player movement: keyboard, or click-to-move target
    let mx = 0, my = 0;
    const k = this.keys;
    if (k['arrowup'] || k['w']) my -= 1;
    if (k['arrowdown'] || k['s']) my += 1;
    if (k['arrowleft'] || k['a']) mx -= 1;
    if (k['arrowright'] || k['d']) mx += 1;
    if (mx || my) {
      this.moveTarget = null;
      const len = Math.hypot(mx, my);
      this.player.dir = Math.atan2(my, mx);
      const pos = moveCircle(this.player.x, this.player.y, PLAYER_R,
        (mx / len) * PLAYER_SPEED * dt, (my / len) * PLAYER_SPEED * dt,
        this.level.walls, BOUNDS);
      this.player.x = pos.x; this.player.y = pos.y;
      this.stepAcc += dt;
      if (this.stepAcc > 0.28) { this.stepAcc = 0; sfx.step(); }
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) this.moveTarget = null;
      else {
        this.player.dir = Math.atan2(dy, dx);
        const pos = moveCircle(this.player.x, this.player.y, PLAYER_R,
          (dx / d) * PLAYER_SPEED * dt, (dy / d) * PLAYER_SPEED * dt,
          this.level.walls, BOUNDS);
        this.player.x = pos.x; this.player.y = pos.y;
      }
    }

    this.hidden = this.level.bushes.some((b) => inRect(this.player.x, this.player.y, b));

    // --- guards: patrol waypoints, pause at each, face movement direction
    for (const g of this.guards) {
      if (g.pause > 0) { g.pause -= dt; continue; }
      const t = g.waypoints[g.wp];
      const dx = t.x - g.x, dy = t.y - g.y;
      const d = Math.hypot(dx, dy);
      if (d < 4) { g.wp = (g.wp + 1) % g.waypoints.length; g.pause = 0.7; continue; }
      g.dir = Math.atan2(dy, dx);
      const sp = g.state === 'chase' ? g.speed * 1.45 : g.speed;
      g.x += (dx / d) * sp * dt;
      g.y += (dy / d) * sp * dt;
    }

    // --- detection: alert fills while seen, drains while unseen
    this.spotted = false;
    for (const g of this.guards) {
      g.sees = this.guardSees(g);
      if (g.sees) {
        this.spotted = true;
        g.state = 'chase';
        const rate = this.inShadow(this.player.x, this.player.y) ? 0.45 : 0.9;
        this.alert += rate * dt;
        if (this.alert >= 1) { this.alert = 1; this.caught('seen'); return; }
      } else if (g.state === 'chase') {
        // lost sight: keep hunting toward the player's last spot briefly
        g.state = 'patrol';
      }
    }
    if (!this.spotted) this.alert = Math.max(0, this.alert - 0.35 * dt);
    if (this.spotted && this.alert > 0.25 && !this._sting) { this._sting = true; sfx.spotted(); }
    if (!this.spotted) this._sting = false;

    // --- pickups
    for (const p of this.pickups) {
      if (!p.taken && dist(p.x, p.y, this.player.x, this.player.y) < 24) {
        p.taken = true;
        this.pickedCount++;
        this.score += 150;
        sfx.pickup();
      }
    }

    // --- exit
    const e = this.level.exit;
    if (inRect(this.player.x, this.player.y, e)) this.levelComplete();

    this.updateHud();
  }

  caught(reason) {
    this.phase = 'caught';
    this.caughtBy = reason; // 'seen' | 'time'
    sfx.caught();
    this.updateHud();
  }

  levelComplete() {
    const timeBonus = Math.round(this.timeLeft) * 5;
    const stealthBonus = this.alert < 0.01 ? 300 : 0;
    this.score += timeBonus + stealthBonus;
    this.stars = this.timeLeft > this.level.time * 0.5 ? 3
      : this.timeLeft > this.level.time * 0.25 ? 2 : 1;
    if (this.levelIndex + 1 >= LEVELS.length) {
      this.phase = 'campaignDone';
      sfx.win();
    } else {
      this.phase = 'levelDone';
      sfx.levelDone();
    }
    this.updateHud();
  }

  nextLevel() {
    this.startLevel(this.levelIndex + 1);
  }

  retryLevel() {
    this.startLevel(this.levelIndex);
  }

  updateHud() {
    if (this.onHud) this.onHud();
  }
}
