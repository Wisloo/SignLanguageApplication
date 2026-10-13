"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import type { AuthFormState } from "@/app/login/actions";

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    guardianConsent: formData.get("guardianConsent") === "on",
  });

  if (!parsed.success) {
    const consentIssue = parsed.error.issues.find(
      (issue) => issue.path[0] === "guardianConsent",
    );
    if (consentIssue) {
      return { consentError: consentIssue.message };
    }
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "That email is already registered. Try logging in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      guardianConsent: true,
      consentAt: new Date(),
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/progress" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in." };
    }
    throw error;
  }
  return {};
}
