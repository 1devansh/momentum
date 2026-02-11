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
 */

const FREE_PLAN_LIMIT = 1;

export interface PremiumLimits {
  maxGoalPlans: number;
  canRegenerate: boolean;
  // TODO: Add more premium feature flags
  // canAccessCreatorPrograms: boolean;
  // canExportData: boolean;
}

export function getPremiumLimits(isPro: boolean): PremiumLimits {
  return {
    maxGoalPlans: isPro ? Infinity : FREE_PLAN_LIMIT,
    canRegenerate: isPro,
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
