/**
 * Onboarding Screen
 *
 * First screen users see when opening the app for the first time.
 * TODO: Implement full onboarding flow with multiple steps
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { useUser } from "../../src/state";

export default function OnboardingScreen() {
  const { completeOnboarding } = useUser();

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace("/(main)/home" as Href);
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        {/* TODO: Add onboarding illustrations/animations */}
        <View style={styles.heroSection}>
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.title}>Welcome to Momentum</Text>
          <Text style={styles.subtitle}>
            Your journey to personal growth starts here
          </Text>
        </View>

        {/* TODO: Add onboarding steps/carousel */}
        <View style={styles.featuresSection}>
          <FeatureItem
            emoji="🎯"
            title="Daily Micro-Challenges"
            description="Small steps that lead to big changes"
          />
          <FeatureItem
            emoji="🌳"
            title="Watch Yourself Grow"
            description="Your character evolves as you progress"
          />
          <FeatureItem
            emoji="✨"
            title="Positive Reinforcement"
            description="Celebrate every win, no matter how small"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          size="large"
          style={styles.button}
        />
        {/* TODO: Add "Already have an account? Sign in" link */}
      </View>
    </ScreenContainer>
  );
}

// Simple feature item component
interface FeatureItemProps {
  emoji: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  emoji,
  title,
  description,
}) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  featuresSection: {
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingVertical: 24,
  },
  button: {
    width: "100%",
  },
});
