// Shadow Courier — geometry helpers: point-in-rect, circle-vs-rect
// collision, and segment-vs-rect line of sight (guards cannot see through
// walls). Pure functions, no DOM.
export function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function segSeg(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (d === 0) return false;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// True when segment (x1,y1)-(x2,y2) touches rect r.
export function segHitsRect(x1, y1, x2, y2, r) {
  if (inRect(x1, y1, r) || inRect(x2, y2, r)) return true;
  const { x, y, w, h } = r;
  return segSeg(x1, y1, x2, y2, x, y, x + w, y)
    || segSeg(x1, y1, x2, y2, x + w, y, x + w, y + h)
    || segSeg(x1, y1, x2, y2, x + w, y + h, x, y + h)
    || segSeg(x1, y1, x2, y2, x, y + h, x, y);
}

// Line of sight: no wall rect blocks the segment.
export function hasLineOfSight(x1, y1, x2, y2, walls) {
  for (const w of walls) if (segHitsRect(x1, y1, x2, y2, w)) return false;
  return true;
}

// Move a circle (x,y,r) by (dx,dy), sliding along wall rects. Returns new pos.
export function moveCircle(x, y, r, dx, dy, walls, bounds) {
  let nx = x + dx;
  let ny = y + dy;
  nx = Math.max(bounds.x + r, Math.min(bounds.x + bounds.w - r, nx));
  ny = Math.max(bounds.y + r, Math.min(bounds.y + bounds.h - r, ny));
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(nx, w.x + w.w));
    const cy = Math.max(w.y, Math.min(ny, w.y + w.h));
    const ddx = nx - cx, ddy = ny - cy;
    if (ddx * ddx + ddy * ddy < r * r) {
      // push out along the smallest penetration axis
      const pushL = (nx + r) - w.x, pushR = (w.x + w.w) - (nx - r);
      const pushT = (ny + r) - w.y, pushB = (w.y + w.h) - (ny - r);
      const m = Math.min(pushL, pushR, pushT, pushB);
      if (m === pushL) nx = w.x - r;
      else if (m === pushR) nx = w.x + w.w + r;
      else if (m === pushT) ny = w.y - r;
      else ny = w.y + w.h + r;
    }
  }
  return { x: nx, y: ny };
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}
