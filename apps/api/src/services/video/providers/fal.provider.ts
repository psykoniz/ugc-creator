import { createFalClient } from "@fal-ai/client";
import { getEnv } from "../../../config/index.js";
import type { VideoProvider, RenderInput, RenderStatus, RenderResult } from "../video-provider.js";

/**
 * Fal.ai VideoProvider implementation.
 * Uses submit → poll → result pattern (inspired by fal video-generator-demo).
 */
export class FalVideoProvider implements VideoProvider {
  private client: ReturnType<typeof createFalClient>;
  private endpoint: string;

  constructor() {
    const env = getEnv();
    this.client = createFalClient({ credentials: env.FAL_API_KEY });
    // TODO(V1.2): make endpoint configurable per style/model
    this.endpoint = "fal-ai/minimax/video-01-live";
  }

  async submitRender(input: RenderInput): Promise<string> {
    const result = await this.client.queue.submit(this.endpoint, {
      input: {
        prompt: input.scriptBody,
        aspect_ratio: "9:16",
      },
    });
    return result.request_id;
  }

  async getRenderStatus(renderId: string): Promise<RenderStatus> {
    const status = await this.client.queue.status(this.endpoint, {
      requestId: renderId,
      logs: true,
    });

    const statusMap: Record<string, RenderStatus["status"]> = {
      IN_QUEUE: "pending",
      IN_PROGRESS: "running",
      COMPLETED: "completed",
      FAILED: "failed",
    };

    const statusAny = status as unknown as Record<string, unknown>;
    const logs = statusAny.logs as Array<{ message: string }> | undefined;
    const lastLog = logs?.length
      ? logs[logs.length - 1]?.message
      : undefined;

    return {
      status: statusMap[status.status] ?? "pending",
      progress: lastLog,
    };
  }

  async getRenderResult(renderId: string): Promise<RenderResult> {
    const result = await this.client.queue.result(this.endpoint, {
      requestId: renderId,
    });

    const data = result.data as Record<string, unknown>;
    const videoUrl = (data.video as { url: string })?.url ?? (data as { url?: string }).url;

    if (!videoUrl || typeof videoUrl !== "string") {
      throw new Error("Fal render result missing video URL");
    }

    return {
      videoUrl,
      thumbnailUrl: undefined, // TODO(V1.2): extract thumbnail from video
      duration: undefined, // TODO(V1.2): extract duration via FFmpeg metadata
    };
  }
}
