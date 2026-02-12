/**
 * Goal Plan Store (Zustand)
 *
 * Central state management for goal plans and challenges.
 * Persists to AsyncStorage. Separated from UI.
 *
 * TODO: Add backend sync action
 * TODO: Add optimistic updates when backend is available
 * TODO: Add advanced analytics tracking
 */

import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { computeCharacterState } from "../character";
import { getDebugDate, getDebugTodayKey } from "../debug/debug-date";
import { computeAdaptation, computeWeeklyInsight } from "./adaptation";
import {
  generateChallenges,
  regenerateChallengesWithRetro,
  RetroContext,
} from "./ai-generator";
import { clearGoalPlans, loadGoalPlans, saveGoalPlans } from "./storage";
import {
  GoalPlan,
  GoalPlanState,
  MicroChallenge,
  RetroFeeling,
  WeeklyRetro,
} from "./types";

const RETRO_CHALLENGE_THRESHOLD = 7;

/** Exported so UI can display retro countdown */
export { RETRO_CHALLENGE_THRESHOLD };

interface GoalPlanActions {
  /** Load plans from storage on app start */
  hydrate: () => Promise<void>;
  /** Create a new goal plan with AI-generated challenges */
  createPlan: (goal: string, focusAreas?: string[]) => Promise<GoalPlan>;
  /** Set the active plan */
  setActivePlan: (planId: string) => void;
  /** Mark the current challenge as complete and advance */
  completeCurrentChallenge: (planId: string, notes?: string) => void;
  /** Skip the current challenge (not relevant / already done) and advance */
  skipCurrentChallenge: (planId: string) => void;
  /** Delete a goal plan */
  deletePlan: (planId: string) => void;
  /** Regenerate challenges for a plan (premium) */
  regeneratePlan: (planId: string) => Promise<void>;
  /** Edit goal title and/or description (future challenges only) */
  editGoal: (
    planId: string,
    updates: { goal?: string; description?: string },
  ) => void;
  /** Submit a weekly retro and regenerate remaining challenges */
  submitRetro: (
    planId: string,
    reflection: string,
    feeling?: RetroFeeling,
    isManual?: boolean,
  ) => Promise<void>;
  /** Mark a goal as fully completed/achieved */
  completeGoal: (planId: string) => void;
  /** Reset all data (sign out) */
  reset: () => Promise<void>;
}

type GoalPlanStore = GoalPlanState & GoalPlanActions;

/**
 * Get today's date as YYYY-MM-DD string for daily gating.
 * Uses debug date offset when active.
 */
function todayKey(): string {
  return getDebugTodayKey();
}

/**
 * Check if a challenge was already completed today.
 */
function wasCompletedToday(challenge: MicroChallenge): boolean {
  if (!challenge.completedAt) return false;
  return challenge.completedAt.slice(0, 10) === todayKey();
}

export const useGoalPlanStore = create<GoalPlanStore>((set, get) => ({
  plans: [],
  activePlanId: null,
  isGenerating: false,
  error: null,

  hydrate: async () => {
    const plans = await loadGoalPlans();
    const activePlan = plans.find((p) => p.isActive) ?? plans[0] ?? null;
    set({ plans, activePlanId: activePlan?.id ?? null });
  },

  createPlan: async (goal, focusAreas = []) => {
    set({ isGenerating: true, error: null });
    try {
      const challenges = await generateChallenges(goal, focusAreas);
      const now = new Date().toISOString();
      const newPlan: GoalPlan = {
        id: Crypto.randomUUID(),
        goal,
        focusAreas,
        challenges,
        currentIndex: 0,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        retros: [],
        completedAtLastRetro: 0,
      };

      const { plans } = get();
      const updatedPlans = plans.map((p) => ({ ...p, isActive: false }));
      updatedPlans.push(newPlan);

      set({
        plans: updatedPlans,
        activePlanId: newPlan.id,
        isGenerating: false,
      });
      await saveGoalPlans(updatedPlans);
      return newPlan;
    } catch (error) {
      console.error("[GoalPlanStore] Error creating plan:", error);
      set({ isGenerating: false, error: "Failed to generate challenge plan" });
      throw error;
    }
  },

  setActivePlan: (planId) => {
    const { plans } = get();
    const updatedPlans = plans.map((p) => ({
      ...p,
      isActive: p.id === planId,
    }));
    set({ plans: updatedPlans, activePlanId: planId });
    saveGoalPlans(updatedPlans);
  },

  completeCurrentChallenge: (planId, notes) => {
    const { plans } = get();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    // Guard: don't allow completing if current challenge was already done today
    const current = plan.challenges[plan.currentIndex];
    if (!current || current.completed) return;

    const updatedPlans = plans.map((p) => {
      if (p.id !== planId) return p;

      const updatedChallenges = p.challenges.map((c, i) => {
        if (i === p.currentIndex) {
          return {
            ...c,
            completed: true,
            completedAt: getDebugDate().toISOString(),
            notes: notes?.trim() || undefined,
          };
        }
        return c;
      });

      // Advance to next incomplete challenge
      let nextIndex = p.currentIndex + 1;
      while (
        nextIndex < updatedChallenges.length &&
        updatedChallenges[nextIndex].completed
      ) {
        nextIndex++;
      }

      return {
        ...p,
        challenges: updatedChallenges,
        currentIndex: Math.min(nextIndex, updatedChallenges.length),
        updatedAt: new Date().toISOString(),
      };
    });

    set({ plans: updatedPlans });
    saveGoalPlans(updatedPlans);
  },

  skipCurrentChallenge: (planId) => {
    const { plans } = get();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const current = plan.challenges[plan.currentIndex];
    if (!current || current.completed) return;

    const updatedPlans = plans.map((p) => {
      if (p.id !== planId) return p;

      // Remove the skipped challenge entirely
      const updatedChallenges = p.challenges.filter(
        (_, i) => i !== p.currentIndex,
      );

      // currentIndex now points to the next challenge (same index, shorter array)
      return {
        ...p,
        challenges: updatedChallenges,
        currentIndex: Math.min(p.currentIndex, updatedChallenges.length),
        updatedAt: new Date().toISOString(),
      };
    });

    set({ plans: updatedPlans });
    saveGoalPlans(updatedPlans);
  },

  deletePlan: (planId) => {
    const { plans, activePlanId } = get();
    const updatedPlans = plans.filter((p) => p.id !== planId);
    const newActiveId =
      planId === activePlanId ? (updatedPlans[0]?.id ?? null) : activePlanId;

    if (newActiveId && newActiveId !== activePlanId) {
      const idx = updatedPlans.findIndex((p) => p.id === newActiveId);
      if (idx >= 0)
        updatedPlans[idx] = { ...updatedPlans[idx], isActive: true };
    }

    set({ plans: updatedPlans, activePlanId: newActiveId });
    saveGoalPlans(updatedPlans);
  },

  regeneratePlan: async (planId) => {
    const { plans } = get();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    set({ isGenerating: true, error: null });
    try {
      const challenges = await generateChallenges(plan.goal, plan.focusAreas);
      const updatedPlans = plans.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          challenges,
          currentIndex: 0,
          updatedAt: new Date().toISOString(),
        };
      });

      set({ plans: updatedPlans, isGenerating: false });
      await saveGoalPlans(updatedPlans);
    } catch (error) {
      console.error("[GoalPlanStore] Error regenerating plan:", error);
      set({ isGenerating: false, error: "Failed to regenerate challenges" });
    }
  },

  editGoal: (planId, updates) => {
    const { plans } = get();
    const updatedPlans = plans.map((p) => {
      if (p.id !== planId) return p;
      return {
        ...p,
        ...(updates.goal !== undefined && { goal: updates.goal }),
        ...(updates.description !== undefined && {
          description: updates.description,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
    set({ plans: updatedPlans });
    saveGoalPlans(updatedPlans);
  },

  submitRetro: async (planId, reflection, feeling, isManual) => {
    const { plans } = get();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const completedChallenges = plan.challenges.filter((c) => c.completed);

    // Compute weekly insight
    const insight = computeWeeklyInsight(plan);

    // Compute adaptation based on feeling + insight
    const adaptation = computeAdaptation(feeling, insight);

    // Compute character stage for AI context
    let totalCompleted = 0;
    for (const p of plans) {
      for (const c of p.challenges) {
        if (c.completed) totalCompleted++;
      }
    }
    const character = computeCharacterState(totalCompleted);

    const retroContext: RetroContext = {
      completedChallengeTitles: completedChallenges.map((c) => c.title),
      reflection,
      feeling,
      progressStage: character.stage.name,
      adaptation,
    };

    set({ isGenerating: true, error: null });
    try {
      // Generate count: add 1 if stretch task is requested
      const generateCount = adaptation.addStretchTask
        ? RETRO_CHALLENGE_THRESHOLD + 1
        : RETRO_CHALLENGE_THRESHOLD;

      const newChallenges = await regenerateChallengesWithRetro(
        plan.goal,
        plan.focusAreas,
        retroContext,
        generateCount,
      );

      const retro: WeeklyRetro = {
        id: Crypto.randomUUID(),
        planId,
        reflection,
        feeling,
        completedChallengeCount: completedChallenges.length,
        createdAt: new Date().toISOString(),
        adaptation,
        insight,
        isManual: isManual ?? false,
      };

      const updatedPlans = plans.map((p) => {
        if (p.id !== planId) return p;

        const isEarlyRetro = p.currentIndex < p.challenges.length;

        if (isEarlyRetro) {
          // Early retro: keep completed, replace remaining incomplete with new batch
          const kept = p.challenges.filter((c) => c.completed);
          const reordered = newChallenges.map(
            (c: MicroChallenge, i: number) => ({
              ...c,
              order: kept.length + i,
            }),
          );
          return {
            ...p,
            challenges: [...kept, ...reordered],
            currentIndex: kept.length, // point to first new challenge
            retros: [...(p.retros || []), retro],
            completedAtLastRetro: kept.length,
            updatedAt: new Date().toISOString(),
          };
        }

        // Forced retro (all challenges completed): append new batch
        const reordered = newChallenges.map((c: MicroChallenge, i: number) => ({
          ...c,
          order: p.challenges.length + i,
        }));
        return {
          ...p,
          challenges: [...p.challenges, ...reordered],
          retros: [...(p.retros || []), retro],
          completedAtLastRetro: completedChallenges.length,
          updatedAt: new Date().toISOString(),
        };
      });

      set({ plans: updatedPlans, isGenerating: false });
      await saveGoalPlans(updatedPlans);
    } catch (error) {
      console.error("[GoalPlanStore] Error submitting retro:", error);
      set({ isGenerating: false, error: "Failed to regenerate challenges" });
    }
  },

  completeGoal: (planId) => {
    const { plans, activePlanId } = get();
    const updatedPlans = plans.map((p) => {
      if (p.id !== planId) return p;
      return {
        ...p,
        goalCompletedAt: new Date().toISOString(),
        isActive: false,
        updatedAt: new Date().toISOString(),
      };
    });

    // If the completed goal was active, switch to another plan
    const newActiveId =
      planId === activePlanId
        ? (updatedPlans.find((p) => !p.goalCompletedAt && p.id !== planId)
            ?.id ?? null)
        : activePlanId;

    set({ plans: updatedPlans, activePlanId: newActiveId });
    saveGoalPlans(updatedPlans);
  },

  reset: async () => {
    await clearGoalPlans();
    set({ plans: [], activePlanId: null, isGenerating: false, error: null });
  },
}));

// ── Selector helpers (derived from reactive `plans` state) ──────────

/**
 * Get the current challenge for a plan, respecting daily gating.
 * Returns null if no challenge available or today's was already done.
 */
export function selectCurrentChallenge(
  plans: GoalPlan[],
  planId: string | null,
): MicroChallenge | null {
  if (!planId) return null;
  const plan = plans.find((p) => p.id === planId);
  if (!plan || plan.currentIndex >= plan.challenges.length) return null;
  return plan.challenges[plan.currentIndex];
}

/**
 * Check whether today's challenge has already been completed.
 */
export function selectCompletedToday(
  plans: GoalPlan[],
  planId: string | null,
): boolean {
  if (!planId) return false;
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return false;

  // Check the challenge that was just completed (one before currentIndex)
  // or the current one if it's already marked done
  const prevIndex = plan.currentIndex - 1;
  if (prevIndex >= 0 && wasCompletedToday(plan.challenges[prevIndex])) {
    return true;
  }
  // Also check current in case it's somehow marked completed today
  if (
    plan.currentIndex < plan.challenges.length &&
    wasCompletedToday(plan.challenges[plan.currentIndex])
  ) {
    return true;
  }
  return false;
}

/**
 * Compute stats from plans array (reactive — recalculates when plans change).
 */
export function selectStats(plans: GoalPlan[]) {
  let totalCompleted = 0;
  let totalChallenges = 0;

  for (const plan of plans) {
    for (const c of plan.challenges) {
      totalChallenges++;
      if (c.completed) totalCompleted++;
    }
  }

  return {
    totalCompleted,
    totalChallenges,
    activePlans: plans.filter((p) => p.isActive).length,
  };
}

/** A completed challenge entry with its parent goal for display. */
export interface CompletedEntry {
  challengeId: string;
  title: string;
  description: string;
  notes?: string;
  completedAt: string;
  goalName: string;
}

/**
 * Build a chronological journal of completed challenges across all plans.
 * Most recent first.
 */
export function selectCompletedHistory(plans: GoalPlan[]): CompletedEntry[] {
  const entries: CompletedEntry[] = [];

  for (const plan of plans) {
    for (const c of plan.challenges) {
      if (c.completed && c.completedAt) {
        entries.push({
          challengeId: c.id,
          title: c.title,
          description: c.description,
          notes: c.notes,
          completedAt: c.completedAt,
          goalName: plan.goal,
        });
      }
    }
  }

  entries.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return entries;
}

/**
 * Check if a plan requires a retro before continuing.
 * Required when all current challenges are completed (batch of 7 done).
 */
export function selectRetroRequired(plan: GoalPlan | undefined): boolean {
  if (!plan) return false;
  return (
    plan.currentIndex >= plan.challenges.length && plan.challenges.length > 0
  );
}

/**
 * Check if a plan is eligible for a weekly retro.
 * Eligible after 7 completed challenges since last retro (or since start),
 * OR always available manually.
 */
export function selectRetroEligible(plan: GoalPlan | undefined): boolean {
  if (!plan) return false;
  const completed = plan.challenges.filter((c) => c.completed).length;
  const sinceLastRetro = completed - (plan.completedAtLastRetro || 0);
  return sinceLastRetro >= RETRO_CHALLENGE_THRESHOLD;
}

/**
 * Check if a plan has a new daily challenge available (not yet completed today).
 */
export function selectHasNewChallenge(plan: GoalPlan | undefined): boolean {
  if (!plan) return false;
  if (plan.currentIndex >= plan.challenges.length) return false;
  const current = plan.challenges[plan.currentIndex];
  if (!current || current.completed) return false;
  // Not completed today
  if (current.completedAt) {
    return current.completedAt.slice(0, 10) !== todayKey();
  }
  return true;
}

/**
 * Get the number of challenges remaining until the next retro is available.
 * Returns 0 if already eligible.
 */
export function selectChallengesUntilRetro(plan: GoalPlan | undefined): number {
  if (!plan) return RETRO_CHALLENGE_THRESHOLD;
  const completed = plan.challenges.filter((c) => c.completed).length;
  const sinceLastRetro = completed - (plan.completedAtLastRetro || 0);
  return Math.max(0, RETRO_CHALLENGE_THRESHOLD - sinceLastRetro);
}

/**
 * Count total manual (early) retros across all plans.
 * Used for premium gating of manual retros.
 */
export function selectManualRetroCount(plans: GoalPlan[]): number {
  return plans.reduce(
    (count, plan) =>
      count + plan.retros.filter((r) => r.isManual === true).length,
    0,
  );
}
