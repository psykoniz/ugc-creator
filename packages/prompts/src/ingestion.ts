/**
 * Prompts for the ingestion engine.
 * Used by LLMProvider to extract structured product briefs from raw content.
 */

export const INGESTION_PROMPTS = {
  /**
   * Extracts a structured ProductBrief from scraped website content.
   */
  extractBriefFromUrl: (scrapedContent: string) => `
You are a product analyst. Analyze the following website content and extract a structured product brief.

Website content:
${scrapedContent}

Return a JSON object with these fields:
- name: the product name
- description: a concise product description (2-3 sentences)
- targetAudience: who this product is for
- keyBenefits: an array of 3-5 key benefits
- tone: the brand tone (e.g. "professional", "playful", "luxurious")
- imageUrls: any product image URLs found in the content

Return ONLY valid JSON, no extra text.
`,

  /**
   * Enriches a manual prompt-based brief with more detail.
   */
  enrichBriefFromPrompt: (input: {
    name: string;
    description: string;
    targetAudience: string;
    keyBenefits: string[];
    tone: string;
  }) => `
You are a product analyst. Enrich the following product information into a polished product brief.

Input:
- Name: ${input.name}
- Description: ${input.description}
- Target Audience: ${input.targetAudience}
- Key Benefits: ${input.keyBenefits.join(", ")}
- Tone: ${input.tone}

Return a JSON object with these fields:
- name: the product name (keep as-is)
- description: an enriched product description (2-3 sentences)
- targetAudience: refined target audience description
- keyBenefits: an array of 3-5 refined key benefits
- tone: the brand tone
- imageUrls: empty array

Return ONLY valid JSON, no extra text.
`,
} as const;
