/**
 * VideoProvider interface — abstracts video rendering services.
 * Engines must use this interface, never the SDK directly.
 */

export interface RenderInput {
  scriptBody: string;
  style: string;
  audioUrl?: string;
}

export interface RenderStatus {
  status: "pending" | "running" | "completed" | "failed";
  progress?: string;
}

export interface RenderResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface VideoProvider {
  submitRender(input: RenderInput): Promise<string>;
  getRenderStatus(renderId: string): Promise<RenderStatus>;
  getRenderResult(renderId: string): Promise<RenderResult>;
}
