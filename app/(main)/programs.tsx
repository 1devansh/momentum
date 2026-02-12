/**
 * Programs Screen
 *
 * Browse creator-led programs. Tapping a card navigates
 * to the detail screen where users can learn more and enroll.
 *
 * TODO: Add search / filter by category
 * TODO: Add creator profile links
 * TODO: Add program ratings
 */

import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { canAccessProgram } from "../../src/features/premium";
import {
    selectActiveCreatorProgram,
    useProgramStore,
} from "../../src/features/programs";
import { useSubscription } from "../../src/state";

export default function ProgramsScreen() {
  const { isPro } = useSubscription();
  const programs = useProgramStore((s) => s.programs);
  const activeProgram = useProgramStore((s) => s.activeProgram);

  const activeCreatorProgram = selectActiveCreatorProgram(
    programs,
    activeProgram,
  );

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Programs</Text>
        <Text style={styles.subtitle}>
          Structured programs from creators to guide your growth
        </Text>
      </View>

      {activeCreatorProgram && activeProgram && (
        <TouchableOpacity
          style={styles.activeCard}
          onPress={() =>
            router.push(
              `/(main)/program-detail?programId=${activeProgram.programId}` as Href,
            )
          }
          accessibilityRole="button"
          accessibilityLabel={`Currently enrolled in ${activeCreatorProgram.title}`}
        >
          <Text style={styles.activeLabel}>CURRENTLY ENROLLED</Text>
          <Text style={styles.activeTitle}>{activeCreatorProgram.title}</Text>
          <Text style={styles.activeProgress}>
            Day {activeProgram.currentDay} of{" "}
            {activeCreatorProgram.durationDays}
          </Text>
        </TouchableOpacity>
      )}

      {programs.map((program) => {
        const isActive = activeProgram?.programId === program.id;
        const locked = !canAccessProgram(isPro, program);

        return (
          <TouchableOpacity
            key={program.id}
            style={[styles.programCard, isActive && styles.programCardActive]}
            onPress={() =>
              router.push(
                `/(main)/program-detail?programId=${program.id}` as Href,
              )
            }
            accessibilityRole="button"
            accessibilityLabel={`${program.title} by ${program.creatorName}${locked ? ", premium locked" : ""}`}
          >
            <View style={styles.programHeader}>
              <Text style={styles.programTitle}>{program.title}</Text>
              {locked && <Text style={styles.lockIcon}>🔒</Text>}
              {isActive && <Text style={styles.activeIcon}>✅</Text>}
            </View>
            <Text style={styles.creatorName}>by {program.creatorName}</Text>
            <Text style={styles.programDescription} numberOfLines={2}>
              {program.description}
            </Text>
            <View style={styles.programMeta}>
              <Text style={styles.metaText}>{program.durationDays} days</Text>
              {program.premium && (
                <Text style={styles.premiumBadge}>✨ Premium</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 16, marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  activeCard: {
    backgroundColor: COLORS.primary + "15",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  activeLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  activeTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  activeProgress: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  programCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  programCardActive: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  lockIcon: { fontSize: 16, marginLeft: 8 },
  activeIcon: { fontSize: 16, marginLeft: 8 },
  creatorName: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  programDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  programMeta: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  premiumBadge: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 12,
  },
});
