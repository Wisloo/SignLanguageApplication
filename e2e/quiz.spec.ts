import { expect, test } from "@playwright/test";

test("a self-check quiz can be completed without a camera", async ({ page }) => {
  await page.goto("/quiz");

  await expect(page.getByRole("heading", { name: "Ready to play?" })).toBeVisible();
  await page.getByRole("button", { name: /Self-check/ }).click();
  await page.getByRole("button", { name: "Start the quiz" }).click();

  for (let round = 0; round < 7; round += 1) {
    await page.getByRole("button", { name: "I made this sign" }).click();
    await page.getByRole("button", { name: "Next letter" }).click();
  }

  await page.getByRole("button", { name: "I made this sign" }).click();
  await page.getByRole("button", { name: "Finish" }).click();

  await expect(
    page.getByRole("heading", { name: "Great practising!" }),
  ).toBeVisible();
  await expect(page.getByText("8 of 8")).toBeVisible();
});

test("camera mode is offered but not required", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page.getByRole("button", { name: /With camera/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: /Self-check/ }).click();
  await expect(page.getByRole("button", { name: /Self-check/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});