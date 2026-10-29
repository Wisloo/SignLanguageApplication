"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CameraIcon, HandIcon, SparkleIcon } from "@/components/ui/icons";
import { CameraStage } from "@/components/vision/camera-stage";
import type { Camera } from "@/hooks/use-camera";
import { useClipRecorder } from "@/hooks/use-clip-recorder";

type Phase = "idle" | "thinking" | "done" | "error";

const MAX_SECONDS = 5;

export function SentencePractice({ camera }: { camera: Camera }) {
  const { status, error: cameraError } = camera;
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = useCallback(async (clip: Blob) => {
    setPhase("thinking");
    setMessage(null);
    try {
      const body = new FormData();
      body.append("clip", clip, "sign.webm");
      const response = await fetch("/api/asl/translate", { method: "POST", body });
      const payload = (await response.json().catch(() => null)) as
        | { text?: string; error?: string }
        | null;

      if (!response.ok) {
        setPhase("error");
        setMessage(payload?.error ?? "I could not read that one. Let us try again.");
        return;
      }

      const next = (payload?.text ?? "").trim();
      if (!next) {
        setPhase("error");
        setMessage("I could not read that one. Try signing a little closer and slower.");
        return;
      }

      setText(next);
      setPhase("done");
    } catch {
      setPhase("error");
      setMessage("Something went wrong reaching the translator. Please try again.");
    }
  }, []);

  const { recording, elapsedMs, start } = useClipRecorder({
    streamRef: camera.streamRef,
    maxMs: MAX_SECONDS * 1000,
    onComplete: submit,
  });

  function record() {
    setText("");
    setMessage(null);
    setPhase("idle");
    start();
  }

  function retry() {
    setText("");
    setMessage(null);
    setPhase("idle");
  }

  const seconds = Math.min(Math.ceil(elapsedMs / 1000), MAX_SECONDS);
  const busy = phase === "thinking";
  const canRecord = status === "ready" && !recording && !busy;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="flex flex-col gap-6">
        <CameraStage
          videoRef={camera.videoRef}
          canvasRef={camera.canvasRef}
          streamRef={camera.streamRef}
          status={status}
          error={cameraError}
        />
        {recording ? (
          <p className="text-center text-sm font-bold uppercase tracking-wide text-accent">
            {`Recording… ${seconds} of ${MAX_SECONDS} seconds`}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4" aria-live="polite">
          {status !== "ready" ? (
            <p className="font-semibold text-foreground">
              {status === "starting"
                ? "Getting the camera ready…"
                : "The camera is not available right now."}
            </p>
          ) : recording ? (
            <div className="flex flex-col gap-2">
              <p className="font-display text-lg font-bold text-foreground">
                I am watching your hand. Sign the whole word, then I will have a look.
              </p>
              <div className="h-3 w-full overflow-hidden rounded-full border-2 border-foreground bg-card">
                <span
                  className="block h-full rounded-full bg-tertiary transition-all duration-150 ease-out"
                  style={{ width: `${(seconds / MAX_SECONDS) * 100}%` }}
                />
              </div>
            </div>
          ) : busy ? (
            <div className="flex items-center gap-3 text-accent">
              <SparkleIcon className="h-6 w-6 animate-wiggle" />
              <p className="font-semibold">Reading your signs…</p>
            </div>
          ) : phase === "done" ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                I think you signed
              </p>
              <p className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                {text}
              </p>
              <p className="text-sm leading-relaxed text-muted">
                If that is not quite right, no problem at all — every try helps you learn.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={retry}>
                  <CameraIcon className="h-5 w-5" />
                  Try another sign
                </Button>
              </div>
            </div>
          ) : phase === "error" ? (
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-foreground">
                {message ?? "I could not read that one. Let us try again."}
              </p>
              <Button onClick={retry} className="self-start">
                <CameraIcon className="h-5 w-5" />
                Try again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-foreground">
                <HandIcon className="h-6 w-6" />
                <p className="font-semibold">
                  Sign a word or short phrase, then press Record.
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Keep your hand in view and sign slowly. Recordings stop on their own after{" "}
                {MAX_SECONDS} seconds.
              </p>
              <Button
                onClick={record}
                disabled={!canRecord}
                className="self-start"
                aria-label="Record a sign"
              >
                <CameraIcon className="h-5 w-5" />
                Record a sign
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}