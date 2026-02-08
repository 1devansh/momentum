/**
 * Index Route (Entry Point)
 *
 * This is the initial route that handles navigation logic.
 * Redirects users based on their onboarding status.
 */

import { Href, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { COLORS } from "../src/config";
import { useUser } from "../src/state";

export default function Index() {
  const { hasOnboarded, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (hasOnboarded) {
        // User has completed onboarding, go to main app
        router.replace("/(main)/home" as Href);
      } else {
        // New user, show onboarding
        router.replace("/(onboarding)" as Href);
      }
    }
  }, [hasOnboarded, isLoading]);

  // Show loading indicator while checking onboarding status
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
