/**
 * Render Worker
 * Processes individual render jobs: render Lite + scoring.
 * Used for single renders and also called by batch worker.
 */

import { Worker } from "bullmq";
import { getRedisConnectionOpts, type RenderJobData } from "../queues/index.js";
import { renderLite } from "../engines/render-engine.js";
import { scoreOutput } from "../engines/ranking-engine.js";
import { jobQueries, outputQueries } from "../db/queries/index.js";

export function createRenderWorker() {
  const worker = new Worker<RenderJobData>(
    "render",
    async (bullJob) => {
      const { jobId, enableTTS } = bullJob.data;

      try {
        // 1. Update job status to running
        await jobQueries.updateJobStatus(jobId, "running", {
          startedAt: new Date().toISOString(),
        });

        // 2. Run Render Lite pipeline
        const renderResult = await renderLite({
          scriptId: (await jobQueries.getJobById(jobId))!.scriptId,
          enableTTS,
        });

        // 3. Get the job for experiment reference
        const job = await jobQueries.getJobById(jobId);
        if (!job) throw new Error(`Job not found: ${jobId}`);

        // 4. Persist output
        const output = await outputQueries.insertOutput({
          jobId,
          experimentId: job.experimentId,
          videoUrl: renderResult.videoUrl,
          thumbnailUrl: renderResult.thumbnailUrl,
          duration: renderResult.duration,
        });

        // 5. Score the output automatically
        await scoreOutput(output.id);

        // 6. Mark job as done
        await jobQueries.updateJobStatus(jobId, "done", {
          completedAt: new Date().toISOString(),
        });

        return { outputId: output.id };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        await jobQueries.updateJobStatus(jobId, "failed", { error: message });
        throw error;
      }
    },
    {
      connection: getRedisConnectionOpts(),
      concurrency: 3,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Render job ${job?.data?.jobId} failed:`, err.message);
  });

  return worker;
}
