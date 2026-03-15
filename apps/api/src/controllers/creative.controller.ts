/**
 * Creative Controller
 * Handles POST /api/creative/pack and POST /api/creative/mutate/:scriptId
 */

import type { Context } from "hono";
import { CreateCreativePackSchema, MutateScriptSchema } from "@ugc/shared";
import { validateBodyOrError } from "../validators/index.js";
import { generateCreativePack, mutateScript } from "../engines/creative-engine.js";

export async function handleCreatePack(c: Context) {
  const parsed = await validateBodyOrError(c, CreateCreativePackSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await generateCreativePack(parsed.data.productId);
    return c.json(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Creative pack generation failed";
    return c.json({ error: message, details: {} }, 500);
  }
}

export async function handleMutateScript(c: Context) {
  const scriptId = c.req.param("scriptId");
  if (!scriptId?.startsWith("scr_")) {
    return c.json({ error: "Invalid script ID", details: {} }, 400);
  }

  const parsed = await validateBodyOrError(c, MutateScriptSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await mutateScript(scriptId, parsed.data.mutationType);
    return c.json(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mutation failed";
    return c.json({ error: message, details: {} }, 500);
  }
}
