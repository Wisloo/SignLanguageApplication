import type { SignLanguage } from "@/data/alphabet";

export async function recordProgress(input: {
  language: SignLanguage;
  letter: string;
  success?: boolean;
}): Promise<void> {
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, ...input }),
    });
  } catch {
    // Progress saving is best-effort and never interrupts a learner.
  }
}
