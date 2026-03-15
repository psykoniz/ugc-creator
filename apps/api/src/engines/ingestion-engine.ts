/**
 * Ingestion Engine
 * Transforms a source (URL, images, prompt) into a ProductBrief and persists it.
 * Uses ScraperProvider (URL source) and LLMProvider (enrichment).
 * No direct SDK calls — all access through provider interfaces.
 */

import { z } from "zod";
import { type ProductBrief, type IngestSource, ProductBriefSchema } from "@ugc/shared";
import { INGESTION_PROMPTS } from "@ugc/prompts";
import { getLLMProvider, getScraperProvider } from "../services/provider-factory.js";
import { productQueries } from "../db/queries/index.js";

// ─── URL Ingestion ───

export async function ingestFromUrl(url: string) {
  const scraper = getScraperProvider();
  const llm = getLLMProvider();

  // 1. Scrape the URL
  const scraped = await scraper.scrape(url);

  // 2. Extract structured brief via LLM
  const prompt = INGESTION_PROMPTS.extractBriefFromUrl(scraped.text);
  const brief = await llm.generateJson(prompt, ProductBriefSchema);

  // Merge scraped images if LLM didn't find them
  if (brief.imageUrls.length === 0 && scraped.imageUrls.length > 0) {
    brief.imageUrls = scraped.imageUrls;
  }

  // 3. Persist
  const product = await productQueries.insertProduct({
    source: "url",
    sourceUrl: url,
    brief,
  });

  return { product_id: product.id, product_brief: brief };
}

// ─── Images Ingestion ───

export async function ingestFromImages(input: {
  imageUrls: string[];
  name: string;
  description: string;
}) {
  const brief: ProductBrief = {
    name: input.name,
    description: input.description,
    targetAudience: "",
    keyBenefits: [],
    tone: "",
    imageUrls: input.imageUrls,
  };

  // Enrich via LLM
  const llm = getLLMProvider();
  const prompt = INGESTION_PROMPTS.enrichBriefFromPrompt({
    name: brief.name,
    description: brief.description,
    targetAudience: "General audience",
    keyBenefits: ["Visual product"],
    tone: "neutral",
  });
  const enriched = await llm.generateJson(prompt, ProductBriefSchema);

  // Keep original images
  enriched.imageUrls = input.imageUrls;

  const product = await productQueries.insertProduct({
    source: "images",
    sourceUrl: null,
    brief: enriched,
  });

  return { product_id: product.id, product_brief: enriched };
}

// ─── Prompt Ingestion ───

export async function ingestFromPrompt(input: {
  name: string;
  description: string;
  targetAudience: string;
  keyBenefits: string[];
  tone: string;
}) {
  const llm = getLLMProvider();

  const prompt = INGESTION_PROMPTS.enrichBriefFromPrompt(input);
  const brief = await llm.generateJson(prompt, ProductBriefSchema);

  const product = await productQueries.insertProduct({
    source: "prompt",
    sourceUrl: null,
    brief,
  });

  return { product_id: product.id, product_brief: brief };
}
