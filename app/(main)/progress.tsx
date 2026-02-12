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
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import type { CompletedEntry, GoalPlan } from "../../src/features/challenges";
import {
  selectCompletedHistory,
  selectStats,
  useGoalPlanStore,
} from "../../src/features/challenges";
import {
  EVOLUTION_STAGES,
  computeCharacterState,
} from "../../src/features/character";
import { useSubscription } from "../../src/state";

type DetailView = null | "challenges" | "goals";

export default function ProgressScreen() {
  const { isPro } = useSubscription();
  const plans = useGoalPlanStore((s) => s.plans);
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(
    null,
  );
  const [showBadges, setShowBadges] = useState(false);

  const stats = selectStats(plans);
  const character = computeCharacterState(stats.totalCompleted);
  const history = selectCompletedHistory(plans);

  // --- Badge definitions ---
  const stageBadges = EVOLUTION_STAGES.map((stage, i) => ({
    id: `stage-${i}`,
    emoji: stage.unlocks[0].emoji,
    title: stage.unlocks[0].title,
    description: stage.unlocks[0].description,
    category: "Evolution" as const,
    earned: i <= character.stageIndex,
  }));

  const completedGoals = plans.filter((p) => p.goalCompletedAt);
  const totalRetros = plans.reduce((sum, p) => sum + p.retros.length, 0);
  const hasNotes = history.some((e) => e.notes && e.notes.trim().length > 0);
  const completedWithNotes = history.filter(
    (e) => e.notes && e.notes.trim().length > 0,
  ).length;

  const achievementBadges = [
    {
      id: "first-challenge",
      emoji: "⭐",
      title: "First Step",
      description: "Completed your very first challenge.",
      category: "Achievement" as const,
      earned: stats.totalCompleted >= 1,
    },
    {
      id: "first-goal-complete",
      emoji: "🎯",
      title: "Goal Crusher",
      description: "Completed an entire goal plan from start to finish.",
      category: "Achievement" as const,
      earned: completedGoals.length >= 1,
    },
    {
      id: "two-goals",
      emoji: "🌐",
      title: "Multi-Tasker",
      description: "Started 2 or more goal plans.",
      category: "Achievement" as const,
      earned: plans.length >= 2,
    },
    {
      id: "first-retro",
      emoji: "🔄",
      title: "Reflector",
      description: "Completed your first weekly retro.",
      category: "Achievement" as const,
      earned: totalRetros >= 1,
    },
    {
      id: "three-retros",
      emoji: "🪞",
      title: "Deep Thinker",
      description: "Completed 3 weekly retros. Self-awareness is a superpower.",
      category: "Achievement" as const,
      earned: totalRetros >= 3,
    },
    {
      id: "first-note",
      emoji: "📝",
      title: "Journaler",
      description: "Left a reflection note on a challenge.",
      category: "Achievement" as const,
      earned: hasNotes,
    },
    {
      id: "five-notes",
      emoji: "📖",
      title: "Storyteller",
      description: "Left reflection notes on 5 challenges.",
      category: "Achievement" as const,
      earned: completedWithNotes >= 5,
    },
    {
      id: "ten-challenges",
      emoji: "🔟",
      title: "Double Digits",
      description: "Completed 10 challenges. You're in the groove.",
      category: "Achievement" as const,
      earned: stats.totalCompleted >= 10,
    },
    {
      id: "three-goals-complete",
      emoji: "🏆",
      title: "Hat Trick",
      description: "Completed 3 goal plans. You finish what you start.",
      category: "Achievement" as const,
      earned: completedGoals.length >= 3,
    },
    {
      id: "twenty-five-challenges",
      emoji: "💎",
      title: "Quarter Century",
      description: "25 challenges completed. Consistency personified.",
      category: "Achievement" as const,
      earned: stats.totalCompleted >= 25,
    },
  ];

  const allBadges = [...stageBadges, ...achievementBadges];
  const earnedCount = allBadges.filter((b) => b.earned).length;

  const toggleDetail = (view: DetailView) => {
    setDetailView((prev) => (prev === view ? null : view));
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Growth</Text>
          <Text style={styles.subtitle}>Watch yourself evolve</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowBadges(true)}
          style={styles.badgeIconBtn}
          activeOpacity={0.7}
          accessibilityLabel="View badges"
        >
          <Text style={styles.badgeIcon}>🏆</Text>
        </TouchableOpacity>
      </View>

      {/* Character Display */}
      <View style={styles.characterSection}>
        <View style={styles.characterCircle}>
          <Text style={styles.characterEmoji}>{character.stage.emoji}</Text>
        </View>
        <Text style={styles.characterName}>{character.stage.name}</Text>
        <Text style={styles.identityLabel}>
          {character.stage.identityLabel}
        </Text>
        <Text style={styles.characterDesc}>{character.stage.description}</Text>
        {character.nextMilestone ? (
          <>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${character.progressToNext * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.nextMilestone}>
              {character.progressMessage}
            </Text>
          </>
        ) : (
          <Text style={styles.completionMessage}>
            {character.progressMessage}
          </Text>
        )}
      </View>

      {/* Evolution Path */}
      <View style={styles.evolutionSection}>
        <Text style={styles.sectionTitle}>Evolution Path</Text>
        <View style={styles.evolutionList}>
          {EVOLUTION_STAGES.map((evoStage, i) => {
            const reached = i < character.stageIndex;
            const current = i === character.stageIndex;
            const locked = i > character.stageIndex;
            const isTappable = reached || current;

            const stageContent = (
              <View
                style={[
                  styles.evolutionItem,
                  current && styles.evolutionItemCurrent,
                  locked && styles.evolutionItemLocked,
                ]}
              >
                <Text style={[styles.stageEmoji, locked && styles.locked]}>
                  {evoStage.identity.emoji}
                </Text>
                <View style={styles.stageInfo}>
                  <Text style={[styles.stageName, locked && styles.locked]}>
                    {evoStage.identity.name}
                  </Text>
                  {current && (
                    <Text style={styles.stageIdentityLabel}>
                      {evoStage.identity.identityLabel}
                    </Text>
                  )}
                  {reached && (
                    <Text style={styles.stageNarrative}>
                      {evoStage.identity.transformationNarrative}
                    </Text>
                  )}
                  {(reached || current) && evoStage.unlocks.length > 0 && (
                    <Text style={styles.unlockItem}>
                      {evoStage.unlocks[0].emoji} {evoStage.unlocks[0].title}
                    </Text>
                  )}
                  {locked && evoStage.unlocks.length > 0 && (
                    <Text style={styles.unlockItemLocked}>
                      🔒 {evoStage.unlocks[0].title}
                    </Text>
                  )}
                  {isTappable && (
                    <Text style={styles.tapHint}>Tap for details</Text>
                  )}
                </View>
                {reached && <Text style={styles.checkmark}>✓</Text>}
              </View>
            );

            return isTappable ? (
              <TouchableOpacity
                key={evoStage.identity.name}
                activeOpacity={0.7}
                onPress={() => setSelectedStageIndex(i)}
              >
                {stageContent}
              </TouchableOpacity>
            ) : (
              <View key={evoStage.identity.name}>{stageContent}</View>
            );
          })}
        </View>
      </View>

      {/* Stage Detail Modal */}
      {selectedStageIndex !== null && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedStageIndex(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSelectedStageIndex(null)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalEmoji}>
                  {EVOLUTION_STAGES[selectedStageIndex].identity.emoji}
                </Text>
                <Text style={styles.modalName}>
                  {EVOLUTION_STAGES[selectedStageIndex].identity.name}
                </Text>
                <Text style={styles.modalIdentityLabel}>
                  {EVOLUTION_STAGES[selectedStageIndex].identity.identityLabel}
                </Text>
                <Text style={styles.modalDescription}>
                  {EVOLUTION_STAGES[selectedStageIndex].identity.description}
                </Text>
                <Text style={styles.modalNarrative}>
                  {`\u201C${EVOLUTION_STAGES[selectedStageIndex].identity.transformationNarrative}\u201D`}
                </Text>

                {EVOLUTION_STAGES[selectedStageIndex].unlocks.length > 0 && (
                  <View style={styles.modalUnlocksSection}>
                    <Text style={styles.modalUnlocksTitle}>Badge</Text>
                    {EVOLUTION_STAGES[selectedStageIndex].unlocks.map(
                      (unlock) => (
                        <View key={unlock.title} style={styles.modalUnlockCard}>
                          <Text style={styles.modalUnlockTitle}>
                            {unlock.emoji} {unlock.title}
                          </Text>
                          <Text style={styles.modalUnlockDesc}>
                            {unlock.description}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedStageIndex(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Badges Modal — uses flex layout so ScrollView gets bounded height */}
      <Modal
        visible={showBadges}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBadges(false)}
      >
        <View style={styles.badgesModalContainer}>
          <View style={styles.badgesModalSheet}>
            <Text style={styles.badgesModalTitle}>🏆 Your Badges</Text>
            <Text style={styles.badgesModalSubtitle}>
              {earnedCount} of {allBadges.length} earned
            </Text>
            <ScrollView
              style={styles.badgesScrollView}
              showsVerticalScrollIndicator
            >
              <Text style={styles.badgesSectionLabel}>Evolution</Text>
              {stageBadges.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.badgeRow,
                    !item.earned && styles.badgeRowLocked,
                  ]}
                >
                  <Text style={styles.badgeRowEmoji}>
                    {item.earned ? item.emoji : "🔒"}
                  </Text>
                  <View style={styles.badgeRowInfo}>
                    <Text
                      style={[
                        styles.badgeRowTitle,
                        !item.earned && styles.badgeRowTitleLocked,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.badgeRowDesc}>
                      {item.earned
                        ? item.description
                        : "Keep evolving to unlock"}
                    </Text>
                  </View>
                </View>
              ))}

              <Text style={styles.badgesSectionLabel}>Achievements</Text>
              {achievementBadges.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.badgeRow,
                    !item.earned && styles.badgeRowLocked,
                  ]}
                >
                  <Text style={styles.badgeRowEmoji}>
                    {item.earned ? item.emoji : "🔒"}
                  </Text>
                  <View style={styles.badgeRowInfo}>
                    <Text
                      style={[
                        styles.badgeRowTitle,
                        !item.earned && styles.badgeRowTitleLocked,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.badgeRowDesc}>
                      {item.earned ? item.description : "Keep going to unlock"}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={{ height: 8 }} />
            </ScrollView>
            <TouchableOpacity
              style={styles.badgesCloseBtn}
              onPress={() => setShowBadges(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  header: {
    marginTop: 16,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 16, color: COLORS.textSecondary },
  badgeIconBtn: { padding: 8 },
  badgeIcon: { fontSize: 24 },
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
    marginBottom: 2,
  },
  identityLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  characterDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  completionMessage: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 4,
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
  evolutionItemLocked: { opacity: 0.7 },
  stageEmoji: { fontSize: 28, marginRight: 12 },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  stageIdentityLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 2,
  },
  stageNarrative: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  unlockItem: { fontSize: 12, color: COLORS.primary, marginTop: 6 },
  unlockItemLocked: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6 },
  checkmark: { fontSize: 16, color: COLORS.primary, fontWeight: "bold" },
  locked: { opacity: 0.4 },
  tapHint: { fontSize: 11, color: COLORS.primary, marginTop: 4, opacity: 0.7 },
  // Stage detail modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalEmoji: { fontSize: 56, textAlign: "center", marginBottom: 8 },
  modalName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  modalIdentityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  modalNarrative: {
    fontSize: 15,
    color: COLORS.text,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  modalUnlocksSection: { marginTop: 20 },
  modalUnlocksTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  modalUnlockCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  modalUnlockTitle: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  modalUnlockDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  modalCloseButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  modalCloseText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  // Badges modal
  badgesModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  badgesModalSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: "85%",
  },
  badgesModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  badgesModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  badgesScrollView: { flexGrow: 0 },
  badgesSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  badgeRowLocked: { opacity: 0.5 },
  badgeRowEmoji: { fontSize: 28, marginRight: 12 },
  badgeRowInfo: { flex: 1 },
  badgeRowTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  badgeRowTitleLocked: { color: COLORS.textSecondary },
  badgeRowDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  badgesCloseBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  // Stats
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
  statTapHint: { fontSize: 11, color: COLORS.primary, marginTop: 6 },
  detailSection: { marginBottom: 32 },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  detailEmpty: { alignItems: "center", padding: 24, marginBottom: 16 },
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
  journalGoal: { fontSize: 11, color: COLORS.textSecondary, maxWidth: "50%" },
  journalTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
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
  goalCardBadge: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
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
  goalCardDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
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
