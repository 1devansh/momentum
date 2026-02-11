/**
 * Goal Plan Store (Zustand)
 *
 * Central state management for goal plans and challenges.
 * Persists to AsyncStorage. Separated from UI.
 *
 * TODO: Add backend sync action
 * TODO: Add optimistic updates when backend is available
 */

import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { generateChallenges } from "./ai-generator";
import { clearGoalPlans, loadGoalPlans, saveGoalPlans } from "./storage";
import { GoalPlan, GoalPlanState, MicroChallenge } from "./types";

interface GoalPlanActions {
  /** Load plans from storage on app start */
  hydrate: () => Promise<void>;
  /** Create a new goal plan with AI-generated challenges */
  createPlan: (goal: string, focusAreas?: string[]) => Promise<GoalPlan>;
  /** Set the active plan */
  setActivePlan: (planId: string) => void;
  /** Mark the current challenge as complete and advance */
  completeCurrentChallenge: (planId: string, notes?: string) => void;
  /** Delete a goal plan */
  deletePlan: (planId: string) => void;
  /** Regenerate challenges for a plan (premium) */
  regeneratePlan: (planId: string) => Promise<void>;
  /** Reset all data (sign out) */
  reset: () => Promise<void>;
}

type GoalPlanStore = GoalPlanState & GoalPlanActions;

/**
 * Get today's date as YYYY-MM-DD string for daily gating.
 */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
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
            completedAt: new Date().toISOString(),
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
