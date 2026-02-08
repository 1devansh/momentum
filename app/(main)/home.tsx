/**
 * Home Screen (Daily Challenge)
 *
 * The main screen users see daily with their current challenge.
 * TODO: Implement full daily challenge functionality
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS, FEATURE_FLAGS } from "../../src/config";
import { useSubscription } from "../../src/state";

export default function HomeScreen() {
  const { isPro, isLoading } = useSubscription();

  const handleUpgrade = () => {
    router.push("/paywall" as Href);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning! 👋</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Pro Badge */}
      {isPro && (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>✨ Pro</Text>
        </View>
      )}

      {/* Daily Challenge Placeholder */}
      <View style={styles.challengeCard}>
        <Text style={styles.challengeLabel}>Today&apos;s Challenge</Text>

        {FEATURE_FLAGS.DAILY_CHALLENGES ? (
          // TODO: Implement actual challenge display
          <View>
            <Text style={styles.challengeTitle}>Challenge Title Here</Text>
            <Text style={styles.challengeDescription}>
              Challenge description will go here
            </Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🎯</Text>
            <Text style={styles.placeholderTitle}>Coming Soon</Text>
            <Text style={styles.placeholderText}>
              Daily micro-challenges will appear here.
              {"\n"}Check back soon!
            </Text>
          </View>
        )}
      </View>

      {/* TODO: Add streak counter */}
      <View style={styles.statsRow}>
        <StatItem label="Current Streak" value="0 days" emoji="🔥" />
        <StatItem label="Total Completed" value="0" emoji="✅" />
      </View>

      {/* Upgrade CTA for free users */}
      {!isPro && !isLoading && (
        <View style={styles.upgradeBanner}>
          <Text style={styles.upgradeText}>
            Unlock all challenges and features
          </Text>
          <Button
            title="Upgrade to Pro"
            onPress={handleUpgrade}
            variant="primary"
            size="small"
          />
        </View>
      )}

      {/* TODO: Add quick actions */}
      {/* TODO: Add motivational quote */}
      {/* TODO: Add AI suggestion section */}
    </ScreenContainer>
  );
}

// Simple stat item component
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  proBadge: {
    position: "absolute",
    top: 16,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  challengeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
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
  },
  placeholder: {
    alignItems: "center",
    paddingVertical: 24,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  upgradeBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upgradeText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginRight: 12,
  },
});
