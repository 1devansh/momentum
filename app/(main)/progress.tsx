/**
 * Progress Screen (Character Growth)
 *
 * Shows character evolution and stats.
 * "Challenges Done" and "Goal Plans" are tappable to expand
 * into detail views (journal / plan list) inline.
 */

import { format } from "date-fns";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import type { CompletedEntry, GoalPlan } from "../../src/features/challenges";
import {
  selectCompletedHistory,
  selectStats,
  useGoalPlanStore,
} from "../../src/features/challenges";
import {
  CHARACTER_STAGES,
  computeCharacterState,
} from "../../src/features/character";
import { useSubscription } from "../../src/state";

type DetailView = null | "challenges" | "goals";

export default function ProgressScreen() {
  const { isPro } = useSubscription();
  const plans = useGoalPlanStore((s) => s.plans);
  const [detailView, setDetailView] = useState<DetailView>(null);

  const stats = selectStats(plans);
  const character = computeCharacterState(stats.totalCompleted);
  const history = selectCompletedHistory(plans);

  const toggleDetail = (view: DetailView) => {
    setDetailView((prev) => (prev === view ? null : view));
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Your Growth</Text>
        <Text style={styles.subtitle}>Watch yourself evolve</Text>
      </View>

      {/* Character Display */}
      <View style={styles.characterSection}>
        <View style={styles.characterCircle}>
          <Text style={styles.characterEmoji}>{character.stage.emoji}</Text>
        </View>
        <Text style={styles.characterName}>{character.stage.name}</Text>
        <Text style={styles.characterDesc}>{character.stage.description}</Text>
        {character.nextMilestone && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${character.progressToNext * 100}%` },
              ]}
            />
          </View>
        )}
        {character.nextMilestone && (
          <Text style={styles.nextMilestone}>
            {character.nextMilestone - stats.totalCompleted} more to next
            evolution
          </Text>
        )}
      </View>

      {/* Evolution Path */}
      <View style={styles.evolutionSection}>
        <Text style={styles.sectionTitle}>Evolution Path</Text>
        <View style={styles.evolutionList}>
          {CHARACTER_STAGES.map((stage, i) => {
            const reached = i <= character.stageIndex;
            const current = i === character.stageIndex;
            return (
              <View
                key={stage.name}
                style={[
                  styles.evolutionItem,
                  current && styles.evolutionItemCurrent,
                ]}
              >
                <Text style={[styles.stageEmoji, !reached && styles.locked]}>
                  {stage.emoji}
                </Text>
                <View style={styles.stageInfo}>
                  <Text style={[styles.stageName, !reached && styles.locked]}>
                    {stage.name}
                  </Text>
                  <Text style={styles.stageThreshold}>
                    {stage.minChallenges} challenges
                  </Text>
                </View>
                {reached && <Text style={styles.checkmark}>✓</Text>}
                {!reached && <Text style={styles.lockIcon}>🔒</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* Tappable Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[
              styles.statCard,
              detailView === "challenges" && styles.statCardActive,
            ]}
            onPress={() => toggleDetail("challenges")}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>{stats.totalCompleted}</Text>
            <Text style={styles.statLabel}>Challenges Done</Text>
            {stats.totalCompleted > 0 && (
              <Text style={styles.statTapHint}>
                {detailView === "challenges" ? "▲ Hide" : "▼ View"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              detailView === "goals" && styles.statCardActive,
            ]}
            onPress={() => toggleDetail("goals")}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>{plans.length}</Text>
            <Text style={styles.statLabel}>Goal Plans</Text>
            {plans.length > 0 && (
              <Text style={styles.statTapHint}>
                {detailView === "goals" ? "▲ Hide" : "▼ View"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded Detail: Challenge Journal */}
      {detailView === "challenges" && history.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>Challenge Journal</Text>
          {history.map((entry) => (
            <JournalEntry key={entry.challengeId} entry={entry} />
          ))}
        </View>
      )}
      {detailView === "challenges" && history.length === 0 && (
        <View style={styles.detailEmpty}>
          <Text style={styles.detailEmptyText}>
            No challenges completed yet. Get started!
          </Text>
        </View>
      )}

      {/* Expanded Detail: Goal Plans */}
      {detailView === "goals" && plans.length > 0 && (
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>Your Goals</Text>
          {plans.map((plan) => (
            <GoalCard key={plan.id} plan={plan} />
          ))}
        </View>
      )}

      {/* Upgrade CTA */}
      {!isPro && (
        <View style={styles.upgradeSection}>
          <Text style={styles.upgradeTitle}>Unlock Full Evolution</Text>
          <Text style={styles.upgradeText}>
            Pro members can create multiple goals and regenerate plans
          </Text>
          <Button
            title="Upgrade to Pro"
            onPress={() => router.push("/paywall" as Href)}
            style={styles.upgradeButton}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const JournalEntry: React.FC<{ entry: CompletedEntry }> = ({ entry }) => {
  const dateStr = format(new Date(entry.completedAt), "MMM d, yyyy");
  return (
    <View style={styles.journalCard}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalDate}>{dateStr}</Text>
        <Text style={styles.journalGoal} numberOfLines={1}>
          {entry.goalName}
        </Text>
      </View>
      <Text style={styles.journalTitle}>{entry.title}</Text>
      {entry.notes && (
        <View style={styles.journalNotes}>
          <Text style={styles.journalNotesLabel}>Your thoughts</Text>
          <Text style={styles.journalNotesText}>{entry.notes}</Text>
        </View>
      )}
    </View>
  );
};

const GoalCard: React.FC<{ plan: GoalPlan }> = ({ plan }) => {
  const done = plan.challenges.filter((c) => c.completed).length;
  const total = plan.challenges.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = plan.currentIndex >= total;

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalCardHeader}>
        <Text style={styles.goalCardTitle} numberOfLines={2}>
          {plan.goal}
        </Text>
        {isComplete && <Text style={styles.goalCardBadge}>✓ Done</Text>}
      </View>
      <View style={styles.goalCardBar}>
        <View style={[styles.goalCardBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.goalCardProgress}>
        {done} of {total} challenges completed
      </Text>
      <Text style={styles.goalCardDate}>
        Started {format(new Date(plan.createdAt), "MMM d, yyyy")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { marginTop: 16, marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 16, color: COLORS.textSecondary },
  characterSection: { alignItems: "center", marginBottom: 32 },
  characterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  characterEmoji: { fontSize: 64 },
  characterName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  characterDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  progressBarContainer: {
    width: "60%",
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  nextMilestone: { fontSize: 12, color: COLORS.textSecondary },
  evolutionSection: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  evolutionList: { gap: 8 },
  evolutionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
  },
  evolutionItemCurrent: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  stageEmoji: { fontSize: 28, marginRight: 12 },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  stageThreshold: { fontSize: 12, color: COLORS.textSecondary },
  checkmark: { fontSize: 16, color: COLORS.primary, fontWeight: "bold" },
  lockIcon: { fontSize: 14 },
  locked: { opacity: 0.4 },
  statsSection: { marginBottom: 16 },
  statsGrid: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  statCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  statValue: { fontSize: 28, fontWeight: "bold", color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  statTapHint: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 6,
  },
  detailSection: { marginBottom: 32 },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  detailEmpty: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16,
  },
  detailEmptyText: { fontSize: 14, color: COLORS.textSecondary },
  journalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  journalDate: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  journalGoal: {
    fontSize: 11,
    color: COLORS.textSecondary,
    maxWidth: "50%",
  },
  journalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  journalNotes: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  journalNotesLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  journalNotesText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    fontStyle: "italic",
  },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  goalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  goalCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  goalCardBadge: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  goalCardBar: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  goalCardBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  goalCardProgress: { fontSize: 12, color: COLORS.textSecondary },
  goalCardDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  upgradeSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  upgradeButton: { minWidth: 200 },
});
