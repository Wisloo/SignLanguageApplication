"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthAction = (
  prev: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: AuthAction;
}) {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(
    action,
    {},
  );

  const isLogin = mode === "login";

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-muted">
          {isLogin
            ? "Sign in to keep track of the letters you practise."
            : "A calm place to save your progress. Only your email and progress are stored."}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {!isLogin ? (
          <Input
            label="Name"
            name="name"
            autoComplete="name"
            required
            placeholder="Alex"
          />
        ) : null}
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={8}
          hint={isLogin ? undefined : "At least 8 characters."}
        />

        {!isLogin ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3 rounded-2xl border-2 border-foreground bg-muted-bg p-4 shadow-pop-sm">
              <input
                id="guardian-consent"
                name="guardianConsent"
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-[#8B5CF6]"
              />
              <label
                htmlFor="guardian-consent"
                className="text-sm leading-relaxed text-muted"
              >
                I confirm I am the learner&apos;s parent, guardian, or teacher,
                and I give consent for SignBright to save this
                account&apos;s learning progress.
              </label>
            </div>
            {state.consentError ? (
              <p role="alert" className="text-sm font-medium text-danger">
                {state.consentError}
              </p>
            ) : null}
          </div>
        ) : null}

        {state.error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending
            ? isLogin
              ? "Signing in…"
              : "Creating account…"
            : isLogin
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {isLogin ? (
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="rounded font-bold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="rounded font-bold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
