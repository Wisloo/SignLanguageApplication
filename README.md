This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Cloud recognition (optional)

Camera practice lives on one page, `/practice`, with a **Letters** ⇄ **Sentences**
toggle (`/practice?mode=sentences`, and `/practice/sentences` redirects there).

- **Letters** run on-device first. MediaPipe hand landmarks feed a small
  learned model that covers all 26 letters and auto-grades practice and quizzes.
  When the model file is missing the app falls back to built-in heuristics for
  nine well-separated letters (B, D, F, I, L, U, V, W, Y) and a friendly
  self-check for the rest. As an opt-in extra, a learner can press
  **"Let the camera check"** to send a ~2.5s clip to the Google Gemini API.
- **Sentences** send a short webcam clip to the Google Gemini API and show the
  signed word or phrase written out in English.

Both cloud paths use the same config:

- Set `GEMINI_API_KEY` in `.env` (get one from Google AI Studio). Optionally set
  `GEMINI_MODEL` to pick a model — the default is `gemini-3.6-flash`.
- Recognition routes are `POST /api/asl/letter` and `POST /api/asl/translate`.
- This uses the Gemini **free tier**: it is rate-limited, latency is a few
  seconds per clip, and free-tier inputs **may be used to improve Google's
  products**. Only use it with consent, and prefer short clips.
- Recognition is best-effort on short, clearly-signed words. It is not a fluent
  continuous translator, and the on-device letter practice/quiz do not depend on it.

## Sign reference images

Each letter page shows a handshape picture a learner can copy, bundled in
`public/signs/<lang>/<letter>.png` and wired via `LetterContent.imageSrc`:

- **ASL** — public domain (wpclipart.com "American ABCs", mirrored on Wikimedia
  Commons); see `public/signs/asl/CREDITS.md`.
- **FSL** — CC0/public domain, one representative frame per letter from the
  `japorton/fsl-dataset`; see `public/signs/fsl/CREDITS.md`. Regenerate with
  `scripts/train/make_reference_images.py`.

J and Z are motion letters, so their images show the starting pose with an arrow
overlay plus the movement text.

## Train the fingerspelling model (optional)

The on-device letter recogniser loads a small landmark model from
`public/models/letters-<lang>.json`. Without it the app falls back to heuristics
for a subset of letters. To produce a model that covers all 26 letters
(and the `none` class), run the offline pipeline in `scripts/train/` via Colab:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Wisloo/SignLanguageApplication/blob/main/notebooks/train_fingerspelling_colab.ipynb)

The notebook downloads a public dataset, cleans it, extracts MediaPipe hand
landmarks, trains a small MLP and exports the JSON weights. Drop the result at
`public/models/letters-asl.json` (or `letters-fsl.json`); the app grades every
letter through it and runs the forward pass in plain TypeScript, so no ML
runtime ships to the browser. The pipeline shares its landmark normalisation
with `src/lib/vision/normalize.ts` — keep the two in sync.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
