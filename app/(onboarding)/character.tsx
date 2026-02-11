/**
 * Screen 5: Character Introduction
 *
 * Introduces the sapling character that grows with the user.
 * Sets emotional connection to the growth metaphor.
 *
 * TODO: Replace emoji with actual sapling illustration/Lottie animation
 * TODO: Connect character evolution to challenge completion data
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";

export default function CharacterScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        {/* TODO: Replace with Lottie sapling animation from src/features/character */}
        <Text style={styles.illustration}>🌱</Text>

        <Text style={styles.title}>Meet your sapling</Text>
        <Text style={styles.body}>
          This little one grows every time you take action. Complete challenges,
          and watch it transform — from a tiny sprout into a mighty tree.
        </Text>
        <Text style={styles.body}>
          Your growth is its growth. Every brave move counts.
        </Text>

        <View style={styles.stages}>
          <Text style={styles.stageItem}>🌱 → 🌿 → 🌳</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => router.push("/(onboarding)/notifications" as Href)}
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
  illustration: { fontSize: 96, marginBottom: 24 },
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
  stages: { marginTop: 20 },
  stageItem: { fontSize: 36, textAlign: "center" },
  footer: { paddingBottom: 16 },
  cta: { width: "100%" },
});
