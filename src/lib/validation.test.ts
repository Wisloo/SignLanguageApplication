import { describe, expect, it } from "vitest";
import { credentialsSchema, progressSchema, registerSchema } from "./validation";

describe("credentialsSchema", () => {
  it("accepts a valid email (trimmed and lowercased) and password", () => {
    const result = credentialsSchema.safeParse({
      email: "  Learner@Example.COM ",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("learner@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = credentialsSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = credentialsSchema.safeParse({
      email: "a@b.co",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("requires guardian consent to be ticked", () => {
    const withConsent = registerSchema.safeParse({
      name: "Alex",
      email: "a@b.co",
      password: "password123",
      guardianConsent: true,
    });
    expect(withConsent.success).toBe(true);

    const withoutConsent = registerSchema.safeParse({
      name: "Alex",
      email: "a@b.co",
      password: "password123",
      guardianConsent: false,
    });
    expect(withoutConsent.success).toBe(false);
  });

  it("normalises the name", () => {
    const result = registerSchema.safeParse({
      name: "  Alex  ",
      email: "a@b.co",
      password: "password123",
      guardianConsent: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Alex");
    }
  });
});

describe("progressSchema", () => {
  it("uppercases and accepts a single letter", () => {
    const result = progressSchema.safeParse({ language: "asl", letter: "a" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.letter).toBe("A");
    }
  });

  it("rejects an unknown language or wrong letter length", () => {
    expect(progressSchema.safeParse({ language: "xyz", letter: "A" }).success).toBe(false);
    expect(progressSchema.safeParse({ language: "asl", letter: "AB" }).success).toBe(false);
  });
});