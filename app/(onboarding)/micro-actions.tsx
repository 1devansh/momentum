/**
 * Screen 3: Micro-Action Explanation
 *
 * Briefly introduces the core concept: small daily brave moves.
 * Keeps it short and emotionally resonant.
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";

export default function MicroActionsScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.title}>Tiny moves, real change</Text>
        <Text style={styles.body}>
          Every day, Momentum gives you one small, brave action — something you
          can do in under 5 minutes.
        </Text>
        <Text style={styles.body}>
          These micro-actions are designed to stretch your comfort zone just
          enough to build lasting confidence.
        </Text>

        <View style={styles.examples}>
          <ExampleItem text="Send that message you've been avoiding" />
          <ExampleItem text="Compliment a stranger" />
          <ExampleItem text="Write down one thing you're proud of" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="I'm in"
          onPress={() => router.push("/(onboarding)/goal" as Href)}
          size="large"
          style={styles.cta}
        />
      </View>
    </ScreenContainer>
  );
}

const ExampleItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.exampleRow}>
    <Text style={styles.bullet}>→</Text>
    <Text style={styles.exampleText}>{text}</Text>
  </View>
);

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
  examples: { marginTop: 24, alignSelf: "stretch" },
  exampleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  bullet: {
    fontSize: 18,
    color: COLORS.primary,
    marginRight: 10,
    fontWeight: "600",
  },
  exampleText: { fontSize: 15, color: COLORS.text, flex: 1 },
  footer: { paddingBottom: 16 },
  cta: { width: "100%" },
});
