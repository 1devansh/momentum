/**
 * User Profile Screen
 *
 * Allows users to manage their profile information.
 */

import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { useBackToTab } from "../../src/hooks";
import { useUser } from "../../src/state";

export default function ProfileScreen() {
  const { extendedProfile, updateExtendedProfile } = useUser();
  const [name, setName] = useState(extendedProfile.name || "");
  const [email, setEmail] = useState(extendedProfile.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const navigateToSettings = useBackToTab("/(main)/settings" as Href);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateExtendedProfile({ name, email });
      Alert.alert("Success", "Profile updated successfully!");
      router.push("/(main)/settings" as Href);
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    name !== (extendedProfile.name || "") ||
    email !== (extendedProfile.email || "");

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push("/(main)/settings" as Href)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.avatarHint}>Profile picture coming soon</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>
                Used for account recovery and updates
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.infoText}>
                Your profile information is synced with RevenueCat to help us
                provide better support.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.footer}>
            <Button
              title={isSaving ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              disabled={isSaving}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
});
