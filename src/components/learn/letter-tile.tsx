import Image from "next/image";
import Link from "next/link";
import type { LetterContent, SignLanguage } from "@/data/alphabet";
import { HandIcon } from "@/components/ui/icons";
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
        "group relative flex aspect-square flex-col overflow-hidden rounded-3xl border-2 border-foreground bg-card shadow-pop-soft",
        "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:shadow-pop active:shadow-pop-active",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
      )}
    >
      {letter.imageSrc ? (
        <span className="flex min-h-0 flex-1 items-center justify-center p-3">
          <Image
            src={letter.imageSrc}
            alt=""
            width={300}
            height={300}
            unoptimized
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.06]"
          />
        </span>
      ) : (
        <span className="flex min-h-0 flex-1 items-center justify-center p-4">
          <HandIcon className="h-14 w-14 text-muted" />
        </span>
      )}
      <span className="flex items-center justify-center gap-2 px-2 pb-3">
        <span className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          {letter.letter}
        </span>
        {letter.motion ? (
          <span className="rounded-full bg-quaternary/70 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-foreground">
            Trace
          </span>
        ) : null}
      </span>
    </Link>
  );
}
