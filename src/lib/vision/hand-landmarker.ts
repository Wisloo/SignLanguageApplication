import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const VERSION = "1.1.0";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

let landmarkerPromise: Promise<HandLandmarker> | null = null;

async function createLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  const base = {
    runningMode: "VIDEO" as const,
    numHands: 1,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  try {
    return await HandLandmarker.createFromOptions(vision, {
      ...base,
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    });
  } catch {
    return await HandLandmarker.createFromOptions(vision, {
      ...base,
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
    });
  }
}

/** Lazily loads and memoizes the MediaPipe hand landmarker (browser only). */
export function getHandLandmarker(): Promise<HandLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = createLandmarker();
  }
  return landmarkerPromise;
}
