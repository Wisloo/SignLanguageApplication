"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Setter = (value: boolean) => void;

interface AccessibilityContextValue {
  highContrast: boolean;
  largeText: boolean;
  setHighContrast: Setter;
  setLargeText: Setter;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const listeners = new Set<() => void>();

function readPref(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(`signbright:${key}`) === "1";
  } catch {
    return false;
  }
}

function writePref(key: string, value: boolean) {
  try {
    window.localStorage.setItem(`signbright:${key}`, value ? "1" : "0");
  } catch {
    // Local storage can be unavailable (private mode); the setting still applies.
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function usePref(key: string, className: string): [boolean, Setter] {
  const value = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    }, []),
    () => readPref(key),
    () => false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle(className, value);
  }, [value, className]);

  const set = useCallback(
    (next: boolean) => {
      writePref(key, next);
      notify();
    },
    [key],
  );

  return [value, set];
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = usePref("hc", "hc");
  const [largeText, setLargeText] = usePref("large-text", "large-text");

  return (
    <AccessibilityContext.Provider
      value={{ highContrast, largeText, setHighContrast, setLargeText }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used inside AccessibilityProvider");
  }
  return context;
}