# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> registration refuses to proceed without guardian consent
- Location: e2e\auth.spec.ts:41:5

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByLabel('Name')
Expected: "Consent Test"
Received: ""
Timeout:  15000ms

Call log:
  - Expect "toHaveValue" getByLabel('Name') with timeout 15000ms
  - waiting for getByLabel('Name')
    33 × locator resolved to <input id="name" required="" name="name" placeholder="Alex" autocomplete="name" class="h-12 w-full rounded-2xl bg-surface px-4 text-foreground shadow-inset outline-none placeholder:text-placeholder transition duration-300 ease-out focus:shadow-inset-deep focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"/>
       - unexpected value ""

```

```yaml
- textbox "Name":
  - /placeholder: Alex
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { randomUUID } from "node:crypto";
  3  | 
  4  | test("sign up, see progress, sign out, and log back in", async ({ page }) => {
  5  |   const email = `e2e-${randomUUID()}@example.com`;
  6  |   const password = "signbright123";
  7  | 
  8  |   await page.goto("/signup");
  9  |   await page.getByLabel("Name").fill("E2E Learner");
  10 |   await page.getByLabel("Email").fill(email);
  11 |   await page.getByLabel("Password").fill(password);
  12 |   await page.getByLabel(/I confirm I am the learner/).check();
  13 |   await page.getByRole("button", { name: "Create account" }).click();
  14 | 
  15 |   await expect(page).toHaveURL(/\/progress/, { timeout: 20_000 });
  16 |   await expect(
  17 |     page.getByRole("heading", { name: "Your progress" }),
  18 |   ).toBeVisible();
  19 |   await expect(
  20 |     page.getByRole("heading", { name: "E2E Learner" }),
  21 |   ).toBeVisible();
  22 |   await expect(page.getByText("0 stars")).toBeVisible();
  23 | 
  24 |   await page.getByRole("button", { name: "Sign out" }).click();
  25 |   await expect(page).not.toHaveURL(/\/progress/, { timeout: 20_000 });
  26 | 
  27 |   await page.goto("/login");
  28 |   await page.getByLabel("Email").fill(email);
  29 |   await page.getByLabel("Password").fill(password);
  30 |   await page.getByRole("button", { name: "Sign in" }).click();
  31 | 
  32 |   await expect(page).toHaveURL(/\/progress/, { timeout: 20_000 });
  33 |   await expect(
  34 |     page.getByRole("heading", { name: "Your progress" }),
  35 |   ).toBeVisible();
  36 |   await expect(
  37 |     page.getByRole("heading", { name: "E2E Learner" }),
  38 |   ).toBeVisible();
  39 | });
  40 | 
  41 | test("registration refuses to proceed without guardian consent", async ({ page }) => {
  42 |   const email = `e2e-noconsent-${randomUUID()}@example.com`;
  43 | 
  44 |   await page.goto("/signup");
  45 |   await page.getByLabel("Name").fill("Consent Test");
  46 |   await page.getByLabel("Email").fill(email);
  47 |   await page.getByLabel("Password").fill("signbright123");
  48 |   await page.getByRole("button", { name: "Create account" }).click();
  49 | 
  50 |   await expect(
  51 |     page.getByText(/Please confirm you have consent/),
  52 |   ).toBeVisible();
> 53 |   await expect(page.getByLabel("Name")).toHaveValue("Consent Test");
     |                                         ^ Error: expect(locator).toHaveValue(expected) failed
  54 | });
```