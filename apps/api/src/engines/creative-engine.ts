/**
 * Creative Engine
 * Generates a creative pack (angles, hooks, scripts, CTA, styles) from a product.
 * Handles script mutation (manual only in V1.1).
 * Uses LLMProvider — no direct SDK calls.
 */

import { z } from "zod";
import type { ProductBrief, MutationType } from "@ugc/shared";
import { CREATIVE_PROMPTS } from "@ugc/prompts";
import { getLLMProvider } from "../services/provider-factory.js";
import {
  productQueries,
  creativePackQueries,
  hookQueries,
  scriptQueries,
} from "../db/queries/index.js";

// ─── Response schemas for LLM validation ───

const CreativePackResponseSchema = z.object({
  angles: z.array(z.string()).min(3).max(5),
  hooks: z.array(
    z.object({
      text: z.string(),
      angle: z.string(),
    })
  ).min(5).max(8),
  scripts: z.array(
    z.object({
      hookIndex: z.number().int().min(0),
      body: z.string(),
      cta: z.string(),
      style: z.string(),
    })
  ).min(5).max(10),
  cta: z.array(z.string()).min(3).max(5),
  styles: z.array(z.string()),
});

const MutatedScriptResponseSchema = z.object({
  body: z.string(),
  cta: z.string(),
  style: z.string(),
});

// ─── Generate Creative Pack ───

export async function generateCreativePack(productId: string) {
  const product = await productQueries.getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const brief = product.brief as ProductBrief;
  const llm = getLLMProvider();

  // 1. Generate creative pack via LLM
  const prompt = CREATIVE_PROMPTS.generateCreativePack(brief);
  const result = await llm.generateJson(prompt, CreativePackResponseSchema);

  // 2. Persist creative pack
  const pack = await creativePackQueries.insertCreativePack({
    productId,
    angles: result.angles,
    cta: result.cta,
    styles: result.styles,
  });

  // 3. Persist hooks
  const hooks = await hookQueries.insertHooksBatch(
    result.hooks.map((h) => ({
      creativePackId: pack.id,
      text: h.text,
      angle: h.angle,
    }))
  );

  // 4. Persist scripts (link to hooks by index)
  const scripts = await scriptQueries.insertScriptsBatch(
    result.scripts.map((s) => ({
      creativePackId: pack.id,
      hookId: hooks[s.hookIndex]!.id,
      body: s.body,
      cta: s.cta,
      style: s.style,
    }))
  );

  return {
    creative_pack: pack,
    hooks,
    scripts,
  };
}

// ─── Mutate Script (manual only V1.1) ───

export async function mutateScript(scriptId: string, mutationType: MutationType) {
  const script = await scriptQueries.getScriptById(scriptId);
  if (!script) {
    throw new Error(`Script not found: ${scriptId}`);
  }

  const hookText = script.hook?.text ?? "";
  const llm = getLLMProvider();

  const prompt = CREATIVE_PROMPTS.mutateScript(
    {
      body: script.body,
      cta: script.cta,
      style: script.style,
      hookText,
    },
    mutationType
  );

  const result = await llm.generateJson(prompt, MutatedScriptResponseSchema);

  // Persist mutated script with reference to parent
  const mutated = await scriptQueries.insertScript({
    creativePackId: script.creativePackId,
    hookId: script.hookId,
    body: result.body,
    cta: result.cta,
    style: result.style,
    mutationType,
    parentScriptId: scriptId,
  });

  return mutated;
}
