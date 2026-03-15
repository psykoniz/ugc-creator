import type { ProviderDomain } from "@ugc/shared";
import { getEnv } from "./env.js";

export interface ProviderConfig {
  video: string;
  llm: string;
  tts: string;
  scraper: string;
  storage: string;
}

export function getProviderConfig(): ProviderConfig {
  const env = getEnv();
  return {
    video: env.VIDEO_PROVIDER,
    llm: env.LLM_PROVIDER,
    tts: env.TTS_PROVIDER,
    scraper: env.SCRAPER_PROVIDER,
    storage: env.STORAGE_PROVIDER,
  };
}

export function getActiveProvider(domain: ProviderDomain): string {
  const config = getProviderConfig();
  return config[domain];
}
