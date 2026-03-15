/**
 * Ranking Engine
 * Calculates hybrid scoring: heuristic (30%) + LLM (50%) + business (20%).
 * Produces decision: keep | mutate | discard.
 * Uses LLMProvider for the LLM scoring component — no direct SDK calls.
 *
 * Called automatically at end of render pipeline in worker,
 * and manually via POST /api/ratings/batch for rescoring.
 */

import { z } from "zod";
import {
  SCORING_WEIGHTS,
  SCORING_THRESHOLDS,
  type RatingDecision,
  type ProductBrief,
} from "@ugc/shared";
import { SCORING_PROMPTS } from "@ugc/prompts";
import { getLLMProvider } from "../services/provider-factory.js";
import {
  outputQueries,
  ratingQueries,
  jobQueries,
  scriptQueries,
  experimentQueries,
  productQueries,
} from "../db/queries/index.js";

// ─── LLM Score Response Schema ───

const LLMScoreResponseSchema = z.object({
  score: z.number().min(0).max(1),
  reasoning: z.string(),
});

// ─── Score a single output ───

export async function scoreOutput(outputId: string): Promise<{
  finalScore: number;
  decision: RatingDecision;
}> {
  // 1. Gather context
  const outputs = await outputQueries.getOutputsByExperimentId("");
  // We need to get the output and its related data
  const allOutputs = await getAllOutputData(outputId);
  if (!allOutputs) {
    throw new Error(`Output not found or missing relations: ${outputId}`);
  }

  const { output, script, hookText, productName, targetAudience } = allOutputs;

  // 2. Heuristic score (rule-based)
  const heuristicScore = calculateHeuristicScore(script);

  // 3. LLM score
  const llm = getLLMProvider();
  const prompt = SCORING_PROMPTS.scoreOutput({
    scriptBody: script.body,
    hookText,
    cta: script.cta,
    style: script.style,
    productName,
    targetAudience,
  });
  const llmResult = await llm.scoreJson(prompt, LLMScoreResponseSchema);
  const llmScore = llmResult.score;

  // 4. Business score (simple heuristic for V1.1)
  const businessScore = calculateBusinessScore(script);

  // 5. Final score = weighted sum
  const finalScore = Number(
    (
      heuristicScore * SCORING_WEIGHTS.heuristic +
      llmScore * SCORING_WEIGHTS.llm +
      businessScore * SCORING_WEIGHTS.business
    ).toFixed(2)
  );

  // 6. Decision based on thresholds
  let decision: RatingDecision;
  if (finalScore >= SCORING_THRESHOLDS.keep) {
    decision = "keep";
  } else if (finalScore >= SCORING_THRESHOLDS.mutate) {
    decision = "mutate";
  } else {
    decision = "discard";
  }

  // 7. Persist rating
  await ratingQueries.insertRating({
    outputId,
    heuristicScore,
    llmScore,
    businessScore,
    finalScore,
    decision,
    reasoning: llmResult.reasoning,
  });

  // 8. Update output score
  await outputQueries.updateFinalScore(outputId, finalScore);

  return { finalScore, decision };
}

// ─── Score a batch of outputs and mark top candidates ───

export async function scoreBatch(outputIds: string[]): Promise<void> {
  // Score each output
  const results: Array<{ outputId: string; finalScore: number; decision: RatingDecision }> = [];

  for (const outputId of outputIds) {
    const result = await scoreOutput(outputId);
    results.push({ outputId, ...result });
  }

  // Mark top 20% as top candidates
  if (results.length > 0) {
    const sorted = [...results].sort((a, b) => b.finalScore - a.finalScore);
    const topCount = Math.max(1, Math.ceil(sorted.length * 0.2));

    for (let i = 0; i < sorted.length; i++) {
      const isTop = i < topCount;
      await outputQueries.updateTopCandidate(sorted[i]!.outputId, isTop);
    }
  }
}

// ─── Heuristic Scoring (rule-based) ───

function calculateHeuristicScore(script: {
  body: string;
  cta: string;
  style: string;
}): number {
  let score = 0.5; // baseline

  // Script length: prefer 50-200 words
  const wordCount = script.body.split(/\s+/).length;
  if (wordCount >= 50 && wordCount <= 200) {
    score += 0.2;
  } else if (wordCount >= 30 && wordCount <= 300) {
    score += 0.1;
  }

  // CTA present and reasonable length
  if (script.cta.length > 5 && script.cta.length < 100) {
    score += 0.15;
  }

  // Style is a recognized format
  const validStyles = ["talking_head", "product_demo", "lifestyle", "testimonial", "unboxing"];
  if (validStyles.includes(script.style)) {
    score += 0.15;
  }

  return Math.min(1, Math.max(0, score));
}

// ─── Business Scoring (simple for V1.1) ───

function calculateBusinessScore(script: {
  body: string;
  cta: string;
}): number {
  let score = 0.5; // baseline

  // Has action words in CTA
  const actionWords = ["buy", "get", "try", "shop", "order", "start", "click", "grab", "save"];
  const ctaLower = script.cta.toLowerCase();
  if (actionWords.some((w) => ctaLower.includes(w))) {
    score += 0.2;
  }

  // Body mentions benefits or results
  const benefitWords = ["benefit", "result", "improve", "transform", "change", "help", "save", "easy"];
  const bodyLower = script.body.toLowerCase();
  const benefitCount = benefitWords.filter((w) => bodyLower.includes(w)).length;
  score += Math.min(0.3, benefitCount * 0.1);

  return Math.min(1, Math.max(0, score));
}

// ─── Data gathering helper ───

async function getAllOutputData(outputId: string) {
  // We need to traverse: output → job → script → hook, and experiment → product
  // Since getOutputsByExperimentId returns with ratings, we need to find the output differently

  // Get all experiments to find the output
  // This is a simplified approach — in production, add getOutputById to queries
  // For now, we get the job from the output and traverse

  const { getDb, schema } = await import("../db/index.js");
  const { eq } = await import("drizzle-orm");

  const db = getDb();

  const output = await db.query.outputs.findFirst({
    where: eq(schema.outputs.id, outputId),
  });
  if (!output) return null;

  const job = await jobQueries.getJobById(output.jobId);
  if (!job) return null;

  const script = await scriptQueries.getScriptById(job.scriptId);
  if (!script) return null;

  const experiment = await experimentQueries.getExperimentById(job.experimentId);
  if (!experiment) return null;

  const product = await productQueries.getProductById(experiment.productId);
  if (!product) return null;

  const brief = product.brief as ProductBrief;

  return {
    output,
    script,
    hookText: script.hook?.text ?? "",
    productName: brief.name,
    targetAudience: brief.targetAudience,
  };
}
