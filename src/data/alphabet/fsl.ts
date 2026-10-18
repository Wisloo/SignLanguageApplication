import { FINGERSPELLING } from "./base";
import type { Alphabet } from "./types";

const EXAMPLES: Record<string, string> = {
  A: "Aso",
  B: "Bola",
  C: "Cake",
  D: "Dagat",
  E: "Elepante",
  F: "Flores",
  G: "Gatas",
  H: "Hayop",
  I: "Ibon",
  J: "Jacket",
  K: "Kuting",
  L: "Langit",
  M: "Mesa",
  N: "Nanay",
  O: "Orasan",
  P: "Pusa",
  Q: "Queso",
  R: "Rosas",
  S: "Saging",
  T: "Tatay",
  U: "Ulan",
  V: "Volleyball",
  W: "Walis",
  X: "Xylophone",
  Y: "Yelo",
  Z: "Zebra",
};

export const fsl: Alphabet = {
  id: "fsl",
  name: "Filipino Sign Language",
  shortName: "FSL",
  description:
    "Filipino Sign Language is the national sign language of the Philippines. Its fingerspelling alphabet shares many handshapes with ASL, making it a friendly next step once you know the letters.",
  note: "FSL signs can vary between regions and schools. When you can, check with a local Deaf teacher or community for the signs used where you live.",
  letters: FINGERSPELLING.map((letter) => ({
    ...letter,
    exampleWord: EXAMPLES[letter.letter],
    imageSrc: `/signs/fsl/${letter.letter.toLowerCase()}.png`,
  })),
};
