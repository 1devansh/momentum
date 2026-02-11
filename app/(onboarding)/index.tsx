/**
 * Screen 1: Welcome
 *
 * Emotionally warm entry point. Sets the tone for the entire app.
 * Headline: "Stop waiting. Start moving."
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";

export default function WelcomeScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🌱</Text>
        <Text style={styles.headline}>Stop waiting.{"\n"}Start moving.</Text>
        <Text style={styles.sub}>
          Momentum helps you grow through small, brave actions — one day at a
          time.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Let's begin"
          onPress={() => router.push("/(onboarding)/identity" as Href)}
          size="large"
          style={styles.cta}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 72, marginBottom: 24 },
  headline: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 16,
  },
  sub: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  footer: { paddingBottom: 16 },
  cta: { width: "100%" },
});
