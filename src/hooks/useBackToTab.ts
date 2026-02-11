/**
 * Custom hook to handle back navigation to a specific tab
 *
 * This is useful for screens within a tab navigator that should
 * navigate back to a specific tab instead of following the default
 * navigation history.
 */

import { Href, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";

export function useBackToTab(tabRoute: Href) {
  const navigateToTab = useCallback(() => {
    router.push(tabRoute);
    return true; // Prevent default back behavior
  }, [tabRoute]);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        navigateToTab,
      );

      return () => backHandler.remove();
    }, [navigateToTab]),
  );

  return navigateToTab;
}
