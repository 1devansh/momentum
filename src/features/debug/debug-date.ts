/**
 * Debug Date Utility
 *
 * Allows advancing the "current date" by an offset for demo purposes.
 * Only used in debug mode. The offset is stored in-memory (resets on app restart).
 */

import { create } from "zustand";

interface DebugDateState {
  /** Number of days to offset from the real today */
  dayOffset: number;
  /** Advance by N days */
  advanceDays: (n: number) => void;
  /** Reset to real date */
  resetDate: () => void;
}

export const useDebugDateStore = create<DebugDateState>((set) => ({
  dayOffset: 0,
  advanceDays: (n) => set((s) => ({ dayOffset: s.dayOffset + n })),
  resetDate: () => set({ dayOffset: 0 }),
}));

/**
 * Get the debug-adjusted "today" date.
 * When dayOffset is 0, returns the real current date.
 */
export function getDebugDate(): Date {
  const offset = useDebugDateStore.getState().dayOffset;
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return now;
}

/**
 * Get the debug-adjusted today key (YYYY-MM-DD).
 */
export function getDebugTodayKey(): string {
  return getDebugDate().toISOString().slice(0, 10);
}
