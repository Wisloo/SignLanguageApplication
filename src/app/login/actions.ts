"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type AuthFormState = { error?: string; consentError?: string };

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/progress",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "That email and password do not match. Please try again." };
    }
    throw error;
  }
  return {};
}
