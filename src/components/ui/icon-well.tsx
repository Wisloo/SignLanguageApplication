import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type IconWellSize = "sm" | "md" | "lg";
export type IconWellTone = "accent" | "secondary" | "tertiary" | "quaternary";

const sizes: Record<IconWellSize, string> = {
  sm: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
  md: "h-14 w-14 [&_svg]:h-6 [&_svg]:w-6",
  lg: "h-16 w-16 [&_svg]:h-8 [&_svg]:w-8",
};

const tones: Record<IconWellTone, string> = {
  accent: "bg-accent text-white",
  secondary: "bg-secondary text-white",
  tertiary: "bg-tertiary text-foreground",
  quaternary: "bg-quaternary text-foreground",
};

export interface IconWellProps extends HTMLAttributes<HTMLSpanElement> {
  size?: IconWellSize;
  tone?: IconWellTone;
}

export function IconWell({
  size = "md",
  tone = "accent",
  className,
  ...props
}: IconWellProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-foreground shadow-pop-sm",
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
