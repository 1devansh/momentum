/**
 * Weekly Retro Component
 *
 * Collects user reflection and optional feeling selection,
 * then triggers AI regeneration of remaining challenges.
 *
 * TODO: Add advanced analytics on retro submissions
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../config/constants";
import { RetroFeeling } from "../../features/challenges/types";
import { Button } from "../ui/Button";

const FEELINGS: { value: RetroFeeling; label: string; emoji: string }[] = [
  { value: "confident", label: "Confident", emoji: "💪" },
  { value: "motivated", label: "Motivated", emoji: "🔥" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "stuck", label: "Stuck", emoji: "🤔" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😰" },
];

interface WeeklyRetroProps {
  onSubmit: (reflection: string, feeling?: RetroFeeling) => void;
  onDismiss: () => void;
  onCompleteGoal: () => void;
  isLoading: boolean;
}

export const WeeklyRetro: React.FC<WeeklyRetroProps> = ({
  onSubmit,
  onDismiss,
  onCompleteGoal,
  isLoading,
}) => {
  const [reflection, setReflection] = useState("");
  const [feeling, setFeeling] = useState<RetroFeeling | undefined>();

  const canSubmit = reflection.trim().length >= 3 && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(reflection.trim(), feeling);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          Adapting your challenges based on your reflection...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Weekly Retro</Text>
      <Text style={styles.subtitle}>
        Reflect on your progress. We'll adapt your remaining challenges.
      </Text>

      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.feelingsRow}>
        {FEELINGS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.feelingChip,
              feeling === f.value && styles.feelingChipActive,
            ]}
            onPress={() =>
              setFeeling(feeling === f.value ? undefined : f.value)
            }
            accessibilityLabel={f.label}
            accessibilityRole="button"
            accessibilityState={{ selected: feeling === f.value }}
          >
            <Text style={styles.feelingEmoji}>{f.emoji}</Text>
            <Text
              style={[
                styles.feelingLabel,
                feeling === f.value && styles.feelingLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your reflection</Text>
      <TextInput
        style={styles.input}
        placeholder="What's working? What's not? What would help?"
        placeholderTextColor={COLORS.textSecondary}
        value={reflection}
        onChangeText={setReflection}
        multiline
        maxLength={500}
        textAlignVertical="top"
        accessibilityLabel="Reflection input"
      />

      <View style={styles.actions}>
        <Button
          title="Submit & Adapt"
          onPress={handleSubmit}
          disabled={!canSubmit}
          size="large"
          style={styles.submitBtn}
        />
        <TouchableOpacity
          onPress={onCompleteGoal}
          style={styles.completeGoalBtn}
        >
          <Text style={styles.completeGoalText}>
            🎉 Actually, I've achieved this goal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  feelingsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  feelingChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  feelingChipActive: {
    backgroundColor: COLORS.primary + "18",
    borderColor: COLORS.primary,
  },
  feelingEmoji: { fontSize: 16, marginRight: 4 },
  feelingLabel: { fontSize: 13, color: COLORS.textSecondary },
  feelingLabelActive: { color: COLORS.primary, fontWeight: "600" },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 80,
    marginBottom: 16,
    lineHeight: 20,
  },
  actions: { alignItems: "center" },
  submitBtn: { width: "100%", marginBottom: 8 },
  completeGoalBtn: { padding: 8, marginBottom: 2 },
  completeGoalText: { fontSize: 14, color: COLORS.primary, fontWeight: "500" },
  dismissBtn: { padding: 8 },
  dismissText: { fontSize: 14, color: COLORS.textSecondary },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
});
