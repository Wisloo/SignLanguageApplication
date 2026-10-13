import { describe, expect, it } from "vitest";
import type { Landmark } from "./features";
import { MotionTracker, type MotionLetter } from "./motion";

function handAt(x: number, y: number): Landmark[] {
  return Array.from({ length: 21 }, () => ({ x, y, z: 0 }));
}

function runTrajectory(letter: MotionLetter, xs: number[], ys: number[]): boolean {
  const tracker = new MotionTracker(letter);
  let detected = false;
  for (let i = 0; i < xs.length; i += 1) {
    if (tracker.add(handAt(xs[i], ys[i]), i * 100)) detected = true;
  }
  return detected;
}

describe("MotionTracker", () => {
  it("detects a J-shaped trace (down, then a curve to one side)", () => {
    const xs = [0.5, 0.52, 0.5, 0.48, 0.42, 0.32, 0.22, 0.12, 0.08, 0.05];
    const ys = [0.25, 0.32, 0.4, 0.48, 0.55, 0.6, 0.62, 0.6, 0.58, 0.56];
    expect(runTrajectory("J", xs, ys)).toBe(true);
  });

  it("detects a Z-shaped trace (two direction changes)", () => {
    const xs = [0.15, 0.28, 0.41, 0.55, 0.42, 0.3, 0.18, 0.3, 0.42, 0.53];
    const ys = [0.3, 0.31, 0.32, 0.33, 0.45, 0.52, 0.55, 0.56, 0.57, 0.58];
    expect(runTrajectory("Z", xs, ys)).toBe(true);
  });

  it("does not treat a straight horizontal line as J or Z", () => {
    const xs = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    const ys = xs.map(() => 0.5);
    expect(runTrajectory("J", xs, ys)).toBe(false);
    expect(runTrajectory("Z", xs, ys)).toBe(false);
  });

  it("does not treat a single V turn as Z", () => {
    const xs = [0.2, 0.3, 0.4, 0.3, 0.2];
    const ys = [0.2, 0.35, 0.5, 0.35, 0.2];
    expect(runTrajectory("Z", xs, ys)).toBe(false);
  });
});