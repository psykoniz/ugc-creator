import { eq, and } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId } from "@ugc/shared";

export async function insertOutput(input: {
  jobId: string;
  experimentId: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
}) {
  const db = getDb();
  const id = createId("output");
  const now = new Date().toISOString();

  const [output] = await db
    .insert(schema.outputs)
    .values({
      id,
      jobId: input.jobId,
      experimentId: input.experimentId,
      videoUrl: input.videoUrl,
      thumbnailUrl: input.thumbnailUrl ?? null,
      duration: input.duration ?? null,
      isTopCandidate: false,
      isWinner: false,
      finalScore: null,
      createdAt: now,
    })
    .returning();

  return output;
}

export async function getOutputsByExperimentId(experimentId: string) {
  const db = getDb();
  return db.query.outputs.findMany({
    where: eq(schema.outputs.experimentId, experimentId),
    with: {
      ratings: true,
    },
  });
}

export async function markWinner(outputId: string, experimentId: string) {
  const db = getDb();

  // 1. Reset all outputs for this experiment
  await db
    .update(schema.outputs)
    .set({ isWinner: false })
    .where(eq(schema.outputs.experimentId, experimentId));

  // 2. Mark the target output as winner
  await db
    .update(schema.outputs)
    .set({ isWinner: true })
    .where(eq(schema.outputs.id, outputId));

  // 3. Update experiment winner reference
  await db
    .update(schema.experiments)
    .set({ winnerOutputId: outputId })
    .where(eq(schema.experiments.id, experimentId));
}

export async function updateTopCandidate(outputId: string, isTopCandidate: boolean) {
  const db = getDb();
  await db
    .update(schema.outputs)
    .set({ isTopCandidate })
    .where(eq(schema.outputs.id, outputId));
}

export async function updateFinalScore(outputId: string, finalScore: number) {
  const db = getDb();
  await db
    .update(schema.outputs)
    .set({ finalScore })
    .where(eq(schema.outputs.id, outputId));
}
