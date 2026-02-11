/**
 * Screen 7: Today's Brave Move
 *
 * First challenge experience right after onboarding.
 * Uses the actual challenge from the generated plan.
 * Includes optional notes input.
 */

import { Href, router } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import {
  selectCurrentChallenge,
  useGoalPlanStore,
} from "../../src/features/challenges";

const AFFIRMATIONS = [
  "You showed up. That matters.",
  "One small step today, a giant leap over time.",
  "You just proved you can do hard things.",
  "The hardest part is starting. You did it.",
];

export default function BraveMoveScreen() {
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const confettiRef = useRef<ConfettiCannon | null>(null);
  const [affirmation] = useState(
    () => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
  );

  const plans = useGoalPlanStore((s) => s.plans);
  const activePlanId = useGoalPlanStore((s) => s.activePlanId);
  const completeCurrentChallenge = useGoalPlanStore(
    (s) => s.completeCurrentChallenge,
  );

  const challenge = selectCurrentChallenge(plans, activePlanId);

  const handleComplete = () => {
    if (activePlanId) {
      completeCurrentChallenge(activePlanId, notes);
    }
    setCompleted(true);
    confettiRef.current?.start();
  };

  const handleGoHome = () => {
    router.replace("/(main)/home" as Href);
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        {!completed ? (
          <>
            <Text style={styles.label}>YOUR FIRST BRAVE MOVE</Text>
            <View style={styles.card}>
              <Text style={styles.challengeTitle}>
                {challenge?.title ?? "Take the first step"}
              </Text>
              <Text style={styles.challengeDesc}>
                {challenge?.description ??
                  "Open your goal plan and read through your first challenge. Then do it."}
              </Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any thoughts or reflections? (optional)"
                placeholderTextColor={COLORS.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                maxLength={500}
                textAlignVertical="top"
                accessibilityLabel="Challenge notes"
              />
            </View>
          </>
        ) : (
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>You did it!</Text>
            <Text style={styles.affirmation}>
              {challenge?.encouragement ?? affirmation}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {!completed ? (
          <Button
            title="I did it ✓"
            onPress={handleComplete}
            size="large"
            style={styles.cta}
          />
        ) : (
          <Button
            title="Go to Home"
            onPress={handleGoHome}
            size="large"
            style={styles.cta}
          />
        )}
      </View>

      <ConfettiCannon
        ref={confettiRef}
        count={120}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        fallSpeed={3000}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: "center" },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 24,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  challengeDesc: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 60,
    marginTop: 16,
    lineHeight: 20,
  },
  celebrationContent: { alignItems: "center" },
  celebrationEmoji: { fontSize: 80, marginBottom: 20 },
  celebrationTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  affirmation: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    fontStyle: "italic",
    paddingHorizontal: 16,
  },
  footer: { paddingBottom: 16 },
  cta: { width: "100%" },
});
