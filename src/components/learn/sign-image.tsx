import Image from "next/image";
import { cn } from "@/lib/cn";

export function SignImage({
  src,
  alt,
  motion = false,
  className,
}: {
  src: string;
  alt: string;
  motion?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-60 w-full items-center justify-center rounded-3xl border-2 border-foreground bg-card p-5 shadow-pop",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={600}
        height={789}
        unoptimized
        className="h-full w-auto"
      />
      {motion ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          className="pointer-events-none absolute bottom-3 right-3 h-11 w-11 text-accent"
        >
          <path
            d="M8 8c14 0 24 6 26 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M28 24l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(38 34 27)"
          />
        </svg>
      ) : null}
    </div>
  );
}
