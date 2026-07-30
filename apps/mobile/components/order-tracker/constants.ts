// ─────────────────────────────────────────────────────────────────────────────
// Traffic profile + mishaps — feeds the simulated live-tracking map's pacing.
// ─────────────────────────────────────────────────────────────────────────────
export const TRAFFIC_PROFILE: readonly (readonly [number, number])[] = [
  [0.00, 0.00], [0.04, 0.02], [0.10, 0.08], [0.18, 0.22], [0.24, 0.30],
  [0.30, 0.31], [0.36, 0.33], [0.42, 0.45], [0.52, 0.58], [0.58, 0.60],
  [0.64, 0.61], [0.70, 0.73], [0.78, 0.82], [0.84, 0.86], [0.90, 0.92],
  [0.94, 0.94], [0.97, 0.97], [1.00, 1.00],
];

export type MishapKind = "signal" | "traffic" | "wrong-turn" | "address" | "pickup-delay";
export type Mishap = {
  kind: MishapKind;
  atFrac: number;
  durFrac: number;
  extraMs: number;
  label: string;
  backtrackFrac?: number;
};
export const MISHAP_SCHEDULE: readonly Mishap[] = [
  { kind: "pickup-delay", atFrac: 0.05, durFrac: 0.04, extraMs:  45_000, label: "Store still packing 🍽️" },
  { kind: "signal",       atFrac: 0.20, durFrac: 0.03, extraMs:  30_000, label: "Waiting at signal 🚦" },
  { kind: "traffic",      atFrac: 0.34, durFrac: 0.08, extraMs: 180_000, label: "Heavy city traffic 🚗" },
  { kind: "wrong-turn",   atFrac: 0.56, durFrac: 0.05, extraMs: 120_000, label: "Missed a turn, rerouting 🔄", backtrackFrac: 0.035 },
  { kind: "signal",       atFrac: 0.70, durFrac: 0.03, extraMs:  45_000, label: "Another signal 🚦" },
  { kind: "address",      atFrac: 0.88, durFrac: 0.04, extraMs:  60_000, label: "Looking for your address 🔍" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Route geometry (viewBox 400×220)
// ─────────────────────────────────────────────────────────────────────────────
export const ROUTE_POINTS = [
  { x: 42,  y: 170 },
  { x: 105, y: 170 },
  { x: 105, y: 100 },
  { x: 180, y: 100 },
  { x: 180, y: 150 },
  { x: 255, y: 150 },
  { x: 255, y: 60  },
  { x: 360, y: 60  },
  { x: 360, y: 110 },
];
export const ROUTE_PATH_D = ROUTE_POINTS
  .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
  .join(" ");

export const ROUTE_SEGMENTS = (() => {
  const segs: { x0: number; y0: number; x1: number; y1: number; len: number; cum: number }[] = [];
  let cum = 0;
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    const a = ROUTE_POINTS[i - 1];
    const b = ROUTE_POINTS[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len, cum });
    cum += len;
  }
  return { segments: segs, totalLength: cum };
})();

export const STORE_POINT = ROUTE_POINTS[0];
export const HOME_POINT  = ROUTE_POINTS[ROUTE_POINTS.length - 1];
