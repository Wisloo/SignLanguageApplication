"use client";

import { useEffect, useRef, useState } from "react";

export type CameraStatus = "starting" | "ready" | "denied" | "error";

export interface Camera {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  streamRef: React.RefObject<MediaStream | null>;
  status: CameraStatus;
  error: string | null;
}

export function useCamera(): Camera {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });

        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = media;
        setStatus("ready");
      } catch (caught) {
        if (cancelled) return;
        const name = caught instanceof DOMException ? caught.name : "";
        setStatus(
          name === "NotAllowedError" || name === "NotFoundError" ? "denied" : "error",
        );
        setError(
          name === "NotAllowedError"
            ? "Camera access was blocked. Allow the camera in your browser to practise."
            : name === "NotFoundError"
              ? "No camera was found on this device."
              : "Something went wrong while starting the camera.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return { videoRef, canvasRef, streamRef, status, error };
}