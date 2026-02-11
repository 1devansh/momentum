/**
 * Fallback Challenge Sets
 *
 * Used when AI generation fails. Provides generic but useful
 * micro-challenges that work for most goals.
 */

import { MicroChallenge } from "./types";

export const FALLBACK_CHALLENGES: Omit<
  MicroChallenge,
  "id" | "completed" | "completedAt"
>[] = [
  {
    order: 0,
    title: "Write it down",
    description:
      "Spend 2 minutes writing your goal in your own words. Be specific about what success looks like.",
    encouragement: "Clarity is the first step. You just took it.",
  },
  {
    order: 1,
    title: "Tell someone",
    description:
      "Share your goal with one person you trust. A text message counts.",
    encouragement: "Saying it out loud makes it real.",
  },
  {
    order: 2,
    title: "Remove one obstacle",
    description:
      "Identify the smallest thing blocking you and eliminate it right now. Unsubscribe, delete, rearrange.",
    encouragement: "Less friction, more momentum.",
  },
  {
    order: 3,
    title: "5-minute research",
    description:
      "Set a timer for 5 minutes and learn one new thing related to your goal.",
    encouragement: "Knowledge compounds. Every bit counts.",
  },
  {
    order: 4,
    title: "The smallest possible step",
    description:
      "Do the absolute tiniest action toward your goal. Open the document, lace up the shoes, send the email.",
    encouragement: "Motion beats meditation every time.",
  },
  {
    order: 5,
    title: "Set a trigger",
    description:
      "Attach your goal action to something you already do daily. After coffee, I will...",
    encouragement: "Habits ride on habits. Smart move.",
  },
  {
    order: 6,
    title: "Visualize the finish line",
    description:
      "Close your eyes for 2 minutes and imagine having achieved your goal. How does it feel?",
    encouragement: "Your brain can't tell the difference. Use that.",
  },
  {
    order: 7,
    title: "Track your first win",
    description:
      "Write down one thing you've already done toward this goal, no matter how small.",
    encouragement: "You're further along than you think.",
  },
  {
    order: 8,
    title: "Teach what you know",
    description:
      "Explain your goal and what you've learned so far to someone, even if it's just a voice memo to yourself.",
    encouragement: "Teaching is the best way to learn.",
  },
  {
    order: 9,
    title: "Celebrate progress",
    description:
      "Look back at what you've done this week. Acknowledge it. Treat yourself to something small.",
    encouragement: "You showed up. That's everything.",
  },
];
