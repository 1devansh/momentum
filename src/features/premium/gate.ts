/**
 * Premium Gating Service
 *
 * Centralized premium feature checks.
 * All premium gating logic lives here — not scattered in UI.
 *
 * Entitlement: "momentum_plus" (RevenueCat)
 *
 * TODO: Add creator-led program gating
 * TODO: Add promotional unlock support
 * TODO: Add trial period logic
 * TODO: Add enhanced premium tiers
 */

const FREE_PLAN_LIMIT = 1;

export interface PremiumLimits {
  maxGoalPlans: number;
  canRegenerate: boolean;
  canEditGoal: boolean;
  canDeleteGoal: boolean;
  canSubmitRetro: boolean;
  // TODO: Add more premium feature flags
  // canAccessCreatorPrograms: boolean;
  // canExportData: boolean;
}

export function getPremiumLimits(isPro: boolean): PremiumLimits {
  return {
    maxGoalPlans: isPro ? Infinity : FREE_PLAN_LIMIT,
    canRegenerate: isPro,
    canEditGoal: true, // all users can edit
    canDeleteGoal: true, // gated by plan count in UI
    canSubmitRetro: true, // retro is available to all users
  };
}

export function canCreateGoalPlan(
  isPro: boolean,
  currentPlanCount: number,
): boolean {
  const limits = getPremiumLimits(isPro);
  return currentPlanCount < limits.maxGoalPlans;
}

export function canRegeneratePlan(isPro: boolean): boolean {
  return isPro;
}

/**
 * Can delete a goal plan.
 * Premium users can always delete. Free users can delete if they have more than 1 plan.
 */
export function canDeleteGoalPlan(
  isPro: boolean,
  currentPlanCount: number,
): boolean {
  if (currentPlanCount <= 1) return true; // always allow deleting last plan
  return isPro || currentPlanCount > 1;
}
