import { NextResponse } from "next/server";
import { recognizeSentence } from "@/lib/asl/gemini";
import { SentenceRecognitionError } from "@/lib/asl/types";

const MAX_CLIP_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "That did not arrive properly." }, { status: 400 });
  }

  const clip = formData.get("clip");
  if (!(clip instanceof Blob) || clip.size === 0) {
    return NextResponse.json(
      { error: "There was no clip to read. Please record again." },
      { status: 400 },
    );
  }

  if (clip.size > MAX_CLIP_BYTES) {
    return NextResponse.json(
      { error: "That clip was a little long. Try a shorter one." },
      { status: 413 },
    );
  }

  const data = Buffer.from(await clip.arrayBuffer()).toString("base64");
  const mimeType = clip.type || "video/webm";

  try {
    const { text } = await recognizeSentence({ data, mimeType });
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof SentenceRecognitionError && error.code === "config") {
      return NextResponse.json(
        { error: "Sentence recognition is not set up yet." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "I could not read that one. Let us try again." },
      { status: 502 },
    );
  }
}
