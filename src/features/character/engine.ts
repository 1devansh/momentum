/**
 * Character Growth Engine
 *
 * Deterministic, milestone-based character evolution.
 * Separated from UI — pure business logic.
 *
 * Growth is based on total completed challenges across all goal plans.
 * Character never regresses.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface StageIdentity {
  name: string;
  emoji: string;
  minChallenges: number;
  identityLabel: string;
  description: string;
  transformationNarrative: string;
}

export interface StageUnlock {
  type: "badge";
  title: string;
  description: string;
  emoji: string;
}

export interface EvolutionStage {
  identity: StageIdentity;
  unlocks: StageUnlock[];
  messages: string[];
}

export interface CharacterState {
  stage: StageIdentity;
  stageIndex: number;
  totalCompleted: number;
  nextMilestone: number | null;
  progressToNext: number;
  unlocks: StageUnlock[];
  progressMessage: string;
}

// ---------------------------------------------------------------------------
// Return messages (per stage) — shown when a user returns after missing days
// ---------------------------------------------------------------------------

const RETURN_MESSAGES: string[] = [
  "Welcome back. Your seed is still here, ready to grow.",
  "You're back. Sprouts are resilient like that.",
  "Welcome back. Your roots held strong.",
  "You returned. That's what resilient people do.",
  "Welcome back. Trees don't stop growing after a storm.",
  "You're back. Nothing can uproot you.",
  "Welcome back. Forces of nature don't disappear.",
];

// ---------------------------------------------------------------------------
// Evolution Stages Configuration
// ---------------------------------------------------------------------------

export const EVOLUTION_STAGES: EvolutionStage[] = [
  // 0 — Seed
  {
    identity: {
      name: "Seed",
      emoji: "🌰",
      minChallenges: 0,
      identityLabel: "The Beginner",
      description: "Every journey starts with a single decision",
      transformationNarrative: "You decided to begin.",
    },
    unlocks: [
      {
        type: "badge",
        title: "Planted Seed",
        emoji: "🌰",
        description: "You took the first step. Most people never do.",
      },
    ],
    messages: [
      "Every oak was once a seed.",
      "The hardest step is the first one. You took it.",
      "You're here. That's what matters.",
    ],
  },
  // 1 — Sprout
  {
    identity: {
      name: "Sprout",
      emoji: "🌱",
      minChallenges: 3,
      identityLabel: "The Committed",
      description: "You're proving this isn't a passing thought",
      transformationNarrative: "You're showing up.",
    },
    unlocks: [
      {
        type: "badge",
        title: "First Steps",
        emoji: "👣",
        description:
          "Completed 3 challenges. You're not just thinking about it anymore.",
      },
    ],
    messages: [
      "Showing up is the real challenge. You're winning.",
      "Sprouts don't rush. They just keep growing.",
      "Three steps in. You're not dreaming anymore.",
    ],
  },
  // 2 — Sapling
  {
    identity: {
      name: "Sapling",
      emoji: "🌿",
      minChallenges: 7,
      identityLabel: "The Builder",
      description: "Consistency is becoming part of who you are",
      transformationNarrative: "You're building something real.",
    },
    unlocks: [
      {
        type: "badge",
        title: "Week Warrior",
        emoji: "📅",
        description: "7 challenges down. A full week of showing up.",
      },
    ],
    messages: [
      "Consistency is your superpower now.",
      "You're building roots that storms can't shake.",
      "A week of showing up. That's not luck — that's you.",
    ],
  },
  // 3 — Young Tree
  {
    identity: {
      name: "Young Tree",
      emoji: "🪴",
      minChallenges: 15,
      identityLabel: "The Resilient",
      description: "Your roots run deep enough to weather storms",
      transformationNarrative: "You've weathered doubt and kept going.",
    },
    unlocks: [
      {
        type: "badge",
        title: "Resilience",
        emoji: "💪",
        description: "15 challenges completed. Doubt came, you stayed.",
      },
    ],
    messages: [
      "Doubt came. You stayed.",
      "Your roots run deeper than you think.",
      "Fifteen steps. You're not the same person who started.",
    ],
  },
  // 4 — Tree
  {
    identity: {
      name: "Tree",
      emoji: "🌳",
      minChallenges: 30,
      identityLabel: "The Steady",
      description: "You don't need motivation — you have identity",
      transformationNarrative: "You became consistent.",
    },
    unlocks: [
      {
        type: "badge",
        title: "Steady Hand",
        emoji: "🎯",
        description: "30 challenges. This isn't a phase — it's who you are.",
      },
    ],
    messages: [
      "You don't need motivation. You have identity.",
      "Thirty challenges. This is who you are now.",
      "Standing tall. Standing steady.",
    ],
  },
  // 5 — Mighty Oak
  {
    identity: {
      name: "Mighty Oak",
      emoji: "🏔️",
      minChallenges: 50,
      identityLabel: "The Unstoppable",
      description: "Your growth inspires the world around you",
      transformationNarrative:
        "You didn't just change a habit. You changed yourself.",
    },
    unlocks: [
      {
        type: "badge",
        title: "Unstoppable",
        emoji: "🔥",
        description:
          "50 challenges. You didn't just build a habit — you built yourself.",
      },
    ],
    messages: [
      "Your growth is undeniable.",
      "Fifty steps of proof that you can change.",
      "You didn't just build a habit. You built yourself.",
    ],
  },
  // 6 — Ancient Grove
  {
    identity: {
      name: "Ancient Grove",
      emoji: "✨",
      minChallenges: 100,
      identityLabel: "The Transcendent",
      description: "You are a force of nature",
      transformationNarrative:
        "You are proof that small steps create transformation.",
    },
    unlocks: [
      {
        type: "badge",
        title: "Transcendence",
        emoji: "👑",
        description:
          "100 challenges. You are proof that small steps create transformation.",
      },
    ],
    messages: [
      "You are a force of nature.",
      "One hundred steps. A hundred proofs of who you are.",
      "Keep growing. There's no ceiling.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Backward-compatible alias (deprecated)
// ---------------------------------------------------------------------------

/** @deprecated Use `EVOLUTION_STAGES` and access `.identity` instead. */
export type CharacterStage = StageIdentity;

/** @deprecated Use `EVOLUTION_STAGES` instead. */
export const CHARACTER_STAGES: StageIdentity[] = EVOLUTION_STAGES.map(
  (s) => s.identity,
);

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Return unlocks for a given stage index. Empty array for out-of-range. */
export function getStageUnlocks(stageIndex: number): StageUnlock[] {
  if (stageIndex < 0 || stageIndex >= EVOLUTION_STAGES.length) return [];
  return EVOLUTION_STAGES[stageIndex].unlocks;
}

/** Return unlocks gained when transitioning from one stage to another. */
export function getNewUnlocks(
  fromStageIndex: number,
  toStageIndex: number,
): StageUnlock[] {
  if (toStageIndex <= fromStageIndex) return [];
  const start = Math.max(0, fromStageIndex + 1);
  const end = Math.min(toStageIndex, EVOLUTION_STAGES.length - 1);
  const unlocks: StageUnlock[] = [];
  for (let i = start; i <= end; i++) {
    unlocks.push(...EVOLUTION_STAGES[i].unlocks);
  }
  return unlocks;
}

/** Return a random motivational message from the stage's pool. */
export function getStageMessage(stageIndex: number): string {
  if (stageIndex < 0 || stageIndex >= EVOLUTION_STAGES.length) {
    return "Keep going.";
  }
  const msgs = EVOLUTION_STAGES[stageIndex].messages;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

/** Return the welcoming return message for a stage. */
export function getReturnMessage(stageIndex: number): string {
  if (stageIndex < 0 || stageIndex >= RETURN_MESSAGES.length) {
    return "Welcome back.";
  }
  return RETURN_MESSAGES[stageIndex];
}

/** Return an identity-based progress message. */
export function getProgressMessage(totalCompleted: number): string {
  const clamped = Math.max(0, totalCompleted);
  let stageIndex = 0;
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (clamped >= EVOLUTION_STAGES[i].identity.minChallenges) {
      stageIndex = i;
      break;
    }
  }
  const nextStage = EVOLUTION_STAGES[stageIndex + 1];
  if (!nextStage) {
    return "You are a force of nature. Keep growing.";
  }
  const remaining = nextStage.identity.minChallenges - clamped;
  return `${remaining} more steps to becoming a ${nextStage.identity.name}`;
}

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

/**
 * Compute character state from total completed challenges.
 * Pure function — no side effects.
 */
export function computeCharacterState(totalCompleted: number): CharacterState {
  const clamped = Math.max(0, totalCompleted);
  let stageIndex = 0;

  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (clamped >= EVOLUTION_STAGES[i].identity.minChallenges) {
      stageIndex = i;
      break;
    }
  }

  const stage = EVOLUTION_STAGES[stageIndex].identity;
  const nextStage = EVOLUTION_STAGES[stageIndex + 1] ?? null;
  const nextMilestone = nextStage ? nextStage.identity.minChallenges : null;

  let progressToNext = 1;
  if (nextStage) {
    const rangeStart = stage.minChallenges;
    const rangeEnd = nextStage.identity.minChallenges;
    progressToNext = (clamped - rangeStart) / (rangeEnd - rangeStart);
  }

  return {
    stage,
    stageIndex,
    totalCompleted: clamped,
    nextMilestone,
    progressToNext: Math.min(1, Math.max(0, progressToNext)),
    unlocks: getStageUnlocks(stageIndex),
    progressMessage: getProgressMessage(clamped),
  };
}
