import { eq } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId, type RatingDecision } from "@ugc/shared";

export async function insertRating(input: {
  outputId: string;
  heuristicScore: number;
  llmScore: number;
  businessScore: number;
  finalScore: number;
  decision: RatingDecision;
  reasoning?: string | null;
}) {
  const db = getDb();
  const id = createId("rating");
  const now = new Date().toISOString();

  const [rating] = await db
    .insert(schema.ratings)
    .values({
      id,
      outputId: input.outputId,
      heuristicScore: input.heuristicScore,
      llmScore: input.llmScore,
      businessScore: input.businessScore,
      finalScore: input.finalScore,
      decision: input.decision,
      reasoning: input.reasoning ?? null,
      createdAt: now,
    })
    .returning();

  return rating;
}

export async function getRatingsByOutputId(outputId: string) {
  const db = getDb();
  return db.query.ratings.findMany({
    where: eq(schema.ratings.outputId, outputId),
  });
}
