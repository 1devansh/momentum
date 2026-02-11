/**
 * Settings Screen
 *
 * User settings and account management.
 */

import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { APP_CONFIG, COLORS } from "../../src/config";
import { useSubscription, useUser } from "../../src/state";

export default function SettingsScreen() {
  const { isPro, restore, isLoading } = useSubscription();
  const {
    preferences,
    extendedProfile,
    updatePreferences,
    signOut,
    resetOnboarding,
  } = useUser();

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

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "This will clear all your data and create a new user ID. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            Alert.alert(
              "Success",
              "Signed out successfully. Restart the app to see changes.",
            );
          },
        },
      ],
    );
  };

  const handleResetOnboarding = async () => {
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

  const handleThemeChange = () => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(preferences.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updatePreferences({ theme: nextTheme });
  };

  const getThemeLabel = () => {
    switch (preferences.theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
    }
  };

  const getRemindersSummary = () => {
    const activeReminders = preferences.dailyReminders.filter(
      (r) => r.enabled,
    ).length;
    if (activeReminders === 0) return "None";
    return `${activeReminders} active`;
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => router.push("/(main)/profile" as Href)}
          >
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color={COLORS.textSecondary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {extendedProfile.name || "Set up your profile"}
              </Text>
              <Text style={styles.profileEmail}>
                {extendedProfile.email || "Add your email"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
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
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={(value) =>
                updatePreferences({ notificationsEnabled: value })
              }
              trackColor={{ false: COLORS.surface, true: COLORS.primary }}
              thumbColor={COLORS.background}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleThemeChange}
          >
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{getThemeLabel()}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(main)/reminders" as Href)}
          >
            <Text style={styles.settingLabel}>Daily Reminders</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{getRemindersSummary()}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Help Center</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Contact Us</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <Text style={[styles.settingLabel, styles.dangerText]}>
              Sign Out
            </Text>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
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
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  dangerText: {
    color: COLORS.error,
  },
});
