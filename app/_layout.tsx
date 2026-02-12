/**
 * Root Layout
 *
 * The root layout that wraps the entire app.
 * Handles:
 * - Provider setup (state management)
 * - RevenueCat initialization
 * - Navigation structure
 * - Splash screen management
 */

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useGoalPlanStore } from "../src/features/challenges";
import { useProgramStore } from "../src/features/programs";
import { initializePurchases } from "../src/services";
import { SubscriptionProvider, UserProvider } from "../src/state";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize RevenueCat
        await initializePurchases();

        // Hydrate goal plan store from local storage
        await useGoalPlanStore.getState().hydrate();

        // Hydrate creator program enrollment from local storage
        await useProgramStore.getState().hydrate();
      } catch (error) {
        console.error("App initialization error:", error);
        // TODO: Handle initialization errors gracefully
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <SubscriptionProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </SubscriptionProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Root Navigator
 *
 * Defines the navigation structure of the app.
 * Uses expo-router's file-based routing.
 */
function RootNavigator() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* Index route handles navigation logic */}
      <Stack.Screen name="index" />

      {/* Onboarding flow */}
      <Stack.Screen
        name="(onboarding)"
        options={{
          animation: "fade",
        }}
      />

      {/* Main app (tabs) */}
      <Stack.Screen
        name="(main)"
        options={{
          animation: "fade",
        }}
      />

      {/* Paywall modal */}
      <Stack.Screen
        name="paywall"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
