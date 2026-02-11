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
import {
  clearUserProfile,
  getOrCreateUserProfile,
  getUserProfile,
  UserProfile,
} from "../../services/auth";

// Types
interface UserPreferences {
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  dailyReminderTime: string | null;
}

interface UserState {
  hasOnboarded: boolean;
  isLoading: boolean;
  preferences: UserPreferences;
  profile: UserProfile | null;
}

interface UserContextValue extends UserState {
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  notificationsEnabled: true,
  theme: "system",
  dailyReminderTime: null,
};

// Default state
const defaultState: UserState = {
  hasOnboarded: false,
  isLoading: true,
  preferences: defaultPreferences,
  profile: null,
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
        const [hasOnboardedStr, preferencesStr, profile] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES),
          getOrCreateUserProfile(), // Get or create user profile
        ]);

        const hasOnboarded = hasOnboardedStr === "true";
        const preferences = preferencesStr
          ? JSON.parse(preferencesStr)
          : defaultPreferences;

        updateState({
          hasOnboarded,
          preferences,
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
      ]);
      updateState({
        hasOnboarded: false,
        preferences: defaultPreferences,
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
