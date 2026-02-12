/**
 * Evolution Celebration Modal
 *
 * A full-screen modal overlay triggered when the user evolves to a new stage.
 * Displays the new stage emoji with a scale-in animation, identity label,
 * transformation narrative, and newly unlocked items. Fires confetti with
 * a distinct color palette and triggers haptic feedback on mount.
 *
 * Self-contained: reads `pendingEvolution` from the evolution store and
 * renders only when a pending evolution exists.
 */

import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import {
    EVOLUTION_STAGES,
    getNewUnlocks,
    useEvolutionStore,
} from "../features/character";
import { Button } from "./ui/Button";

/**
 * Distinct confetti palette for evolution celebrations.
 * Deliberately different from the default confetti on the home screen
 * to make the evolution moment feel special.
 */
const EVOLUTION_CONFETTI_COLORS = [
  "#FFD700", // gold
  "#FF6B6B", // coral
  "#A855F7", // purple
  "#38BDF8", // sky blue
  "#34D399", // emerald
  "#FB923C", // orange
];

export const EvolutionCelebration: React.FC = () => {
  const pendingEvolution = useEvolutionStore((s) => s.pendingEvolution);
  const dismissEvolution = useEvolutionStore((s) => s.dismissEvolution);
  const confettiRef = useRef<ConfettiCannon | null>(null);

  // Animation shared values
  const emojiScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const isVisible = pendingEvolution !== null;

  // Validate stage indices
  const toStage =
    isVisible && pendingEvolution.toStageIndex < EVOLUTION_STAGES.length
      ? EVOLUTION_STAGES[pendingEvolution.toStageIndex]
      : null;

  const newUnlocks =
    isVisible && toStage
      ? getNewUnlocks(
          pendingEvolution.fromStageIndex,
          pendingEvolution.toStageIndex,
        )
      : [];

  useEffect(() => {
    if (!isVisible || !toStage) return;

    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Start entrance animations
    emojiScale.value = withSpring(1, { damping: 8, stiffness: 120 });
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    // Fire confetti
    confettiRef.current?.start();

    return () => {
      // Reset animation values on unmount
      emojiScale.value = 0;
      contentOpacity.value = 0;
    };
  }, [isVisible, toStage, emojiScale, contentOpacity]);

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Don't render if no pending evolution or invalid stage
  if (!isVisible || !toStage) return null;

  const { identity } = toStage;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissEvolution}
    >
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Stage emoji with scale-in animation */}
            <Animated.Text style={[styles.stageEmoji, emojiAnimatedStyle]}>
              {identity.emoji}
            </Animated.Text>

            <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
              {/* Identity label */}
              <Text style={styles.identityLabel}>{identity.identityLabel}</Text>

              {/* Stage name */}
              <Text style={styles.stageName}>{identity.name}</Text>

              {/* Transformation narrative */}
              <Text style={styles.narrative}>
                {identity.transformationNarrative}
              </Text>

              {/* New badges */}
              {newUnlocks.length > 0 && (
                <View style={styles.unlocksSection}>
                  <Text style={styles.unlocksTitle}>
                    New Badge{newUnlocks.length > 1 ? "s" : ""}
                  </Text>
                  {newUnlocks.map((unlock, index) => (
                    <View
                      key={`${unlock.title}-${index}`}
                      style={styles.unlockRow}
                    >
                      <Text style={styles.unlockEmoji}>{unlock.emoji}</Text>
                      <View style={styles.unlockText}>
                        <Text style={styles.unlockTitle}>{unlock.title}</Text>
                        <Text style={styles.unlockDescription}>
                          {unlock.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Dismiss button */}
              <Button
                title="Continue"
                onPress={dismissEvolution}
                size="large"
                style={styles.dismissBtn}
              />
            </Animated.View>
          </View>
        </ScrollView>

        {/* Confetti with distinct evolution palette */}
        <ConfettiCannon
          ref={confettiRef}
          count={120}
          origin={{ x: -10, y: -20 }}
          autoStart={false}
          fadeOut
          fallSpeed={2500}
          colors={EVOLUTION_CONFETTI_COLORS}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  stageEmoji: {
    fontSize: 96,
    marginBottom: 24,
  },
  textContent: {
    alignItems: "center",
    width: "100%",
  },
  identityLabel: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  stageName: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 16,
    textAlign: "center",
  },
  narrative: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  unlocksSection: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  unlocksTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  unlockRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  unlockEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  unlockText: {
    flex: 1,
  },
  unlockTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  unlockDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 20,
  },
  dismissBtn: {
    width: "100%",
    marginTop: 8,
  },
});
