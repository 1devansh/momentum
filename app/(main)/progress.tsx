/**
 * Progress Screen (Character Growth)
 *
 * Shows character evolution based on total completed challenges.
 * Uses the deterministic character engine — no regression.
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { selectStats, useGoalPlanStore } from "../../src/features/challenges";
import {
    CHARACTER_STAGES,
    computeCharacterState,
} from "../../src/features/character";
import { useSubscription } from "../../src/state";

export default function ProgressScreen() {
  const { isPro } = useSubscription();
  const plans = useGoalPlanStore((s) => s.plans);

  const stats = selectStats(plans);
  const character = computeCharacterState(stats.totalCompleted);

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

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Challenges Done"
            value={String(stats.totalCompleted)}
          />
          <StatCard
            label="Total Challenges"
            value={String(stats.totalChallenges)}
          />
          <StatCard label="Goal Plans" value={String(plans.length)} />
          <StatCard
            label="Completion Rate"
            value={
              stats.totalChallenges > 0
                ? `${Math.round((stats.totalCompleted / stats.totalChallenges) * 100)}%`
                : "—"
            }
          />
        </View>
      </View>

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

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  statsSection: { marginBottom: 32 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "bold", color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
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
