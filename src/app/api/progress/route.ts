import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { progressSchema } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { lastPractisedAt: "desc" },
  });

  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { language, letter, success } = parsed.data;
  const userId = session.user.id;

  const progress = await prisma.progress.upsert({
    where: { userId_language_letter: { userId, language, letter } },
    create: {
      userId,
      language,
      letter,
      attempts: 1,
      successes: success ? 1 : 0,
      stars: success ? 1 : 0,
    },
    update: {
      attempts: { increment: 1 },
      successes: success ? { increment: 1 } : undefined,
      stars: success ? { increment: 1 } : undefined,
      lastPractisedAt: new Date(),
    },
  });

  return NextResponse.json({ progress });
}
