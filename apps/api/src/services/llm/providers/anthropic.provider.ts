import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { getEnv } from "../../../config/index.js";
import type { LLMProvider } from "../llm-provider.js";

/**
 * Anthropic LLMProvider implementation.
 * Uses Claude for JSON generation and scoring.
 */
export class AnthropicLLMProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    const env = getEnv();
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    this.model = "claude-sonnet-4-20250514";
  }

  async generateJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
    return this.callAndParse(prompt, schema);
  }

  async scoreJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
    return this.callAndParse(prompt, schema);
  }

  private async callAndParse<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Anthropic response missing text content");
    }

    const raw = textBlock.text;

    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, raw];
    const jsonStr = (jsonMatch[1] ?? raw).trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Failed to parse LLM JSON response: ${jsonStr.slice(0, 200)}`);
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`LLM response failed schema validation: ${result.error.message}`);
    }

    return result.data;
  }
}
