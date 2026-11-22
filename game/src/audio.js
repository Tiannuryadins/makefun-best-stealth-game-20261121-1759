// Shadow Courier — all sounds are synthesized with WebAudio. No audio files.
let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (muted) return;
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + when);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + when + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + when);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + when);
    o.stop(c.currentTime + when + dur + 0.05);
  } catch { /* audio unavailable: game stays silent */ }
}

export const sfx = {
  step() { tone(180 + Math.random() * 40, 0.05, 'triangle', 0.04); },
  pickup() { tone(660, 0.12, 'sine', 0.12); tone(990, 0.16, 'sine', 0.1, 0.07); },
  spotted() { tone(220, 0.3, 'sawtooth', 0.14, 0, 440); tone(330, 0.3, 'sawtooth', 0.1, 0.12, 660); },
  caught() { tone(392, 0.25, 'square', 0.12); tone(311, 0.25, 'square', 0.12, 0.2); tone(233, 0.5, 'square', 0.12, 0.4); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.12, i * 0.11)); },
  levelDone() { [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'sine', 0.11, i * 0.1)); },
  click() { tone(520, 0.06, 'sine', 0.08); },
  hide() { tone(300, 0.15, 'sine', 0.06, 0, 180); },
};
