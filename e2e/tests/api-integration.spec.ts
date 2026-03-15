import { test, expect } from "@playwright/test";
import { apiPost, apiGet, waitForApi, API_URL } from "./helpers";

/**
 * API integration tests — validates the backend endpoints directly.
 *
 * These tests don't use the browser, they call the API directly.
 * They serve as a typed, structured replacement for scripts/test-pipeline.ts.
 */

test.describe("API Integration", () => {
  test.beforeAll(async () => {
    await waitForApi();
  });

  test("health check", async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.ok).toBe(true);
  });

  test("ingest → creative pack → experiment → batch → jobs → outputs → rating → winner", async () => {
    // 1. Ingest via prompt
    const ingest = await apiPost<{
      product_id: string;
      product_brief: { name: string };
    }>("/api/ingest/prompt", {
      name: "API Test Product",
      description: "An automated test product",
      targetAudience: "Developers",
      keyBenefits: ["Fast", "Reliable"],
      tone: "professional",
    });

    expect(ingest.product_id).toMatch(/^prod_/);
    expect(ingest.product_brief.name).toBeTruthy();
    const productId = ingest.product_id;

    // 2. Generate creative pack
    const pack = await apiPost<{
      creative_pack: { id: string; angles: string[] };
      hooks: { id: string }[];
      scripts: { id: string }[];
    }>("/api/creative/pack", { productId });

    expect(pack.creative_pack.id).toMatch(/^cpk_/);
    expect(pack.creative_pack.angles.length).toBeGreaterThan(0);
    expect(pack.hooks.length).toBeGreaterThan(0);
    expect(pack.scripts.length).toBeGreaterThan(0);

    const creativePackId = pack.creative_pack.id;
    const scriptIds = pack.scripts.map((s) => s.id);

    // 3. Create experiment
    const experiment = await apiPost<{ id: string }>("/api/experiments", {
      productId,
      creativePackId,
      name: "API Integration Test",
    });

    expect(experiment.id).toMatch(/^exp_/);
    const experimentId = experiment.id;

    // 4. Launch batch (limit to 3)
    const batch = await apiPost<{
      jobs: { id: string; status: string }[];
    }>("/api/jobs/batch", {
      experimentId,
      scriptIds: scriptIds.slice(0, 3),
    });

    expect(batch.jobs.length).toBeGreaterThan(0);
    expect(batch.jobs[0].id).toMatch(/^job_/);

    // 5. Poll jobs until complete (max 10 minutes)
    const maxPollMs = 10 * 60 * 1000;
    const pollStart = Date.now();
    let allFinished = false;

    while (Date.now() - pollStart < maxPollMs) {
      const jobsResult = await apiGet<{
        jobs: { status: string }[];
      }>(`/api/jobs?experiment_id=${experimentId}`);

      const pending = jobsResult.jobs.filter(
        (j) => j.status === "pending" || j.status === "running"
      ).length;

      if (pending === 0) {
        allFinished = true;
        break;
      }

      await new Promise((r) => setTimeout(r, 5000));
    }

    expect(allFinished).toBe(true);

    // 6. Get outputs
    const outputsResult = await apiGet<{
      outputs: { id: string; videoUrl: string; isTopCandidate: boolean }[];
    }>(`/api/outputs?experiment_id=${experimentId}`);

    // Some jobs may fail depending on provider config — that's OK
    if (outputsResult.outputs.length === 0) {
      test.skip(true, "No outputs generated — provider may not be configured");
      return;
    }

    expect(outputsResult.outputs[0].id).toMatch(/^out_/);

    // 7. Batch rating
    const outputIds = outputsResult.outputs.map((o) => o.id);
    const rateResult = await apiPost<{ success: boolean; scored: number }>(
      "/api/ratings/batch",
      { outputIds }
    );

    expect(rateResult.success).toBe(true);
    expect(rateResult.scored).toBe(outputIds.length);

    // 8. Verify scores applied
    const scoredOutputs = await apiGet<{
      outputs: {
        id: string;
        finalScore: number | null;
        isTopCandidate: boolean;
      }[];
    }>(`/api/outputs?experiment_id=${experimentId}`);

    const scored = scoredOutputs.outputs.filter((o) => o.finalScore !== null);
    expect(scored.length).toBeGreaterThan(0);

    // 9. Mark winner
    const winnerId = scoredOutputs.outputs[0].id;
    const winnerResult = await apiPost<{
      success: boolean;
      winner_output_id: string;
    }>(`/api/outputs/${winnerId}/mark-winner`);

    expect(winnerResult.success).toBe(true);
    expect(winnerResult.winner_output_id).toBe(winnerId);

    // 10. Verify experiment has winner
    const finalExp = await apiGet<{ winnerOutputId: string | null }>(
      `/api/experiments/${experimentId}`
    );
    expect(finalExp.winnerOutputId).toBe(winnerId);

    // 11. Test mutation
    const mutated = await apiPost<{
      id: string;
      mutationType: string;
      parentScriptId: string;
    }>(`/api/creative/mutate/${scriptIds[0]}`, { mutationType: "UGC" });

    expect(mutated.id).toMatch(/^scr_/);
    expect(mutated.mutationType).toBe("UGC");
    expect(mutated.parentScriptId).toBe(scriptIds[0]);
  });

  test("ingest validation errors", async () => {
    // Missing required fields should fail
    const res = await fetch(`${API_URL}/api/ingest/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test" }),
    });
    expect(res.ok).toBe(false);
  });

  test("batch size limit enforced", async () => {
    // Create a product + pack first
    const ingest = await apiPost<{ product_id: string }>(
      "/api/ingest/prompt",
      {
        name: "Limit Test",
        description: "Testing batch limits",
        targetAudience: "Testers",
        keyBenefits: ["Testing"],
        tone: "neutral",
      }
    );

    const pack = await apiPost<{
      creative_pack: { id: string };
      scripts: { id: string }[];
    }>("/api/creative/pack", { productId: ingest.product_id });

    const experiment = await apiPost<{ id: string }>("/api/experiments", {
      productId: ingest.product_id,
      creativePackId: pack.creative_pack.id,
      name: "Limit Test Experiment",
    });

    // Try to submit more than MAX_RENDERS_PER_BATCH (20) scripts
    const fakeIds = Array.from({ length: 21 }, (_, i) => `scr_fake${i}`);
    const res = await fetch(`${API_URL}/api/jobs/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experimentId: experiment.id,
        scriptIds: fakeIds,
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Maximum");
  });
});
