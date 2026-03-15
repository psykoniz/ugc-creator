/**
 * Jobs Controller
 * Handles POST /api/jobs/batch, GET /api/jobs?experiment_id=..., POST /api/jobs/:id/retry
 */

import type { Context } from "hono";
import {
  CreateBatchSchema,
  ExperimentIdQuerySchema,
  MAX_RENDERS_PER_BATCH,
} from "@ugc/shared";
import { validateBodyOrError, validateQuery } from "../validators/index.js";
import { jobQueries } from "../db/queries/index.js";
import { getActiveProvider } from "../config/index.js";
import { getBatchQueue, getRenderQueue } from "../queues/index.js";

export async function handleCreateBatch(c: Context) {
  const parsed = await validateBodyOrError(c, CreateBatchSchema);
  if ("error" in parsed) return parsed.error;

  const { experimentId, scriptIds } = parsed.data;

  if (scriptIds.length > MAX_RENDERS_PER_BATCH) {
    return c.json(
      {
        error: `Maximum ${MAX_RENDERS_PER_BATCH} renders per batch`,
        details: {},
      },
      400
    );
  }

  try {
    const videoProvider = getActiveProvider("video");

    // Create job records in DB
    const jobs = await jobQueries.insertJobsBatch(
      scriptIds.map((scriptId) => ({
        experimentId,
        scriptId,
        provider: videoProvider,
      }))
    );

    // Enqueue batch processing
    const batchQueue = getBatchQueue();
    await batchQueue.add(`batch-${experimentId}`, {
      experimentId,
      jobIds: jobs.map((j) => j.id),
    });

    return c.json({ jobs }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch creation failed";
    return c.json({ error: message, details: {} }, 500);
  }
}

export async function handleGetJobs(c: Context) {
  const parsed = validateQuery(c, ExperimentIdQuerySchema);
  if ("error" in parsed) return parsed.error;

  try {
    const jobs = await jobQueries.getJobsByExperimentId(parsed.data.experiment_id);
    return c.json({ jobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return c.json({ error: message, details: {} }, 500);
  }
}

export async function handleRetryJob(c: Context) {
  const id = c.req.param("id");
  if (!id?.startsWith("job_")) {
    return c.json({ error: "Invalid job ID", details: {} }, 400);
  }

  try {
    const job = await jobQueries.getJobById(id);
    if (!job) {
      return c.json({ error: "Job not found", details: {} }, 404);
    }

    // Increment retry count and reset status
    await jobQueries.incrementRetryCount(id);

    // Re-enqueue render job
    const renderQueue = getRenderQueue();
    await renderQueue.add(`render-retry-${id}`, {
      jobId: id,
      enableTTS: false,
    });

    const updated = await jobQueries.getJobById(id);
    return c.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Retry failed";
    return c.json({ error: message, details: {} }, 500);
  }
}
