"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SpeakerIcon } from "@/components/ui/icons";

const PREFERRED_VOICES = [
  /Microsoft Aria/i,
  /Microsoft Jenny/i,
  /Microsoft Michelle/i,
  /Microsoft Ana/i,
  /Microsoft Zira/i,
  /Google US English/i,
  /Google UK English Female/i,
  /Samantha/i,
  /Karen/i,
  /Moira/i,
  /Tessa/i,
  /Fiona/i,
  /Female/i,
];

function pickPreferredVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const english = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  for (const pattern of PREFERRED_VOICES) {
    const match = pool.find((voice) => pattern.test(voice.name));
    if (match) return match;
  }
  return pool[0] ?? null;
}

export function SpeakButton({
  text,
  label = "Hear it",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const refresh = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) voiceRef.current = pickPreferredVoice(voices);
    };
    refresh();
    synth.addEventListener("voiceschanged", refresh);
    return () => synth.removeEventListener("voiceschanged", refresh);
  }, []);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voiceRef.current ?? pickPreferredVoice(synth.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    synth.speak(utterance);
  }

  return (
    <Button variant="secondary" onClick={speak} className={className}>
      <SpeakerIcon className="h-5 w-5" />
      {label}
    </Button>
  );
}
