/**
 * Challenges feature barrel export
 */
export { computeAdaptation, computeWeeklyInsight } from "./adaptation";
export {
    generateChallenges,
    regenerateChallengesWithRetro
} from "./ai-generator";
export type { RetroContext } from "./ai-generator";
export { FALLBACK_CHALLENGES } from "./fallback-challenges";
export {
    RETRO_CHALLENGE_THRESHOLD,
    selectChallengesUntilRetro,
    selectCompletedHistory,
    selectCompletedToday,
    selectCurrentChallenge,
    selectHasNewChallenge,
    selectManualRetroCount,
    selectRetroEligible,
    selectRetroRequired,
    selectStats,
    useGoalPlanStore
} from "./store";
export type { CompletedEntry } from "./store";
export type {
    AdaptationResult,
    ChallengeStats,
    GoalPlan,
    GoalPlanState,
    MicroChallenge,
    RetroFeeling,
    WeeklyInsight,
    WeeklyRetro
} from "./types";

