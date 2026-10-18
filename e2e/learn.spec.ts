import { expect, test } from "@playwright/test";

test("alphabet page shows letters", async ({ page }) => {
  await page.goto("/learn");

  await expect(
    page.getByRole("heading", { name: "The fingerspelling alphabet" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Letter A" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "FSL" })).toHaveCount(0);
});

test("letter detail page describes the sign", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "Letter A" }).click();

  await expect(page).toHaveURL(/\/learn\/asl\/a/);
  await expect(
    page.getByRole("heading", { name: "How to make it" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Memory tip" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Practice this letter" }),
  ).toBeVisible();
});