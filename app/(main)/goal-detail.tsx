/**
 * Goal Detail Screen
 *
 * Shows full goal info, completed challenges, edit/delete options,
 * retro countdown, and manual retro trigger.
 *
 * This is the hub for managing a single goal.
 */

import { Href, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, ScreenContainer, WeeklyRetro } from "../../src/components";
import { COLORS } from "../../src/config";
import {
  RETRO_CHALLENGE_THRESHOLD,
  RetroFeeling,
  selectChallengesUntilRetro,
  selectRetroRequired,
  useGoalPlanStore,
} from "../../src/features/challenges";
import { canDeleteGoalPlan } from "../../src/features/premium";
import { useSubscription } from "../../src/state";

export default function GoalDetailScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { isPro } = useSubscription();

  const plans = useGoalPlanStore((s) => s.plans);
  const editGoal = useGoalPlanStore((s) => s.editGoal);
  const deletePlan = useGoalPlanStore((s) => s.deletePlan);
  const submitRetro = useGoalPlanStore((s) => s.submitRetro);
  const completeGoal = useGoalPlanStore((s) => s.completeGoal);
  const isGenerating = useGoalPlanStore((s) => s.isGenerating);

  const plan = plans.find((p) => p.id === planId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(plan?.goal ?? "");
  const [editedDesc, setEditedDesc] = useState(plan?.description ?? "");
  const [showRetro, setShowRetro] = useState(false);

  if (!plan) {
    return (
      <ScreenContainer>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>Goal not found</Text>
      </ScreenContainer>
    );
  }

  const completedChallenges = plan.challenges.filter((c) => c.completed);
  const totalChallenges = plan.challenges.length;
  const challengesUntilRetro = selectChallengesUntilRetro(plan);
  const retroRequired = selectRetroRequired(plan);
  const completedSinceLastRetro =
    completedChallenges.length - (plan.completedAtLastRetro || 0);

  const handleSaveEdit = () => {
    if (!planId || editedGoal.trim().length < 5) return;
    editGoal(planId, {
      goal: editedGoal.trim(),
      description: editedDesc.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!planId) return;
    if (!canDeleteGoalPlan(isPro, plans.length)) {
      router.push("/paywall" as Href);
      return;
    }
    Alert.alert(
      "Delete Goal",
      `This will permanently delete "${plan.goal}" and all its challenges.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePlan(planId);
            router.back();
          },
        },
      ],
    );
  };

  const handleRetroSubmit = async (
    reflection: string,
    feeling?: RetroFeeling,
  ) => {
    if (!planId) return;
    await submitRetro(planId, reflection, feeling);
    // Don't dismiss here — WeeklyRetro will show the adaptation result
    // and dismiss itself when the user taps "Got It"
  };

  const handleCompleteGoal = () => {
    if (!planId) return;
    Alert.alert(
      "Mark Goal as Completed",
      `Congrats! This will mark "${plan.goal}" as achieved. You won't receive new challenges for it.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete Goal 🎉",
          onPress: () => {
            completeGoal(planId);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Goal Header */}
      {plan.goalCompletedAt && (
        <View style={styles.goalCompletedBanner}>
          <Text style={styles.goalCompletedText}>
            🎉 Goal achieved on{" "}
            {new Date(plan.goalCompletedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      )}

      {isEditing ? (
        <View style={styles.editSection}>
          <Text style={styles.label}>Goal</Text>
          <TextInput
            style={styles.input}
            value={editedGoal}
            onChangeText={setEditedGoal}
            placeholder="Your goal..."
            placeholderTextColor={COLORS.textSecondary}
            maxLength={200}
            accessibilityLabel="Goal title"
          />
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.descInput]}
            value={editedDesc}
            onChangeText={setEditedDesc}
            placeholder="Add context..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={500}
            textAlignVertical="top"
            accessibilityLabel="Goal description"
          />
          <View style={styles.editActions}>
            <Button
              title="Save"
              onPress={handleSaveEdit}
              size="medium"
              disabled={editedGoal.trim().length < 5}
            />
            <TouchableOpacity
              onPress={() => {
                setIsEditing(false);
                setEditedGoal(plan.goal);
                setEditedDesc(plan.description ?? "");
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{plan.goal}</Text>
          {plan.description ? (
            <Text style={styles.goalDesc}>{plan.description}</Text>
          ) : null}
          <Text style={styles.goalMeta}>
            {completedChallenges.length} of {totalChallenges} challenges
            completed
          </Text>
        </View>
      )}

      {/* Actions */}
      {!isEditing && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionLabel}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionLabel, styles.deleteLabel]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Retro Section */}
      {!plan.goalCompletedAt && (
        <View style={styles.retroSection}>
          <Text style={styles.sectionTitle}>🔄 Weekly Retro</Text>

          {retroRequired ? (
            <View style={styles.retroForced}>
              <Text style={styles.retroForcedTitle}>
                Retro time — all {RETRO_CHALLENGE_THRESHOLD} challenges done!
              </Text>
              <Text style={styles.retroForcedDesc}>
                Tell us how it's going. Your reflection helps the AI create
                better, more personalized challenges for your next batch.
              </Text>
              {!showRetro && (
                <Button
                  title="Start Retro & Get Next Challenges"
                  onPress={() => setShowRetro(true)}
                  size="large"
                  style={styles.retroCta}
                />
              )}
            </View>
          ) : (
            <View style={styles.retroInfo}>
              <Text style={styles.retroInfoText}>
                After every {RETRO_CHALLENGE_THRESHOLD} challenges, you'll
                reflect on your progress. The AI uses your feedback to create
                smarter, more relevant challenges tailored to where you are
                right now.
              </Text>
              <View style={styles.retroProgress}>
                <View style={styles.retroProgressBar}>
                  <View
                    style={[
                      styles.retroProgressFill,
                      {
                        width: `${(completedSinceLastRetro / RETRO_CHALLENGE_THRESHOLD) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.retroProgressText}>
                  {challengesUntilRetro > 0
                    ? `${challengesUntilRetro} challenge${challengesUntilRetro === 1 ? "" : "s"} until next retro`
                    : "Retro available"}
                </Text>
              </View>
              {!showRetro && (
                <TouchableOpacity
                  onPress={() => setShowRetro(true)}
                  style={styles.manualRetroBtn}
                >
                  <Text style={styles.manualRetroText}>
                    Challenges not working? Start retro early →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {showRetro && (
            <WeeklyRetro
              plan={plan}
              onSubmit={handleRetroSubmit}
              onDismiss={() => setShowRetro(false)}
              onCompleteGoal={handleCompleteGoal}
              isLoading={isGenerating}
            />
          )}
        </View>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.sectionTitle}>
            ✅ Completed ({completedChallenges.length})
          </Text>
          {completedChallenges
            .sort(
              (a, b) =>
                new Date(b.completedAt ?? 0).getTime() -
                new Date(a.completedAt ?? 0).getTime(),
            )
            .map((c) => (
              <View key={c.id} style={styles.completedItem}>
                <Text style={styles.completedTitle}>{c.title}</Text>
                <Text style={styles.completedDesc}>{c.description}</Text>
                {c.notes ? (
                  <Text style={styles.completedNotes}>💭 {c.notes}</Text>
                ) : null}
                {c.completedAt ? (
                  <Text style={styles.completedDate}>
                    {new Date(c.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                ) : null}
              </View>
            ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background },
  backBtn: { paddingVertical: 12 },
  backText: { fontSize: 16, color: COLORS.primary },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  goalHeader: { marginBottom: 16 },
  goalCompletedBanner: {
    backgroundColor: COLORS.primary + "18",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  goalCompletedText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  goalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  goalDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 22,
  },
  goalMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  editSection: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  descInput: { minHeight: 70, lineHeight: 22 },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cancelBtn: { padding: 8 },
  cancelText: { fontSize: 15, color: COLORS.textSecondary },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  actionIcon: { fontSize: 16 },
  actionLabel: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  deleteLabel: { color: COLORS.error },
  retroSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  retroForced: {},
  retroForcedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 6,
  },
  retroForcedDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  retroCta: { width: "100%" },
  retroInfo: {},
  retroInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  retroProgress: { marginBottom: 10 },
  retroProgressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  retroProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  retroProgressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  manualRetroBtn: { paddingVertical: 4 },
  manualRetroText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  completedSection: { marginBottom: 24 },
  completedItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  completedDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  completedNotes: {
    fontSize: 13,
    color: COLORS.text,
    fontStyle: "italic",
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
