/**
 * Screen 4: Goal Input (REQUIRED)
 *
 * Users MUST enter a primary goal. This goal drives their
 * personalized AI challenge plan.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { STORAGE_KEYS } from "../../src/config/constants";

export default function GoalScreen() {
  const [goal, setGoal] = useState("");

  const canContinue = goal.trim().length >= 5;

  const handleContinue = async () => {
    if (!canContinue) return;
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_GOAL, goal.trim());
    router.push("/(onboarding)/character" as Href);
  };

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
          <View style={styles.content}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>
              What is one goal you've{"\n"}been putting off?
            </Text>
            <Text style={styles.sub}>
              This powers your personalized challenge plan.{"\n"}Be honest — no
              one else sees this.
            </Text>

            <TextInput
              style={[
                styles.input,
                !canContinue && goal.length > 0 && styles.inputHint,
              ]}
              placeholder="e.g. Start exercising regularly, launch my side project, learn to cook..."
              placeholderTextColor={COLORS.textSecondary}
              value={goal}
              onChangeText={setGoal}
              multiline
              maxLength={200}
              textAlignVertical="top"
              accessibilityLabel="Your primary goal"
            />
            {goal.length > 0 && !canContinue && (
              <Text style={styles.hint}>
                Tell us a bit more (at least 5 characters)
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleContinue}
              size="large"
              disabled={!canContinue}
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
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
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
    lineHeight: 22,
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
  inputHint: {
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  hint: {
    fontSize: 13,
    color: COLORS.warning,
    marginTop: 8,
  },
  footer: { paddingBottom: 16, alignItems: "center" },
  cta: { width: "100%" },
});
