// ─── Enums & Literals ───

export type JobStatus = "pending" | "running" | "done" | "failed";

export type RatingDecision = "keep" | "mutate" | "discard";

export type IngestSource = "url" | "images" | "prompt";

export type MutationType =
  | "AGGRESSIVE"
  | "UGC"
  | "PREMIUM"
  | "SHORTER"
  | "FACE_CAM"
  | "TIKTOK_NATIVE";

export type ProviderDomain = "video" | "llm" | "tts" | "scraper" | "storage";

// ─── Product ───

export interface ProductBrief {
  name: string;
  description: string;
  targetAudience: string;
  keyBenefits: string[];
  tone: string;
  imageUrls: string[];
}

export interface Product {
  id: string;
  source: IngestSource;
  sourceUrl: string | null;
  brief: ProductBrief;
  createdAt: string; // ISO 8601 UTC
}

// ─── Creative Pack ───

export interface CreativePack {
  id: string;
  productId: string;
  angles: string[];
  cta: string[];
  styles: string[];
  createdAt: string;
}

// ─── Hook ───

export interface Hook {
  id: string;
  creativePackId: string;
  text: string;
  angle: string;
  createdAt: string;
}

// ─── Script ───

export interface Script {
  id: string;
  creativePackId: string;
  hookId: string;
  body: string;
  cta: string;
  style: string;
  mutationType: MutationType | null;
  parentScriptId: string | null;
  createdAt: string;
}

// ─── Experiment ───

export interface Experiment {
  id: string;
  productId: string;
  creativePackId: string;
  name: string;
  winnerOutputId: string | null;
  createdAt: string;
}

// ─── Job ───

export interface Job {
  id: string;
  experimentId: string;
  scriptId: string;
  status: JobStatus;
  provider: string;
  retryCount: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ─── Output ───

export interface Output {
  id: string;
  jobId: string;
  experimentId: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  isTopCandidate: boolean;
  isWinner: boolean;
  finalScore: number | null;
  createdAt: string;
}

// ─── Rating ───

export interface Rating {
  id: string;
  outputId: string;
  heuristicScore: number;
  llmScore: number;
  businessScore: number;
  finalScore: number;
  decision: RatingDecision;
  reasoning: string | null;
  createdAt: string;
}

// ─── API Response ───

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}

// ─── Scoring ───

export const SCORING_WEIGHTS = {
  heuristic: 0.3,
  llm: 0.5,
  business: 0.2,
} as const;

export const SCORING_THRESHOLDS = {
  keep: 0.7,
  mutate: 0.5,
} as const;

/**
 * Configurable heuristic scoring parameters.
 * Extracted from ranking-engine so they can be tuned without code changes.
 */
export const HEURISTIC_CONFIG = {
  /** Baseline score before any bonuses */
  baseline: 0.5,
  /** Optimal word count range for scripts */
  wordCount: {
    optimal: { min: 50, max: 200, bonus: 0.2 },
    acceptable: { min: 30, max: 300, bonus: 0.1 },
  },
  /** CTA length range (characters) */
  ctaLength: { min: 5, max: 100, bonus: 0.15 },
  /** Recognized UGC video styles */
  validStyles: [
    "talking_head",
    "product_demo",
    "lifestyle",
    "testimonial",
    "unboxing",
  ] as string[],
  styleBonus: 0.15,
} as const;

export const BUSINESS_CONFIG = {
  baseline: 0.5,
  /** Action words that indicate strong CTAs */
  actionWords: [
    "buy", "get", "try", "shop", "order",
    "start", "click", "grab", "save", "discover",
    "unlock", "claim", "join",
  ] as string[],
  actionBonus: 0.2,
  /** Benefit/value words in script body */
  benefitWords: [
    "benefit", "result", "improve", "transform",
    "change", "help", "save", "easy", "fast",
    "proven", "guaranteed", "free",
  ] as string[],
  benefitBonusEach: 0.1,
  benefitBonusMax: 0.3,
} as const;

// ─── Limits ───

export const MAX_RENDERS_PER_BATCH = 20;
