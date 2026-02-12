/**
 * Program Enrollment Persistence
 *
 * Handles reading/writing active program state to AsyncStorage.
 * Separate from goal plan storage.
 *
 * TODO: Add backend sync when API is available
 * TODO: Add completed programs history storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveProgram } from "./types";

const STORAGE_KEY = "@momentum/active_program";

export async function loadActiveProgram(): Promise<ActiveProgram | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("[ProgramStorage] Error loading active program:", error);
    return null;
  }
}

export async function saveActiveProgram(
  program: ActiveProgram | null,
): Promise<void> {
  try {
    if (program) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(program));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("[ProgramStorage] Error saving active program:", error);
  }
}

export async function clearActiveProgram(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[ProgramStorage] Error clearing active program:", error);
  }
}
