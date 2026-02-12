/**
 * Program Detail Screen
 *
 * Shows full program info, creator bio, social proof (reviews
 * and enrollment count), and enrollment CTA with confirmation.
 *
 * TODO: Add creator social links
 * TODO: Add real reviews from backend
 */

import { Href, router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components";
import { COLORS } from "../../src/config";
import { canAccessProgram } from "../../src/features/premium";
import type { ProgramReview } from "../../src/features/programs";
import {
    selectActiveCreatorProgram,
    useProgramStore,
} from "../../src/features/programs";
import { useBackToTab } from "../../src/hooks";
import { useSubscription } from "../../src/state";

export default function ProgramDetailScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { isPro } = useSubscription();

  const programs = useProgramStore((s) => s.programs);
  const activeProgram = useProgramStore((s) => s.activeProgram);
  const enroll = useProgramStore((s) => s.enroll);

  const program = programs.find((p) => p.id === programId);
  const activeCreatorProgram = selectActiveCreatorProgram(
    programs,
    activeProgram,
  );
  const isActive = activeProgram?.programId === programId;
  const locked = program ? !canAccessProgram(isPro, program) : false;

  const goBack = useBackToTab("/(main)/programs" as Href);

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Program not found.</Text>
        <Button title="Go back" onPress={goBack} />
      </SafeAreaView>
    );
  }

  const handleEnroll = () => {
    if (locked) {
      router.push("/paywall" as Href);
      return;
    }

    if (activeProgram && activeProgram.programId !== programId) {
      Alert.alert(
        "Switch Program?",
        `You're currently enrolled in "${activeCreatorProgram?.title}". Starting "${program.title}" will replace your current program.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Switch", onPress: () => confirmEnroll() },
        ],
      );
      return;
    }

    confirmEnroll();
  };

  const confirmEnroll = () => {
    Alert.alert(
      "Start Program?",
      `You're about to begin "${program.title}" — a ${program.durationDays}-day program by ${program.creatorName}. Ready to commit?`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Let's go",
          onPress: () => {
            enroll(program.id);
            goBack();
          },
        },
      ],
    );
  };

  const { socialProof } = program;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Program header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{program.title}</Text>
            {locked && <Text style={styles.lockIcon}>🔒</Text>}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.duration}>{program.durationDays} days</Text>
            {program.premium && (
              <Text style={styles.premiumBadge}>✨ Premium</Text>
            )}
          </View>
          <Text style={styles.description}>{program.description}</Text>
        </View>

        {/* Social proof stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {socialProof.enrolledCount.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Enrolled</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {socialProof.averageRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{program.durationDays}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
        </View>

        {/* Creator section */}
        <View style={styles.creatorCard}>
          <Text style={styles.sectionLabel}>ABOUT THE CREATOR</Text>
          <Text style={styles.creatorName}>{program.creatorName}</Text>
          <Text style={styles.creatorBio}>{program.creatorBio}</Text>
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>What people are saying</Text>
          {socialProof.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        {isActive ? (
          <View style={styles.enrolledBanner}>
            <Text style={styles.enrolledText}>
              ✅ Currently enrolled — Day {activeProgram!.currentDay} of{" "}
              {program.durationDays}
            </Text>
          </View>
        ) : locked ? (
          <Button
            title="🔒 Upgrade to Unlock"
            onPress={() => router.push("/paywall" as Href)}
            size="large"
          />
        ) : (
          <Button title="Start Program" onPress={handleEnroll} size="large" />
        )}
      </View>
    </SafeAreaView>
  );
}

function ReviewCard({ review }: { review: ProgramReview }) {
  const stars = "⭐".repeat(review.rating);
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewName}>{review.name}</Text>
        <Text style={styles.reviewStars}>{stars}</Text>
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  backBtn: { paddingVertical: 12 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: "500" },
  header: { marginBottom: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  lockIcon: { fontSize: 20, marginLeft: 8 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  duration: { fontSize: 14, color: COLORS.textSecondary },
  premiumBadge: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.textSecondary + "30",
  },
  creatorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  creatorBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  reviewsSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewStars: { fontSize: 12 },
  reviewText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  enrolledBanner: {
    backgroundColor: COLORS.primary + "15",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  enrolledText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 16,
  },
});
