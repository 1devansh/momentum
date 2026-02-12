/**
 * Creator Program Store (Zustand)
 *
 * Central state management for creator-led programs.
 * Completely separate from GoalPlan store.
 * Persists enrollment to AsyncStorage.
 *
 * MVP: One active program at a time.
 *
 * TODO: Add backend sync for enrollment
 * TODO: Add completed programs history
 * TODO: Add program purchase tracking
 * TODO: Add creator monetization split tracking
 */

import { create } from "zustand";
import { CREATOR_PROGRAMS } from "./data";
import {
    clearActiveProgram,
    loadActiveProgram,
    saveActiveProgram,
} from "./storage";
import { ActiveProgram, CreatorProgram, ProgramDay } from "./types";

interface ProgramState {
  /** All available programs (local mock data for MVP) */
  programs: CreatorProgram[];
  /** Currently enrolled program, or null */
  activeProgram: ActiveProgram | null;
}

interface ProgramActions {
  /** Load enrollment from storage on app start */
  hydrate: () => Promise<void>;
  /** Enroll in a program (replaces any current enrollment) */
  enroll: (programId: string) => void;
  /** Complete the current day and advance */
  completeDay: () => void;
  /** Leave the current program */
  abandon: () => void;
  /** Reset all program data (sign out) */
  reset: () => Promise<void>;
}

type ProgramStore = ProgramState & ProgramActions;

export const useProgramStore = create<ProgramStore>((set, get) => ({
  programs: CREATOR_PROGRAMS,
  activeProgram: null,

  hydrate: async () => {
    const activeProgram = await loadActiveProgram();
    set({ activeProgram });
  },

  enroll: (programId) => {
    const program = get().programs.find((p) => p.id === programId);
    if (!program) return;

    const enrollment: ActiveProgram = {
      programId,
      currentDay: 1,
      startedAt: new Date().toISOString(),
      completedDays: [],
    };

    set({ activeProgram: enrollment });
    saveActiveProgram(enrollment);
  },

  completeDay: () => {
    const { activeProgram, programs } = get();
    if (!activeProgram) return;

    const program = programs.find((p) => p.id === activeProgram.programId);
    if (!program) return;

    const dayNum = activeProgram.currentDay;
    if (activeProgram.completedDays.includes(dayNum)) return;

    const updatedCompletedDays = [...activeProgram.completedDays, dayNum];
    const nextDay = dayNum + 1;
    const isFinished = nextDay > program.durationDays;

    const updated: ActiveProgram = {
      ...activeProgram,
      completedDays: updatedCompletedDays,
      currentDay: isFinished ? dayNum : nextDay,
    };

    // TODO: If isFinished, move to completed programs history
    // For MVP, we keep the enrollment so the user sees the completion state
    if (isFinished) {
      // Program complete — clear enrollment
      set({ activeProgram: null });
      saveActiveProgram(null);
      return;
    }

    set({ activeProgram: updated });
    saveActiveProgram(updated);
  },

  abandon: () => {
    set({ activeProgram: null });
    clearActiveProgram();
  },

  reset: async () => {
    await clearActiveProgram();
    set({ activeProgram: null });
  },
}));

// ── Selectors ──────────────────────────────────────────────────────

/**
 * Get the CreatorProgram for the current enrollment, or null.
 */
export function selectActiveCreatorProgram(
  programs: CreatorProgram[],
  activeProgram: ActiveProgram | null,
): CreatorProgram | null {
  if (!activeProgram) return null;
  return programs.find((p) => p.id === activeProgram.programId) ?? null;
}

/**
 * Get today's program day content, or null if no active program.
 */
export function selectTodayProgramDay(
  programs: CreatorProgram[],
  activeProgram: ActiveProgram | null,
): ProgramDay | null {
  const program = selectActiveCreatorProgram(programs, activeProgram);
  if (!program || !activeProgram) return null;
  return program.days.find((d) => d.day === activeProgram.currentDay) ?? null;
}

/**
 * Check if the current program day has been completed.
 */
export function selectProgramDayCompleted(
  activeProgram: ActiveProgram | null,
): boolean {
  if (!activeProgram) return false;
  return activeProgram.completedDays.includes(activeProgram.currentDay);
}

/**
 * Get program progress as a fraction (0–1).
 */
export function selectProgramProgress(
  activeProgram: ActiveProgram | null,
  program: CreatorProgram | null,
): number {
  if (!activeProgram || !program) return 0;
  return activeProgram.completedDays.length / program.durationDays;
}
