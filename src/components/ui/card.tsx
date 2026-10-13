import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardShadow = "soft" | "pink" | "pop";

const shadowClasses: Record<CardShadow, string> = {
  soft: "shadow-pop-soft",
  pink: "shadow-pop-pink",
  pop: "shadow-pop",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  shadow?: CardShadow;
}

export function Card({
  interactive,
  shadow = "soft",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-3xl border-2 border-foreground p-6 sm:p-8",
        "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        shadowClasses[shadow],
        interactive &&
          "hover:-rotate-1 hover:scale-[1.02] hover:shadow-pop focus-within:shadow-pop",
        className,
      )}
      {...props}
    />
  );
}
