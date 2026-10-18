"use client";

import { useCallback, useState } from "react";
import { SignImage } from "@/components/learn/sign-image";
import { SpeakButton } from "@/components/learn/speak-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CameraIcon, CheckIcon, HandIcon, SparkleIcon } from "@/components/ui/icons";
import { CameraStage } from "@/components/vision/camera-stage";
import { alphabets, getLetter, languages, type SignLanguage } from "@/data/alphabet";
import type { Camera } from "@/hooks/use-camera";
import { useClipRecorder } from "@/hooks/use-clip-recorder";
import { useLetterTarget } from "@/hooks/use-sign-target";
import { cn } from "@/lib/cn";
import { recordProgress } from "@/lib/progress-client";
import { RELIABLE_LETTERS } from "@/lib/vision/classifier";

const CHECK_MAX_MS = 2500;

export function LetterPractice({
  camera,
  initialLang,
  initialLetter,
}: {
  camera: Camera;
  initialLang: SignLanguage;
  initialLetter: string;
}) {
  const [lang, setLang] = useState<SignLanguage>(initialLang);
  const [letter, setLetter] = useState(initialLetter);
  const [stars, setStars] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkNote, setCheckNote] = useState<string | null>(null);

  const alphabet = alphabets[lang];
  const content = getLetter(lang, letter);
  const movable = letter === "J" || letter === "Z";

  const celebrate = useCallback(() => {
    setStars((value) => value + 1);
    setCelebrated(true);
    void recordProgress({ language: lang, letter, success: true });
  }, [lang, letter]);

  const { status, error, frame, holdProgress, reset, modelReady } = useLetterTarget(
    camera,
    letter,
    lang,
    celebrate,
  );

  // The learned model grades every letter; the ASL-only heuristics are used only
  // as a fallback and must not grade FSL, whose signs differ.
  const reliable = (lang === "asl" && RELIABLE_LETTERS.has(letter)) || modelReady;

  const submitLetter = useCallback(
    async (clip: Blob) => {
      setChecking(true);
      setCheckNote(null);
      try {
        const body = new FormData();
        body.append("clip", clip, "letter.webm");
        const response = await fetch("/api/asl/letter", { method: "POST", body });
        const payload = (await response.json().catch(() => null)) as
          | { letter?: string; error?: string }
          | null;

        if (!response.ok) {
          setCheckNote(payload?.error ?? "The camera check is unavailable right now.");
          return;
        }

        const guess = (payload?.letter ?? "").toUpperCase();
        if (guess && guess === letter) {
          celebrate();
        } else if (guess) {
          setCheckNote(
            `The camera thought it looked like ${guess}. These two can look alike, so try again, or use \u201cI made this sign\u201d.`,
          );
        } else {
          setCheckNote(
            "The camera was not sure. That is okay, so try again, or use \u201cI made this sign\u201d.",
          );
        }
      } catch {
        setCheckNote("The camera check is unavailable right now.");
      } finally {
        setChecking(false);
      }
    },
    [celebrate, letter],
  );

  const { recording, start } = useClipRecorder({
    streamRef: camera.streamRef,
    maxMs: CHECK_MAX_MS,
    onComplete: submitLetter,
  });

  function chooseLetter(next: string) {
    setLetter(next);
    reset();
    setCelebrated(false);
    setCheckNote(null);
  }

  function chooseLang(next: SignLanguage) {
    setLang(next);
    reset();
    setCelebrated(false);
    setCheckNote(null);
  }

  const rawDetected = frame?.prediction.letter ?? null;
  const detected = rawDetected === "none" ? null : rawDetected;
  const confidence = frame?.prediction.confidence ?? 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="flex flex-col gap-6">
        <CameraStage
          videoRef={camera.videoRef}
          canvasRef={camera.canvasRef}
          streamRef={camera.streamRef}
          status={status}
          error={error}
        />

        <Card className="flex flex-col gap-3" aria-live="polite">
          {status !== "ready" ? (
            <p className="font-semibold text-foreground">
              {status === "starting"
                ? "Getting the camera ready…"
                : "The camera is not available right now."}
            </p>
          ) : celebrated ? (
            <div className="flex items-center gap-3 text-accent-secondary">
              <CheckIcon className="h-6 w-6" />
              <p className="font-display text-lg font-bold">
                Yes! That&apos;s the letter {letter}. Wonderful work.
              </p>
            </div>
          ) : !frame ? (
            <div className="flex items-center gap-3 text-muted">
              <HandIcon className="h-6 w-6" />
              <p className="font-semibold">
                Show your hand to the camera when you are ready.
              </p>
            </div>
          ) : reliable ? (
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-foreground">
                {detected === letter
                  ? "Close! Hold it steady for a moment…"
                  : "I can see a hand. Keep adjusting until it matches."}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                <span>
                  I can see:{" "}
                  <span className="font-semibold text-foreground">
                    {detected ?? "a hand I do not recognise yet"}
                  </span>
                </span>
                <span className="rounded-full border-2 border-foreground bg-card px-3 py-1 font-bold shadow-pop-sm">
                  {Math.round(confidence * 100)}% sure
                </span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full border-2 border-foreground bg-card">
                <span
                  className="block h-full rounded-full bg-quaternary transition-all duration-200 ease-out"
                  style={{ width: `${holdProgress * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-foreground">
                {movable
                  ? "This letter moves through the air — trace it and I will cheer when I recognise it."
                  : "Compare your hand with the picture, then check yourself below."}
              </p>
              <p className="text-sm leading-relaxed text-muted">
                Some letters look very similar to the camera, so you are the best
                judge here.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={celebrate} className="self-start">
                  <CheckIcon className="h-5 w-5" />
                  I made this sign
                </Button>
                {!movable ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCheckNote(null);
                      start();
                    }}
                    disabled={recording || checking || status !== "ready"}
                    className="self-start"
                  >
                    <CameraIcon className="h-5 w-5" />
                    {recording ? "Recording…" : checking ? "Checking…" : "Let the camera check"}
                  </Button>
                ) : null}
              </div>
              {checkNote ? (
                <p className="text-sm leading-relaxed text-accent">{checkNote}</p>
              ) : null}
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Sign language"
              className="inline-flex gap-1 rounded-full border-2 border-foreground bg-card p-1 shadow-pop-sm"
            >
              {languages.map(({ id }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={lang === id}
                  onClick={() => chooseLang(id)}
                  className={cn(
                    "h-10 rounded-full border-2 px-4 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    lang === id
                      ? "border-foreground bg-accent text-white shadow-pop-sm"
                      : "border-transparent text-muted hover:bg-tertiary hover:text-foreground",
                  )}
                >
                  {alphabets[id].shortName}
                </button>
              ))}
            </div>
            <span
              className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-quaternary/70 px-3 py-1 text-sm font-bold text-foreground shadow-pop-sm"
              aria-label={`${stars} stars earned`}
            >
              <SparkleIcon className="h-4 w-4" />
              {stars}
            </span>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your goal
            </p>
            <p className="font-display text-7xl font-extrabold leading-none tracking-tight text-foreground">
              {letter}
            </p>
            {content?.imageSrc ? (
              <SignImage
                src={content.imageSrc}
                alt={`The ${alphabet.name} fingerspelling handshape for the letter ${letter}.`}
                motion={content.motion}
                className="max-w-[14rem]"
              />
            ) : null}
            {content ? (
              <div className="flex flex-col gap-3">
                <p className="leading-relaxed text-foreground">{content.handshape}</p>
                {content.movement ? (
                  <p className="leading-relaxed text-foreground">{content.movement}</p>
                ) : null}
                <p className="text-sm text-muted">{content.tip}</p>
              </div>
            ) : null}
            {content ? (
              <SpeakButton
                text={`The letter ${letter}. ${content.handshape}${
                  content.movement ? ` ${content.movement}` : ""
                }`}
              />
            ) : null}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            Choose a letter
          </h2>
          <ul className="grid grid-cols-6 gap-2 sm:grid-cols-7">
            {alphabet.letters.map((item) => {
              const active = item.letter === letter;
              return (
                <li key={item.letter}>
                  <button
                    type="button"
                    onClick={() => chooseLetter(item.letter)}
                    aria-pressed={active}
                    aria-label={`Practise the letter ${item.letter}`}
                    className={cn(
                      "flex h-11 w-full items-center justify-center rounded-xl border-2 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                      active
                        ? "border-foreground bg-accent text-white shadow-pop-sm"
                        : "border-foreground bg-card shadow-pop-soft hover:-translate-y-0.5 hover:shadow-pop",
                    )}
                  >
                    {item.letter}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}