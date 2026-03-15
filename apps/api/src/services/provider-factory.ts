/**
 * Provider factory — returns the active provider instance for each domain.
 * One provider active per domain, selected via env config.
 * No fallback orchestration (V1.1).
 */

import { getActiveProvider } from "../config/index.js";

import type { VideoProvider } from "./video/video-provider.js";
import type { LLMProvider } from "./llm/llm-provider.js";
import type { TTSProvider } from "./tts/tts-provider.js";
import type { ScraperProvider } from "./scraper/scraper-provider.js";
import type { StorageProvider } from "./storage/storage-provider.js";

import { FalVideoProvider } from "./video/providers/index.js";
import { AnthropicLLMProvider } from "./llm/providers/index.js";
import { ElevenLabsTTSProvider } from "./tts/providers/index.js";
import { FirecrawlScraperProvider } from "./scraper/providers/index.js";
import { S3StorageProvider } from "./storage/providers/index.js";

// Singleton instances
let _videoProvider: VideoProvider | null = null;
let _llmProvider: LLMProvider | null = null;
let _ttsProvider: TTSProvider | null = null;
let _scraperProvider: ScraperProvider | null = null;
let _storageProvider: StorageProvider | null = null;

export function getVideoProvider(): VideoProvider {
  if (!_videoProvider) {
    const active = getActiveProvider("video");
    switch (active) {
      case "fal":
        _videoProvider = new FalVideoProvider();
        break;
      default:
        throw new Error(`Unknown video provider: ${active}`);
    }
  }
  return _videoProvider;
}

export function getLLMProvider(): LLMProvider {
  if (!_llmProvider) {
    const active = getActiveProvider("llm");
    switch (active) {
      case "anthropic":
        _llmProvider = new AnthropicLLMProvider();
        break;
      default:
        throw new Error(`Unknown LLM provider: ${active}`);
    }
  }
  return _llmProvider;
}

export function getTTSProvider(): TTSProvider {
  if (!_ttsProvider) {
    const active = getActiveProvider("tts");
    switch (active) {
      case "elevenlabs":
        _ttsProvider = new ElevenLabsTTSProvider();
        break;
      default:
        throw new Error(`Unknown TTS provider: ${active}`);
    }
  }
  return _ttsProvider;
}

export function getScraperProvider(): ScraperProvider {
  if (!_scraperProvider) {
    const active = getActiveProvider("scraper");
    switch (active) {
      case "firecrawl":
        _scraperProvider = new FirecrawlScraperProvider();
        break;
      default:
        throw new Error(`Unknown scraper provider: ${active}`);
    }
  }
  return _scraperProvider;
}

export function getStorageProvider(): StorageProvider {
  if (!_storageProvider) {
    const active = getActiveProvider("storage");
    switch (active) {
      case "s3":
        _storageProvider = new S3StorageProvider();
        break;
      default:
        throw new Error(`Unknown storage provider: ${active}`);
    }
  }
  return _storageProvider;
}
