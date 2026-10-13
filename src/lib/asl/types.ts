export interface SentenceClip {
  data: string;
  mimeType: string;
}

export interface SentenceResult {
  text: string;
}

export interface LetterResult {
  letter: string;
}

export type SentenceErrorCode = "config" | "upstream";

export class SentenceRecognitionError extends Error {
  readonly code: SentenceErrorCode;

  constructor(code: SentenceErrorCode, message: string) {
    super(message);
    this.name = "SentenceRecognitionError";
    this.code = code;
  }
}
