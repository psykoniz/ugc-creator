import type {
  Product,
  ProductBrief,
  CreativePack,
  Hook,
  Script,
  Experiment,
  Job,
  Output,
  Rating,
  MutationType,
} from "@ugc/shared";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetcher<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      data.error || "Request failed",
      res.status,
      data.details
    );
  }

  return data as T;
}

// ─── Response types (match actual API shapes) ───

export interface IngestResponse {
  product_id: string;
  product_brief: ProductBrief;
}

export interface CreativePackResponse {
  creative_pack: CreativePack;
  hooks: Hook[];
  scripts: Script[];
}

// ─── Ingest ───

export function ingestUrl(url: string) {
  return fetcher<IngestResponse>("POST", "/api/ingest/url", { url });
}

export function ingestImages(data: {
  imageUrls: string[];
  name: string;
  description: string;
}) {
  return fetcher<IngestResponse>("POST", "/api/ingest/images", data);
}

export function ingestPrompt(data: {
  name: string;
  description: string;
  targetAudience: string;
  keyBenefits: string[];
  tone: string;
}) {
  return fetcher<IngestResponse>("POST", "/api/ingest/prompt", data);
}

// ─── Creative ───

export function createCreativePack(productId: string) {
  return fetcher<CreativePackResponse>("POST", "/api/creative/pack", {
    productId,
  });
}

export function mutateScript(scriptId: string, mutationType: MutationType) {
  return fetcher<Script>("POST", `/api/creative/mutate/${scriptId}`, {
    mutationType,
  });
}

// ─── Experiments ───

export function createExperiment(data: {
  productId: string;
  creativePackId: string;
  name: string;
}) {
  return fetcher<Experiment>("POST", "/api/experiments", data);
}

export function getExperiment(id: string) {
  return fetcher<Experiment>("GET", `/api/experiments/${id}`);
}

// ─── Jobs ───

export function createBatch(experimentId: string, scriptIds: string[]) {
  return fetcher<{ jobs: Job[] }>("POST", "/api/jobs/batch", {
    experimentId,
    scriptIds,
  });
}

export function getJobs(experimentId: string) {
  return fetcher<{ jobs: Job[] }>(
    "GET",
    `/api/jobs?experiment_id=${experimentId}`
  );
}

export function retryJob(jobId: string) {
  return fetcher<Job>("POST", `/api/jobs/${jobId}/retry`);
}

// ─── Outputs ───

export function getOutputs(experimentId: string) {
  return fetcher<{ outputs: Output[] }>(
    "GET",
    `/api/outputs?experiment_id=${experimentId}`
  );
}

export function markWinner(outputId: string) {
  return fetcher<{ success: boolean; winner_output_id: string }>(
    "POST",
    `/api/outputs/${outputId}/mark-winner`
  );
}

// ─── Ratings ───

export function batchRate(outputIds: string[]) {
  return fetcher<{ success: boolean; scored: number }>(
    "POST",
    "/api/ratings/batch",
    { outputIds }
  );
}

export { ApiError };
