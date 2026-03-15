import { eq } from "drizzle-orm";
import { getDb, schema } from "../index.js";
import { createId, type ProductBrief, type IngestSource } from "@ugc/shared";

export async function insertProduct(input: {
  source: IngestSource;
  sourceUrl: string | null;
  brief: ProductBrief;
}) {
  const db = getDb();
  const id = createId("product");
  const now = new Date().toISOString();

  const [product] = await db
    .insert(schema.products)
    .values({
      id,
      source: input.source,
      sourceUrl: input.sourceUrl,
      brief: input.brief,
      createdAt: now,
    })
    .returning();

  return product;
}

export async function getProductById(id: string) {
  const db = getDb();
  return db.query.products.findFirst({
    where: eq(schema.products.id, id),
  });
}
