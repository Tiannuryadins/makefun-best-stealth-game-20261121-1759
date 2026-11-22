// Shadow Courier — deterministic RNG (mulberry32), used for decorative
// floor speckles and drifting leaves so a screenshot replays exactly.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function levelSeed(levelIndex) {
  return 0x51ed1a7 + levelIndex * 104729;
}
