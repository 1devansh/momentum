/**
 * Screen 6: Notification Permission
 *
 * Requests push notification permission.
 * On completion, generates the AI challenge plan from the user's goal,
 * then finishes onboarding.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { STORAGE_KEYS } from "../../src/config/constants";
import { useGoalPlanStore } from "../../src/features/challenges";
import { useUser } from "../../src/state";

export default function NotificationsScreen() {
  const { completeOnboarding, updatePreferences } = useUser();
  const createPlan = useGoalPlanStore((s) => s.createPlan);
  const [isGenerating, setIsGenerating] = useState(false);

  const finishOnboarding = async () => {
    setIsGenerating(true);
    try {
      // Load the goal and focus areas from onboarding storage
      const [goal, focusAreasRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_GOAL),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_FOCUS_AREAS),
      ]);

      const focusAreas = focusAreasRaw ? JSON.parse(focusAreasRaw) : [];

      // Generate the AI challenge plan
      if (goal) {
        await createPlan(goal, focusAreas);
      }
    } catch (error) {
      console.error("[Onboarding] Error generating plan:", error);
      // Continue anyway — user can retry from home screen
    }

    await completeOnboarding();
    setIsGenerating(false);
    router.replace("/(onboarding)/brave-move" as Href);
  };

  const handleEnable = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      await updatePreferences({ notificationsEnabled: status === "granted" });
    } catch (error) {
      console.error("[Notifications] Permission request failed:", error);
    }
    await finishOnboarding();
  };

  const handleSkip = async () => {
    await updatePreferences({ notificationsEnabled: false });
    await finishOnboarding();
  };

  if (isGenerating) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.generatingTitle}>Building your plan...</Text>
          <Text style={styles.generatingBody}>
            Creating personalized challenges just for you.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>A gentle nudge, not a nag</Text>
        <Text style={styles.body}>
          We'll send you one quiet reminder each day — just enough to keep your
          momentum going.
        </Text>
        <Text style={styles.body}>
          No spam, no guilt. You can change this anytime in settings.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Enable reminders"
          onPress={handleEnable}
          size="large"
          style={styles.cta}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Not right now</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 64, marginBottom: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  generatingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  generatingBody: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footer: { paddingBottom: 16, alignItems: "center" },
  cta: { width: "100%" },
  skipBtn: { marginTop: 14, padding: 8 },
  skipText: { fontSize: 15, color: COLORS.textSecondary },
});
