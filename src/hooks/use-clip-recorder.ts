"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MAX_MS = 5000;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export interface ClipRecorder {
  recording: boolean;
  elapsedMs: number;
  start: () => void;
  stop: () => void;
}

export function useClipRecorder(options: {
  streamRef: React.RefObject<MediaStream | null>;
  maxMs?: number;
  onComplete?: (clip: Blob) => void;
}): ClipRecorder {
  const { streamRef, maxMs = DEFAULT_MAX_MS, onComplete } = options;
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  const start = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || recorderRef.current || typeof MediaRecorder === "undefined") {
      return;
    }

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      clearTimer();
      setRecording(false);
      setElapsedMs(0);
      const type = recorder.mimeType || "video/webm";
      const clip = new Blob(chunksRef.current, { type });
      chunksRef.current = [];
      recorderRef.current = null;
      if (clip.size > 0) onCompleteRef.current?.(clip);
    };

    recorderRef.current = recorder;
    recorder.start();
    startedAtRef.current = performance.now();
    setRecording(true);
    setElapsedMs(0);

    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAtRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= maxMs) stop();
    }, 100);
  }, [streamRef, maxMs, clearTimer, stop]);

  useEffect(() => {
    return () => {
      clearTimer();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      recorderRef.current = null;
    };
  }, [clearTimer]);

  return { recording, elapsedMs, start, stop };
}
