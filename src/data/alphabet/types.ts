export type SignLanguage = "asl" | "fsl";

export interface LetterContent {
  /** Uppercase letter, e.g. "A". */
  letter: string;
  /** How to shape the hand. */
  handshape: string;
  /** Motion description for letters that are drawn in the air (J, Z). */
  movement?: string;
  /** A friendly memory hook. */
  tip: string;
  /** True when the letter requires movement rather than a static pose. */
  motion: boolean;
  /** A simple word that begins with this letter. */
  exampleWord?: string;
  /** Optional reference image under /public. */
  imageSrc?: string;
}

export interface Alphabet {
  id: SignLanguage;
  name: string;
  shortName: string;
  description: string;
  /** Editorial caveat shown on the alphabet pages. */
  note?: string;
  letters: LetterContent[];
}
