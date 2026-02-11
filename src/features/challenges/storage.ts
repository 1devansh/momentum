/**
 * Goal Plan Persistence
 *
 * Handles reading/writing goal plans to AsyncStorage.
 * TODO: Add backend sync when API is available
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoalPlan } from "./types";

const STORAGE_KEY = "@momentum/goal_plans";

export async function loadGoalPlans(): Promise<GoalPlan[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("[GoalPlanStorage] Error loading plans:", error);
    return [];
  }
}

export async function saveGoalPlans(plans: GoalPlan[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error("[GoalPlanStorage] Error saving plans:", error);
  }
}

export async function clearGoalPlans(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[GoalPlanStorage] Error clearing plans:", error);
  }
}
