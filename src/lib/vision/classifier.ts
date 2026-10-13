import type { HandFeatures } from "./features";

export interface Candidate {
  letter: string;
  score: number;
}

export interface Prediction {
  /** Best matching letter, or null when nothing is confident enough. */
  letter: string | null;
  /** Score of the best match, 0..1. */
  confidence: number;
  /** All letters ranked by score. */
  candidates: Candidate[];
}

/** Below this score we do not auto-grade — the learner keeps adjusting instead. */
export const GRADED_MIN_CONFIDENCE = 0.7;

/** Letters the heuristic can separate reliably enough to grade automatically. */
export const RELIABLE_LETTERS = new Set([
  "B",
  "D",
  "F",
  "I",
  "L",
  "U",
  "V",
  "W",
  "Y",
]);

interface Ctx {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
  spread: number;
  thumbIndex: number;
  thumbMiddle: number;
  thumbPinky: number;
  crossed: boolean;
  up: boolean;
  hook: boolean;
  fist: boolean;
}

function buildContext(f: HandFeatures): Ctx {
  const [thumb, index, middle, ring, pinky] = f.extended;
  return {
    thumb,
    index,
    middle,
    ring,
    pinky,
    spread: f.indexMiddleSpread,
    thumbIndex: f.thumbIndexDistance,
    thumbMiddle: f.thumbMiddleDistance,
    thumbPinky: f.thumbPinkyDistance,
    crossed: f.indexCrossed,
    up: f.palmDirection === "up",
    hook: !index && f.curl[1] > 0.3 && f.curl[1] < 0.82,
    fist: !index && !middle && !ring && !pinky,
  };
}

type Test = (c: Ctx) => boolean;

const rules: Record<string, Test[]> = {
  B: [(c) => c.index && c.middle && c.ring && c.pinky, (c) => c.spread < 0.6],
  F: [(c) => !c.index && c.middle && c.ring && c.pinky, (c) => c.thumbIndex < 0.55],
  I: [(c) => c.pinky && !c.index && !c.middle && !c.ring, (c) => !c.thumb],
  Y: [(c) => c.pinky && !c.index && !c.middle && !c.ring, (c) => c.thumb, (c) => c.thumbPinky > 0.9],
  L: [(c) => c.index && !c.middle && !c.ring && !c.pinky, (c) => c.thumb, (c) => c.thumbIndex > 0.85],
  D: [(c) => c.index && !c.middle && !c.ring && !c.pinky, (c) => c.thumbIndex < 0.55],
  V: [(c) => c.index && c.middle && !c.ring && !c.pinky, (c) => c.spread > 0.7],
  U: [(c) => c.index && c.middle && !c.ring && !c.pinky, (c) => c.spread < 0.55],
  W: [(c) => c.index && c.middle && c.ring && !c.pinky, (c) => c.spread > 0.6],
  K: [(c) => c.index && c.middle && !c.ring && !c.pinky, (c) => c.thumb, (c) => c.spread > 0.5, (c) => c.up],
  R: [(c) => c.index && c.middle && !c.ring && !c.pinky, (c) => c.crossed],
  X: [(c) => c.hook && !c.middle && !c.ring && !c.pinky, (c) => !c.thumb],
  C: [(c) => c.fist, (c) => !c.thumb && c.thumbIndex > 0.3],
  O: [(c) => c.fist, (c) => c.thumbIndex < 0.4, (c) => c.thumbMiddle < 0.5],
  A: [(c) => c.fist, (c) => c.thumb, (c) => c.up],
  S: [(c) => c.fist, (c) => !c.thumb, (c) => c.thumbIndex > 0.5],
  E: [(c) => c.fist, (c) => !c.thumb, (c) => c.thumbIndex < 0.6],
  T: [(c) => c.fist, (c) => !c.thumb, (c) => c.thumbMiddle < 0.6],
  M: [(c) => c.fist, (c) => !c.thumb, (c) => c.spread < 0.45],
  N: [(c) => c.fist, (c) => !c.thumb, (c) => c.spread >= 0.45],
};

export function classify(f: HandFeatures): Prediction {
  const ctx = buildContext(f);

  const candidates: Candidate[] = Object.entries(rules).map(([letter, tests]) => {
    const matched = tests.reduce((sum, test) => sum + (test(ctx) ? 1 : 0), 0);
    return { letter, score: matched / tests.length };
  });

  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) {
    return { letter: null, confidence: 0, candidates };
  }

  const tied = candidates.find(
    (candidate) => candidate.letter !== best.letter && candidate.score === best.score,
  );

  return {
    letter: best.score >= GRADED_MIN_CONFIDENCE && !tied ? best.letter : null,
    confidence: best.score,
    candidates,
  };
}
