/**
 * Home Screen (Daily Challenge)
 *
 * Shows the user's goals in a horizontal swipe carousel.
 * The centered card is the active goal. Daily challenge updates
 * automatically when swiping between goals.
 *
 * Includes weekly retro prompt when eligible.
 *
 * TODO: Add advanced analytics tracking
 * TODO: Add push notification for new daily challenges
 */

import { Href, router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Button, GoalCarousel, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import {
  GoalPlan,
  selectCompletedToday,
  selectCurrentChallenge,
  selectHasNewChallenge,
  selectRetroRequired,
  selectStats,
  useGoalPlanStore,
} from "../../src/features/challenges";
import { computeCharacterState } from "../../src/features/character";
import {
  getDebugDate,
  useDebugDateStore,
} from "../../src/features/debug/debug-date";
import { canCreateGoalPlan } from "../../src/features/premium";
import { useSubscription } from "../../src/state";

export default function HomeScreen() {
  const { isPro, isLoading } = useSubscription();

  const plans = useGoalPlanStore((s) => s.plans);
  const activePlanId = useGoalPlanStore((s) => s.activePlanId);
  const completeCurrentChallenge = useGoalPlanStore(
    (s) => s.completeCurrentChallenge,
  );
  const skipCurrentChallenge = useGoalPlanStore((s) => s.skipCurrentChallenge);
  const setActivePlan = useGoalPlanStore((s) => s.setActivePlan);

  const activePlan = plans.find((p) => p.id === activePlanId);
  const activePlans = plans.filter((p) => !p.goalCompletedAt);
  // Subscribe to debug date offset so time travel triggers re-render
  const dayOffset = useDebugDateStore((s) => s.dayOffset);

  const currentChallenge = React.useMemo(
    () => selectCurrentChallenge(plans, activePlanId),
    [plans, activePlanId, dayOffset],
  );

  const completedToday = React.useMemo(
    () => selectCompletedToday(plans, activePlanId),
    [plans, activePlanId, dayOffset],
  );

  const stats = selectStats(plans);
  const character = computeCharacterState(stats.totalCompleted);
  const retroRequired = selectRetroRequired(activePlan);

  const confettiRef = useRef<ConfettiCannon | null>(null);
  const [notes, setNotes] = useState("");

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
    completeCurrentChallenge(activePlanId, notes);
    setNotes("");
    confettiRef.current?.start();
  };

  const handleSkip = () => {
    if (!activePlanId) return;
    skipCurrentChallenge(activePlanId);
  };

  const handleNewGoal = () => {
    if (!canCreateGoalPlan(isPro, activePlans.length)) {
      router.push("/paywall" as Href);
      return;
    }
    router.push("/(main)/new-goal" as Href);
  };

  const handleUpgrade = () => {
    router.push("/paywall" as Href);
  };

  const handlePlanChange = useCallback(
    (planId: string) => {
      setActivePlan(planId);
    },
    [setActivePlan],
  );

  const handleCardPress = useCallback((planId: string) => {
    router.push(`/(main)/goal-detail?planId=${planId}` as Href);
  }, []);

  const checkHasNewChallenge = useCallback(
    (plan: GoalPlan) => selectHasNewChallenge(plan),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayOffset],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const simulatedDate = React.useMemo(() => getDebugDate(), [dayOffset]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {character.stage.emoji} {getGreeting()}
          </Text>
          <Text style={styles.date}>
            {simulatedDate.toLocaleDateString("en-US", {
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

      {/* Goal Carousel */}
      {activePlans.length > 0 && (
        <GoalCarousel
          plans={activePlans}
          activePlanId={activePlanId}
          onPlanChange={handlePlanChange}
          onCardPress={handleCardPress}
          hasNewChallenge={checkHasNewChallenge}
        />
      )}

      {/* Add Goal / Upgrade CTA below carousel */}
      {activePlans.length > 0 && (
        <View style={styles.carouselActions}>
          {canCreateGoalPlan(isPro, activePlans.length) ? (
            <TouchableOpacity onPress={handleNewGoal}>
              <Text style={styles.addGoalText}>+ Add goal</Text>
            </TouchableOpacity>
          ) : !isPro ? (
            <TouchableOpacity onPress={handleUpgrade}>
              <Text style={styles.upgradeHint}>🔒 Upgrade for more goals</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Daily Challenge Card */}
      <View style={styles.challengeCard}>
        <Text style={styles.challengeLabel}>TODAY&apos;S CHALLENGE</Text>

        {retroRequired ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🔄</Text>
            <Text style={styles.placeholderTitle}>Time for a retro</Text>
            <Text style={styles.placeholderText}>
              You&apos;ve completed all your current challenges. Reflect on your
              progress to unlock your next personalized batch.
            </Text>
            <Button
              title="Open Goal & Start Retro"
              onPress={() =>
                activePlanId &&
                router.push(
                  `/(main)/goal-detail?planId=${activePlanId}` as Href,
                )
              }
              size="medium"
              style={styles.newGoalBtn}
            />
          </View>
        ) : completedToday ? (
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Done for today!</Text>
            <Text style={styles.celebrationText}>
              {lastCompletedChallenge?.encouragement ??
                "You showed up. That\u2019s what matters."}
            </Text>
            {lastCompletedChallenge?.notes && (
              <View style={styles.notesReview}>
                <Text style={styles.notesReviewLabel}>Your thoughts:</Text>
                <Text style={styles.notesReviewText}>
                  {lastCompletedChallenge.notes}
                </Text>
              </View>
            )}
            <Text style={styles.comeBackText}>
              Come back tomorrow for your next challenge.
            </Text>
          </View>
        ) : currentChallenge ? (
          <View>
            <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
            <Text style={styles.challengeDescription}>
              {currentChallenge.description}
            </Text>

            <TextInput
              style={styles.notesInput}
              placeholder="Any thoughts or reflections? (optional)"
              placeholderTextColor={COLORS.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={500}
              textAlignVertical="top"
              accessibilityLabel="Challenge notes"
            />

            <Button
              title="I did it ✓"
              onPress={handleComplete}
              size="large"
              style={styles.completeBtn}
            />
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip — not relevant</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
  const hour = getDebugDate().getHours();
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
  carouselActions: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  addGoalText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  upgradeHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    marginTop: 4,
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
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 60,
    marginBottom: 16,
    lineHeight: 20,
  },
  completeBtn: { width: "100%" },
  skipBtn: { alignItems: "center", paddingVertical: 10 },
  skipText: { fontSize: 14, color: COLORS.textSecondary },
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
  notesReview: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    width: "100%",
  },
  notesReviewLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesReviewText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
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
