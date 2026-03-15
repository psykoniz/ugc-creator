/**
 * Zod validation helper for Hono routes.
 * Validates request body/query against a Zod schema and returns typed data or error response.
 */

import type { Context } from "hono";
import type { z } from "zod";

export async function validateBody<T>(
  c: Context,
  schema: z.ZodType<T>
): Promise<T | null> {
  const body = await c.req.json().catch(() => null);
  if (!body) {
    c.status(400);
    c.header("Content-Type", "application/json");
    return null;
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    c.status(400);
    c.header("Content-Type", "application/json");
    return null;
  }

  return result.data;
}

export async function validateBodyOrError<T>(
  c: Context,
  schema: z.ZodType<T>
): Promise<{ data: T } | { error: Response }> {
  const body = await c.req.json().catch(() => null);
  if (!body) {
    return {
      error: c.json({ error: "Invalid JSON body", details: {} }, 400),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      error: c.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        400
      ),
    };
  }

  return { data: result.data };
}

export function validateQuery<T>(
  c: Context,
  schema: z.ZodType<T>
): { data: T } | { error: Response } {
  const query = c.req.query();
  const result = schema.safeParse(query);

  if (!result.success) {
    return {
      error: c.json(
        {
          error: "Invalid query parameters",
          details: result.error.flatten().fieldErrors,
        },
        400
      ),
    };
  }

  return { data: result.data };
}
