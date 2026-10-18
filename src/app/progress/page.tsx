import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/progress/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SparkleIcon } from "@/components/ui/icons";
import { alphabets, getLetter, type SignLanguage } from "@/data/alphabet";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Your progress",
  description: "See the letters you have practised and the stars you have earned.",
};

function ProgressFallback() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="h-32 animate-pulse" />
      <Card className="h-48 animate-pulse" />
    </div>
  );
}

function LanguageProgress({
  language,
  rows,
}: {
  language: SignLanguage;
  rows: { letter: string; stars: number; successes: number }[];
}) {
  const alphabet = alphabets[language];
  const map = new Map(rows.map((row) => [row.letter, row]));

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          {alphabet.name}
        </h2>
        <span className="rounded-full border-2 border-foreground bg-muted-bg px-3 py-1 text-sm font-bold text-foreground shadow-pop-sm">
          {rows.length} of {alphabet.letters.length} letters
        </span>
      </div>

      <ul className="grid grid-cols-6 gap-2 sm:grid-cols-9">
        {alphabet.letters.map((item) => {
          const row = map.get(item.letter);
          const played = Boolean(row);
          const content = getLetter(language, item.letter);
          return (
            <li key={item.letter}>
              <span
                title={content?.handshape}
                className={
                  "flex h-12 flex-col items-center justify-center rounded-xl border-2 text-sm font-bold transition-all duration-300 ease-out " +
                  (played
                    ? "border-foreground bg-quaternary/70 text-foreground shadow-pop-sm"
                    : "border-border bg-card text-placeholder shadow-pop-sm")
                }
              >
                {item.letter}
                {played ? (
                  <span className="text-[10px] leading-none">{row?.stars ?? 0}★</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

async function ProgressContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const rows = await prisma.progress.findMany({
    where: { userId: session.user.id, language: "asl" },
    orderBy: { lastPractisedAt: "desc" },
  });

  const totalStars = rows.reduce((sum, row) => sum + row.stars, 0);
  const practised = rows.length;

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            Good to see you
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {session.user.name ?? session.user.email}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-quaternary/70 px-4 py-2 font-bold text-foreground shadow-pop-sm">
            <SparkleIcon className="h-5 w-5" />
            {totalStars} stars
          </span>
          <SignOutButton />
        </div>
      </Card>

      {practised === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-8 text-center">
          <SparkleIcon className="h-10 w-10 text-accent" />
          <p className="max-w-md leading-relaxed text-muted">
            Your first star is waiting. Visit the practice page, show a letter to
            your camera, and it will show up here.
          </p>
          <Link href="/practice" className="text-accent">
            <Button size="lg">Start practising</Button>
          </Link>
        </Card>
      ) : (
        <>
          <LanguageProgress language="asl" rows={rows} />
        </>
      )}
    </div>
  );
}

export default function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Your progress
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Every letter you try is worth celebrating. There is no rush and no
          score to beat.
        </p>
      </header>

      <Suspense fallback={<ProgressFallback />}>
        <ProgressContent />
      </Suspense>
    </div>
  );
}
