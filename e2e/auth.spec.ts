import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("sign up, see progress, sign out, and log back in", async ({ page }) => {
  const email = `e2e-${randomUUID()}@example.com`;
  const password = "signbright123";

  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Learner");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByLabel(/I confirm I am the learner/).check();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/progress/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Your progress" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "E2E Learner" }),
  ).toBeVisible();
  await expect(page.getByText("0 stars")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).not.toHaveURL(/\/progress/, { timeout: 20_000 });

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/progress/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Your progress" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "E2E Learner" }),
  ).toBeVisible();
});

test("registration refuses to proceed without guardian consent", async ({ page }) => {
  const email = `e2e-noconsent-${randomUUID()}@example.com`;

  await page.goto("/signup");
  await page.getByLabel("Name").fill("Consent Test");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("signbright123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(
    page.getByText(/Please confirm you have consent/),
  ).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("Consent Test");
});