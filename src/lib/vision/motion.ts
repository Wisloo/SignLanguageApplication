import type { Landmark } from "./features";

export type MotionLetter = "J" | "Z";

interface Point {
  x: number;
  y: number;
  t: number;
}

const WINDOW_MS = 1600;
const MIN_POINTS = 8;

/**
 * Very small trajectory recogniser for the two fingerspelling letters that move
 * through the air. It follows a single fingertip and looks for the rough shape
 * of a J (down, then a curve to one side) or a Z (two sharp direction changes).
 * It is intentionally conservative — misses are fine because learners can always
 * confirm the sign themselves.
 */
export class MotionTracker {
  private points: Point[] = [];

  constructor(private readonly target: MotionLetter) {}

  get letter(): MotionLetter {
    return this.target;
  }

  add(landmarks: Landmark[], now: number): boolean {
    const tipIndex = this.target === "J" ? 20 : 8;
    const tip = landmarks[tipIndex];
    this.points.push({ x: tip.x, y: tip.y, t: now });
    this.points = this.points.filter((point) => now - point.t <= WINDOW_MS);

    if (this.points.length < MIN_POINTS) return false;
    if (now - this.points[0].t < WINDOW_MS * 0.5) return false;

    const matched = this.target === "Z" ? this.looksLikeZ() : this.looksLikeJ();
    if (matched) {
      this.points = [];
    }
    return matched;
  }

  private looksLikeZ(): boolean {
    const start = this.points[0];
    const xs = this.points.map((point) => point.x - start.x);
    const ys = this.points.map((point) => point.y - start.y);

    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    const scale = Math.max(xRange, yRange, 1e-4);

    let changes = 0;
    let lastSign = 0;
    for (let i = 1; i < xs.length; i += 1) {
      const dx = xs[i] - xs[i - 1];
      if (Math.abs(dx) < 0.06 * scale) continue;
      const sign = Math.sign(dx);
      if (lastSign !== 0 && sign !== lastSign) changes += 1;
      lastSign = sign;
    }

    return changes >= 2 && xRange > yRange * 0.7;
  }

  private looksLikeJ(): boolean {
    const start = this.points[0];
    const xs = this.points.map((point) => point.x - start.x);
    const ys = this.points.map((point) => point.y - start.y);

    const yRange = Math.max(...ys) - Math.min(...ys);
    if (yRange < 0.1) return false;

    let lowest = 0;
    ys.forEach((value, index) => {
      if (value > ys[lowest]) lowest = index;
    });

    if (lowest < ys.length * 0.35) return false;

    let horizontalAfter = 0;
    for (let i = lowest; i < xs.length; i += 1) {
      horizontalAfter = Math.max(horizontalAfter, Math.abs(xs[i] - xs[lowest]));
    }

    return horizontalAfter > 0.05;
  }
}
