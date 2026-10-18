import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpeakButton } from "@/components/learn/speak-button";
import { SignImage } from "@/components/learn/sign-image";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconWell } from "@/components/ui/icon-well";
import {
  ArrowRightIcon,
  BookIcon,
  CameraIcon,
  HandIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { getAlphabet, getLetter, isVisibleLanguage, languages } from "@/data/alphabet";

export function generateStaticParams() {
  return languages.flatMap((alphabet) =>
    alphabet.letters.map((letter) => ({
      lang: alphabet.id,
      letter: letter.letter.toLowerCase(),
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[lang]/[letter]">): Promise<Metadata> {
  const { lang, letter } = await params;
  if (!isVisibleLanguage(lang)) return {};
  const alphabet = getAlphabet(lang);
  const content = getLetter(lang, letter);
  if (!alphabet || !content) return {};
  return {
    title: `Letter ${content.letter} in ${alphabet.shortName}`,
    description: content.handshape,
  };
}

export default async function LetterPage({
  params,
}: PageProps<"/learn/[lang]/[letter]">) {
  const { lang, letter } = await params;
  if (!isVisibleLanguage(lang)) notFound();

  const alphabet = getAlphabet(lang);
  const content = getLetter(lang, letter);
  if (!alphabet || !content) notFound();

  const index = alphabet.letters.findIndex((item) => item.letter === content.letter);
  const prev = index > 0 ? alphabet.letters[index - 1] : undefined;
  const next = index < alphabet.letters.length - 1 ? alphabet.letters[index + 1] : undefined;

  const speakText = `The letter ${content.letter}. ${content.handshape}${
    content.movement ? ` ${content.movement}` : ""
  }`;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <Link
        href="/learn"
        className="mb-8 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-muted transition-all duration-300 hover:bg-tertiary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
        All letters
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="flex flex-col items-center justify-center gap-6 text-center">
          {content.imageSrc ? (
            <SignImage
              src={content.imageSrc}
              alt={`The ${alphabet.name} fingerspelling handshape for the letter ${content.letter}.`}
              motion={content.motion}
            />
          ) : (
            <span className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-foreground bg-accent text-white shadow-pop">
              <HandIcon className="h-14 w-14" />
            </span>
          )}
          <p className="font-display text-[6rem] font-extrabold leading-none tracking-tight text-foreground">
            {content.letter}
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-wide text-muted">
              {alphabet.name}
            </p>
            {content.motion ? (
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-tertiary/60 px-3 py-1 text-xs font-bold text-foreground shadow-pop-sm">
                <SparkleIcon className="h-3.5 w-3.5" />
                Traced in the air
              </span>
            ) : null}
            {content.imageSrc ? (
              <p className="text-xs text-muted">
                Handshape image: wpclipart.com (public domain)
              </p>
            ) : null}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <IconWell size="sm">
                <HandIcon />
              </IconWell>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                How to make it
              </h2>
            </div>
            <p className="leading-relaxed text-foreground">{content.handshape}</p>
            {content.movement ? (
              <p className="leading-relaxed text-foreground">{content.movement}</p>
            ) : null}
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <IconWell size="sm">
                <SparkleIcon />
              </IconWell>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                Memory tip
              </h2>
            </div>
            <p className="leading-relaxed text-muted">{content.tip}</p>
            {content.exampleWord ? (
              <p className="text-sm text-muted">
                Try a word that starts with it:{" "}
                <span className="font-semibold text-foreground">
                  {content.exampleWord}
                </span>
              </p>
            ) : null}
          </Card>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <SpeakButton text={speakText} label="Hear it" className="flex-1 sm:flex-none" />
            <Link
              href={`/practice?lang=${alphabet.id}&letter=${content.letter}`}
              className={buttonClasses({ className: "flex-1 sm:flex-none" })}
            >
              <CameraIcon className="h-5 w-5" />
              Practice this letter
            </Link>
          </div>
        </div>
      </div>

      <nav
        aria-label="Letter navigation"
        className="mt-12 flex items-center justify-between gap-4"
      >
        {prev ? (
          <Link
            href={`/learn/${alphabet.id}/${prev.letter.toLowerCase()}`}
            className={buttonClasses({ variant: "secondary" })}
          >
            <ArrowRightIcon className="h-5 w-5 rotate-180" />
            {prev.letter}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href="/learn"
          className="rounded-full p-2 text-sm font-bold text-muted transition-all duration-300 hover:bg-tertiary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <BookIcon className="mx-auto h-5 w-5" aria-hidden />
        </Link>
        {next ? (
          <Link
            href={`/learn/${alphabet.id}/${next.letter.toLowerCase()}`}
            className={buttonClasses({ variant: "secondary" })}
          >
            {next.letter}
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
