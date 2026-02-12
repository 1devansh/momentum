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

/** Adaptation adjustments applied after a retro */
export interface AdaptationResult {
  /** What changed */
  adjustments: string[];
  /** Why it changed */
  reason: string;
  /** What to expect */
  expectation: string;
  /** Applied difficulty modifier: -1 easier, 0 same, +1 harder */
  difficultyDelta: -1 | 0 | 1;
  /** Target duration in minutes (default 10) */
  targetDurationMinutes: number;
  /** Whether to add guidance prompts to challenges */
  addGuidance: boolean;
  /** Whether to add a stretch/bonus task */
  addStretchTask: boolean;
  /** Preferred time of day hint (if detected) */
  preferredTimeHint?: string;
}

/** Weekly insight summary computed before retro input */
export interface WeeklyInsight {
  completedCount: number;
  totalCount: number;
  completionRate: number;
  /** "morning" | "afternoon" | "evening" | "mixed" */
  timePattern: string;
  missedDays: number;
  /** Human-readable behavioral insight */
  behavioralInsight: string;
  /** Days since plan started or last retro */
  daySpan: number;
}

export interface WeeklyRetro {
  id: string;
  planId: string;
  reflection: string;
  feeling?: RetroFeeling;
  completedChallengeCount: number;
  createdAt: string;
  /** Adaptation applied after this retro */
  adaptation?: AdaptationResult;
  /** Insight snapshot at time of retro */
  insight?: WeeklyInsight;
  /** Whether this was a manual (early) retro vs forced */
  isManual?: boolean;
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
