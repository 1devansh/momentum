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

// Types
// TODO: Expand UserPreferences as features are added
interface UserPreferences {
  // TODO: Add notification preferences
  notificationsEnabled: boolean;
  // TODO: Add theme preference
  theme: "light" | "dark" | "system";
  // TODO: Add challenge preferences
  dailyReminderTime: string | null;
}

interface UserState {
  hasOnboarded: boolean;
  isLoading: boolean;
  preferences: UserPreferences;
  // TODO: Add user profile data when authentication is implemented
  // profile: UserProfile | null;
}

interface UserContextValue extends UserState {
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  // TODO: Add authentication methods
  // signIn: (credentials: Credentials) => Promise<void>;
  // signOut: () => Promise<void>;
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
        const [hasOnboardedStr, preferencesStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES),
        ]);

        const hasOnboarded = hasOnboardedStr === "true";
        const preferences = preferencesStr
          ? JSON.parse(preferencesStr)
          : defaultPreferences;

        updateState({
          hasOnboarded,
          preferences,
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

  const value: UserContextValue = {
    ...state,
    completeOnboarding,
    resetOnboarding,
    updatePreferences,
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
