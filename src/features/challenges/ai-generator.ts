/**
 * AI Challenge Generator
 *
 * Generates personalized micro-challenges using Gemini AI.
 * Falls back to static challenges on failure.
 *
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
 * Generate challenges using Gemini AI (gemini-2.0-flash).
 * Falls back gracefully if API key is missing or call fails.
 */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";

function getGeminiConfig() {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  return { apiKey, model };
}

async function callAI(prompt: string): Promise<string | null> {
  const { apiKey, model } = getGeminiConfig();

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log(
      "[AIGenerator] Gemini API key not configured, using fallback challenges",
    );
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  };

  console.log("[AIGenerator] ➡️ Request:", {
    model,
    url: url.replace(apiKey, "***"),
    promptLength: prompt.length,
    promptPreview: prompt.slice(0, 120) + "...",
  });

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[AIGenerator] ❌ Response:", {
        status: response.status,
        elapsed: `${elapsed}ms`,
        error: errorBody,
      });
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    const usage = data.usageMetadata;

    console.log("[AIGenerator] ✅ Response:", {
      status: response.status,
      elapsed: `${elapsed}ms`,
      responseLength: text?.length ?? 0,
      responsePreview: text?.slice(0, 120) + "...",
      tokens: usage
        ? {
            prompt: usage.promptTokenCount,
            response: usage.candidatesTokenCount,
            total: usage.totalTokenCount,
          }
        : "N/A",
    });

    return text;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error("[AIGenerator] ❌ Failed:", {
      elapsed: `${elapsed}ms`,
      error,
    });
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
