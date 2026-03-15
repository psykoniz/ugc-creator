/**
 * Batch Worker
 * Orchestrates a full batch: enqueues render jobs, waits for completion,
 * then runs batch scoring to select top candidates.
 */

import { Worker } from "bullmq";
import { getRedisConnectionOpts, getRenderQueue, type BatchJobData } from "../queues/index.js";
import { scoreBatch } from "../engines/ranking-engine.js";
import { jobQueries, outputQueries } from "../db/queries/index.js";

export function createBatchWorker() {
  const worker = new Worker<BatchJobData>(
    "batch",
    async (bullJob) => {
      const { experimentId, jobIds } = bullJob.data;
      const renderQueue = getRenderQueue();

      // 1. Enqueue all render jobs
      for (const jobId of jobIds) {
        await renderQueue.add(`render-${jobId}`, {
          jobId,
          enableTTS: false, // TODO(V1.2): make TTS configurable per batch
        });
      }

      // 2. Poll until all jobs are done or failed
      const maxWaitMs = 15 * 60 * 1000; // 15 minutes
      const pollIntervalMs = 5000;
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitMs) {
        const jobs = await jobQueries.getJobsByExperimentId(experimentId);
        const relevantJobs = jobs.filter((j) => jobIds.includes(j.id));

        const allDone = relevantJobs.every(
          (j) => j.status === "done" || j.status === "failed"
        );

        if (allDone) break;

        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      }

      // 3. Collect completed outputs and run batch scoring
      const outputs = await outputQueries.getOutputsByExperimentId(experimentId);
      const outputIds = outputs.map((o) => o.id);

      if (outputIds.length > 0) {
        await scoreBatch(outputIds);
      }

      return { experimentId, outputCount: outputIds.length };
    },
    {
      connection: getRedisConnectionOpts(),
      concurrency: 1, // one batch at a time
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Batch job for experiment ${job?.data?.experimentId} failed:`, err.message);
  });

  return worker;
}
