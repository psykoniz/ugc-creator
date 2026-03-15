import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage redirects to /intake", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/intake/);
  });

  test("navigation tabs are visible", async ({ page }) => {
    await page.goto("/intake");
    await expect(page.getByRole("link", { name: "Intake" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Queue" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ranking" })).toBeVisible();
  });

  test("intake page shows source selector and URL form", async ({ page }) => {
    await page.goto("/intake");
    await expect(page.getByText("Product Intake")).toBeVisible();
    await expect(page.getByRole("button", { name: "URL" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Images" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Prompt" })).toBeVisible();
  });

  test("switching source type shows correct form", async ({ page }) => {
    await page.goto("/intake");

    // Default: URL form
    await expect(page.getByLabel("Product URL")).toBeVisible();

    // Switch to Prompt
    await page.getByRole("button", { name: "Prompt" }).click();
    await expect(page.getByLabel("Product Name")).toBeVisible();
    await expect(page.getByLabel("Target Audience")).toBeVisible();
    await expect(page.getByLabel("Tone")).toBeVisible();

    // Switch to Images
    await page.getByRole("button", { name: "Images" }).click();
    await expect(page.getByLabel("Product Name")).toBeVisible();
    await expect(page.getByText("Image URLs")).toBeVisible();
  });

  test("create page shows empty state without session data", async ({ page }) => {
    await page.goto("/create");
    await expect(
      page.getByText("No creative pack found")
    ).toBeVisible();
  });

  test("queue page shows empty state without session data", async ({ page }) => {
    await page.goto("/queue");
    await expect(
      page.getByText("No experiment found")
    ).toBeVisible();
  });

  test("ranking page shows empty state without session data", async ({ page }) => {
    await page.goto("/ranking");
    await expect(
      page.getByText("No experiment found")
    ).toBeVisible();
  });
});
