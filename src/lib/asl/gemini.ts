import {
  GoogleGenAI,
  createPartFromBase64,
  createUserContent,
} from "@google/genai";
import {
  SentenceRecognitionError,
  type LetterResult,
  type SentenceClip,
  type SentenceResult,
} from "./types";

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

const SYSTEM_INSTRUCTION = [
  "You help a sign language learner check what they signed.",
  "You are shown a short webcam clip of someone signing in American Sign Language (ASL).",
  "Reply with the English word or very short phrase they signed.",
  "Reply with the words only — no quotes, labels, punctuation explanation, or commentary.",
  "If you truly cannot tell, reply with an empty response.",
].join(" ");

const PROMPT = "What did this person sign? Reply with just the English word or short phrase.";

const LETTER_SYSTEM_INSTRUCTION = [
  "You help a sign language learner check a single fingerspelled letter in American Sign Language (ASL).",
  "You are shown a short webcam clip of one handshape for a fingerspelling letter.",
  "Reply with exactly one uppercase letter from A to Z.",
  "If you cannot tell, reply with nothing — no explanation.",
].join(" ");

const LETTER_PROMPT =
  "Which ASL fingerspelling letter is this handshape? Reply with one uppercase letter (A-Z) only.";

function clean(text: string): string {
  return text.trim().replace(/^["'`]+|["'`.]+$/g, "").trim();
}

export async function recognizeSentence(
  clip: SentenceClip,
): Promise<SentenceResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new SentenceRecognitionError(
      "config",
      "Sentence recognition is not configured.",
    );
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const client = new GoogleGenAI({ apiKey });

  try {
    const response = await client.models.generateContent({
      model,
      contents: createUserContent([
        createPartFromBase64(clip.data, clip.mimeType),
        PROMPT,
      ]),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        maxOutputTokens: 64,
      },
    });

    return { text: clean(response.text ?? "") };
  } catch (error) {
    console.error("Gemini sentence recognition failed", error);
    throw new SentenceRecognitionError("upstream", "The translator is unavailable.");
  }
}

export async function recognizeLetter(clip: SentenceClip): Promise<LetterResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new SentenceRecognitionError("config", "Letter recognition is not configured.");
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const client = new GoogleGenAI({ apiKey });

  try {
    const response = await client.models.generateContent({
      model,
      contents: createUserContent([
        createPartFromBase64(clip.data, clip.mimeType),
        LETTER_PROMPT,
      ]),
      config: {
        systemInstruction: LETTER_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        maxOutputTokens: 8,
      },
    });

    const text = clean(response.text ?? "");
    const exact = text.match(/^([A-Za-z])[.!]?$/);
    if (exact) return { letter: exact[1].toUpperCase() };

    const spoken = text.match(/\bletter\s+([A-Za-z])\b/i);
    return { letter: spoken ? spoken[1].toUpperCase() : "" };
  } catch (error) {
    console.error("Gemini letter recognition failed", error);
    throw new SentenceRecognitionError("upstream", "The camera check is unavailable.");
  }
}
