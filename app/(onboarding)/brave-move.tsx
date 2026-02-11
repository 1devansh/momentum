/**
 * Screen 7: Today's Brave Move
 *
 * Immediate transition to the first daily challenge.
 * Shows a placeholder challenge with completion button.
 * Triggers confetti + positive affirmation on completion.
 *
 * TODO: Replace placeholder with AI-generated challenge based on focus areas
 * TODO: Gate premium challenge categories behind subscription
 * TODO: Track completion in challenge history / streak system
 */

import { Href, router } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";

const PLACEHOLDER_CHALLENGE = {
  title: "Send a kind message",
  description:
    "Think of someone you appreciate. Send them a short message telling them why. It doesn't have to be perfect — just honest.",
  category: "Connection",
  duration: "~2 min",
};

const AFFIRMATIONS = [
  "You showed up. That's what matters.",
  "Bravery isn't the absence of fear — it's action despite it.",
  "One small step today, a giant leap over time.",
  "You just proved you can do hard things.",
  "The hardest part is starting. You did it.",
];

export default function BraveMoveScreen() {
  const [completed, setCompleted] = useState(false);
  const confettiRef = useRef<ConfettiCannon | null>(null);
  const [affirmation] = useState(
    () => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
  );

  const handleComplete = () => {
    setCompleted(true);
    confettiRef.current?.start();
    // TODO: Record challenge completion in persistent storage
    // TODO: Update streak counter
    // TODO: Award XP / character growth points
  };

  const handleGoHome = () => {
    router.replace("/(main)/home" as Href);
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        {!completed ? (
          <>
            <Text style={styles.label}>TODAY'S BRAVE MOVE</Text>
            <View style={styles.card}>
              <View style={styles.meta}>
                <Text style={styles.category}>
                  {PLACEHOLDER_CHALLENGE.category}
                </Text>
                <Text style={styles.duration}>
                  {PLACEHOLDER_CHALLENGE.duration}
                </Text>
              </View>
              <Text style={styles.challengeTitle}>
                {PLACEHOLDER_CHALLENGE.title}
              </Text>
              <Text style={styles.challengeDesc}>
                {PLACEHOLDER_CHALLENGE.description}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>You did it!</Text>
            <Text style={styles.affirmation}>{affirmation}</Text>
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
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  category: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  duration: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
