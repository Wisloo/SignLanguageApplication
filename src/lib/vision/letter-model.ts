import type { Landmark } from "./features";
import { NORMALIZATION_ID, normalizeLandmarks } from "./normalize";
import type { Candidate, Prediction } from "./classifier";

/**
 * A dense layer stored in `[out][in]` orientation, matching how the training
 * script exports PyTorch `nn.Linear` weights. Forward pass: `y = W·x + b`.
 */
export interface LetterModelLayer {
  W: number[][];
  b: number[];
}

export interface LetterModel {
  version: number;
  /** Must equal NORMALIZATION_ID, otherwise the model is rejected. */
  normalization: string;
  labels: string[];
  layers: LetterModelLayer[];
  /** Default confidence needed to auto-grade a prediction. */
  threshold: number;
  /** Optional per-letter overrides for visually confusable classes. */
  thresholds?: Record<string, number>;
}

export const DEFAULT_MODEL_URL = "/models/letters.json";

/** Per-language model path, e.g. asl -> /models/letters-asl.json. */
export function modelUrlForLang(lang: string): string {
  return `/models/letters-${lang}.json`;
}

function relu(value: number): number {
  return value > 0 ? value : 0;
}

function dense(layer: LetterModelLayer, input: number[]): number[] {
  const out = new Array<number>(layer.W.length);
  for (let j = 0; j < layer.W.length; j += 1) {
    const row = layer.W[j];
    let sum = layer.b[j] ?? 0;
    for (let i = 0; i < row.length; i += 1) {
      sum += row[i] * input[i];
    }
    out[j] = sum;
  }
  return out;
}

function softmax(logits: number[]): number[] {
  let max = -Infinity;
  for (const value of logits) if (value > max) max = value;
  const exps = logits.map((value) => Math.exp(value - max));
  let sum = 0;
  for (const value of exps) sum += value;
  return sum > 0 ? exps.map((value) => value / sum) : exps;
}

/** Runs the network and returns a ranked, thresholded prediction. */
export function predictWithModel(model: LetterModel, input: number[]): Prediction {
  if (model.layers.length === 0) {
    throw new Error("Letter model has no layers.");
  }

  let activations = input;
  for (let index = 0; index < model.layers.length; index += 1) {
    const layer = model.layers[index];
    const projected = dense(layer, activations);
    const isLast = index === model.layers.length - 1;
    activations = isLast ? softmax(projected) : projected.map(relu);
  }

  const candidates: Candidate[] = activations.map((score, index) => ({
    letter: model.labels[index] ?? "?",
    score,
  }));
  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) {
    return { letter: null, confidence: 0, candidates, source: "model" };
  }

  const threshold = model.thresholds?.[best.letter] ?? model.threshold;
  const tied = candidates.find(
    (candidate) => candidate.letter !== best.letter && candidate.score === best.score,
  );

  return {
    letter: best.score >= threshold && !tied ? best.letter : null,
    confidence: best.score,
    candidates,
    source: "model",
  };
}

export function classifyLandmarks(model: LetterModel, landmarks: Landmark[]): Prediction {
  return predictWithModel(model, normalizeLandmarks(landmarks));
}

function isValidModel(value: unknown): value is LetterModel {
  if (typeof value !== "object" || value === null) return false;
  const model = value as Partial<LetterModel>;
  return (
    Array.isArray(model.labels) &&
    model.labels.length > 0 &&
    Array.isArray(model.layers) &&
    model.layers.length > 0 &&
    model.normalization === NORMALIZATION_ID &&
    typeof model.threshold === "number"
  );
}

const modelPromises = new Map<string, Promise<LetterModel | null>>();

async function fetchModel(url: string): Promise<LetterModel | null> {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    const json: unknown = await response.json();
    return isValidModel(json) ? json : null;
  } catch {
    return null;
  }
}

/**
 * Lazily loads and memoizes the fingerspelling model (browser only), keyed by
 * URL so each sign language keeps its own model. Resolves to null when the
 * model is absent, so callers can fall back to the heuristics.
 */
export function loadLetterModel(url: string = DEFAULT_MODEL_URL): Promise<LetterModel | null> {
  let promise = modelPromises.get(url);
  if (!promise) {
    promise = fetchModel(url);
    modelPromises.set(url, promise);
  }
  return promise;
}
