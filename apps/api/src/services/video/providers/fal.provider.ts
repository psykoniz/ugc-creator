import { createFalClient } from "@fal-ai/client";
import { getEnv } from "../../../config/index.js";
import type { VideoProvider, RenderInput, RenderStatus, RenderResult } from "../video-provider.js";

/**
 * Style-to-endpoint mapping. Different UGC styles may benefit from
 * different video generation models.
 */
const STYLE_ENDPOINTS: Record<string, string> = {
  talking_head: "fal-ai/minimax/video-01-live",
  product_demo: "fal-ai/minimax/video-01-live",
  lifestyle: "fal-ai/minimax/video-01",
  testimonial: "fal-ai/minimax/video-01-live",
  unboxing: "fal-ai/minimax/video-01-live",
};

const STYLE_ASPECT_RATIOS: Record<string, string> = {
  talking_head: "9:16",
  product_demo: "9:16",
  lifestyle: "16:9",
  testimonial: "9:16",
  unboxing: "9:16",
};

const DEFAULT_ENDPOINT = "fal-ai/minimax/video-01-live";
const DEFAULT_ASPECT_RATIO = "9:16";

/**
 * Fal.ai VideoProvider implementation.
 * Uses submit → poll → result pattern (inspired by fal video-generator-demo).
 * Endpoint and aspect ratio are now configurable per style.
 */
export class FalVideoProvider implements VideoProvider {
  private client: ReturnType<typeof createFalClient>;
  /** Tracks which endpoint was used per render request for status/result polling. */
  private renderEndpoints = new Map<string, string>();

  constructor() {
    const env = getEnv();
    this.client = createFalClient({ credentials: env.FAL_API_KEY });
  }

  private getEndpoint(style?: string): string {
    const env = getEnv();
    return env.FAL_ENDPOINT ?? (style ? STYLE_ENDPOINTS[style] : undefined) ?? DEFAULT_ENDPOINT;
  }

  private getAspectRatio(style?: string): string {
    const env = getEnv();
    return env.FAL_ASPECT_RATIO ?? (style ? STYLE_ASPECT_RATIOS[style] : undefined) ?? DEFAULT_ASPECT_RATIO;
  }

  async submitRender(input: RenderInput): Promise<string> {
    const endpoint = this.getEndpoint(input.style);
    const aspectRatio = this.getAspectRatio(input.style);

    const result = await this.client.queue.submit(endpoint, {
      input: {
        prompt: input.scriptBody,
        aspect_ratio: aspectRatio,
      },
    });
    this.renderEndpoints.set(result.request_id, endpoint);
    return result.request_id;
  }

  async getRenderStatus(renderId: string): Promise<RenderStatus> {
    const endpoint = this.renderEndpoints.get(renderId) ?? DEFAULT_ENDPOINT;
    const status = await this.client.queue.status(endpoint, {
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
    const endpoint = this.renderEndpoints.get(renderId) ?? DEFAULT_ENDPOINT;
    this.renderEndpoints.delete(renderId); // cleanup after result fetched
    const result = await this.client.queue.result(endpoint, {
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
