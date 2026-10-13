"use client";

import { useState } from "react";
import { LetterPractice } from "@/components/practice/letter-practice";
import { SentencePractice } from "@/components/practice/sentence-practice";
import { HandIcon, SparkleIcon } from "@/components/ui/icons";
import type { SignLanguage } from "@/data/alphabet";
import { useCamera } from "@/hooks/use-camera";
import { cn } from "@/lib/cn";

export type PracticeMode = "letters" | "sentences";

const MODES: { id: PracticeMode; label: string; icon: React.ReactNode }[] = [
  { id: "letters", label: "Letters", icon: <HandIcon className="h-4 w-4" /> },
  { id: "sentences", label: "Sentences", icon: <SparkleIcon className="h-4 w-4" /> },
];

function ModeToggle({
  mode,
  onChange,
}: {
  mode: PracticeMode;
  onChange: (next: PracticeMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Practice mode"
      className="mx-auto inline-flex gap-1 rounded-full border-2 border-foreground bg-card p-1 shadow-pop-sm"
    >
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={mode === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border-2 px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            mode === item.id
              ? "border-foreground bg-accent text-white shadow-pop-sm"
              : "border-transparent text-muted hover:bg-tertiary hover:text-foreground",
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function PracticeClient({
  initialLang,
  initialLetter,
  initialMode,
}: {
  initialLang: SignLanguage;
  initialLetter: string;
  initialMode: PracticeMode;
}) {
  const camera = useCamera();
  const [mode, setMode] = useState<PracticeMode>(initialMode);

  return (
    <div className="flex flex-col gap-8">
      <ModeToggle mode={mode} onChange={setMode} />
      {mode === "letters" ? (
        <LetterPractice
          camera={camera}
          initialLang={initialLang}
          initialLetter={initialLetter}
        />
      ) : (
        <SentencePractice camera={camera} />
      )}
    </div>
  );
}