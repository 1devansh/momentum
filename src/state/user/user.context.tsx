/**
 * User State Context
 *
 * Manages user-related state across the app.
 * Separate from subscription state for clean separation of concerns.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { STORAGE_KEYS } from "../../config/constants";
import { useGoalPlanStore } from "../../features/challenges";
import {
    clearUserProfile,
    getOrCreateUserProfile,
    getUserProfile,
    UserProfile,
} from "../../services/auth";
import { syncUserAttributesToRevenueCat } from "../../services/purchases";

// Types
export interface DailyReminder {
  id: string;
  time: string; // HH:mm format
  enabled: boolean;
}

interface UserPreferences {
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  dailyReminders: DailyReminder[];
}

export interface ExtendedUserProfile {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

interface UserState {
  hasOnboarded: boolean;
  isLoading: boolean;
  preferences: UserPreferences;
  profile: UserProfile | null;
  extendedProfile: ExtendedUserProfile;
}

interface UserContextValue extends UserState {
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  updateExtendedProfile: (
    updates: Partial<ExtendedUserProfile>,
  ) => Promise<void>;
  addReminder: (time: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  notificationsEnabled: true,
  theme: "system",
  dailyReminders: [],
};

const defaultExtendedProfile: ExtendedUserProfile = {};

// Default state
const defaultState: UserState = {
  hasOnboarded: false,
  isLoading: true,
  preferences: defaultPreferences,
  profile: null,
  extendedProfile: defaultExtendedProfile,
};

// Create context
const UserContext = createContext<UserContextValue | undefined>(undefined);

// Provider props
interface UserProviderProps {
  children: ReactNode;
}

/**
 * User Provider Component
 * Wrap your app with this to provide user state
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, setState] = useState<UserState>(defaultState);

  // Update state helper
  const updateState = useCallback((updates: Partial<UserState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const [hasOnboardedStr, preferencesStr, extendedProfileStr, profile] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
            AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES),
            AsyncStorage.getItem(STORAGE_KEYS.EXTENDED_USER_PROFILE),
            getOrCreateUserProfile(), // Get or create user profile
          ]);

        const hasOnboarded = hasOnboardedStr === "true";
        const preferences = preferencesStr
          ? JSON.parse(preferencesStr)
          : defaultPreferences;
        const extendedProfile = extendedProfileStr
          ? JSON.parse(extendedProfileStr)
          : defaultExtendedProfile;

        updateState({
          hasOnboarded,
          preferences,
          extendedProfile,
          profile,
          isLoading: false,
        });
      } catch (error) {
        console.error("[UserContext] Error loading persisted state:", error);
        updateState({ isLoading: false });
      }
    };

    loadPersistedState();
  }, [updateState]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, "true");
      updateState({ hasOnboarded: true });
    } catch (error) {
      console.error("[UserContext] Error completing onboarding:", error);
    }
  }, [updateState]);

  // Reset onboarding (for testing/debugging)
  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, "false");
      updateState({ hasOnboarded: false });
    } catch (error) {
      console.error("[UserContext] Error resetting onboarding:", error);
    }
  }, [updateState]);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      try {
        const newPreferences = { ...state.preferences, ...updates };
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_PREFERENCES,
          JSON.stringify(newPreferences),
        );
        updateState({ preferences: newPreferences });
      } catch (error) {
        console.error("[UserContext] Error updating preferences:", error);
      }
    },
    [state.preferences, updateState],
  );

  // Update extended profile
  const updateExtendedProfile = useCallback(
    async (updates: Partial<ExtendedUserProfile>) => {
      try {
        const newExtendedProfile = { ...state.extendedProfile, ...updates };
        await AsyncStorage.setItem(
          STORAGE_KEYS.EXTENDED_USER_PROFILE,
          JSON.stringify(newExtendedProfile),
        );
        updateState({ extendedProfile: newExtendedProfile });

        // Sync to RevenueCat
        await syncUserAttributesToRevenueCat(newExtendedProfile);
      } catch (error) {
        console.error("[UserContext] Error updating extended profile:", error);
      }
    },
    [state.extendedProfile, updateState],
  );

  // Add reminder
  const addReminder = useCallback(
    async (time: string) => {
      try {
        const newReminder: DailyReminder = {
          id: Date.now().toString(),
          time,
          enabled: true,
        };
        const newReminders = [...state.preferences.dailyReminders, newReminder];
        await updatePreferences({ dailyReminders: newReminders });
      } catch (error) {
        console.error("[UserContext] Error adding reminder:", error);
      }
    },
    [state.preferences.dailyReminders, updatePreferences],
  );

  // Remove reminder
  const removeReminder = useCallback(
    async (id: string) => {
      try {
        const newReminders = state.preferences.dailyReminders.filter(
          (r) => r.id !== id,
        );
        await updatePreferences({ dailyReminders: newReminders });
      } catch (error) {
        console.error("[UserContext] Error removing reminder:", error);
      }
    },
    [state.preferences.dailyReminders, updatePreferences],
  );

  // Toggle reminder
  const toggleReminder = useCallback(
    async (id: string) => {
      try {
        const newReminders = state.preferences.dailyReminders.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r,
        );
        await updatePreferences({ dailyReminders: newReminders });
      } catch (error) {
        console.error("[UserContext] Error toggling reminder:", error);
      }
    },
    [state.preferences.dailyReminders, updatePreferences],
  );

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      updateState({ profile });
    } catch (error) {
      console.error("[UserContext] Error refreshing profile:", error);
    }
  }, [updateState]);

  // Sign out (clear user data)
  const signOut = useCallback(async () => {
    try {
      await Promise.all([
        clearUserProfile(),
        AsyncStorage.removeItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES),
        AsyncStorage.removeItem(STORAGE_KEYS.EXTENDED_USER_PROFILE),
        AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_GOAL),
        AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_FOCUS_AREAS),
        useGoalPlanStore.getState().reset(),
      ]);
      updateState({
        hasOnboarded: false,
        preferences: defaultPreferences,
        extendedProfile: defaultExtendedProfile,
        profile: null,
      });
      console.log("[UserContext] User signed out successfully");
    } catch (error) {
      console.error("[UserContext] Error signing out:", error);
    }
  }, [updateState]);

  const value: UserContextValue = {
    ...state,
    completeOnboarding,
    resetOnboarding,
    updatePreferences,
    updateExtendedProfile,
    addReminder,
    removeReminder,
    toggleReminder,
    refreshProfile,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Hook to access user state
 * Must be used within UserProvider
 */
export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
