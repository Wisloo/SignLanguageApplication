import { expect, test } from "@playwright/test";

test("practice page loads with the camera stage", async ({ page }) => {
  await page.goto("/practice");
  await expect(
    page.getByRole("heading", { name: "Camera practice" }),
  ).toBeVisible();
  await expect(page.getByText("Your goal")).toBeVisible();
});

test("practice can be targeted at a specific letter", async ({ page }) => {
  await page.goto("/practice?lang=asl&letter=B");
  await expect(
    page.getByRole("heading", { name: "Camera practice" }),
  ).toBeVisible();
  await expect(page.getByText("Your goal")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Practise the letter B" }),
  ).toHaveAttribute("aria-pressed", "true");
});