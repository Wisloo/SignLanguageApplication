import Link from "next/link";
import type { LetterContent, SignLanguage } from "@/data/alphabet";
import { cn } from "@/lib/cn";

export function LetterTile({
  lang,
  letter,
}: {
  lang: SignLanguage;
  letter: LetterContent;
}) {
  return (
    <Link
      href={`/learn/${lang}/${letter.letter.toLowerCase()}`}
      aria-label={`Letter ${letter.letter}${letter.motion ? ", traced in the air" : ""}`}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-foreground bg-card shadow-pop-soft",
        "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-2 hover:scale-[1.04] hover:shadow-pop active:shadow-pop-active",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
      )}
    >
      <span className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
        {letter.letter}
      </span>
      {letter.motion ? (
        <span className="text-[0.65rem] font-bold uppercase tracking-wide text-accent-secondary">
          Trace
        </span>
      ) : null}
    </Link>
  );
}
