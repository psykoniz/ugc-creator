/**
 * Ingest Controller
 * Handles POST /api/ingest/url, /images, /prompt
 * Returns { product_id, product_brief }
 */

import type { Context } from "hono";
import { IngestUrlSchema, IngestImagesSchema, IngestPromptSchema } from "@ugc/shared";
import { validateBodyOrError } from "../validators/index.js";
import { ingestFromUrl, ingestFromImages, ingestFromPrompt } from "../engines/ingestion-engine.js";

export async function handleIngestUrl(c: Context) {
  const parsed = await validateBodyOrError(c, IngestUrlSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await ingestFromUrl(parsed.data.url);
    return c.json(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed";
    return c.json({ error: message, details: {} }, 500);
  }
}

export async function handleIngestImages(c: Context) {
  const parsed = await validateBodyOrError(c, IngestImagesSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await ingestFromImages(parsed.data);
    return c.json(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed";
    return c.json({ error: message, details: {} }, 500);
  }
}

export async function handleIngestPrompt(c: Context) {
  const parsed = await validateBodyOrError(c, IngestPromptSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await ingestFromPrompt(parsed.data);
    return c.json(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed";
    return c.json({ error: message, details: {} }, 500);
  }
}
