import { asl } from "./asl";
import { fsl } from "./fsl";
import type { Alphabet, LetterContent, SignLanguage } from "./types";

export const alphabets: Record<SignLanguage, Alphabet> = { asl, fsl };

export const languages: Alphabet[] = [asl, fsl];

export function isSignLanguage(value: string): value is SignLanguage {
  return value === "asl" || value === "fsl";
}

export function getAlphabet(lang: string): Alphabet | undefined {
  return isSignLanguage(lang) ? alphabets[lang] : undefined;
}

export function getLetter(
  lang: SignLanguage,
  letter: string,
): LetterContent | undefined {
  const target = letter.toUpperCase();
  return alphabets[lang].letters.find((item) => item.letter === target);
}

export type { Alphabet, LetterContent, SignLanguage } from "./types";
