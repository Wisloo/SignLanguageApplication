import type { Landmark } from "./features";

export const LANDMARK_COUNT = 21;
export const NORMALIZED_LENGTH = LANDMARK_COUNT * 3;

/** Wrist and middle-finger MCP indices used to anchor and scale the hand. */
const WRIST = 0;
const MIDDLE_MCP = 9;

/**
 * Canonical landmark transform shared with the offline training pipeline.
 *
 * The hand is translated so the wrist sits at the origin and scaled by the
 * wrist-to-middle-MCP distance, so the same shape maps to the same vector
 * regardless of where the hand is or how close it is to the camera. Rotation
 * is deliberately left alone: palm orientation carries meaning between letters
 * (e.g. U vs D), so we must not normalise it away.
 *
 * The Python extractor must apply the identical transform. Version this string
 * and stamp it into the exported model so a mismatch is detectable.
 */
export const NORMALIZATION_ID = "wrist-origin-palm-scale-v1";

export function normalizeLandmarks(landmarks: Landmark[]): number[] {
  if (landmarks.length < LANDMARK_COUNT) {
    throw new Error(
      `Expected ${LANDMARK_COUNT} landmarks, received ${landmarks.length}.`,
    );
  }

  const wrist = landmarks[WRIST];
  const reference = landmarks[MIDDLE_MCP];
  const scale = Math.max(Math.hypot(reference.x - wrist.x, reference.y - wrist.y), 1e-6);

  const out = new Array<number>(NORMALIZED_LENGTH);
  let cursor = 0;
  for (let i = 0; i < LANDMARK_COUNT; i += 1) {
    const point = landmarks[i];
    out[cursor] = (point.x - wrist.x) / scale;
    out[cursor + 1] = (point.y - wrist.y) / scale;
    out[cursor + 2] = (point.z - wrist.z) / scale;
    cursor += 3;
  }
  return out;
}
