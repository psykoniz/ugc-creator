import { eq } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId } from "@ugc/shared";

export async function insertCreativePack(input: {
  productId: string;
  angles: string[];
  cta: string[];
  styles: string[];
}) {
  const db = getDb();
  const id = createId("creative_pack");
  const now = new Date().toISOString();

  const [pack] = await db
    .insert(schema.creativePacks)
    .values({
      id,
      productId: input.productId,
      angles: input.angles,
      cta: input.cta,
      styles: input.styles,
      createdAt: now,
    })
    .returning();

  return pack;
}

export async function getCreativePackById(id: string) {
  const db = getDb();
  return db.query.creativePacks.findFirst({
    where: eq(schema.creativePacks.id, id),
    with: {
      hooks: true,
      scripts: true,
    },
  });
}

export async function getCreativePacksByProductId(productId: string) {
  const db = getDb();
  return db.query.creativePacks.findMany({
    where: eq(schema.creativePacks.productId, productId),
  });
}
