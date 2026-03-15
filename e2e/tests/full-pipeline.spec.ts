import { test, expect, type Page } from "@playwright/test";
import { apiGet, waitForApi } from "./helpers";

/**
 * Full E2E pipeline: Intake → Create → Queue → Ranking
 *
 * Prerequisites:
 * - API running on localhost:3001 (or API_URL env var)
 * - Web running on localhost:3000 (or WEB_URL env var)
 * - PostgreSQL + Redis running
 * - Valid provider API keys configured
 *
 * This test exercises the complete operator workflow through the browser.
 */

test.describe("Full Pipeline E2E", () => {
  test.beforeAll(async () => {
    await waitForApi();
  });

  test("ingest via prompt → create pack → launch batch → monitor queue → view ranking", async ({
    page,
  }) => {
    // ─── Step 1: Intake ───
    await test.step("Navigate to intake and fill prompt form", async () => {
      await page.goto("/intake");
      await expect(page.getByText("Product Intake")).toBeVisible();

      // Select Prompt source
      await page.getByRole("button", { name: "Prompt" }).click();

      // Fill out the prompt form
      await page.getByLabel("Product Name").fill("E2E Test Product");
      await page.getByLabel("Description").fill(
        "A revolutionary test product for E2E pipeline validation"
      );
      await page.getByLabel("Target Audience").fill(
        "Tech-savvy early adopters aged 25-35"
      );
      await page.getByLabel("Tone").fill("playful");

      // Fill first benefit
      await page
        .locator('input[placeholder="e.g., saves time"]')
        .first()
        .fill("Saves time");

      // Add second benefit
      await page.getByRole("button", { name: "Add benefit" }).click();
      await page
        .locator('input[placeholder="e.g., saves time"]')
        .nth(1)
        .fill("Easy to use");
    });

    await test.step("Submit prompt form and verify brief preview", async () => {
      await page.getByRole("button", { name: "Create from Prompt" }).click();

      // Wait for API response — brief preview should appear
      await expect(
        page.getByText("Product Brief:", { exact: false })
      ).toBeVisible({ timeout: 30_000 });

      // Verify brief content
      await expect(page.getByText("E2E Test Product")).toBeVisible();
      await expect(page.getByText("Saves time")).toBeVisible();
    });

    // ─── Step 2: Create Creative Pack ───
    await test.step("Create creative pack and navigate to /create", async () => {
      await page
        .getByRole("button", { name: "Validate & Create Creative Pack" })
        .click();

      // Wait for creative pack generation — this may take time with LLM
      await expect(page).toHaveURL(/\/create/, { timeout: 120_000 });
    });

    await test.step("Verify creative pack content", async () => {
      await expect(page.getByText("Creative Pack")).toBeVisible();

      // Should have angles
      await expect(page.getByText("Angles")).toBeVisible();

      // Should have scripts table
      await expect(page.getByText("Scripts")).toBeVisible();
    });

    // ─── Step 3: Create Experiment & Launch Batch ───
    let experimentId: string;

    await test.step("Select scripts and create experiment", async () => {
      // Select first 2 scripts by clicking table rows
      const rows = page.locator("tbody tr");
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Click first row(s) to select
      const selectCount = Math.min(rowCount, 2);
      for (let i = 0; i < selectCount; i++) {
        await rows.nth(i).click();
      }

      // Verify selection count
      await expect(
        page.getByText(new RegExp(`${selectCount} /`))
      ).toBeVisible();

      // Fill experiment name
      await page
        .getByPlaceholder("e.g., Q1 Test Batch")
        .fill("E2E Test Experiment");

      // Create experiment
      await page
        .getByRole("button", { name: "Create Experiment" })
        .click();

      // Wait for experiment creation
      await expect(
        page.getByRole("button", { name: /Launch Batch/ })
      ).toBeEnabled({ timeout: 15_000 });
    });

    await test.step("Launch batch and navigate to queue", async () => {
      await page.getByRole("button", { name: /Launch Batch/ }).click();

      // Should navigate to queue
      await expect(page).toHaveURL(/\/queue/, { timeout: 15_000 });
    });

    // ─── Step 4: Monitor Queue ───
    await test.step("Verify queue shows jobs", async () => {
      await expect(page.getByText("Render Queue")).toBeVisible();

      // Should show job stats
      await expect(page.getByText("Total:")).toBeVisible({ timeout: 10_000 });

      // Should have at least pending or running jobs
      const statsText = await page.locator(".flex.gap-4.text-sm").textContent();
      expect(statsText).toContain("Total:");
    });

    await test.step("Wait for jobs to complete", async () => {
      // Poll until "View Results" button appears (all jobs done/failed)
      // or timeout after 10 minutes
      await expect(
        page.getByRole("link", { name: "View Results" })
      ).toBeVisible({ timeout: 600_000 });
    });

    // ─── Step 5: Ranking ───
    await test.step("Navigate to ranking and verify outputs", async () => {
      await page.getByRole("link", { name: "View Results" }).click();
      await expect(page).toHaveURL(/\/ranking/);

      await expect(page.getByText("Ranking Board")).toBeVisible();
    });

    await test.step("Trigger batch rating", async () => {
      // Click "Rate All" button
      const rateButton = page.getByRole("button", { name: "Rate All" });
      if (await rateButton.isEnabled()) {
        await rateButton.click();

        // Wait for rating to complete — scores should appear
        await expect(page.getByText("%")).toBeVisible({ timeout: 120_000 });
      }
    });

    await test.step("Mark winner if outputs exist", async () => {
      const markWinnerButton = page
        .getByRole("button", { name: "Mark Winner" })
        .first();

      if (await markWinnerButton.isVisible().catch(() => false)) {
        await markWinnerButton.click();

        // Verify winner badge appears
        await expect(page.getByText("WINNER")).toBeVisible({
          timeout: 10_000,
        });
      }
    });
  });
});
