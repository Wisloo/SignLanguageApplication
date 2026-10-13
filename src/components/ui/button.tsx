import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground font-bold select-none " +
  "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover " +
    "active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active",
  secondary:
    "bg-transparent text-foreground shadow-none hover:bg-tertiary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop " +
    "active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active",
  ghost:
    "border-transparent bg-transparent text-foreground shadow-none hover:bg-muted-bg active:translate-y-0.5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-11 px-5 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
  icon: "h-12 w-12 p-0",
};

export function buttonClasses(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const { variant = "primary", size = "md", className } = options ?? {};
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
