/**
 * Prompts for the ranking engine.
 * Used by LLMProvider for the LLM scoring component.
 */

export const SCORING_PROMPTS = {
  /**
   * Scores an output based on script quality, visual match, and engagement potential.
   */
  scoreOutput: (input: {
    scriptBody: string;
    hookText: string;
    cta: string;
    style: string;
    productName: string;
    targetAudience: string;
  }) => `
You are a UGC creative performance analyst. Score the following creative output.

Product: ${input.productName}
Target Audience: ${input.targetAudience}

Script:
- Hook: ${input.hookText}
- Body: ${input.scriptBody}
- CTA: ${input.cta}
- Style: ${input.style}

Score the output on a scale of 0.00 to 1.00 for these criteria:
1. Hook strength: How attention-grabbing is the opening?
2. Script coherence: Does the body flow logically and persuasively?
3. CTA effectiveness: Is the call to action compelling?
4. Audience fit: How well does this match the target audience?
5. Platform fit: How well would this perform on short-form video platforms?

Return a JSON object with:
- score: overall score (0.00 to 1.00, weighted average of criteria)
- reasoning: brief explanation (1-2 sentences)

Return ONLY valid JSON, no extra text.
`,
} as const;
