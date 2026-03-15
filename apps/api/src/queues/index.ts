/**
 * BullMQ queue definitions.
 * Two queues: batch (orchestrates full batch) and render (single render job).
 */

import { Queue } from "bullmq";
import { getEnv } from "../config/index.js";

export function getRedisConnectionOpts() {
  const env = getEnv();
  // Parse redis URL into host/port for BullMQ compatibility
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    maxRetriesPerRequest: null as null,
  };
}

// ─── Queue definitions ───

let _batchQueue: Queue | null = null;
let _renderQueue: Queue | null = null;

export interface BatchJobData {
  experimentId: string;
  jobIds: string[];
}

export interface RenderJobData {
  jobId: string;
  enableTTS: boolean;
}

export function getBatchQueue(): Queue<BatchJobData> {
  if (!_batchQueue) {
    _batchQueue = new Queue("batch", { connection: getRedisConnectionOpts() });
  }
  return _batchQueue as Queue<BatchJobData>;
}

export function getRenderQueue(): Queue<RenderJobData> {
  if (!_renderQueue) {
    _renderQueue = new Queue("render", { connection: getRedisConnectionOpts() });
  }
  return _renderQueue as Queue<RenderJobData>;
}
