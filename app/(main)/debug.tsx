/**
 * Debug Screen
 *
 * Displays user information, testing utilities, future challenge viewer,
 * and date manipulation for demo purposes.
 * Remove this screen before production release.
 */

import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { useGoalPlanStore, type GoalPlan } from "../../src/features/challenges";
import {
    getDebugTodayKey,
    useDebugDateStore,
} from "../../src/features/debug/debug-date";
import { useSubscription } from "../../src/state/subscription";
import { useUser } from "../../src/state/user";

export default function DebugScreen() {
  const { profile, preferences, hasOnboarded, resetOnboarding } = useUser();
  const { isPro, isLoading: subLoading } = useSubscription();
  const plans = useGoalPlanStore((s) => s.plans);
  const dayOffset = useDebugDateStore((s) => s.dayOffset);
  const advanceDays = useDebugDateStore((s) => s.advanceDays);
  const resetDate = useDebugDateStore((s) => s.resetDate);

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    Alert.alert(
      "Success",
      "Onboarding reset. Restart the app to see onboarding flow.",
    );
  };

  const debugToday = getDebugTodayKey();

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Debug Information</Text>
        <Text style={styles.warning}>
          ⚠️ Remove this screen before production release
        </Text>

        {/* Time Travel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏩ Time Travel (Demo)</Text>
          <Text style={styles.dateDisplay}>Simulated date: {debugToday}</Text>
          <Text style={styles.offsetLabel}>
            Offset:{" "}
            {dayOffset === 0 ? "None (real time)" : `+${dayOffset} day(s)`}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: COLORS.primary }]}
              onPress={() => advanceDays(1)}
            >
              <Text style={styles.smallButtonText}>+1 Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: COLORS.primary }]}
              onPress={() => advanceDays(3)}
            >
              <Text style={styles.smallButtonText}>+3 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: COLORS.primary }]}
              onPress={() => advanceDays(7)}
            >
              <Text style={styles.smallButtonText}>+7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: COLORS.error }]}
              onPress={resetDate}
            >
              <Text style={styles.smallButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Future Challenges Viewer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 All Planned Challenges</Text>
          {plans.length === 0 ? (
            <Text style={styles.value}>No goal plans created yet.</Text>
          ) : (
            plans.map((plan) => (
              <PlanChallengeList
                key={plan.id}
                plan={plan}
                expanded={expandedPlanId === plan.id}
                onToggle={() =>
                  setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)
                }
              />
            ))
          )}
        </View>

        {/* User Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Profile</Text>
          {profile ? (
            <>
              <InfoRow label="User ID" value={profile.userId} />
              <InfoRow
                label="Created At"
                value={new Date(profile.createdAt).toLocaleString()}
              />
              <InfoRow
                label="Last Login"
                value={new Date(profile.lastLoginAt).toLocaleString()}
              />
            </>
          ) : (
            <Text style={styles.value}>No profile loaded</Text>
          )}
        </View>

        {/* Subscription Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <InfoRow label="Is Pro" value={isPro ? "Yes ✅" : "No ❌"} />
          <InfoRow label="Loading" value={subLoading ? "Yes" : "No"} />
        </View>

        {/* App State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App State</Text>
          <InfoRow label="Has Onboarded" value={hasOnboarded ? "Yes" : "No"} />
          <InfoRow
            label="Notifications"
            value={preferences.notificationsEnabled ? "Enabled" : "Disabled"}
          />
          <InfoRow label="Theme" value={preferences.theme} />
          <InfoRow
            label="Reminders"
            value={`${preferences.dailyReminders.length} configured`}
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleResetOnboarding}
          >
            <Text style={styles.buttonText}>Reset Onboarding</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

interface PlanChallengeListProps {
  plan: GoalPlan;
  expanded: boolean;
  onToggle: () => void;
}

function PlanChallengeList({
  plan,
  expanded,
  onToggle,
}: PlanChallengeListProps) {
  const completed = plan.challenges.filter((c) => c.completed).length;
  const total = plan.challenges.length;

  return (
    <View style={styles.planCard}>
      <TouchableOpacity onPress={onToggle} style={styles.planHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.planGoal} numberOfLines={1}>
            {plan.isActive ? "🟢 " : "⚪ "}
            {plan.goal}
          </Text>
          <Text style={styles.planMeta}>
            {completed}/{total} completed · Current: #{plan.currentIndex + 1}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.challengeList}>
          {plan.challenges.map((c, i) => (
            <View
              key={c.id}
              style={[
                styles.challengeRow,
                i === plan.currentIndex && styles.currentChallenge,
              ]}
            >
              <Text style={styles.challengeIndex}>
                {c.completed ? "✅" : i === plan.currentIndex ? "👉" : "⬜"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeTitle}>
                  {i + 1}. {c.title}
                </Text>
                <Text style={styles.challengeDesc}>{c.description}</Text>
                {c.completedAt && (
                  <Text style={styles.challengeDate}>
                    Done: {c.completedAt.slice(0, 10)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value} selectable>
        {value}
      </Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  warning: {
    fontSize: 14,
    color: COLORS.warning,
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.text,
  },
  infoRow: { flexDirection: "row", marginBottom: 8 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    width: 120,
  },
  value: { fontSize: 14, color: COLORS.text, flex: 1 },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  // Time travel
  dateDisplay: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  offsetLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  smallButtonText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  // Plan / challenge viewer
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  planGoal: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  planMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  chevron: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 8 },
  challengeList: { paddingHorizontal: 12, paddingBottom: 12 },
  challengeRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
    alignItems: "flex-start",
  },
  currentChallenge: { backgroundColor: "#E8F5E9" },
  challengeIndex: { fontSize: 16, marginRight: 8, marginTop: 2 },
  challengeTitle: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  challengeDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  challengeDate: { fontSize: 11, color: COLORS.primary, marginTop: 2 },
});
