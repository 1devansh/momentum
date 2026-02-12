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
import {
  computeAdaptation,
  computeWeeklyInsight,
} from "../../features/challenges/adaptation";
import type {
  AdaptationResult,
  GoalPlan,
  RetroFeeling,
  WeeklyInsight,
} from "../../features/challenges/types";
import { Button } from "../ui/Button";

const FEELINGS: { value: RetroFeeling; label: string; emoji: string }[] = [
  { value: "confident", label: "Confident", emoji: "\uD83D\uDCAA" },
  { value: "motivated", label: "Motivated", emoji: "\uD83D\uDD25" },
  { value: "neutral", label: "Neutral", emoji: "\uD83D\uDE10" },
  { value: "stuck", label: "Stuck", emoji: "\uD83E\uDD14" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "\uD83D\uDE30" },
];

type RetroPhase = "insight" | "reflect" | "adapting" | "result";

interface WeeklyRetroProps {
  plan: GoalPlan;
  onSubmit: (reflection: string, feeling?: RetroFeeling) => void;
  onDismiss: () => void;
  onCompleteGoal: () => void;
  isLoading: boolean;
}

export const WeeklyRetro: React.FC<WeeklyRetroProps> = ({
  plan,
  onSubmit,
  onDismiss,
  onCompleteGoal,
  isLoading,
}) => {
  const [phase, setPhase] = useState<RetroPhase>("insight");
  const [reflection, setReflection] = useState("");
  const [feeling, setFeeling] = useState<RetroFeeling | undefined>();
  const [adaptation, setAdaptation] = useState<AdaptationResult | null>(null);
  const [snapshotInsight, setSnapshotInsight] = useState<WeeklyInsight | null>(
    null,
  );

  // Compute live insight for the summary screen, but use snapshot for adaptation
  const liveInsight = computeWeeklyInsight(plan);
  const insight = snapshotInsight || liveInsight;
  const canSubmit = reflection.trim().length >= 3 && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // Freeze the insight before the store updates the plan
    setSnapshotInsight(liveInsight);
    const result = computeAdaptation(feeling, liveInsight);
    setAdaptation(result);
    setPhase("adapting");
    onSubmit(reflection.trim(), feeling);
  };

  // Transition to result screen when loading completes
  React.useEffect(() => {
    if (phase === "adapting" && !isLoading && adaptation) {
      setPhase("result");
    }
  }, [phase, isLoading, adaptation]);

  if (phase === "insight") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Week in Review</Text>
        <InsightSummary insight={insight} />
        <Button
          title="Continue to Reflection"
          onPress={() => setPhase("reflect")}
          size="large"
          style={styles.fullWidthBtn}
        />
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Not now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === "adapting" && isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          Analyzing your reflection and adapting challenges...
        </Text>
      </View>
    );
  }

  if (phase === "result" && adaptation) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{"Here's What's Changing"}</Text>
        <AdaptationCard
          adaptation={adaptation}
          feeling={feeling}
          insight={insight}
        />
        <Button
          title="Got It"
          onPress={onDismiss}
          size="large"
          style={styles.fullWidthBtn}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Retro</Text>
      <Text style={styles.subtitle}>
        Reflect on your progress. We will adapt your challenges based on how you
        are doing.
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
        placeholder="What is working? What is not? What would help?"
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
          title="Submit and Adapt"
          onPress={handleSubmit}
          disabled={!canSubmit}
          size="large"
          style={styles.fullWidthBtn}
        />
        <TouchableOpacity
          onPress={onCompleteGoal}
          style={styles.completeGoalBtn}
        >
          <Text style={styles.completeGoalText}>I have achieved this goal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InsightSummary: React.FC<{ insight: WeeklyInsight }> = ({ insight }) => {
  const pct = Math.round(insight.completionRate * 100);
  const timeLabels: Record<string, string> = {
    morning: "Mornings",
    afternoon: "Afternoons",
    evening: "Evenings",
    mixed: "Mixed",
  };
  const timeLabel = timeLabels[insight.timePattern] || "Mixed";
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightRow}>
        <View style={styles.insightStat}>
          <Text style={styles.insightValue}>
            {insight.completedCount}/{insight.totalCount}
          </Text>
          <Text style={styles.insightLabel}>Completed</Text>
        </View>
        <View style={styles.insightStat}>
          <Text style={styles.insightValue}>{timeLabel}</Text>
          <Text style={styles.insightLabel}>Peak Time</Text>
        </View>
        <View style={styles.insightStat}>
          <Text style={styles.insightValue}>{insight.missedDays}</Text>
          <Text style={styles.insightLabel}>Missed Days</Text>
        </View>
      </View>
      <View style={styles.insightBarContainer}>
        <View style={[styles.insightBar, { width: (pct + "%") as any }]} />
      </View>
      <Text style={styles.insightPct}>{pct}% completion rate</Text>
      <View style={styles.insightBubble}>
        <Text style={styles.insightBubbleText}>
          {insight.behavioralInsight}
        </Text>
      </View>
    </View>
  );
};

const AdaptationCard: React.FC<{
  adaptation: AdaptationResult;
  feeling?: RetroFeeling;
  insight: WeeklyInsight;
}> = ({ adaptation, feeling, insight }) => {
  const pct = Math.round(insight.completionRate * 100);
  const feelingEntry = feeling
    ? FEELINGS.find((f) => f.value === feeling)
    : null;
  const summary = feelingEntry
    ? "You completed " +
      insight.completedCount +
      "/" +
      insight.totalCount +
      " challenges and marked " +
      feelingEntry.label +
      "."
    : "You completed " +
      insight.completedCount +
      "/" +
      insight.totalCount +
      " challenges (" +
      pct +
      "%).";
  return (
    <View style={styles.adaptationCard}>
      <Text style={styles.adaptationSummary}>{summary}</Text>
      <View style={styles.adaptationList}>
        {adaptation.adjustments.map((adj: string, i: number) => (
          <View key={i} style={styles.adaptationItem}>
            <Text style={styles.adaptationBullet}>{"\u2192"}</Text>
            <Text style={styles.adaptationText}>{adj}</Text>
          </View>
        ))}
      </View>
      <View style={styles.adaptationReason}>
        <Text style={styles.adaptationReasonLabel}>Why?</Text>
        <Text style={styles.adaptationReasonText}>{adaptation.reason}</Text>
      </View>
      <View style={styles.adaptationExpect}>
        <Text style={styles.adaptationExpectLabel}>What to expect</Text>
        <Text style={styles.adaptationExpectText}>
          {adaptation.expectation}
        </Text>
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
  actions: { alignItems: "center" as const },
  fullWidthBtn: { width: "100%" as any, marginBottom: 8 },
  completeGoalBtn: { padding: 8, marginBottom: 2 },
  completeGoalText: { fontSize: 14, color: COLORS.primary, fontWeight: "500" },
  dismissBtn: { padding: 8 },
  dismissText: { fontSize: 14, color: COLORS.textSecondary },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center" as const,
    marginTop: 16,
  },
  insightCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  insightRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  insightStat: { alignItems: "center" as const, flex: 1 },
  insightValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  insightLabel: { fontSize: 11, color: COLORS.textSecondary },
  insightBarContainer: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: "hidden" as const,
    marginBottom: 4,
  },
  insightBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  insightPct: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "right" as const,
    marginBottom: 10,
  },
  insightBubble: {
    backgroundColor: COLORS.primary + "12",
    borderRadius: 10,
    padding: 12,
  },
  insightBubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  adaptationCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  adaptationSummary: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  adaptationList: { marginBottom: 12 },
  adaptationItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: 6,
  },
  adaptationBullet: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: "600",
  },
  adaptationText: { fontSize: 14, color: COLORS.text, flex: 1, lineHeight: 20 },
  adaptationReason: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  adaptationReasonLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  adaptationReasonText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  adaptationExpect: {
    backgroundColor: COLORS.primary + "10",
    borderRadius: 8,
    padding: 10,
  },
  adaptationExpectLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 2,
  },
  adaptationExpectText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
});
