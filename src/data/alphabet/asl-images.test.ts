import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { alphabets } from "./index";

const PUBLIC_DIR = join(process.cwd(), "public");

describe("ASL sign reference images", () => {
  it("points every ASL letter at /signs/asl/<letter>.png", () => {
    for (const letter of alphabets.asl.letters) {
      expect(letter.imageSrc).toBe(`/signs/asl/${letter.letter.toLowerCase()}.png`);
    }
  });

  it("has a non-empty image file on disk for every ASL letter", () => {
    for (const letter of alphabets.asl.letters) {
      expect(letter.imageSrc, `letter ${letter.letter} is missing imageSrc`).toBeTruthy();
      const file = join(PUBLIC_DIR, letter.imageSrc as string);
      expect(existsSync(file), `missing file for ${letter.letter}: ${file}`).toBe(true);
      expect(statSync(file).size, `empty file for ${letter.letter}`).toBeGreaterThan(0);
    }
  });

  it("covers the whole alphabet", () => {
    const letters = alphabets.asl.letters.map((item) => item.letter).sort();
    const expected = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    expect(letters).toEqual(expected);
  });

  it("points every FSL letter at an existing /signs/fsl/<letter>.png", () => {
    for (const letter of alphabets.fsl.letters) {
      expect(letter.imageSrc).toBe(`/signs/fsl/${letter.letter.toLowerCase()}.png`);
      const file = join(PUBLIC_DIR, letter.imageSrc as string);
      expect(existsSync(file), `missing file for ${letter.letter}: ${file}`).toBe(true);
      expect(statSync(file).size, `empty file for ${letter.letter}`).toBeGreaterThan(0);
    }
  });
});
