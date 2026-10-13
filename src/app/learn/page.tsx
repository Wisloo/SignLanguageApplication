import type { Metadata } from "next";
import { LanguageTabs } from "@/components/learn/language-tabs";
import { languages } from "@/data/alphabet";

export const metadata: Metadata = {
  title: "Learn the alphabet",
  description:
    "Browse the ASL and FSL fingerspelling alphabet, letter by letter, with friendly tips.",
};

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
      <header className="mb-12 flex flex-col items-center gap-4 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          The fingerspelling alphabet
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Choose a language, then tap any letter to see exactly how to make it.
          Take your time — every letter is worth celebrating.
        </p>
      </header>

      <LanguageTabs alphabets={languages} />
    </div>
  );
}
