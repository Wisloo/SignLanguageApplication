const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:3100/signup");

  const navTypeBefore = await page.evaluate(
    () => window.performance.getEntriesByType("navigation")[0].type,
  );

  await page.getByLabel("Name").fill("Probe User");
  await page.getByLabel("Email").fill("probe@example.com");
  await page.getByLabel("Password").fill("signbright123");
  await page.getByRole("button", { name: "Create account" }).click();

  await page.getByText(/Please confirm you have consent/).waitFor({ timeout: 10000 });

  const navTypeAfter = await page.evaluate(
    () => window.performance.getEntriesByType("navigation")[0].type,
  );
  const nameValue = await page.getByLabel("Name").inputValue();

  console.log("navType before/after:", navTypeBefore, "/", navTypeAfter);
  console.log("name value after submit:", JSON.stringify(nameValue));

  await browser.close();
})();