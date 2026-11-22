// Shadow Courier — level definitions. Top-down maps, 960x600 play area.
// Walls block movement and guard sight. Bushes hide the player (a guard
// cannot spot you while you stand inside one). Shadows are dark floor zones
// that slow detection. Every level: reach the green EXIT with the parcel.
export const LEVELS = [
  {
    name: 'Taman Senja',
    sub: 'Level 1 · 2 penjaga · 3 dokumen',
    time: 150,
    player: { x: 70, y: 530 },
    exit: { x: 880, y: 70, w: 56, h: 56 },
    walls: [
      { x: 200, y: 120, w: 180, h: 26 },
      { x: 200, y: 380, w: 26, h: 150 },
      { x: 560, y: 180, w: 26, h: 170 },
      { x: 620, y: 420, w: 200, h: 26 },
      { x: 420, y: 90, w: 26, h: 120 },
    ],
    bushes: [
      { x: 300, y: 250, w: 90, h: 70 },
      { x: 660, y: 120, w: 90, h: 70 },
      { x: 430, y: 440, w: 110, h: 70 },
    ],
    shadows: [
      { x: 90, y: 90, w: 150, h: 120 },
      { x: 700, y: 330, w: 170, h: 130 },
    ],
    pickups: [
      { x: 330, y: 165, kind: 'doc' },
      { x: 480, y: 330, kind: 'doc' },
      { x: 760, y: 500, kind: 'doc' },
    ],
    guards: [
      { x: 300, y: 90, speed: 62, range: 190, fov: 1.25, waypoints: [{ x: 300, y: 90 }, { x: 640, y: 90 }, { x: 640, y: 300 }, { x: 300, y: 300 }] },
      { x: 700, y: 480, speed: 58, range: 180, fov: 1.25, waypoints: [{ x: 700, y: 480 }, { x: 350, y: 480 }, { x: 350, y: 300 }] },
    ],
  },
  {
    name: 'Gudang Malam',
    sub: 'Level 2 · 3 penjaga · 4 dokumen',
    time: 180,
    player: { x: 70, y: 70 },
    exit: { x: 880, y: 480, w: 56, h: 56 },
    walls: [
      { x: 180, y: 0, w: 26, h: 180 },
      { x: 180, y: 300, w: 26, h: 300 },
      { x: 420, y: 120, w: 220, h: 26 },
      { x: 420, y: 420, w: 220, h: 26 },
      { x: 700, y: 180, w: 26, h: 240 },
      { x: 330, y: 260, w: 130, h: 26 },
    ],
    bushes: [
      { x: 90, y: 300, w: 70, h: 90 },
      { x: 260, y: 480, w: 90, h: 70 },
      { x: 520, y: 200, w: 90, h: 70 },
      { x: 760, y: 90, w: 90, h: 70 },
    ],
    shadows: [
      { x: 240, y: 90, w: 140, h: 110 },
      { x: 480, y: 330, w: 150, h: 80 },
      { x: 780, y: 300, w: 130, h: 120 },
    ],
    pickups: [
      { x: 130, y: 500, kind: 'doc' },
      { x: 330, y: 210, kind: 'doc' },
      { x: 580, y: 480, kind: 'doc' },
      { x: 860, y: 210, kind: 'doc' },
    ],
    guards: [
      { x: 300, y: 90, speed: 70, range: 200, fov: 1.2, waypoints: [{ x: 300, y: 90 }, { x: 640, y: 90 }, { x: 640, y: 210 }, { x: 300, y: 210 }] },
      { x: 520, y: 330, speed: 66, range: 200, fov: 1.2, waypoints: [{ x: 520, y: 330 }, { x: 860, y: 330 }, { x: 860, y: 520 }, { x: 520, y: 520 }] },
      { x: 800, y: 90, speed: 74, range: 190, fov: 1.3, waypoints: [{ x: 800, y: 90 }, { x: 800, y: 420 }, { x: 580, y: 420 }] },
    ],
  },
  {
    name: 'Halaman Museum',
    sub: 'Level 3 · 4 penjaga · 5 dokumen',
    time: 210,
    player: { x: 70, y: 530 },
    exit: { x: 880, y: 70, w: 56, h: 56 },
    walls: [
      { x: 150, y: 140, w: 200, h: 26 },
      { x: 150, y: 420, w: 26, h: 160 },
      { x: 420, y: 80, w: 26, h: 200 },
      { x: 420, y: 330, w: 200, h: 26 },
      { x: 660, y: 140, w: 26, h: 220 },
      { x: 660, y: 440, w: 200, h: 26 },
      { x: 300, y: 300, w: 26, h: 130 },
    ],
    bushes: [
      { x: 90, y: 200, w: 80, h: 80 },
      { x: 260, y: 480, w: 100, h: 70 },
      { x: 500, y: 140, w: 90, h: 70 },
      { x: 740, y: 260, w: 90, h: 70 },
      { x: 520, y: 460, w: 100, h: 70 },
    ],
    shadows: [
      { x: 80, y: 80, w: 160, h: 110 },
      { x: 250, y: 200, w: 130, h: 90 },
      { x: 720, y: 380, w: 160, h: 120 },
    ],
    pickups: [
      { x: 120, y: 330, kind: 'doc' },
      { x: 350, y: 90, kind: 'doc' },
      { x: 580, y: 260, kind: 'doc' },
      { x: 800, y: 120, kind: 'doc' },
      { x: 880, y: 500, kind: 'doc' },
    ],
    guards: [
      { x: 250, y: 90, speed: 78, range: 210, fov: 1.2, waypoints: [{ x: 250, y: 90 }, { x: 620, y: 90 }, { x: 620, y: 260 }, { x: 250, y: 260 }] },
      { x: 500, y: 400, speed: 74, range: 200, fov: 1.25, waypoints: [{ x: 500, y: 400 }, { x: 860, y: 400 }, { x: 860, y: 540 }, { x: 500, y: 540 }] },
      { x: 780, y: 90, speed: 80, range: 200, fov: 1.2, waypoints: [{ x: 780, y: 90 }, { x: 780, y: 330 }, { x: 540, y: 330 }] },
      { x: 120, y: 250, speed: 70, range: 190, fov: 1.3, waypoints: [{ x: 120, y: 250 }, { x: 360, y: 250 }, { x: 360, y: 500 }, { x: 120, y: 500 }] },
    ],
  },
];
