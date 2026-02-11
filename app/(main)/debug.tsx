/**
 * Debug Screen
 *
 * Displays user information and provides testing utilities.
 * Remove this screen before production release.
 */

import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ScreenContainer } from "../../src/components";
import { useSubscription } from "../../src/state/subscription";
import { useUser } from "../../src/state/user";

export default function DebugScreen() {
  const { profile, preferences, hasOnboarded, signOut, resetOnboarding } =
    useUser();
  const { isPro, isLoading: subLoading } = useSubscription();

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "This will clear all user data and create a new user ID. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            Alert.alert(
              "Success",
              "User data cleared. Restart the app to see changes.",
            );
          },
        },
      ],
    );
  };

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    Alert.alert(
      "Success",
      "Onboarding reset. Restart the app to see onboarding flow.",
    );
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Debug Information</Text>
        <Text style={styles.warning}>
          ⚠️ Remove this screen before production release
        </Text>

        {/* User Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Profile</Text>
          {profile ? (
            <>
              <InfoRow label="User ID" value={profile.userId} />
              <InfoRow
                label="Created At"
                value={new Date(profile.createdAt).toLocaleString()}
              />
              <InfoRow
                label="Last Login"
                value={new Date(profile.lastLoginAt).toLocaleString()}
              />
            </>
          ) : (
            <Text style={styles.value}>No profile loaded</Text>
          )}
        </View>

        {/* Subscription Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <InfoRow label="Is Pro" value={isPro ? "Yes ✅" : "No ❌"} />
          <InfoRow label="Loading" value={subLoading ? "Yes" : "No"} />
        </View>

        {/* App State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App State</Text>
          <InfoRow label="Has Onboarded" value={hasOnboarded ? "Yes" : "No"} />
          <InfoRow
            label="Notifications"
            value={preferences.notificationsEnabled ? "Enabled" : "Disabled"}
          />
          <InfoRow label="Theme" value={preferences.theme} />
          <InfoRow
            label="Reminder Time"
            value={preferences.dailyReminderTime || "Not set"}
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetOnboarding}
          >
            <Text style={styles.buttonText}>Reset Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleSignOut}
          >
            <Text style={[styles.buttonText, styles.dangerButtonText]}>
              Sign Out (Clear All Data)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RevenueCat Testing</Text>
          <Text style={styles.instructions}>
            1. Copy your User ID above{"\n"}
            2. Go to RevenueCat Dashboard{"\n"}
            3. Search for this User ID in Customers{"\n"}
            4. You should see this user appear after making a test purchase
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  warning: {
    fontSize: 14,
    color: "#FF9800",
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#212121",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#757575",
    width: 120,
  },
  value: {
    fontSize: 14,
    color: "#212121",
    flex: 1,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#F44336",
  },
  dangerButtonText: {
    color: "#FFFFFF",
  },
  instructions: {
    fontSize: 14,
    color: "#757575",
    lineHeight: 20,
  },
});
