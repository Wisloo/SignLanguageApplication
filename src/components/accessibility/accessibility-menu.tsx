"use client";

import { useEffect, useRef, useState } from "react";
import { useAccessibility } from "@/components/accessibility/accessibility-provider";
import { buttonClasses } from "@/components/ui/button";
import { AccessibilityIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

function PrefToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-sm text-muted">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-12 w-20 shrink-0 rounded-full border-2 border-foreground transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          checked ? "bg-accent" : "bg-muted-bg",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1.5 left-1.5 h-8 w-8 rounded-full border-2 border-foreground bg-card transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            checked && "translate-x-9",
          )}
        />
      </button>
    </div>
  );
}

export function AccessibilityMenu() {
  const { highContrast, largeText, setHighContrast, setLargeText } =
    useAccessibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className={buttonClasses({ variant: "secondary", size: "icon" })}
      >
        <AccessibilityIcon className="h-5 w-5" />
        <span className="sr-only">
          {open ? "Close accessibility settings" : "Open accessibility settings"}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          className="absolute right-0 top-full z-50 mt-3 w-72 origin-top-right rounded-3xl border-2 border-foreground bg-card p-5 shadow-pop transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        >
          <p className="mb-4 font-display text-lg font-bold tracking-tight text-foreground">
            Make it easier
          </p>
          <div className="flex flex-col gap-5">
            <PrefToggle
              checked={highContrast}
              onChange={setHighContrast}
              label="High contrast"
              description="Stronger colours for easier reading."
            />
            <PrefToggle
              checked={largeText}
              onChange={setLargeText}
              label="Large text"
              description="Bigger text throughout the app."
            />
          </div>
          <p className="mt-4 text-sm text-muted">
            Your choices are remembered on this device.
          </p>
        </div>
      ) : null}
    </div>
  );
}