/**
 * AI Challenge Generator
 *
 * Generates personalized micro-challenges using AI.
 * Falls back to static challenges on failure.
 *
 * TODO: Replace mock AI with real API call (OpenAI, Anthropic, etc.)
 * TODO: Add rate limiting and caching
 * TODO: Support creator-led challenge templates
 */

import * as Crypto from "expo-crypto";
import { FALLBACK_CHALLENGES } from "./fallback-challenges";
import { MicroChallenge } from "./types";

const CHALLENGE_COUNT = 12;

/**
 * Build the prompt for AI challenge generation.
 */
function buildPrompt(goal: string, focusAreas: string[]): string {
  const areasStr =
    focusAreas.length > 0 ? focusAreas.join(", ") : "general personal growth";
  return `Generate ${CHALLENGE_COUNT} personalized micro-challenges for someone whose goal is: "${goal}".
Their focus areas are: ${areasStr}.

Rules:
- Order from easiest to slightly harder
- Each challenge should take under 10 minutes
- Focus on action, not planning
- Include a short encouraging message for each
- Make them feel personal and achievable

Respond ONLY with a JSON array. Each item must have:
- "title": string (short, action-oriented)
- "description": string (1-2 sentences, specific instructions)
- "encouragement": string (1 sentence, warm and motivating)

No markdown, no explanation, just the JSON array.`;
}

/**
 * Parse AI response into MicroChallenge array.
 * Validates structure and falls back on parse failure.
 */
function parseAIResponse(
  raw: string,
): Omit<MicroChallenge, "id" | "completed" | "completedAt" | "order">[] | null {
  try {
    // Extract JSON array from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    // Validate each item has required fields
    for (const item of parsed) {
      if (
        typeof item.title !== "string" ||
        typeof item.description !== "string" ||
        typeof item.encouragement !== "string"
      ) {
        return null;
      }
    }

    return parsed;
  } catch {
    console.warn("[AIGenerator] Failed to parse AI response");
    return null;
  }
}

/**
 * Convert raw challenge data into full MicroChallenge objects.
 */
function toChallenges(
  items: Omit<MicroChallenge, "id" | "completed" | "completedAt" | "order">[],
): MicroChallenge[] {
  return items.map((item, index) => ({
    id: Crypto.randomUUID(),
    title: item.title,
    description: item.description,
    encouragement: item.encouragement,
    order: index,
    completed: false,
  }));
}

/**
 * Generate challenges using AI.
 *
 * TODO: Replace this mock implementation with a real API call.
 * The mock simulates what a real AI response would look like
 * so the rest of the system is ready for production.
 */
async function callAI(prompt: string): Promise<string | null> {
  try {
    // TODO: Implement real AI API call
    // Example with OpenAI:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4o-mini',
    //     messages: [{ role: 'user', content: prompt }],
    //     temperature: 0.7,
    //   }),
    // });
    // const data = await response.json();
    // return data.choices[0].message.content;

    // For now, return null to trigger fallback
    console.log("[AIGenerator] AI not configured, using fallback challenges");
    return null;
  } catch (error) {
    console.error("[AIGenerator] AI call failed:", error);
    return null;
  }
}

/**
 * Generate a personalized challenge plan for a goal.
 *
 * Attempts AI generation first, falls back to static challenges.
 */
export async function generateChallenges(
  goal: string,
  focusAreas: string[] = [],
): Promise<MicroChallenge[]> {
  const prompt = buildPrompt(goal, focusAreas);
  const aiResponse = await callAI(prompt);

  if (aiResponse) {
    const parsed = parseAIResponse(aiResponse);
    if (parsed) {
      console.log("[AIGenerator] Successfully generated AI challenges");
      return toChallenges(parsed);
    }
  }

  // Fallback: use static challenges
  console.log("[AIGenerator] Using fallback challenge set");
  return toChallenges(FALLBACK_CHALLENGES);
}
