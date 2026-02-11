/**
 * Character Growth Engine
 *
 * Deterministic, milestone-based character evolution.
 * Separated from UI — pure business logic.
 *
 * Growth is based on total completed challenges across all goal plans.
 * Character never regresses.
 *
 * TODO: Add achievement unlocks at milestones
 * TODO: Support custom character themes (premium)
 * TODO: Add creator-led character packs
 */

export interface CharacterStage {
  name: string;
  emoji: string;
  minChallenges: number;
  description: string;
}

export const CHARACTER_STAGES: CharacterStage[] = [
  {
    name: "Seed",
    emoji: "🌰",
    minChallenges: 0,
    description: "Every journey starts here",
  },
  {
    name: "Sprout",
    emoji: "🌱",
    minChallenges: 3,
    description: "Breaking through the surface",
  },
  {
    name: "Sapling",
    emoji: "🌿",
    minChallenges: 7,
    description: "Growing stronger each day",
  },
  {
    name: "Young Tree",
    emoji: "🪴",
    minChallenges: 15,
    description: "Roots are deepening",
  },
  {
    name: "Tree",
    emoji: "🌳",
    minChallenges: 30,
    description: "Standing tall and steady",
  },
  {
    name: "Mighty Oak",
    emoji: "🏔️",
    minChallenges: 50,
    description: "Unmovable, unstoppable",
  },
  {
    name: "Ancient Grove",
    emoji: "✨",
    minChallenges: 100,
    description: "A force of nature",
  },
];

export interface CharacterState {
  stage: CharacterStage;
  stageIndex: number;
  totalCompleted: number;
  nextMilestone: number | null; // challenges needed for next stage
  progressToNext: number; // 0-1 progress toward next stage
}

/**
 * Compute character state from total completed challenges.
 * Pure function — no side effects.
 */
export function computeCharacterState(totalCompleted: number): CharacterState {
  let stageIndex = 0;

  for (let i = CHARACTER_STAGES.length - 1; i >= 0; i--) {
    if (totalCompleted >= CHARACTER_STAGES[i].minChallenges) {
      stageIndex = i;
      break;
    }
  }

  const stage = CHARACTER_STAGES[stageIndex];
  const nextStage = CHARACTER_STAGES[stageIndex + 1] ?? null;
  const nextMilestone = nextStage ? nextStage.minChallenges : null;

  let progressToNext = 1;
  if (nextStage) {
    const rangeStart = stage.minChallenges;
    const rangeEnd = nextStage.minChallenges;
    progressToNext = (totalCompleted - rangeStart) / (rangeEnd - rangeStart);
  }

  return {
    stage,
    stageIndex,
    totalCompleted,
    nextMilestone,
    progressToNext: Math.min(1, Math.max(0, progressToNext)),
  };
}
