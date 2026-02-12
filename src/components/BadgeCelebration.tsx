/**
 * Badge / Achievement Celebration Modal
 *
 * Reuses the same animation language as EvolutionCelebration:
 * full-screen overlay, scale-in emoji, confetti burst, haptic
 * feedback. Shown whenever a new badge or achievement is unlocked.
 */

import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useBadgeStore } from "../features/badges";
import { Button } from "./ui/Button";

const BADGE_CONFETTI_COLORS = [
  "#FFD700", // gold
  "#FF6B6B", // coral
  "#A855F7", // purple
  "#38BDF8", // sky blue
  "#34D399", // emerald
  "#FB923C", // orange
];

export const BadgeCelebration: React.FC = () => {
  const pendingBadge = useBadgeStore((s) => s.pendingBadge);
  const dismissBadge = useBadgeStore((s) => s.dismissBadge);
  const confettiRef = useRef<ConfettiCannon | null>(null);

  const emojiScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const isVisible = pendingBadge !== null;

  useEffect(() => {
    if (!isVisible) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    emojiScale.value = withSpring(1, { damping: 8, stiffness: 120 });
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    confettiRef.current?.start();

    return () => {
      emojiScale.value = 0;
      contentOpacity.value = 0;
    };
  }, [isVisible, emojiScale, contentOpacity]);

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissBadge}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>
            {pendingBadge.emoji}
          </Animated.Text>

          <Animated.View style={[styles.textContent, contentAnimatedStyle]}>
            <Text style={styles.unlocked}>Badge Unlocked</Text>
            <Text style={styles.title}>{pendingBadge.title}</Text>
            <Text style={styles.description}>{pendingBadge.description}</Text>

            <Button
              title="Continue"
              onPress={dismissBadge}
              size="large"
              style={styles.dismissBtn}
            />
          </Animated.View>
        </View>

        <ConfettiCannon
          ref={confettiRef}
          count={120}
          origin={{ x: -10, y: -20 }}
          autoStart={false}
          fadeOut
          fallSpeed={2500}
          colors={BADGE_CONFETTI_COLORS}
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
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 96,
    marginBottom: 24,
  },
  textContent: {
    alignItems: "center",
    width: "100%",
  },
  unlocked: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  dismissBtn: {
    width: "100%",
    marginTop: 8,
  },
});
