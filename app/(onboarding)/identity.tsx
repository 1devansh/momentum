/**
 * Screen 2: Identity Selection
 *
 * Users pick up to 2 focus areas that resonate with them.
 * Selections are persisted to AsyncStorage immediately.
 *
 * TODO: Use selected areas for AI-powered challenge personalization
 * TODO: Gate premium focus packs behind subscription
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { STORAGE_KEYS } from "../../src/config/constants";
import type { FocusArea } from "../../src/hooks";
import { FOCUS_AREAS } from "../../src/hooks";

export default function IdentityScreen() {
  const [selectedAreas, setSelectedAreas] = useState<FocusArea[]>([]);

  const toggleArea = (area: FocusArea) => {
    setSelectedAreas((prev) => {
      if (prev.includes(area)) return prev.filter((a) => a !== area);
      if (prev.length >= 2) return prev;
      return [...prev, area];
    });
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_FOCUS_AREAS,
      JSON.stringify(selectedAreas),
    );
    router.push("/(onboarding)/micro-actions" as Href);
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What matters most to you?</Text>
        <Text style={styles.sub}>Pick up to 2 areas you want to grow in.</Text>

        <View style={styles.grid}>
          {FOCUS_AREAS.map((item) => {
            const selected = selectedAreas.includes(item.label);
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleArea(item.label)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={item.label}
              >
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    selected && styles.chipLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          size="large"
          disabled={selectedAreas.length === 0}
          style={styles.cta}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#E8F5E9",
  },
  chipEmoji: { fontSize: 20, marginRight: 8 },
  chipLabel: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  chipLabelSelected: { color: COLORS.primary, fontWeight: "600" },
  footer: { paddingBottom: 16 },
  cta: { width: "100%" },
});
