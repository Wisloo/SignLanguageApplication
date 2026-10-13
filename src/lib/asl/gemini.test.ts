import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => {
  class GoogleGenAI {
    models = { generateContent };
  }
  return {
    GoogleGenAI,
    createPartFromBase64: (data: string, mimeType: string) => ({
      inlineData: { data, mimeType },
    }),
    createUserContent: (parts: unknown) => ({ parts }),
  };
});

import { DEFAULT_GEMINI_MODEL, recognizeLetter, recognizeSentence } from "./gemini";
import { SentenceRecognitionError } from "./types";

const ORIGINAL_KEY = process.env.GEMINI_API_KEY;
const ORIGINAL_MODEL = process.env.GEMINI_MODEL;

beforeEach(() => {
  generateContent.mockReset();
  process.env.GEMINI_API_KEY = "test-key";
  delete process.env.GEMINI_MODEL;
});

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_MODEL === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = ORIGINAL_MODEL;
});

describe("recognizeSentence", () => {
  it("returns the model's text with surrounding quotes stripped", async () => {
    generateContent.mockResolvedValue({ text: '  "Hello"  ' });
    await expect(
      recognizeSentence({ data: "AAAA", mimeType: "video/webm" }),
    ).resolves.toEqual({ text: "Hello" });
  });

  it("sends the inline clip to the configured model", async () => {
    process.env.GEMINI_MODEL = "gemini-custom-flash";
    generateContent.mockResolvedValue({ text: "thank you" });

    await recognizeSentence({ data: "BBBB", mimeType: "video/webm" });

    const params = generateContent.mock.calls[0][0];
    expect(params.model).toBe("gemini-custom-flash");
    expect(params.contents.parts[0]).toEqual({
      inlineData: { data: "BBBB", mimeType: "video/webm" },
    });
  });

  it("falls back to the default model when unset", async () => {
    generateContent.mockResolvedValue({ text: "hi" });
    await recognizeSentence({ data: "CCCC", mimeType: "video/webm" });
    expect(generateContent.mock.calls[0][0].model).toBe(DEFAULT_GEMINI_MODEL);
  });

  it("returns an empty string when the model gives nothing usable", async () => {
    generateContent.mockResolvedValue({ text: undefined });
    await expect(
      recognizeSentence({ data: "DDDD", mimeType: "video/webm" }),
    ).resolves.toEqual({ text: "" });
  });

  it("throws a config error when no API key is set", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(
      recognizeSentence({ data: "EEEE", mimeType: "video/webm" }),
    ).rejects.toMatchObject({ name: "SentenceRecognitionError", code: "config" });
  });

  it("wraps upstream failures as an upstream error", async () => {
    generateContent.mockRejectedValue(new Error("429 rate limited"));
    await expect(
      recognizeSentence({ data: "FFFF", mimeType: "video/webm" }),
    ).rejects.toBeInstanceOf(SentenceRecognitionError);
  });
});

describe("recognizeLetter", () => {
  it("returns the single uppercase letter from the reply", async () => {
    generateContent.mockResolvedValue({ text: "  b  " });
    await expect(
      recognizeLetter({ data: "GGGG", mimeType: "video/webm" }),
    ).resolves.toEqual({ letter: "B" });
  });

  it("extracts a letter from a verbose reply", async () => {
    generateContent.mockResolvedValue({ text: "It looks like the letter K." });
    await expect(
      recognizeLetter({ data: "HHHH", mimeType: "video/webm" }),
    ).resolves.toEqual({ letter: "K" });
  });

  it("returns an empty letter when the model cannot tell", async () => {
    generateContent.mockResolvedValue({ text: "I cannot tell." });
    await expect(
      recognizeLetter({ data: "IIII", mimeType: "video/webm" }),
    ).resolves.toEqual({ letter: "" });
  });

  it("throws a config error when no API key is set", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(
      recognizeLetter({ data: "JJJJ", mimeType: "video/webm" }),
    ).rejects.toMatchObject({ name: "SentenceRecognitionError", code: "config" });
  });

  it("wraps upstream failures as an upstream error", async () => {
    generateContent.mockRejectedValue(new Error("503 service unavailable"));
    await expect(
      recognizeLetter({ data: "KKKK", mimeType: "video/webm" }),
    ).rejects.toBeInstanceOf(SentenceRecognitionError);
  });
});
