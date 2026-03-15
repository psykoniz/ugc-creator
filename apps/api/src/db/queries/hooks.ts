import { eq } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId } from "@ugc/shared";

export async function insertHook(input: {
  creativePackId: string;
  text: string;
  angle: string;
}) {
  const db = getDb();
  const id = createId("hook");
  const now = new Date().toISOString();

  const [hook] = await db
    .insert(schema.hooks)
    .values({
      id,
      creativePackId: input.creativePackId,
      text: input.text,
      angle: input.angle,
      createdAt: now,
    })
    .returning();

  return hook;
}

export async function insertHooksBatch(
  hooks: Array<{ creativePackId: string; text: string; angle: string }>
) {
  const db = getDb();
  const now = new Date().toISOString();

  const values = hooks.map((h) => ({
    id: createId("hook"),
    creativePackId: h.creativePackId,
    text: h.text,
    angle: h.angle,
    createdAt: now,
  }));

  return db.insert(schema.hooks).values(values).returning();
}

export async function getHooksByCreativePackId(creativePackId: string) {
  const db = getDb();
  return db.query.hooks.findMany({
    where: eq(schema.hooks.creativePackId, creativePackId),
  });
}
