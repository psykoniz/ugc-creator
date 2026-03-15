/**
 * Experiments Controller
 * Handles POST /api/experiments and GET /api/experiments/:id
 */

import type { Context } from "hono";
import { CreateExperimentSchema } from "@ugc/shared";
import { validateBodyOrError } from "../validators/index.js";
import { experimentQueries } from "../db/queries/index.js";

export async function handleCreateExperiment(c: Context) {
  const parsed = await validateBodyOrError(c, CreateExperimentSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const experiment = await experimentQueries.insertExperiment(parsed.data);
    return c.json(experiment, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Experiment creation failed";
    return c.json({ error: message, details: {} }, 500);
  }
}

export async function handleGetExperiment(c: Context) {
  const id = c.req.param("id");
  if (!id?.startsWith("exp_")) {
    return c.json({ error: "Invalid experiment ID", details: {} }, 400);
  }

  try {
    const experiment = await experimentQueries.getExperimentById(id);
    if (!experiment) {
      return c.json({ error: "Experiment not found", details: {} }, 404);
    }
    return c.json(experiment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch experiment";
    return c.json({ error: message, details: {} }, 500);
  }
}
