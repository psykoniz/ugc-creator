/**
 * Outputs Controller
 * Handles GET /api/outputs?experiment_id=... and POST /api/outputs/:id/mark-winner
 */

import type { Context } from "hono";
import { ExperimentIdQuerySchema } from "@ugc/shared";
import { validateQuery } from "../validators/index.js";
import { outputQueries } from "../db/queries/index.js";

export async function handleGetOutputs(c: Context) {
  const parsed = validateQuery(c, ExperimentIdQuerySchema);
  if ("error" in parsed) return parsed.error;

  try {
    const outputs = await outputQueries.getOutputsByExperimentId(
      parsed.data.experiment_id
    );
    return c.json({ outputs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch outputs";
    return c.json({ error: message, details: {} }, 500);
  }
}

export async function handleMarkWinner(c: Context) {
  const id = c.req.param("id");
  if (!id?.startsWith("out_")) {
    return c.json({ error: "Invalid output ID", details: {} }, 400);
  }

  try {
    // Find the output to get the experiment ID
    const { getDb, schema } = await import("../db/index.js");
    const { eq } = await import("drizzle-orm");
    const db = getDb();

    const output = await db.query.outputs.findFirst({
      where: eq(schema.outputs.id, id),
    });

    if (!output) {
      return c.json({ error: "Output not found", details: {} }, 404);
    }

    // Atomic winner marking:
    // 1. Reset all outputs for experiment to is_winner = false
    // 2. Set this output to is_winner = true
    // 3. Update experiments.winner_output_id
    await outputQueries.markWinner(id, output.experimentId);

    return c.json({ success: true, winner_output_id: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mark winner failed";
    return c.json({ error: message, details: {} }, 500);
  }
}
