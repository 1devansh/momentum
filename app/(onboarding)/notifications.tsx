/**
 * Screen 6: Notification Permission
 *
 * Requests push notification permission with gentle, non-guilt messaging.
 * Users can decline without friction.
 */

import * as Notifications from "expo-notifications";
import { Href, router } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { useUser } from "../../src/state";

export default function NotificationsScreen() {
  const { completeOnboarding, updatePreferences } = useUser();

  const finishOnboarding = async () => {
    // Persist focus areas from AsyncStorage (already saved per-screen)
    await completeOnboarding();
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
  footer: { paddingBottom: 16, alignItems: "center" },
  cta: { width: "100%" },
  skipBtn: { marginTop: 14, padding: 8 },
  skipText: { fontSize: 15, color: COLORS.textSecondary },
});
