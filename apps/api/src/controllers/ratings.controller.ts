/**
 * Ratings Controller
 * Handles POST /api/ratings/batch — manual rescore/recalculate
 * Primary scoring happens automatically in the render worker.
 */

import type { Context } from "hono";
import { BatchRatingSchema } from "@ugc/shared";
import { validateBodyOrError } from "../validators/index.js";
import { scoreBatch } from "../engines/ranking-engine.js";

export async function handleBatchRating(c: Context) {
  const parsed = await validateBodyOrError(c, BatchRatingSchema);
  if ("error" in parsed) return parsed.error;

  try {
    await scoreBatch(parsed.data.outputIds);
    return c.json({ success: true, scored: parsed.data.outputIds.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch rating failed";
    return c.json({ error: message, details: {} }, 500);
  }
}
