import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconWell, type IconWellTone } from "@/components/ui/icon-well";
import {
  ArrowRightIcon,
  BookIcon,
  CameraIcon,
  ChartIcon,
  HandIcon,
  SparkleIcon,
  TrophyIcon,
} from "@/components/ui/icons";

const features: {
  href: string;
  icon: React.ReactNode;
  tone: IconWellTone;
  title: string;
  body: string;
}[] = [
  {
    href: "/learn",
    icon: <BookIcon />,
    tone: "accent",
    title: "Learn the alphabet",
    body: "Explore every fingerspelling letter in ASL and FSL, with clear pictures and friendly tips.",
  },
  {
    href: "/practice",
    icon: <CameraIcon />,
    tone: "secondary",
    title: "Practice with camera",
    body: "Show a letter to your camera for gentle feedback, or sign a word and watch it written out in English.",
  },
  {
    href: "/quiz",
    icon: <TrophyIcon />,
    tone: "tertiary",
    title: "Play a quiz",
    body: "A calm, scored game to celebrate what you know and discover what to try next.",
  },
  {
    href: "/progress",
    icon: <ChartIcon />,
    tone: "quaternary",
    title: "See your progress",
    body: "Watch your streak and mastered letters grow over time in a simple, colourful dashboard.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <section className="grid items-center gap-16 py-20 md:py-28 lg:grid-cols-2">
        <div className="relative flex flex-col items-start gap-8">
          <span
            aria-hidden="true"
            className="absolute -left-12 -top-6 -z-10 h-56 w-56 rounded-full bg-tertiary/70"
          />
          <span
            aria-hidden="true"
            className="absolute right-4 top-0 -z-10 h-5 w-5 rotate-12 rounded-sm border-2 border-foreground bg-secondary"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-24 right-10 -z-10 h-4 w-4 rounded-full border-2 border-foreground bg-quaternary"
          />

          <span className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-2 text-sm font-bold text-foreground shadow-pop-sm">
            <HandIcon className="h-4 w-4" />
            ASL &amp; FSL
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Learn to sign,
            <br />
            one letter at a time.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            A calm, patient way for every learner to master the fingerspelling
            alphabet, practice with their own camera, and feel proud of their
            progress.
          </p>
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link href="/learn" className={buttonClasses({ size: "lg" })}>
              Start learning
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent">
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/practice"
              className={buttonClasses({ variant: "secondary", size: "lg" })}
            >
              Try practice
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center py-6">
          <div
            aria-hidden="true"
            className="bg-dots absolute inset-4 rounded-[40px] opacity-70"
          />
          <span
            aria-hidden="true"
            className="absolute -right-2 top-4 h-6 w-6 rotate-45 border-2 border-foreground bg-accent"
          />

          <div className="animate-float relative flex h-64 w-64 items-center justify-center rounded-[38%_62%_60%_40%/45%_40%_60%_55%] border-2 border-foreground bg-tertiary shadow-pop-lg sm:h-72 sm:w-72 md:h-80 md:w-80">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-foreground bg-card shadow-pop sm:h-44 sm:w-44 md:h-48 md:w-48">
              <HandIcon className="h-16 w-16 text-accent md:h-20 md:w-20" />
            </div>
          </div>

          <span className="absolute -left-1 bottom-6 inline-flex h-14 w-14 -rotate-6 items-center justify-center rounded-full border-2 border-foreground bg-secondary text-white shadow-pop-sm">
            <SparkleIcon className="h-7 w-7" />
          </span>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="pb-24">
        <h2
          id="features-heading"
          className="mb-16 text-center font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
        >
          Everything you need to grow
        </h2>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-24 hidden h-px w-auto lg:block"
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke="#1e293b"
              strokeWidth="2"
              strokeDasharray="6 10"
              strokeLinecap="round"
            />
          </svg>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.href}
                interactive
                className="relative flex flex-col gap-4 pt-12"
              >
                <IconWell
                  size="lg"
                  tone={feature.tone}
                  className="absolute -top-7 left-6"
                >
                  {feature.icon}
                </IconWell>
                <Link
                  href={feature.href}
                  className="flex flex-col gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <h3 className="font-display text-xl font-extrabold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {feature.body}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-accent">
                    Explore
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
