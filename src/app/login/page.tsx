import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { login } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save your learning progress.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16">
      <AuthForm mode="login" action={login} />
    </div>
  );
}
