"use client";

import { useEffect, type RefObject } from "react";
import { cn } from "@/lib/cn";
import type { CameraStatus } from "@/hooks/use-camera";

export function CameraStage({
  videoRef,
  canvasRef,
  streamRef,
  status,
  error,
  className,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  streamRef: RefObject<MediaStream | null>;
  status: CameraStatus;
  error: string | null;
  className?: string;
}) {
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current ?? null;
    if (!video || !stream) return;
    if (video.srcObject !== stream) video.srcObject = stream;
    void video.play().catch(() => {});
  }, [videoRef, streamRef, status]);

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-pop-lg",
        className,
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full -scale-x-100"
      />

      {status !== "ready" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/90 p-6 text-center">
          <p className="font-display text-lg font-bold text-foreground">
            {status === "starting" ? "Starting the camera…" : "Camera unavailable"}
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            {status === "starting"
              ? "This can take a moment the first time while the model loads."
              : error ?? "Please check your camera and try again."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
