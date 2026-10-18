import { describe, expect, it } from "vitest";
import type { Landmark } from "./features";
import { LANDMARK_COUNT, NORMALIZED_LENGTH, normalizeLandmarks } from "./normalize";

function makeHand(): Landmark[] {
  return Array.from({ length: LANDMARK_COUNT }, (_, i) => ({
    x: 0.2 + i * 0.01,
    y: 0.4 + (i % 5) * 0.03,
    z: 0.05 * (i % 3),
  }));
}

describe("normalizeLandmarks", () => {
  it("produces a fixed-length 3x21 vector with the wrist at the origin", () => {
    const out = normalizeLandmarks(makeHand());
    expect(out).toHaveLength(NORMALIZED_LENGTH);
    expect(out[0]).toBeCloseTo(0, 10);
    expect(out[1]).toBeCloseTo(0, 10);
    expect(out[2]).toBeCloseTo(0, 10);
  });

  it("is translation invariant (z included)", () => {
    const base = normalizeLandmarks(makeHand());
    const shifted = normalizeLandmarks(
      makeHand().map((point) => ({
        x: point.x + 5,
        y: point.y - 3,
        z: point.z + 2,
      })),
    );
    shifted.forEach((value, i) => expect(value).toBeCloseTo(base[i], 10));
  });

  it("is scale invariant", () => {
    const base = normalizeLandmarks(makeHand());
    const scaled = normalizeLandmarks(
      makeHand().map((point) => ({
        x: point.x * 4,
        y: point.y * 4,
        z: point.z * 4,
      })),
    );
    scaled.forEach((value, i) => expect(value).toBeCloseTo(base[i], 10));
  });

  it("rejects a short landmark list", () => {
    expect(() => normalizeLandmarks(makeHand().slice(0, 10))).toThrow();
  });
});
