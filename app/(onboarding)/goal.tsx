/**
 * Screen 4: Optional Goal Input
 *
 * Users can type a personal goal or skip.
 * Input is stored for future AI-powered personalization.
 *
 * TODO: Feed this goal into AI challenge generation engine
 * TODO: Show goal on profile / progress screens
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { STORAGE_KEYS } from "../../src/config/constants";

export default function GoalScreen() {
  const [goal, setGoal] = useState("");

  const handleContinue = async () => {
    if (goal.trim()) {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_GOAL, goal.trim());
    }
    router.push("/(onboarding)/character" as Href);
  };

  const handleSkip = () => {
    router.push("/(onboarding)/character" as Href);
  };

  return (
    <ScreenContainer style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.title}>
            What's one thing you'd love to be braver about?
          </Text>
          <Text style={styles.sub}>
            This helps us tailor your experience. Totally optional.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Speaking up in meetings, starting a side project..."
            placeholderTextColor={COLORS.textSecondary}
            value={goal}
            onChangeText={setGoal}
            multiline
            maxLength={200}
            textAlignVertical="top"
            accessibilityLabel="Your personal goal"
          />
        </View>

        <View style={styles.footer}>
          <Button
            title={goal.trim() ? "Continue" : "Continue"}
            onPress={handleContinue}
            size="large"
            style={styles.cta}
          />
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 56, marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 32,
  },
  sub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    width: "100%",
    minHeight: 100,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  footer: { paddingBottom: 16, alignItems: "center" },
  cta: { width: "100%" },
  skipBtn: { marginTop: 14, padding: 8 },
  skipText: { fontSize: 15, color: COLORS.textSecondary },
});
