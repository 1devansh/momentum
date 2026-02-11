/**
 * Home Screen (Daily Challenge)
 *
 * Shows the user's current challenge from their active goal plan.
 * Enforces one-challenge-per-day: once completed, shows celebration
 * until the next calendar day.
 */

import { Href, router } from "expo-router";
import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import {
    selectCompletedToday,
    selectCurrentChallenge,
    selectStats,
    useGoalPlanStore,
} from "../../src/features/challenges";
import { computeCharacterState } from "../../src/features/character";
import { canCreateGoalPlan } from "../../src/features/premium";
import { useSubscription } from "../../src/state";

export default function HomeScreen() {
  const { isPro, isLoading } = useSubscription();

  // Subscribe to reactive state — these cause re-renders when plans change
  const plans = useGoalPlanStore((s) => s.plans);
  const activePlanId = useGoalPlanStore((s) => s.activePlanId);
  const completeCurrentChallenge = useGoalPlanStore(
    (s) => s.completeCurrentChallenge,
  );

  // Derived from plans (reactive)
  const activePlan = plans.find((p) => p.id === activePlanId);
  const currentChallenge = selectCurrentChallenge(plans, activePlanId);
  const completedToday = selectCompletedToday(plans, activePlanId);
  const stats = selectStats(plans);
  const character = computeCharacterState(stats.totalCompleted);

  const confettiRef = useRef<ConfettiCannon | null>(null);

  // The challenge that was just completed (for showing encouragement)
  const lastCompletedChallenge = activePlan
    ? (activePlan.challenges
        .filter((c) => c.completed)
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? 0).getTime() -
            new Date(a.completedAt ?? 0).getTime(),
        )[0] ?? null)
    : null;

  const handleComplete = () => {
    if (!activePlanId || completedToday) return;
    completeCurrentChallenge(activePlanId);
    confettiRef.current?.start();
  };

  const handleNewGoal = () => {
    if (!canCreateGoalPlan(isPro, plans.length)) {
      router.push("/paywall" as Href);
      return;
    }
    router.push("/(main)/new-goal" as Href);
  };

  const handleUpgrade = () => {
    router.push("/paywall" as Href);
  };

  const planCompleted =
    activePlan && activePlan.currentIndex >= activePlan.challenges.length;

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {character.stage.emoji} {getGreeting()}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        {isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>✨ Pro</Text>
          </View>
        )}
      </View>

      {/* Active Goal */}
      {activePlan && (
        <View style={styles.goalBanner}>
          <Text style={styles.goalLabel}>YOUR GOAL</Text>
          <Text style={styles.goalText}>{activePlan.goal}</Text>
          <View style={styles.goalProgressBar}>
            <View
              style={[
                styles.goalProgressFill,
                {
                  width: `${activePlan.challenges.length > 0 ? (activePlan.challenges.filter((c) => c.completed).length / activePlan.challenges.length) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.goalProgress}>
            {activePlan.challenges.filter((c) => c.completed).length === 0
              ? "Just getting started"
              : `${activePlan.challenges.filter((c) => c.completed).length} challenge${activePlan.challenges.filter((c) => c.completed).length === 1 ? "" : "s"} completed`}
          </Text>
        </View>
      )}

      {/* Daily Challenge Card */}
      <View style={styles.challengeCard}>
        <Text style={styles.challengeLabel}>TODAY&apos;S CHALLENGE</Text>

        {completedToday ? (
          /* Already done for today — show celebration until tomorrow */
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Done for today!</Text>
            <Text style={styles.celebrationText}>
              {lastCompletedChallenge?.encouragement ??
                "You showed up. That\u2019s what matters."}
            </Text>
            <Text style={styles.comeBackText}>
              Come back tomorrow for your next challenge.
            </Text>
          </View>
        ) : currentChallenge ? (
          /* Show today's challenge */
          <View>
            <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
            <Text style={styles.challengeDescription}>
              {currentChallenge.description}
            </Text>
            <Button
              title="I did it ✓"
              onPress={handleComplete}
              size="large"
              style={styles.completeBtn}
            />
          </View>
        ) : planCompleted ? (
          /* All challenges in the plan are done */
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🏆</Text>
            <Text style={styles.placeholderTitle}>Plan Complete!</Text>
            <Text style={styles.placeholderText}>
              You crushed every challenge. Ready for a new goal?
            </Text>
            <Button
              title="Set a new goal"
              onPress={handleNewGoal}
              size="medium"
              style={styles.newGoalBtn}
            />
          </View>
        ) : (
          /* No plan at all */
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🎯</Text>
            <Text style={styles.placeholderTitle}>No active plan</Text>
            <Text style={styles.placeholderText}>
              Set a goal to get your personalized challenges.
            </Text>
            <Button
              title="Set a goal"
              onPress={handleNewGoal}
              size="medium"
              style={styles.newGoalBtn}
            />
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatItem
          label="Completed"
          value={String(stats.totalCompleted)}
          emoji="✅"
        />
        <StatItem
          label="Character"
          value={character.stage.name}
          emoji={character.stage.emoji}
        />
      </View>

      {/* Upgrade CTA for free users */}
      {!isPro && !isLoading && (
        <TouchableOpacity style={styles.upgradeBanner} onPress={handleUpgrade}>
          <Text style={styles.upgradeText}>
            Unlock multiple goals & AI regeneration
          </Text>
          <Text style={styles.upgradeArrow}>→</Text>
        </TouchableOpacity>
      )}

      <ConfettiCannon
        ref={confettiRef}
        count={80}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        fallSpeed={3000}
      />
    </ScreenContainer>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  return "Good evening!";
}

interface StatItemProps {
  label: string;
  value: string;
  emoji: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, emoji }) => (
  <View style={styles.statItem}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  date: { fontSize: 14, color: COLORS.textSecondary },
  proBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  goalBanner: {
    backgroundColor: COLORS.primary + "12",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  goalProgress: { fontSize: 13, color: COLORS.textSecondary },
  goalProgressBar: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: "hidden" as const,
    marginBottom: 6,
    marginTop: 2,
  },
  goalProgressFill: {
    height: "100%" as const,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    minWidth: 2,
  },
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  challengeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 1,
    fontWeight: "600",
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  completeBtn: { width: "100%" },
  placeholder: { alignItems: "center", paddingVertical: 16 },
  placeholderEmoji: { fontSize: 48, marginBottom: 12 },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  newGoalBtn: { minWidth: 160 },
  celebrationContent: { alignItems: "center", paddingVertical: 12 },
  celebrationEmoji: { fontSize: 56, marginBottom: 12 },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 12,
  },
  comeBackText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  statItem: { alignItems: "center" },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  upgradeBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  upgradeText: { flex: 1, fontSize: 14, color: COLORS.text },
  upgradeArrow: { fontSize: 18, color: COLORS.primary, fontWeight: "bold" },
});
