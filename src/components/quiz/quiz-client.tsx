"use client";

import { useCallback, useRef, useState } from "react";
import { SignImage } from "@/components/learn/sign-image";
import { SpeakButton } from "@/components/learn/speak-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CameraIcon,
  CheckIcon,
  CloseIcon,
  HandIcon,
  ImageIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { CameraStage } from "@/components/vision/camera-stage";
import { alphabets, getLetter, languages, type SignLanguage } from "@/data/alphabet";
import { useSignTarget } from "@/hooks/use-sign-target";
import { cn } from "@/lib/cn";
import { recordProgress } from "@/lib/progress-client";
import { RELIABLE_LETTERS } from "@/lib/vision/classifier";

const ROUND_COUNT = 8;
const CHOICE_COUNT = 4;

type QuizMode = "camera" | "self" | "picture";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function hasPictures(lang: SignLanguage): boolean {
  return alphabets[lang].letters.some((item) => item.imageSrc && !item.motion);
}

function pickRounds(lang: SignLanguage, mode: QuizMode): string[] {
  const letters = alphabets[lang].letters
    .filter((item) => mode !== "picture" || (item.imageSrc && !item.motion))
    .map((item) => item.letter);
  return shuffle(letters).slice(0, ROUND_COUNT);
}

function buildChoices(lang: SignLanguage, letter: string): string[] {
  const pool = alphabets[lang].letters
    .filter((item) => item.imageSrc && !item.motion && item.letter !== letter)
    .map((item) => item.letter);
  return shuffle([letter, ...shuffle(pool).slice(0, CHOICE_COUNT - 1)]);
}

function ModeButton({
  active,
  disabled,
  hint,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  hint?: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border-2 border-foreground px-4 py-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:pointer-events-none disabled:opacity-50",
        active
          ? "bg-accent text-white shadow-pop-sm"
          : "bg-card text-muted shadow-pop-soft hover:-translate-y-0.5 hover:text-foreground hover:shadow-pop",
      )}
    >
      {icon}
      <span>{label}</span>
      {hint ? <span className="text-xs font-medium opacity-80">{hint}</span> : null}
    </button>
  );
}

function LanguageToggle({
  lang,
  onChange,
}: {
  lang: SignLanguage;
  onChange: (next: SignLanguage) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Sign language"
      className="mx-auto inline-flex gap-1 rounded-full border-2 border-foreground bg-card p-1 shadow-pop-sm"
    >
      {languages.map(({ id }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={lang === id}
          onClick={() => onChange(id)}
          className={cn(
            "h-10 rounded-full border-2 px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
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
  );
}

function RoundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      {children}
    </div>
  );
}

function TargetCard({
  letter,
  lang,
  index,
  total,
}: {
  letter: string;
  lang: SignLanguage;
  index: number;
  total: number;
}) {
  const content = getLetter(lang, letter);
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">
        Round {index + 1} of {total}
      </p>
      <p className="font-display text-7xl font-extrabold leading-none tracking-tight text-foreground">
        {letter}
      </p>
      <p className="leading-relaxed text-foreground">{content?.handshape}</p>
      {content?.movement ? (
        <p className="leading-relaxed text-foreground">{content.movement}</p>
      ) : null}
      <SpeakButton text={`Make the letter ${letter}.`} label="Hear it" />
    </Card>
  );
}

function QuizRound({
  letter,
  lang,
  index,
  total,
  onSolved,
  onNext,
}: {
  letter: string;
  lang: SignLanguage;
  index: number;
  total: number;
  onSolved: () => void;
  onNext: () => void;
}) {
  const [solved, setSolved] = useState(false);
  const solvedRef = useRef(false);

  const handleSolved = useCallback(() => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    setSolved(true);
    onSolved();
  }, [onSolved]);

  const { videoRef, canvasRef, streamRef, status, error, frame, holdProgress, modelReady } =
    useSignTarget(letter, lang, handleSolved);

  // The learned model grades every letter; the ASL-only heuristics are used only
  // as a fallback and must not grade FSL, whose signs differ.
  const reliable = (lang === "asl" && RELIABLE_LETTERS.has(letter)) || modelReady;
  const last = index + 1 >= total;
  const rawDetected = frame?.prediction.letter ?? null;
  const detected = rawDetected === "none" ? null : rawDetected;
  const confidence = frame?.prediction.confidence ?? 0;

  return (
    <RoundLayout>
      <div className="flex flex-col gap-6">
        <CameraStage
          videoRef={videoRef}
          canvasRef={canvasRef}
          streamRef={streamRef}
          status={status}
          error={error}
        />
        <Card aria-live="polite" className="flex flex-col gap-3">
          {solved ? (
            <div className="flex items-center gap-3 text-accent-secondary">
              <CheckIcon className="h-6 w-6" />
              <p className="font-display text-lg font-bold">
                {letter} — got it! Beautiful.
              </p>
            </div>
          ) : status !== "ready" ? (
            <p className="font-semibold text-foreground">
              {status === "starting" ? "Getting the camera ready…" : "Camera unavailable."}
            </p>
          ) : !frame ? (
            <div className="flex items-center gap-3 text-muted">
              <HandIcon className="h-6 w-6" />
              <p className="font-semibold">Show your hand to the camera.</p>
            </div>
          ) : reliable ? (
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-foreground">
                {detected === letter
                  ? "Hold it steady…"
                  : "Keep adjusting until it matches."}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted">
                <span>
                  I can see:{" "}
                  <span className="font-semibold text-foreground">
                    {detected ?? "not sure yet"}
                  </span>
                </span>
                <span className="rounded-full border-2 border-foreground bg-card px-3 py-1 font-bold shadow-pop-sm">
                  {Math.round(confidence * 100)}%
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
                {letter === "J" || letter === "Z"
                  ? "Trace it in the air — I will cheer when I recognise it."
                  : "Compare carefully, then confirm when you are ready."}
              </p>
              <Button onClick={handleSolved} className="self-start">
                <CheckIcon className="h-5 w-5" />
                I made this sign
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <TargetCard letter={letter} lang={lang} index={index} total={total} />
        <Button onClick={onNext} disabled={!solved} size="lg" className="w-full">
          {last ? "Finish" : "Next letter"}
        </Button>
      </div>
    </RoundLayout>
  );
}

function ManualRound({
  letter,
  lang,
  index,
  total,
  onSolved,
  onNext,
}: {
  letter: string;
  lang: SignLanguage;
  index: number;
  total: number;
  onSolved: () => void;
  onNext: () => void;
}) {
  const [solved, setSolved] = useState(false);
  const solvedRef = useRef(false);

  const handleSolved = useCallback(() => {
    if (solvedRef.current) return;
    solvedRef.current = true;
    setSolved(true);
    onSolved();
  }, [onSolved]);

  const last = index + 1 >= total;

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card className="flex flex-col items-center gap-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          Self-check round {index + 1} of {total}
        </p>
        <p className="font-display text-7xl font-extrabold leading-none tracking-tight text-foreground">
          {letter}
        </p>
        <p className="leading-relaxed text-foreground">
          {getLetter(lang, letter)?.handshape}
        </p>
        {getLetter(lang, letter)?.movement ? (
          <p className="leading-relaxed text-foreground">
            {getLetter(lang, letter)?.movement}
          </p>
        ) : null}
        <SpeakButton text={`Make the letter ${letter}.`} label="Hear it" />

        <div aria-live="polite" className="flex w-full flex-col items-center gap-4">
          {solved ? (
            <div className="flex items-center gap-3 text-accent-secondary">
              <CheckIcon className="h-6 w-6" />
              <p className="font-display text-lg font-bold">
                {letter} — got it! Wonderful.
              </p>
            </div>
          ) : (
            <Button onClick={handleSolved} size="lg">
              <CheckIcon className="h-5 w-5" />
              I made this sign
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!solved}
            size="lg"
            className="w-full"
          >
            {last ? "Finish" : "Next letter"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function PictureRound({
  letter,
  lang,
  index,
  total,
  onMiss,
  onSolved,
  onNext,
}: {
  letter: string;
  lang: SignLanguage;
  index: number;
  total: number;
  onMiss: () => void;
  onSolved: (firstTry: boolean) => void;
  onNext: () => void;
}) {
  const content = getLetter(lang, letter);
  const [choices] = useState(() => buildChoices(lang, letter));
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const solvedRef = useRef(false);
  const missedRef = useRef(false);
  const last = index + 1 >= total;

  function choose(option: string) {
    if (solvedRef.current || wrong.includes(option)) return;
    if (option === letter) {
      solvedRef.current = true;
      setSolved(true);
      onSolved(!missedRef.current);
      return;
    }
    setWrong((current) => [...current, option]);
    if (!missedRef.current) {
      missedRef.current = true;
      onMiss();
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card className="flex flex-col items-center gap-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          Read the sign {index + 1} of {total}
        </p>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Which letter is this?
        </h2>

        {content?.imageSrc ? (
          <SignImage
            src={content.imageSrc}
            alt="A fingerspelled handshape to identify"
          />
        ) : null}

        <div className="grid w-full grid-cols-2 gap-3">
          {choices.map((option) => {
            const isWrong = wrong.includes(option);
            const isCorrect = solved && option === letter;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                disabled={solved || isWrong}
                aria-label={
                  isCorrect
                    ? `${option} — correct`
                    : isWrong
                      ? `${option} — not this one`
                      : `Choose the letter ${option}`
                }
                className={cn(
                  "flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-foreground text-2xl font-extrabold shadow-pop-soft",
                  "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  "disabled:pointer-events-none",
                  isCorrect
                    ? "bg-accent-secondary text-white shadow-pop"
                    : isWrong
                      ? "border-dashed bg-muted-bg text-muted line-through opacity-70"
                      : "bg-card text-foreground hover:-translate-y-1 hover:shadow-pop",
                )}
              >
                <span>{option}</span>
                {isCorrect ? <CheckIcon className="h-5 w-5" /> : null}
                {isWrong ? <CloseIcon className="h-5 w-5" /> : null}
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="min-h-6">
          {solved ? (
            <p className="font-display text-lg font-bold text-accent-secondary">
              It&apos;s {letter}! Nicely read.
            </p>
          ) : wrong.length > 0 ? (
            <p className="font-semibold text-foreground">
              Not quite — take another look and try a different one.
            </p>
          ) : (
            <p className="text-muted">Take your time. Which letter is this?</p>
          )}
        </div>

        <Button onClick={onNext} disabled={!solved} size="lg" className="w-full">
          {last ? "Finish" : "Next sign"}
        </Button>
      </Card>
    </div>
  );
}

export function QuizClient() {
  const [lang, setLang] = useState<SignLanguage>("asl");
  const [mode, setMode] = useState<QuizMode>("camera");
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [rounds, setRounds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(0);

  const pictureReady = hasPictures(lang);
  const activeMode: QuizMode =
    mode === "picture" && !pictureReady ? "self" : mode;

  function start() {
    setMode(activeMode);
    setRounds(pickRounds(lang, activeMode));
    setIndex(0);
    setScore(0);
    setFirstTry(0);
    setPhase("play");
  }

  function handleSolved() {
    setScore((value) => value + 1);
    const letter = rounds[index];
    if (letter) {
      void recordProgress({ language: lang, letter, success: true });
    }
  }

  function handlePictureSolved(firstTryAnswer: boolean) {
    setScore((value) => value + 1);
    if (firstTryAnswer) setFirstTry((value) => value + 1);
    const letter = rounds[index];
    if (letter) {
      void recordProgress({ language: lang, letter, success: true });
    }
  }

  function handleMiss() {
    const letter = rounds[index];
    if (letter) {
      void recordProgress({ language: lang, letter, success: false });
    }
  }

  function advance() {
    if (index + 1 >= rounds.length) {
      setPhase("done");
      return;
    }
    setIndex((value) => value + 1);
  }

  if (phase === "intro") {
    return (
      <Card className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <SparkleIcon className="h-10 w-10 text-accent" />
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Ready to play?
        </h2>
        <p className="leading-relaxed text-muted">
          Eight friendly rounds. There are no wrong answers — only tries.
        </p>

        <fieldset className="flex w-full flex-col gap-3">
          <legend className="text-sm font-semibold text-muted">
            How do you want to play?
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <ModeButton
              active={activeMode === "camera"}
              icon={<CameraIcon className="h-6 w-6" />}
              label="With camera"
              hint="make the sign"
              onClick={() => setMode("camera")}
            />
            <ModeButton
              active={activeMode === "self"}
              icon={<HandIcon className="h-6 w-6" />}
              label="Self-check"
              hint="no camera"
              onClick={() => setMode("self")}
            />
            <ModeButton
              active={activeMode === "picture"}
              disabled={!pictureReady}
              icon={<ImageIcon className="h-6 w-6" />}
              label="Read the sign"
              hint={pictureReady ? "no camera" : "ASL only"}
              onClick={() => setMode("picture")}
            />
          </div>
        </fieldset>

        <LanguageToggle lang={lang} onChange={setLang} />
        <Button size="lg" onClick={start} className="w-full sm:w-auto">
          Start the quiz
        </Button>
      </Card>
    );
  }

  if (phase === "done") {
    return (
      <Card className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <SparkleIcon className="h-10 w-10 text-accent-secondary" />
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Great practising!
        </h2>
        <p className="text-lg text-muted">
          {mode === "picture" ? (
            <>
              You read{" "}
              <span className="font-bold text-foreground">
                {score} of {rounds.length}
              </span>{" "}
              signs
              {firstTry > 0 ? `, ${firstTry} on the first try` : ""}.
            </>
          ) : (
            <>
              You completed{" "}
              <span className="font-bold text-foreground">
                {score} of {rounds.length}
              </span>{" "}
              signs this time.
            </>
          )}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button size="lg" onClick={start}>
            Play again
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setPhase("intro")}>
            Change settings
          </Button>
        </div>
      </Card>
    );
  }

  if (mode === "picture") {
    return (
      <PictureRound
        key={`picture-${index}`}
        letter={rounds[index]}
        lang={lang}
        index={index}
        total={rounds.length}
        onMiss={handleMiss}
        onSolved={handlePictureSolved}
        onNext={advance}
      />
    );
  }

  return mode === "self" ? (
    <ManualRound
      key={`manual-${index}`}
      letter={rounds[index]}
      lang={lang}
      index={index}
      total={rounds.length}
      onSolved={handleSolved}
      onNext={advance}
    />
  ) : (
    <QuizRound
      key={`camera-${index}`}
      letter={rounds[index]}
      lang={lang}
      index={index}
      total={rounds.length}
      onSolved={handleSolved}
      onNext={advance}
    />
  );
}
