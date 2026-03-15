/**
 * ScraperProvider interface — abstracts web scraping services.
 * Used by ingestion-engine for URL-based product ingestion.
 * Engines must use this interface, never the SDK directly.
 */

export interface ScrapeResult {
  text: string;
  imageUrls: string[];
  title?: string;
}

export interface ScraperProvider {
  scrape(url: string): Promise<ScrapeResult>;
}
