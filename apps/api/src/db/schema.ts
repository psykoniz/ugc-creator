import { pgTable, text, boolean, real, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Products ───

export const products = pgTable("products", {
  id: text("id").primaryKey(), // prod_...
  source: text("source").notNull(), // "url" | "images" | "prompt"
  sourceUrl: text("source_url"),
  brief: jsonb("brief").notNull(), // ProductBrief JSON
  createdAt: text("created_at").notNull(), // ISO 8601 UTC
});

// ─── Creative Packs ───

export const creativePacks = pgTable("creative_packs", {
  id: text("id").primaryKey(), // cpk_...
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  angles: jsonb("angles").notNull().$type<string[]>(),
  cta: jsonb("cta").notNull().$type<string[]>(),
  styles: jsonb("styles").notNull().$type<string[]>(),
  createdAt: text("created_at").notNull(),
});

// ─── Hooks ───

export const hooks = pgTable("hooks", {
  id: text("id").primaryKey(), // hook_...
  creativePackId: text("creative_pack_id")
    .notNull()
    .references(() => creativePacks.id),
  text: text("text").notNull(),
  angle: text("angle").notNull(),
  createdAt: text("created_at").notNull(),
});

// ─── Scripts ───

export const scripts = pgTable("scripts", {
  id: text("id").primaryKey(), // scr_...
  creativePackId: text("creative_pack_id")
    .notNull()
    .references(() => creativePacks.id),
  hookId: text("hook_id")
    .notNull()
    .references(() => hooks.id),
  body: text("body").notNull(),
  cta: text("cta").notNull(),
  style: text("style").notNull(),
  mutationType: text("mutation_type"), // nullable
  parentScriptId: text("parent_script_id"), // nullable, self-ref
  createdAt: text("created_at").notNull(),
});

// ─── Experiments ───

export const experiments = pgTable("experiments", {
  id: text("id").primaryKey(), // exp_...
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  creativePackId: text("creative_pack_id")
    .notNull()
    .references(() => creativePacks.id),
  name: text("name").notNull(),
  winnerOutputId: text("winner_output_id"), // nullable, set when winner chosen
  createdAt: text("created_at").notNull(),
});

// ─── Jobs ───

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(), // job_...
  experimentId: text("experiment_id")
    .notNull()
    .references(() => experiments.id),
  scriptId: text("script_id")
    .notNull()
    .references(() => scripts.id),
  status: text("status").notNull().default("pending"), // "pending" | "running" | "done" | "failed"
  provider: text("provider").notNull(), // e.g. "fal", "anthropic"
  retryCount: integer("retry_count").notNull().default(0),
  error: text("error"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull(),
});

// ─── Outputs ───

export const outputs = pgTable("outputs", {
  id: text("id").primaryKey(), // out_...
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id),
  experimentId: text("experiment_id")
    .notNull()
    .references(() => experiments.id),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: real("duration"),
  isTopCandidate: boolean("is_top_candidate").notNull().default(false),
  isWinner: boolean("is_winner").notNull().default(false),
  finalScore: real("final_score"),
  createdAt: text("created_at").notNull(),
});

// ─── Ratings ───

export const ratings = pgTable("ratings", {
  id: text("id").primaryKey(), // rat_...
  outputId: text("output_id")
    .notNull()
    .references(() => outputs.id),
  heuristicScore: real("heuristic_score").notNull(),
  llmScore: real("llm_score").notNull(),
  businessScore: real("business_score").notNull(),
  finalScore: real("final_score").notNull(),
  decision: text("decision").notNull(), // "keep" | "mutate" | "discard"
  reasoning: text("reasoning"),
  createdAt: text("created_at").notNull(),
});

// ─── Relations ───

export const productsRelations = relations(products, ({ many }) => ({
  creativePacks: many(creativePacks),
  experiments: many(experiments),
}));

export const creativePacksRelations = relations(creativePacks, ({ one, many }) => ({
  product: one(products, {
    fields: [creativePacks.productId],
    references: [products.id],
  }),
  hooks: many(hooks),
  scripts: many(scripts),
  experiments: many(experiments),
}));

export const hooksRelations = relations(hooks, ({ one, many }) => ({
  creativePack: one(creativePacks, {
    fields: [hooks.creativePackId],
    references: [creativePacks.id],
  }),
  scripts: many(scripts),
}));

export const scriptsRelations = relations(scripts, ({ one }) => ({
  creativePack: one(creativePacks, {
    fields: [scripts.creativePackId],
    references: [creativePacks.id],
  }),
  hook: one(hooks, {
    fields: [scripts.hookId],
    references: [hooks.id],
  }),
}));

export const experimentsRelations = relations(experiments, ({ one, many }) => ({
  product: one(products, {
    fields: [experiments.productId],
    references: [products.id],
  }),
  creativePack: one(creativePacks, {
    fields: [experiments.creativePackId],
    references: [creativePacks.id],
  }),
  jobs: many(jobs),
  outputs: many(outputs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  experiment: one(experiments, {
    fields: [jobs.experimentId],
    references: [experiments.id],
  }),
  script: one(scripts, {
    fields: [jobs.scriptId],
    references: [scripts.id],
  }),
  outputs: many(outputs),
}));

export const outputsRelations = relations(outputs, ({ one, many }) => ({
  job: one(jobs, {
    fields: [outputs.jobId],
    references: [jobs.id],
  }),
  experiment: one(experiments, {
    fields: [outputs.experimentId],
    references: [experiments.id],
  }),
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  output: one(outputs, {
    fields: [ratings.outputId],
    references: [outputs.id],
  }),
}));
