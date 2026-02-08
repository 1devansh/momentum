/**
 * Settings Screen
 *
 * User settings and account management.
 * TODO: Implement full settings functionality
 */

import { Href, router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { APP_CONFIG, COLORS } from "../../src/config";
import { useSubscription, useUser } from "../../src/state";

export default function SettingsScreen() {
  const { isPro, restore, isLoading } = useSubscription();
  const { resetOnboarding } = useUser();

  const handleUpgrade = () => {
    router.push("/paywall" as Href);
  };

  const handleRestore = async () => {
    const restored = await restore();
    if (restored) {
      Alert.alert("Success", "Your purchases have been restored!");
    } else {
      Alert.alert("No Purchases Found", "No previous purchases were found.");
    }
  };

  const handleResetOnboarding = async () => {
    // For development/testing only
    Alert.alert(
      "Reset Onboarding",
      "This will reset the onboarding flow. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetOnboarding();
            router.replace("/(onboarding)" as Href);
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionStatus}>
              {isPro ? "✨ Pro Member" : "Free Plan"}
            </Text>
            <Text style={styles.subscriptionDescription}>
              {isPro
                ? "You have access to all features"
                : "Upgrade to unlock all features"}
            </Text>
          </View>
          {!isPro && (
            <Button title="Upgrade" onPress={handleUpgrade} size="small" />
          )}
        </View>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleRestore}
          disabled={isLoading}
        >
          <Text style={styles.settingLabel}>Restore Purchases</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {/* TODO: Implement notification settings */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingValue}>On</Text>
        </TouchableOpacity>
        {/* TODO: Implement theme settings */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Theme</Text>
          <Text style={styles.settingValue}>System</Text>
        </TouchableOpacity>
        {/* TODO: Implement reminder time settings */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Daily Reminder</Text>
          <Text style={styles.settingValue}>9:00 AM</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {/* TODO: Implement help center */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Help Center</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        {/* TODO: Implement contact support */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Contact Us</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        {/* TODO: Implement privacy policy */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
        {/* TODO: Implement terms of service */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>{APP_CONFIG.version}</Text>
        </View>
      </View>

      {/* Development Section - Remove in production */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.devSection]}>
            🛠 Development
          </Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleResetOnboarding}
          >
            <Text style={styles.settingLabel}>Reset Onboarding</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TODO: Add account deletion option */}
      {/* TODO: Add data export option */}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  devSection: {
    color: COLORS.warning,
  },
  subscriptionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  subscriptionInfo: {
    flex: 1,
    marginRight: 12,
  },
  subscriptionStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  settingItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  settingArrow: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
