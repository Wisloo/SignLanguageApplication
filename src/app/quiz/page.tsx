import type { Metadata } from "next";
import { QuizClient } from "@/components/quiz/quiz-client";

export const metadata: Metadata = {
  title: "Quiz",
  description:
    "A calm, scored game to practise fingerspelling letters with your camera.",
};

export default function QuizPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Quiz time
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          A friendly game with no pressure. Take every round at your own pace and
          celebrate each sign you try.
        </p>
      </header>

      <QuizClient />
    </div>
  );
}
