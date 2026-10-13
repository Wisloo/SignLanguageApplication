import { expect, test } from "@playwright/test";

test("landing page introduces the app", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start learning" })).toBeVisible();
});

test("primary navigation links work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Quiz", exact: true }).click();
  await expect(page).toHaveURL(/\/quiz/);
  await expect(page.getByRole("heading", { name: "Ready to play?" })).toBeVisible();

  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/learn/);
  await expect(
    page.getByRole("heading", { name: "The fingerspelling alphabet" }),
  ).toBeVisible();
});

test("sign in entry point is reachable from the nav", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});