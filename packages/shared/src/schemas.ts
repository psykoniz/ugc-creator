import { z } from "zod";

// ─── Product Brief ───

export const ProductBriefSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  targetAudience: z.string().min(1),
  keyBenefits: z.array(z.string().min(1)).min(1),
  tone: z.string().min(1),
  imageUrls: z.array(z.string().url()),
});

// ─── Ingest ───

export const IngestUrlSchema = z.object({
  url: z.string().url(),
});

export const IngestImagesSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1),
  name: z.string().min(1),
  description: z.string().min(1),
});

export const IngestPromptSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  targetAudience: z.string().min(1),
  keyBenefits: z.array(z.string().min(1)).min(1),
  tone: z.string().min(1),
});

// ─── Creative Pack ───

export const CreateCreativePackSchema = z.object({
  productId: z.string().startsWith("prod_"),
});

// ─── Mutation ───

export const MutationTypeSchema = z.enum([
  "AGGRESSIVE",
  "UGC",
  "PREMIUM",
  "SHORTER",
  "FACE_CAM",
  "TIKTOK_NATIVE",
]);

export const MutateScriptSchema = z.object({
  mutationType: MutationTypeSchema,
});

// ─── Experiment ───

export const CreateExperimentSchema = z.object({
  productId: z.string().startsWith("prod_"),
  creativePackId: z.string().startsWith("cpk_"),
  name: z.string().min(1),
});

// ─── Jobs ───

export const CreateBatchSchema = z.object({
  experimentId: z.string().startsWith("exp_"),
  scriptIds: z
    .array(z.string().startsWith("scr_"))
    .min(1)
    .max(20),
});

// ─── Ratings ───

export const BatchRatingSchema = z.object({
  outputIds: z.array(z.string().startsWith("out_")).min(1),
});

// ─── Query params ───

export const ExperimentIdQuerySchema = z.object({
  experiment_id: z.string().startsWith("exp_"),
});
