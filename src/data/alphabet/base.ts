import type { LetterContent } from "./types";

/**
 * Shared fingerspelling handshapes. FSL fingerspelling is closely related to ASL,
 * so the handshape descriptions live here and each language supplies its own
 * examples and notes. Motion letters (J and Z) are drawn in the air.
 */
export const FINGERSPELLING: LetterContent[] = [
  {
    letter: "A",
    handshape:
      "Make a fist with your palm facing forward. Keep your thumb straight and resting against the side of your index finger.",
    tip: "Imagine gently holding a small ball.",
    motion: false,
  },
  {
    letter: "B",
    handshape:
      "Hold your hand flat with your four fingers together and pointing up. Fold your thumb across your palm.",
    tip: "Like a flat hand waving hello.",
    motion: false,
  },
  {
    letter: "C",
    handshape:
      "Curve your fingers and thumb into the shape of the letter C, like you are holding a cup.",
    tip: "Pretend you are holding a small cup.",
    motion: false,
  },
  {
    letter: "D",
    handshape:
      "Point your index finger up. Touch your thumb to the tips of your middle, ring, and pinky fingers to make a circle.",
    tip: "The circle sits below one tall finger.",
    motion: false,
  },
  {
    letter: "E",
    handshape:
      "Curl all four fingers down so their tips rest on your thumb, a little like a claw.",
    tip: "Everything is bent toward the thumb.",
    motion: false,
  },
  {
    letter: "F",
    handshape:
      "Touch your thumb and index finger together to make a circle. Keep your middle, ring, and pinky fingers up and slightly apart.",
    tip: "Think of the phrase 'okay', but with three fingers up.",
    motion: false,
  },
  {
    letter: "G",
    handshape:
      "Point your index finger sideways. Rest your thumb on top, parallel to your index finger.",
    tip: "Two lines lying flat, like the letter G.",
    motion: false,
  },
  {
    letter: "H",
    handshape:
      "Point your index and middle fingers sideways, held together.",
    tip: "Two fingers, side by side, pointing across.",
    motion: false,
  },
  {
    letter: "I",
    handshape: "Make a fist and point your pinky finger straight up.",
    tip: "The smallest finger takes the lead.",
    motion: false,
  },
  {
    letter: "J",
    handshape:
      "Start with your pinky finger up, like the letter I, palm facing forward.",
    movement: "Then draw the shape of a J in the air with your pinky.",
    tip: "It begins like I, then curls into a J.",
    motion: true,
  },
  {
    letter: "K",
    handshape:
      "Point your index and middle fingers up in a V. Rest your thumb between them.",
    tip: "A V with the thumb tucked in the middle.",
    motion: false,
  },
  {
    letter: "L",
    handshape:
      "Point your index finger up and stretch your thumb out to the side to make the letter L.",
    tip: "A perfect right angle.",
    motion: false,
  },
  {
    letter: "M",
    handshape:
      "Fold your thumb under your first three fingers (index, middle, ring) so their tips rest on your thumb.",
    tip: "Three fingers draped over the thumb.",
    motion: false,
  },
  {
    letter: "N",
    handshape:
      "Fold your thumb under your index and middle fingers so their tips rest on your thumb.",
    tip: "Two fingers draped over the thumb.",
    motion: false,
  },
  {
    letter: "O",
    handshape:
      "Curve all your fingers and your thumb so they meet, making the shape of the letter O.",
    tip: "Round, like a zero.",
    motion: false,
  },
  {
    letter: "P",
    handshape:
      "Make the letter K, then tilt your hand so your fingers point down toward the floor.",
    tip: "It is the letter K, pointing down.",
    motion: false,
  },
  {
    letter: "Q",
    handshape:
      "Make the letter G, then tilt your hand so your fingers point down toward the floor.",
    tip: "It is the letter G, pointing down.",
    motion: false,
  },
  {
    letter: "R",
    handshape:
      "Point your index and middle fingers up and cross them over each other.",
    tip: "Crossed fingers, like wishing for luck.",
    motion: false,
  },
  {
    letter: "S",
    handshape:
      "Make a fist and wrap your thumb across the front of your fingers.",
    tip: "A firm, closed fist.",
    motion: false,
  },
  {
    letter: "T",
    handshape:
      "Make a fist and tuck your thumb between your index and middle fingers.",
    tip: "The thumb peeks out between two fingers.",
    motion: false,
  },
  {
    letter: "U",
    handshape:
      "Point your index and middle fingers up, held together and touching.",
    tip: "Two fingers standing together.",
    motion: false,
  },
  {
    letter: "V",
    handshape:
      "Point your index and middle fingers up and spread them apart to make a V.",
    tip: "The classic peace sign.",
    motion: false,
  },
  {
    letter: "W",
    handshape:
      "Point your index, middle, and ring fingers up and spread them apart.",
    tip: "Three fingers, like a little fan.",
    motion: false,
  },
  {
    letter: "X",
    handshape:
      "Make a fist and bend your index finger into a small hook.",
    tip: "One finger curled into a hook.",
    motion: false,
  },
  {
    letter: "Y",
    handshape:
      "Stretch your thumb and pinky finger out to the sides, keeping the other fingers closed.",
    tip: "Like making a phone call.",
    motion: false,
  },
  {
    letter: "Z",
    handshape:
      "Point your index finger forward at about shoulder height.",
    movement: "Then draw the shape of a Z in the air with your index finger.",
    tip: "A zig-zag shape in the air.",
    motion: true,
  },
];
