"use client";

import { useState } from "react";
import type { Alphabet, SignLanguage } from "@/data/alphabet";
import { cn } from "@/lib/cn";
import { LetterTile } from "./letter-tile";

export function LanguageTabs({ alphabets }: { alphabets: Alphabet[] }) {
  const [active, setActive] = useState<SignLanguage>(alphabets[0]?.id ?? "asl");
  const current = alphabets.find((alphabet) => alphabet.id === active) ?? alphabets[0];

  if (!current) return null;

  return (
    <div className="flex flex-col gap-10">
      {alphabets.length > 1 ? (
        <div
          role="tablist"
          aria-label="Sign language"
          className="mx-auto inline-flex gap-2 self-center rounded-full border-2 border-foreground bg-card p-1.5 shadow-pop-sm"
        >
          {alphabets.map((alphabet) => {
            const selected = alphabet.id === current.id;
            return (
              <button
                key={alphabet.id}
                type="button"
                role="tab"
                id={`tab-${alphabet.id}`}
                aria-selected={selected}
                aria-controls={`panel-${alphabet.id}`}
                onClick={() => setActive(alphabet.id)}
                className={cn(
                  "h-11 rounded-full border-2 px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  selected
                    ? "border-foreground bg-accent text-white shadow-pop-sm"
                    : "border-transparent text-muted hover:bg-tertiary hover:text-foreground",
                )}
              >
                {alphabet.shortName}
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        role="tabpanel"
        id={`panel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        className="flex flex-col gap-8"
      >
        <p className="mx-auto max-w-2xl text-center leading-relaxed text-muted">
          {current.description}
        </p>

        {current.note ? (
          <p className="mx-auto max-w-2xl rounded-2xl border-2 border-foreground bg-tertiary/50 px-5 py-4 text-center text-sm font-medium leading-relaxed text-foreground shadow-pop-sm">
            {current.note}
          </p>
        ) : null}

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {current.letters.map((letter) => (
            <li key={letter.letter}>
              <LetterTile lang={current.id} letter={letter} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
