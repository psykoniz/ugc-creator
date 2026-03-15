import { eq } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId, type MutationType } from "@ugc/shared";

export async function insertScript(input: {
  creativePackId: string;
  hookId: string;
  body: string;
  cta: string;
  style: string;
  mutationType?: MutationType | null;
  parentScriptId?: string | null;
}) {
  const db = getDb();
  const id = createId("script");
  const now = new Date().toISOString();

  const [script] = await db
    .insert(schema.scripts)
    .values({
      id,
      creativePackId: input.creativePackId,
      hookId: input.hookId,
      body: input.body,
      cta: input.cta,
      style: input.style,
      mutationType: input.mutationType ?? null,
      parentScriptId: input.parentScriptId ?? null,
      createdAt: now,
    })
    .returning();

  return script;
}

export async function insertScriptsBatch(
  scripts: Array<{
    creativePackId: string;
    hookId: string;
    body: string;
    cta: string;
    style: string;
  }>
) {
  const db = getDb();
  const now = new Date().toISOString();

  const values = scripts.map((s) => ({
    id: createId("script"),
    creativePackId: s.creativePackId,
    hookId: s.hookId,
    body: s.body,
    cta: s.cta,
    style: s.style,
    mutationType: null,
    parentScriptId: null,
    createdAt: now,
  }));

  return db.insert(schema.scripts).values(values).returning();
}

export async function getScriptById(id: string) {
  const db = getDb();
  return db.query.scripts.findFirst({
    where: eq(schema.scripts.id, id),
    with: {
      hook: true,
    },
  });
}

export async function getScriptsByCreativePackId(creativePackId: string) {
  const db = getDb();
  return db.query.scripts.findMany({
    where: eq(schema.scripts.creativePackId, creativePackId),
  });
}
