/**
 * Challenges feature barrel export
 */
export { generateChallenges } from "./ai-generator";
export { FALLBACK_CHALLENGES } from "./fallback-challenges";
export {
    selectCompletedHistory,
    selectCompletedToday,
    selectCurrentChallenge,
    selectStats,
    useGoalPlanStore
} from "./store";
export type { CompletedEntry } from "./store";
export type {
    ChallengeStats,
    GoalPlan,
    GoalPlanState,
    MicroChallenge
} from "./types";

