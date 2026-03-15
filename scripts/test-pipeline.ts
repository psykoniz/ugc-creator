/**
 * Test Pipeline — Validates the full V1.1 pipeline end-to-end.
 * Run with: npx tsx scripts/test-pipeline.ts
 *
 * Requires:
 * - API server running on localhost:3001
 * - PostgreSQL + Redis running (docker/docker-compose.yml)
 * - Valid provider API keys in .env
 *
 * Tests the 13 routes in order:
 * 1. Ingest (URL or prompt)
 * 2. Generate creative pack
 * 3. Create experiment
 * 4. Launch batch
 * 5. Poll jobs
 * 6. Get outputs
 * 7. Batch rating (rescore)
 * 8. Mark winner
 */

const BASE_URL = process.env.API_URL ?? "http://localhost:3001";

async function api(method: string, path: string, body?: unknown) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`FAIL ${method} ${path} (${res.status}):`, data);
    throw new Error(`${method} ${path} failed with ${res.status}`);
  }

  console.log(`OK   ${method} ${path} (${res.status})`);
  return data;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== UGC Creative Ops — Test Pipeline ===\n");
  console.log(`Target: ${BASE_URL}\n`);

  // 0. Health check
  await api("GET", "/health");

  // 1. Ingest via prompt
  console.log("\n--- Step 1: Ingest product ---");
  const ingestResult = await api("POST", "/api/ingest/prompt", {
    name: "TestProduct Pro",
    description: "A revolutionary test product for pipeline validation",
    targetAudience: "Tech-savvy early adopters aged 25-35",
    keyBenefits: [
      "Saves time",
      "Easy to use",
      "Affordable",
    ],
    tone: "playful",
  });

  const productId = ingestResult.product_id;
  console.log(`  Product ID: ${productId}`);
  console.log(`  Brief name: ${ingestResult.product_brief.name}`);

  // 2. Generate creative pack
  console.log("\n--- Step 2: Generate creative pack ---");
  const packResult = await api("POST", "/api/creative/pack", {
    productId,
  });

  const creativePackId = packResult.creative_pack.id;
  const scriptIds = packResult.scripts.map((s: { id: string }) => s.id);
  console.log(`  Pack ID: ${creativePackId}`);
  console.log(`  Hooks: ${packResult.hooks.length}`);
  console.log(`  Scripts: ${scriptIds.length}`);

  // 3. Create experiment
  console.log("\n--- Step 3: Create experiment ---");
  const experiment = await api("POST", "/api/experiments", {
    productId,
    creativePackId,
    name: "Pipeline Test Experiment",
  });

  const experimentId = experiment.id;
  console.log(`  Experiment ID: ${experimentId}`);

  // 4. Launch batch (limit to 5 scripts max for test)
  console.log("\n--- Step 4: Launch batch ---");
  const batchScriptIds = scriptIds.slice(0, 5);
  const batchResult = await api("POST", "/api/jobs/batch", {
    experimentId,
    scriptIds: batchScriptIds,
  });

  console.log(`  Jobs created: ${batchResult.jobs.length}`);

  // 5. Poll jobs until done (max 15 min)
  console.log("\n--- Step 5: Poll jobs ---");
  const maxPollTime = 15 * 60 * 1000;
  const pollStart = Date.now();
  let allDone = false;

  while (Date.now() - pollStart < maxPollTime) {
    const jobsResult = await api("GET", `/api/jobs?experiment_id=${experimentId}`);
    const jobs = jobsResult.jobs;

    const pending = jobs.filter((j: { status: string }) => j.status === "pending").length;
    const running = jobs.filter((j: { status: string }) => j.status === "running").length;
    const done = jobs.filter((j: { status: string }) => j.status === "done").length;
    const failed = jobs.filter((j: { status: string }) => j.status === "failed").length;

    console.log(`  Status: pending=${pending} running=${running} done=${done} failed=${failed}`);

    if (pending === 0 && running === 0) {
      allDone = true;
      break;
    }

    await sleep(5000);
  }

  if (!allDone) {
    console.error("  TIMEOUT: Jobs did not complete within 15 minutes");
  }

  // 6. Get outputs
  console.log("\n--- Step 6: Get outputs ---");
  const outputsResult = await api("GET", `/api/outputs?experiment_id=${experimentId}`);
  const outputs = outputsResult.outputs;
  console.log(`  Outputs: ${outputs.length}`);

  if (outputs.length === 0) {
    console.log("  No outputs to score or rank. Pipeline test partially complete.");
    console.log("\n=== Pipeline test finished (no renders completed) ===");
    return;
  }

  // 7. Batch rating (rescore)
  console.log("\n--- Step 7: Batch rating ---");
  const outputIds = outputs.map((o: { id: string }) => o.id);
  await api("POST", "/api/ratings/batch", { outputIds });

  // 8. Check top candidates
  console.log("\n--- Step 8: Check ranking ---");
  const rankedOutputs = await api("GET", `/api/outputs?experiment_id=${experimentId}`);
  const topCandidates = rankedOutputs.outputs.filter(
    (o: { isTopCandidate: boolean }) => o.isTopCandidate
  );
  console.log(`  Top candidates: ${topCandidates.length}`);

  // 9. Mark winner
  if (topCandidates.length > 0) {
    console.log("\n--- Step 9: Mark winner ---");
    const winnerId = topCandidates[0].id;
    await api("POST", `/api/outputs/${winnerId}/mark-winner`);
    console.log(`  Winner: ${winnerId}`);

    // Verify experiment has winner
    const finalExperiment = await api("GET", `/api/experiments/${experimentId}`);
    console.log(`  Experiment winner_output_id: ${finalExperiment.winnerOutputId}`);
  }

  // 10. Test mutation
  if (scriptIds.length > 0) {
    console.log("\n--- Step 10: Mutate script ---");
    const mutated = await api("POST", `/api/creative/mutate/${scriptIds[0]}`, {
      mutationType: "UGC",
    });
    console.log(`  Mutated script ID: ${mutated.id}`);
    console.log(`  Mutation type: ${mutated.mutationType}`);
    console.log(`  Parent: ${mutated.parentScriptId}`);
  }

  console.log("\n=== Pipeline test COMPLETE ===");
}

main().catch((err) => {
  console.error("\nPipeline test FAILED:", err.message);
  process.exit(1);
});
