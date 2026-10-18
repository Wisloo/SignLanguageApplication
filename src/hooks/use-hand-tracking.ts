"use client";

import {
  DrawingUtils,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { classify, type Prediction } from "@/lib/vision/classifier";
import { extractFeatures, type HandFeatures, type Landmark } from "@/lib/vision/features";
import { getHandLandmarker } from "@/lib/vision/hand-landmarker";
import { classifyLandmarks, DEFAULT_MODEL_URL, loadLetterModel, type LetterModel } from "@/lib/vision/letter-model";
import type { Camera } from "./use-camera";

export interface TrackingFrame {
  landmarks: Landmark[];
  features: HandFeatures;
  prediction: Prediction;
}

export interface HandTracking {
  frame: TrackingFrame | null;
  /** True once the learned letter model has loaded (covers all 26 letters). */
  modelReady: boolean;
}

const STATE_UPDATE_MS = 90;

export function useHandTracking(
  camera: Camera,
  options?: { modelUrl?: string; onFrame?: (frame: TrackingFrame | null) => void },
): HandTracking {
  const { videoRef, canvasRef, status } = camera;
  const { modelUrl = DEFAULT_MODEL_URL, onFrame } = options ?? {};
  const onFrameRef = useRef(onFrame);
  const [frame, setFrame] = useState<TrackingFrame | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (status !== "ready") return;

    let cancelled = false;
    let raf = 0;
    let lastVideoTime = -1;
    let lastUpdate = 0;
    let drawing: DrawingUtils | null = null;

    const landmarkerRef: { current: HandLandmarker | null } = { current: null };
    const modelRef: { current: LetterModel | null } = { current: null };

    void loadLetterModel(modelUrl).then((model) => {
      if (cancelled) return;
      modelRef.current = model;
      if (model) setLoadedUrl(modelUrl);
    });

    function draw(result: HandLandmarkerResult) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      drawing = drawing ?? new DrawingUtils(ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const landmarks of result.landmarks ?? []) {
        drawing.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#6C63FF",
          lineWidth: 4,
        });
        drawing.drawLandmarks(landmarks, {
          color: "#38B2AC",
          fillColor: "#38B2AC",
          radius: 5,
          lineWidth: 2,
        });
      }
    }

    function tick() {
      if (cancelled) return;

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (
        video &&
        landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
      ) {
        lastVideoTime = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        draw(result);

        const now = performance.now();
        if (now - lastUpdate >= STATE_UPDATE_MS) {
          lastUpdate = now;
          const landmarks = result.landmarks?.[0] as Landmark[] | undefined;
          if (landmarks && landmarks.length === 21) {
            const handedness =
              (result.handedness?.[0]?.[0]?.categoryName as "Left" | "Right") ?? null;
            const features = extractFeatures(landmarks, handedness);
            const fromModel = modelRef.current
              ? classifyLandmarks(modelRef.current, landmarks)
              : null;
            const prediction =
              fromModel && fromModel.letter ? fromModel : classify(features);
            const nextFrame = { landmarks, features, prediction };
            setFrame(nextFrame);
            onFrameRef.current?.(nextFrame);
          } else {
            setFrame(null);
            onFrameRef.current?.(null);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    void (async () => {
      try {
        landmarkerRef.current = await getHandLandmarker();
      } catch {
        landmarkerRef.current = null;
      }
      if (cancelled) return;
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [status, videoRef, canvasRef, modelUrl]);

  const modelReady = loadedUrl === modelUrl;

  return { frame, modelReady };
}