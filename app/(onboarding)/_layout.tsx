/**
 * Onboarding Layout
 *
 * Stack navigator for the multi-step onboarding flow.
 * Uses slide_from_right animation for forward momentum feel.
 */

import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    />
  );
}
