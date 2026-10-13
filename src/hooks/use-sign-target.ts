"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GRADED_MIN_CONFIDENCE, RELIABLE_LETTERS } from "@/lib/vision/classifier";
import { MotionTracker, type MotionLetter } from "@/lib/vision/motion";
import { useCamera, type Camera } from "./use-camera";
import { useHandTracking, type TrackingFrame } from "./use-hand-tracking";

const HOLD_FRAMES = 7;

export function useLetterTarget(
  camera: Camera,
  letter: string,
  onSolved: () => void,
) {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRef = useRef(0);
  const armedRef = useRef(true);
  const trackerRef = useRef<MotionTracker | null>(null);
  const onSolvedRef = useRef(onSolved);

  useEffect(() => {
    onSolvedRef.current = onSolved;
  }, [onSolved]);

  const onFrame = useCallback(
    (next: TrackingFrame | null) => {
      if (letter === "J" || letter === "Z") {
        if (!next) {
          trackerRef.current = null;
          return;
        }
        if (!trackerRef.current || trackerRef.current.letter !== letter) {
          trackerRef.current = new MotionTracker(letter as MotionLetter);
        }
        if (trackerRef.current.add(next.landmarks, performance.now())) {
          trackerRef.current = new MotionTracker(letter as MotionLetter);
          onSolvedRef.current();
        }
        return;
      }

      if (!RELIABLE_LETTERS.has(letter) || !next) {
        holdRef.current = 0;
        setHoldProgress(0);
        return;
      }

      const ok =
        next.prediction.letter === letter &&
        next.prediction.confidence >= GRADED_MIN_CONFIDENCE;

      if (!ok) {
        holdRef.current = 0;
        armedRef.current = true;
        setHoldProgress(0);
        return;
      }

      if (!armedRef.current) return;

      holdRef.current += 1;
      setHoldProgress(Math.min(holdRef.current / HOLD_FRAMES, 1));
      if (holdRef.current >= HOLD_FRAMES) {
        armedRef.current = false;
        holdRef.current = 0;
        onSolvedRef.current();
      }
    },
    [letter],
  );

  const tracking = useHandTracking(camera, { onFrame });

  const reset = useCallback(() => {
    holdRef.current = 0;
    armedRef.current = true;
    trackerRef.current = null;
    setHoldProgress(0);
  }, []);

  return { ...camera, ...tracking, holdProgress, reset };
}

export function useSignTarget(letter: string, onSolved: () => void) {
  const camera = useCamera();
  return useLetterTarget(camera, letter, onSolved);
}