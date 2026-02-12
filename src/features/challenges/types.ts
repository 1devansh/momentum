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
  notes?: string; // user's thoughts on completion
}

/** Structured feeling options for weekly retro */
export type RetroFeeling =
  | "confident"
  | "stuck"
  | "overwhelmed"
  | "motivated"
  | "neutral";

export interface WeeklyRetro {
  id: string;
  planId: string;
  reflection: string;
  feeling?: RetroFeeling;
  completedChallengeCount: number;
  createdAt: string;
}

export interface GoalPlan {
  id: string;
  goal: string;
  description?: string;
  focusAreas: string[];
  challenges: MicroChallenge[];
  currentIndex: number; // index of next incomplete challenge
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  retros: WeeklyRetro[];
  /** Number of completed challenges at last retro (tracks retro eligibility) */
  completedAtLastRetro: number;
  /** ISO date when user marked the goal as fully achieved */
  goalCompletedAt?: string;
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
