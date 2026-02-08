/**
 * Onboarding Layout
 *
 * Layout for the onboarding flow.
 * TODO: Add shared onboarding navigation if needed
 */

import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
