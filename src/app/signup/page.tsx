import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { signup } from "./actions";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account to save your learning progress.",
};

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16">
      <AuthForm mode="signup" action={signup} />
    </div>
  );
}
