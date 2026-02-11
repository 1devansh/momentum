/**
 * Onboarding Flow State Hook
 *
 * Manages local state for the multi-step onboarding flow.
 * Persists focus areas and goal to AsyncStorage for future use.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { STORAGE_KEYS } from "../config/constants";

export type FocusArea =
  | "Career & Ambition"
  | "Travel & Adventure"
  | "Financial Confidence"
  | "Health & Strength"
  | "Self-Trust & Confidence"
  | "Creativity";

export const FOCUS_AREAS: { label: FocusArea; emoji: string }[] = [
  { label: "Career & Ambition", emoji: "🚀" },
  { label: "Travel & Adventure", emoji: "🌍" },
  { label: "Financial Confidence", emoji: "💰" },
  { label: "Health & Strength", emoji: "💪" },
  { label: "Self-Trust & Confidence", emoji: "🔥" },
  { label: "Creativity", emoji: "🎨" },
];

interface OnboardingState {
  selectedAreas: FocusArea[];
  goal: string;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    selectedAreas: [],
    goal: "",
  });

  const toggleArea = useCallback((area: FocusArea) => {
    setState((prev) => {
      const isSelected = prev.selectedAreas.includes(area);
      if (isSelected) {
        return {
          ...prev,
          selectedAreas: prev.selectedAreas.filter((a) => a !== area),
        };
      }
      if (prev.selectedAreas.length >= 2) return prev;
      return { ...prev, selectedAreas: [...prev.selectedAreas, area] };
    });
  }, []);

  const setGoal = useCallback((goal: string) => {
    setState((prev) => ({ ...prev, goal }));
  }, []);

  /** Persist selections to AsyncStorage for future AI personalization */
  const persistSelections = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.ONBOARDING_FOCUS_AREAS,
          JSON.stringify(state.selectedAreas),
        ),
        state.goal.trim()
          ? AsyncStorage.setItem(
              STORAGE_KEYS.ONBOARDING_GOAL,
              state.goal.trim(),
            )
          : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("[useOnboarding] Error persisting selections:", error);
    }
  }, [state]);

  return {
    ...state,
    toggleArea,
    setGoal,
    persistSelections,
  };
}
