/**
 * App State Hook
 *
 * Handles app state changes (foreground/background).
 * Useful for refreshing data when app comes to foreground.
 */

import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

type AppStateCallback = (state: AppStateStatus) => void;

/**
 * Hook to listen for app state changes
 *
 * @param onForeground - Callback when app comes to foreground
 * @param onBackground - Callback when app goes to background
 */
export const useAppState = (
  onForeground?: AppStateCallback,
  onBackground?: AppStateCallback,
) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // App came to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        onForeground?.(nextAppState);
      }

      // App went to background
      if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        onBackground?.(nextAppState);
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground]);

  return appState.current;
};
