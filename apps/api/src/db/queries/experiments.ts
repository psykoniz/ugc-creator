import { eq } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId } from "@ugc/shared";

export async function insertExperiment(input: {
  productId: string;
  creativePackId: string;
  name: string;
}) {
  const db = getDb();
  const id = createId("experiment");
  const now = new Date().toISOString();

  const [experiment] = await db
    .insert(schema.experiments)
    .values({
      id,
      productId: input.productId,
      creativePackId: input.creativePackId,
      name: input.name,
      winnerOutputId: null,
      createdAt: now,
    })
    .returning();

  return experiment;
}

export async function getExperimentById(id: string) {
  const db = getDb();
  return db.query.experiments.findFirst({
    where: eq(schema.experiments.id, id),
    with: {
      jobs: true,
      outputs: true,
    },
  });
}

export async function setWinnerOutputId(experimentId: string, outputId: string) {
  const db = getDb();
  await db
    .update(schema.experiments)
    .set({ winnerOutputId: outputId })
    .where(eq(schema.experiments.id, experimentId));
}
