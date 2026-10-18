"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SignLanguage } from "@/data/alphabet";
import { GRADED_MIN_CONFIDENCE, RELIABLE_LETTERS } from "@/lib/vision/classifier";
import { modelUrlForLang } from "@/lib/vision/letter-model";
import { MotionTracker, type MotionLetter } from "@/lib/vision/motion";
import { useCamera, type Camera } from "./use-camera";
import { useHandTracking, type TrackingFrame } from "./use-hand-tracking";

const HOLD_FRAMES = 7;

export function useLetterTarget(
  camera: Camera,
  letter: string,
  lang: SignLanguage,
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

      if (!next) {
        holdRef.current = 0;
        setHoldProgress(0);
        return;
      }

      const { prediction } = next;
      // The learned model covers every letter; the ASL-only heuristic grades just
      // the subset it separates reliably, so only trust it for ASL.
      const gradeable =
        prediction.source === "model" ||
        (lang === "asl" && RELIABLE_LETTERS.has(letter));
      const ok =
        gradeable &&
        prediction.letter === letter &&
        prediction.confidence >= GRADED_MIN_CONFIDENCE;

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
    [letter, lang],
  );

  const tracking = useHandTracking(camera, {
    modelUrl: modelUrlForLang(lang),
    onFrame,
  });

  const reset = useCallback(() => {
    holdRef.current = 0;
    armedRef.current = true;
    trackerRef.current = null;
    setHoldProgress(0);
  }, []);

  return { ...camera, ...tracking, holdProgress, reset };
}

export function useSignTarget(
  letter: string,
  lang: SignLanguage,
  onSolved: () => void,
) {
  const camera = useCamera();
  return useLetterTarget(camera, letter, lang, onSolved);
}