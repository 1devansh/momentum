/**
 * Goal Carousel Component
 *
 * Horizontal swipe carousel for switching between goal plans.
 * Center card is the active goal. Swiping switches active goal.
 * Tapping a card opens the goal detail screen.
 *
 * Cards are compact — detail lives in the goal-detail screen.
 */

import React, { useCallback, useRef } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import { COLORS } from "../../config/constants";
import { GoalPlan } from "../../features/challenges/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 80;
const CARD_MARGIN = 8;

interface GoalCarouselProps {
  plans: GoalPlan[];
  activePlanId: string | null;
  onPlanChange: (planId: string) => void;
  onCardPress: (planId: string) => void;
  hasNewChallenge: (plan: GoalPlan) => boolean;
}

export const GoalCarousel: React.FC<GoalCarouselProps> = ({
  plans,
  activePlanId,
  onPlanChange,
  onCardPress,
  hasNewChallenge,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const centeredItem = viewableItems[0];
        if (centeredItem.item && centeredItem.item.id !== activePlanId) {
          onPlanChange(centeredItem.item.id);
        }
      }
    },
    [activePlanId, onPlanChange],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderCard = useCallback(
    ({ item, isFullWidth }: { item: GoalPlan; isFullWidth?: boolean }) => {
      const completed = item.challenges.filter((c) => c.completed).length;
      const total = item.challenges.length;
      const progress = total > 0 ? completed / total : 0;
      const isActive = item.id === activePlanId;
      const showNewDot = hasNewChallenge(item);

      return (
        <TouchableOpacity
          style={[
            styles.card,
            isActive && styles.cardActive,
            isFullWidth && styles.cardFullWidth,
          ]}
          onPress={() => onCardPress(item.id)}
          activeOpacity={0.7}
          accessibilityLabel={`Goal: ${item.goal}. ${completed} of ${total} challenges completed. Tap for details.`}
          accessibilityRole="button"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.goalLabel}>YOUR GOAL</Text>
            <View style={styles.cardHeaderRight}>
              {showNewDot && <View style={styles.newDot} />}
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>
          <Text style={styles.goalText}>{item.goal}</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {completed === 0
              ? "Just getting started"
              : `${completed} of ${total} completed`}
          </Text>
        </TouchableOpacity>
      );
    },
    [activePlanId, hasNewChallenge, onCardPress],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: CARD_WIDTH + CARD_MARGIN * 2,
      offset: (CARD_WIDTH + CARD_MARGIN * 2) * index,
      index,
    }),
    [],
  );

  const initialIndex = plans.findIndex((p) => p.id === activePlanId);

  if (plans.length === 0) return null;

  if (plans.length === 1) {
    return (
      <View style={styles.singleContainer}>
        {renderCard({ item: plans[0], isFullWidth: true })}
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={plans}
      renderItem={({ item }) => renderCard({ item })}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled={false}
      snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
      snapToAlignment="center"
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={getItemLayout}
      initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
    />
  );
};

const styles = StyleSheet.create({
  singleContainer: {
    paddingHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    backgroundColor: COLORS.primary + "12",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary + "40",
  },
  cardActive: {
    borderLeftColor: COLORS.primary,
  },
  cardFullWidth: {
    width: "auto",
    marginHorizontal: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: "300",
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    minWidth: 2,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
