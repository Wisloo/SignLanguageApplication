import { FINGERSPELLING } from "./base";
import type { Alphabet } from "./types";

const EXAMPLES: Record<string, string> = {
  A: "Apple",
  B: "Ball",
  C: "Cat",
  D: "Dog",
  E: "Egg",
  F: "Fish",
  G: "Go",
  H: "Hat",
  I: "Ice",
  J: "Jump",
  K: "Kite",
  L: "Lion",
  M: "Moon",
  N: "Nose",
  O: "Open",
  P: "Pig",
  Q: "Queen",
  R: "Rabbit",
  S: "Sun",
  T: "Tree",
  U: "Up",
  V: "Van",
  W: "Water",
  X: "Xylophone",
  Y: "Yellow",
  Z: "Zebra",
};

export const asl: Alphabet = {
  id: "asl",
  name: "American Sign Language",
  shortName: "ASL",
  description:
    "The ASL fingerspelling alphabet uses one hand to spell out letters. Learning it helps you sign names, places, and any word you have not learned a sign for yet.",
  letters: FINGERSPELLING.map((letter) => ({
    ...letter,
    exampleWord: EXAMPLES[letter.letter],
    imageSrc: `/signs/asl/${letter.letter.toLowerCase()}.png`,
  })),
};
