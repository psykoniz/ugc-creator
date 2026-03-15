import { getEnv } from "../../../config/index.js";
import type { ScraperProvider, ScrapeResult } from "../scraper-provider.js";

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1";

/**
 * Firecrawl ScraperProvider implementation.
 * Uses HTTP fetch — no heavy SDK required.
 */
export class FirecrawlScraperProvider implements ScraperProvider {
  private apiKey: string;

  constructor() {
    const env = getEnv();
    if (!env.FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is required for Firecrawl scraper provider");
    }
    this.apiKey = env.FIRECRAWL_API_KEY;
  }

  async scrape(url: string): Promise<ScrapeResult> {
    const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Firecrawl scrape failed (${response.status}): ${body}`);
    }

    const json = (await response.json()) as {
      success: boolean;
      data?: {
        markdown?: string;
        metadata?: { title?: string };
      };
    };

    if (!json.success || !json.data) {
      throw new Error("Firecrawl returned unsuccessful response");
    }

    const text = json.data.markdown ?? "";
    const title = json.data.metadata?.title;

    // Extract image URLs from markdown content
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const imageUrls: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = imageRegex.exec(text)) !== null) {
      if (match[1]) {
        imageUrls.push(match[1]);
      }
    }

    return { text, imageUrls, title };
  }
}
