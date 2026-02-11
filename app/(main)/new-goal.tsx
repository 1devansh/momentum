/**
 * New Goal Screen
 *
 * Allows users to create a new goal plan.
 * Free users are gated to 1 plan (checked before navigation).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
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
import { STORAGE_KEYS } from "../../src/config/constants";
import { useGoalPlanStore } from "../../src/features/challenges";

export default function NewGoalScreen() {
  const [goal, setGoal] = useState("");
  const createPlan = useGoalPlanStore((s) => s.createPlan);
  const isGenerating = useGoalPlanStore((s) => s.isGenerating);

  const canSubmit = goal.trim().length >= 5 && !isGenerating;

  const handleCreate = async () => {
    if (!canSubmit) return;
    try {
      // Load focus areas from onboarding (if available)
      const focusAreasRaw = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_FOCUS_AREAS,
      );
      const focusAreas = focusAreasRaw ? JSON.parse(focusAreasRaw) : [];

      await createPlan(goal.trim(), focusAreas);
      router.back();
    } catch (error) {
      console.error("[NewGoal] Error creating plan:", error);
    }
  };

  if (isGenerating) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingTitle}>Building your plan...</Text>
          <Text style={styles.loadingBody}>
            Creating personalized challenges for your goal.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>What's your next goal?</Text>
            <Text style={styles.sub}>
              We'll create a personalized challenge plan to help you get there.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Read more books, save money, learn guitar..."
              placeholderTextColor={COLORS.textSecondary}
              value={goal}
              onChangeText={setGoal}
              multiline
              maxLength={200}
              textAlignVertical="top"
              accessibilityLabel="Your new goal"
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Generate my plan"
              onPress={handleCreate}
              size="large"
              disabled={!canSubmit}
              style={styles.cta}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "space-between" },
  backBtn: { paddingVertical: 12 },
  backText: { fontSize: 16, color: COLORS.primary },
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 56, marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
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
  footer: { paddingBottom: 16 },
  cta: { width: "100%" },
  loadingContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 8,
  },
  loadingBody: { fontSize: 16, color: COLORS.textSecondary },
});
