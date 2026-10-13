import { FINGERSPELLING } from "./base";
import type { Alphabet } from "./types";

export const fsl: Alphabet = {
  id: "fsl",
  name: "Filipino Sign Language",
  shortName: "FSL",
  description:
    "Filipino Sign Language is the national sign language of the Philippines. Its fingerspelling alphabet shares many handshapes with ASL, making it a friendly next step once you know the letters.",
  note: "FSL signs can vary between regions and schools. When you can, check with a local Deaf teacher or community for the signs used where you live.",
  letters: FINGERSPELLING.map((letter) => ({ ...letter })),
};
