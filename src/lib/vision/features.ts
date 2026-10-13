export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandFeatures {
  /** Distance from wrist to middle-finger MCP, used to normalise sizes. */
  palmSize: number;
  /** Per finger straightness ratio (1 = fully straight). Order: thumb, index, middle, ring, pinky. */
  straightness: number[];
  /** Per finger curled amount, 0 (straight) to 1 (fully curled). */
  curl: number[];
  /** Whether each finger looks extended. Order: thumb, index, middle, ring, pinky. */
  extended: boolean[];
  /** Distance between index and middle fingertips, normalised by palm size. */
  indexMiddleSpread: number;
  /** Distance between thumb and index fingertips, normalised by palm size. */
  thumbIndexDistance: number;
  /** Distance between thumb and middle fingertips, normalised by palm size. */
  thumbMiddleDistance: number;
  /** Distance between thumb tip and pinky MCP, normalised by palm size. */
  thumbPinkyDistance: number;
  /** Whether the index finger crosses over the middle finger. */
  indexCrossed: boolean;
  /** Whether the hand points up or down in the frame. */
  palmDirection: "up" | "down";
  /** Reported handedness of the detected hand. */
  handedness: "Left" | "Right" | null;
}

const WRIST = 0;
const THUMB = [1, 2, 3, 4];
const INDEX = [5, 6, 7, 8];
const MIDDLE = [9, 10, 11, 12];
const RING = [13, 14, 15, 16];
const PINKY = [17, 18, 19, 20];
const MIDDLE_MCP = 9;
const PINKY_MCP = 17;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;

const FINGERS = [THUMB, INDEX, MIDDLE, RING, PINKY];

function distance(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function straightnessOf(landmarks: Landmark[], joints: number[]): number {
  const [a, b, c, d] = joints.map((index) => landmarks[index]);
  const path = distance(a, b) + distance(b, c) + distance(c, d);
  if (path === 0) return 0;
  return distance(a, d) / path;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function extractFeatures(
  landmarks: Landmark[],
  handedness: "Left" | "Right" | null = null,
): HandFeatures {
  const palmSize = Math.max(distance(landmarks[WRIST], landmarks[MIDDLE_MCP]), 1e-6);

  const straightness = FINGERS.map((joints) => straightnessOf(landmarks, joints));
  const curl = straightness.map((value) => clamp(1 - value));
  const extended = straightness.map((value, index) =>
    value > (index === 0 ? 0.66 : 0.82),
  );

  const indexMiddleSpread =
    distance(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]) / palmSize;
  const thumbIndexDistance =
    distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) / palmSize;
  const thumbMiddleDistance =
    distance(landmarks[THUMB_TIP], landmarks[MIDDLE_TIP]) / palmSize;
  const thumbPinkyDistance =
    distance(landmarks[THUMB_TIP], landmarks[PINKY_MCP]) / palmSize;

  const wrist = landmarks[WRIST];
  const indexMcp = landmarks[INDEX[0]];
  const middleMcp = landmarks[MIDDLE[0]];
  const indexTip = landmarks[INDEX_TIP];
  const middleTip = landmarks[MIDDLE_TIP];

  const mcpCross =
    (indexMcp.x - wrist.x) * (middleMcp.y - wrist.y) -
    (indexMcp.y - wrist.y) * (middleMcp.x - wrist.x);
  const tipCross =
    (indexTip.x - wrist.x) * (middleTip.y - wrist.y) -
    (indexTip.y - wrist.y) * (middleTip.x - wrist.x);
  const indexCrossed = mcpCross >= 0 ? tipCross < 0 : tipCross > 0;

  const palmDirection: HandFeatures["palmDirection"] =
    landmarks[MIDDLE_MCP].y < wrist.y ? "up" : "down";

  return {
    palmSize,
    straightness,
    curl,
    extended,
    indexMiddleSpread,
    thumbIndexDistance,
    thumbMiddleDistance,
    thumbPinkyDistance,
    indexCrossed,
    palmDirection,
    handedness,
  };
}
