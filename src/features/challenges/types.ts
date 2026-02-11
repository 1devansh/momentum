/**
 * Challenge & Goal Plan Types
 *
 * Core domain types for the challenge system.
 */

export interface MicroChallenge {
  id: string;
  title: string;
  description: string;
  encouragement: string;
  order: number;
  completed: boolean;
  completedAt?: string; // ISO date
}

export interface GoalPlan {
  id: string;
  goal: string;
  focusAreas: string[];
  challenges: MicroChallenge[];
  currentIndex: number; // index of next incomplete challenge
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface GoalPlanState {
  plans: GoalPlan[];
  activePlanId: string | null;
  isGenerating: boolean;
  error: string | null;
}

/** Summary stats derived from all plans */
export interface ChallengeStats {
  totalCompleted: number;
  totalChallenges: number;
  activePlans: number;
}
