import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PracticeClient,
  type PracticeMode,
} from "@/components/practice/practice-client";
import { Card } from "@/components/ui/card";
import { isVisibleLanguage } from "@/data/alphabet";

export const metadata: Metadata = {
  title: "Practice with your camera",
  description:
    "Show fingerspelling letters to your camera for gentle feedback, or sign a word and watch it written out in English.",
};

type PracticeSearchParams = PageProps<"/practice">["searchParams"];

function PracticeFallback() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <Card className="aspect-[4/3] animate-pulse" />
      <Card className="h-64 animate-pulse" />
    </div>
  );
}

async function PracticeResolver({
  searchParams,
}: {
  searchParams: PracticeSearchParams;
}) {
  const params = await searchParams;

  const langParam = typeof params.lang === "string" ? params.lang : undefined;
  const letterParam = typeof params.letter === "string" ? params.letter : undefined;
  const modeParam = typeof params.mode === "string" ? params.mode : undefined;

  const lang = langParam && isVisibleLanguage(langParam) ? langParam : "asl";
  const letter = letterParam ? letterParam.toUpperCase().charAt(0) : "A";
  const mode: PracticeMode = modeParam === "sentences" ? "sentences" : "letters";

  return (
    <PracticeClient initialLang={lang} initialLetter={letter} initialMode={mode} />
  );
}

export default function PracticePage({ searchParams }: PageProps<"/practice">) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Camera practice
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Take your time, try as often as you like, and stop whenever you need.
          Nothing here is ever wrong — every try helps you learn.
        </p>
      </header>

      <Suspense fallback={<PracticeFallback />}>
        <PracticeResolver searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
