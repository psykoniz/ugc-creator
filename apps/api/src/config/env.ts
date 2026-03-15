import { z } from "zod";

const EnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Provider selection
  VIDEO_PROVIDER: z.string().default("fal"),
  LLM_PROVIDER: z.string().default("anthropic"),
  TTS_PROVIDER: z.string().default("elevenlabs"),
  SCRAPER_PROVIDER: z.string().default("firecrawl"),
  STORAGE_PROVIDER: z.string().default("s3"),

  // Fal
  FAL_API_KEY: z.string().optional(),
  FAL_ENDPOINT: z.string().optional(), // Override default video model endpoint
  FAL_ASPECT_RATIO: z.string().optional(), // Override default aspect ratio (e.g. "9:16", "16:9")

  // ElevenLabs voice config
  ELEVENLABS_VOICE_ID: z.string().optional(), // Override default voice (Rachel)
  ELEVENLABS_MODEL_ID: z.string().optional(), // Override default model (eleven_monolingual_v1)

  // Anthropic
  ANTHROPIC_API_KEY: z.string().optional(),

  // ElevenLabs
  ELEVENLABS_API_KEY: z.string().optional(),

  // Firecrawl
  FIRECRAWL_API_KEY: z.string().optional(),

  // S3
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),

  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof EnvSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
      throw new Error("Invalid environment variables");
    }
    _env = result.data;
  }
  return _env;
}
