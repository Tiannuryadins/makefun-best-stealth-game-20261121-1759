// Shadow Courier — keyboard + mouse input. WASD/arrows move, click sets a
// click-to-move target, M mutes, Esc pauses, Enter/Space confirms overlays.
export function bindInput(game, canvas, onKey) {
  const key = (e) => e.key.toLowerCase();
  window.addEventListener('keydown', (e) => {
    const k = key(e);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (k === 'm') { game.toggleMute(); return; }
    if (k === 'escape') { game.togglePause(); if (onKey) onKey('escape'); return; }
    if (k === 'enter' || k === ' ') { if (onKey) onKey(k); return; }
    game.keys[k] = true;
  });
  window.addEventListener('keyup', (e) => { game.keys[key(e)] = false; });
  window.addEventListener('blur', () => { game.keys = {}; });

  canvas.addEventListener('click', (e) => {
    if (game.phase !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    game.moveTarget = {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  });
}
