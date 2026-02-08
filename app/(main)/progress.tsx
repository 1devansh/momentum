/**
 * Progress Screen (Character Growth)
 *
 * Shows the user's character evolution and overall progress.
 * TODO: Implement character growth visualization
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS, FEATURE_FLAGS } from "../../src/config";
import { useSubscription } from "../../src/state";

export default function ProgressScreen() {
  const { isPro } = useSubscription();

  const handleUpgrade = () => {
    router.push("/paywall" as Href);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Your Growth</Text>
        <Text style={styles.subtitle}>Watch yourself evolve</Text>
      </View>

      {/* Character Display Placeholder */}
      <View style={styles.characterSection}>
        {FEATURE_FLAGS.CHARACTER_GROWTH ? (
          // TODO: Implement actual character visualization
          <View style={styles.characterContainer}>
            <Text style={styles.characterPlaceholder}>Character Here</Text>
          </View>
        ) : (
          <View style={styles.characterPlaceholder}>
            <Text style={styles.characterEmoji}>🌱</Text>
            <Text style={styles.characterName}>Sapling</Text>
            <Text style={styles.characterLevel}>Level 1</Text>
          </View>
        )}
      </View>

      {/* Evolution Path */}
      <View style={styles.evolutionSection}>
        <Text style={styles.sectionTitle}>Evolution Path</Text>
        <View style={styles.evolutionPath}>
          <EvolutionStage emoji="🌱" name="Sapling" level="1-5" active />
          <View style={styles.evolutionArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <EvolutionStage
            emoji="🌿"
            name="Sprout"
            level="6-15"
            locked={!isPro}
          />
          <View style={styles.evolutionArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <EvolutionStage emoji="🌳" name="Tree" level="16+" locked={!isPro} />
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Days Active" value="0" />
          <StatCard label="Challenges Done" value="0" />
          <StatCard label="Best Streak" value="0" />
          <StatCard label="Total XP" value="0" />
        </View>
      </View>

      {/* TODO: Add achievements section */}
      {/* TODO: Add weekly/monthly progress charts */}
      {/* TODO: Add milestone celebrations */}

      {/* Upgrade CTA */}
      {!isPro && (
        <View style={styles.upgradeSection}>
          <Text style={styles.upgradeTitle}>Unlock Full Evolution</Text>
          <Text style={styles.upgradeText}>
            Pro members can evolve their character to its full potential
          </Text>
          <Button
            title="Upgrade to Pro"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

// Evolution stage component
interface EvolutionStageProps {
  emoji: string;
  name: string;
  level: string;
  active?: boolean;
  locked?: boolean;
}

const EvolutionStage: React.FC<EvolutionStageProps> = ({
  emoji,
  name,
  level,
  active = false,
  locked = false,
}) => (
  <View style={[styles.evolutionStage, active && styles.evolutionStageActive]}>
    <Text style={[styles.stageEmoji, locked && styles.locked]}>{emoji}</Text>
    <Text style={[styles.stageName, locked && styles.locked]}>{name}</Text>
    <Text style={[styles.stageLevel, locked && styles.locked]}>
      Lv. {level}
    </Text>
    {locked && <Text style={styles.lockIcon}>🔒</Text>}
  </View>
);

// Stat card component
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
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  characterSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  characterContainer: {
    // TODO: Style for actual character
  },
  characterPlaceholder: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 100,
    width: 160,
    height: 160,
    justifyContent: "center",
  },
  characterEmoji: {
    fontSize: 64,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 8,
  },
  characterLevel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  evolutionSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  evolutionPath: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  evolutionStage: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    minWidth: 80,
  },
  evolutionStageActive: {
    backgroundColor: COLORS.primary + "20",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stageEmoji: {
    fontSize: 32,
  },
  stageName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 4,
  },
  stageLevel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  lockIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    fontSize: 12,
  },
  locked: {
    opacity: 0.5,
  },
  evolutionArrow: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  upgradeButton: {
    minWidth: 200,
  },
});
