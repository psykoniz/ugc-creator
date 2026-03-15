/**
 * LLMProvider interface — abstracts LLM services.
 * Used by creative-engine (generation, mutation) and ranking-engine (scoring).
 * Engines must use this interface, never the SDK directly.
 */

import type { z } from "zod";

export interface LLMProvider {
  generateJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T>;
  scoreJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T>;
}
