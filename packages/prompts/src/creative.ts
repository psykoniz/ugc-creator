import type { ProductBrief } from "@ugc/shared";

/**
 * Prompts for the creative engine.
 * Used by LLMProvider to generate angles, hooks, scripts, CTAs, and styles.
 */

export const CREATIVE_PROMPTS = {
  /**
   * Generates a full creative pack from a product brief.
   */
  generateCreativePack: (brief: ProductBrief) => `
You are a UGC creative strategist. Generate a creative pack for this product.

Product:
- Name: ${brief.name}
- Description: ${brief.description}
- Target Audience: ${brief.targetAudience}
- Key Benefits: ${brief.keyBenefits.join(", ")}
- Tone: ${brief.tone}

Generate a JSON object with:
- angles: array of 3-5 marketing angles (short strings describing the creative angle)
- hooks: array of 5-8 hook objects, each with:
  - text: the hook text (attention-grabbing opening line)
  - angle: which angle this hook belongs to
- scripts: array of 5-10 script objects, each with:
  - hookIndex: index of the hook this script uses (0-based)
  - body: the script body (3-5 sentences of UGC-style copy)
  - cta: call to action text
  - style: one of "talking_head", "product_demo", "lifestyle", "testimonial", "unboxing"
- cta: array of 3-5 CTA variations
- styles: array of styles used (subset of: "talking_head", "product_demo", "lifestyle", "testimonial", "unboxing")

Return ONLY valid JSON, no extra text.
`,

  /**
   * Mutates a script with a specific mutation type.
   */
  mutateScript: (
    originalScript: { body: string; cta: string; style: string; hookText: string },
    mutationType: string
  ) => `
You are a UGC creative strategist. Mutate the following script using the "${mutationType}" strategy.

Original script:
- Hook: ${originalScript.hookText}
- Body: ${originalScript.body}
- CTA: ${originalScript.cta}
- Style: ${originalScript.style}

Mutation strategies:
- AGGRESSIVE: Make the copy more direct, urgent, and action-driven
- UGC: Make it feel more authentic, casual, and user-generated
- PREMIUM: Elevate the tone to feel more luxurious and high-end
- SHORTER: Cut the script to its essential message, much more concise
- FACE_CAM: Rewrite as if speaking directly to camera in first person
- TIKTOK_NATIVE: Rewrite using TikTok-native language, trends, and patterns

Return a JSON object with:
- body: the mutated script body
- cta: the mutated CTA
- style: the style (may change based on mutation)

Return ONLY valid JSON, no extra text.
`,
} as const;
