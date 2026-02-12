/**
 * AI Adaptation Logic
 *
 * Computes weekly insights from challenge data and determines
 * adaptation rules based on feeling + completion rate.
 */

import {
    AdaptationResult,
    GoalPlan,
    RetroFeeling,
    WeeklyInsight
} from "./types";

/**
 * Classify completion time into a time-of-day bucket.
 */
function classifyTime(isoDate: string): "morning" | "afternoon" | "evening" {
  const hour = new Date(isoDate).getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/**
 * Count unique calendar days between two dates.
 */
function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  const d1 = new Date(a).setHours(0, 0, 0, 0);
  const d2 = new Date(b).setHours(0, 0, 0, 0);
  return Math.round(Math.abs(d2 - d1) / msPerDay);
}

/**
 * Compute weekly insight from the challenges completed since last retro.
 */
export function computeWeeklyInsight(plan: GoalPlan): WeeklyInsight {
  const sinceIndex = plan.completedAtLastRetro || 0;
  const relevantChallenges = plan.challenges.slice(sinceIndex);
  const completed = relevantChallenges.filter((c) => c.completed);
  const total = relevantChallenges.length;
  const completionRate = total > 0 ? completed.length / total : 0;

  // Time pattern analysis
  const times = completed
    .filter((c) => c.completedAt)
    .map((c) => classifyTime(c.completedAt!));

  const timeCounts = { morning: 0, afternoon: 0, evening: 0 };
  for (const t of times) timeCounts[t]++;

  let timePattern: string = "mixed";
  const maxCount = Math.max(...Object.values(timeCounts));
  if (maxCount > 0 && times.length > 1) {
    const dominant = Object.entries(timeCounts).find(
      ([, count]) => count === maxCount,
    );
    if (dominant && maxCount >= times.length * 0.5) {
      timePattern = dominant[0];
    }
  }

  // Day span and missed days
  const lastRetro =
    plan.retros.length > 0
      ? plan.retros[plan.retros.length - 1].createdAt
      : plan.createdAt;
  const now = new Date().toISOString();
  const daySpan = Math.max(1, daysBetween(lastRetro, now));

  const completedDays = new Set(
    completed
      .filter((c) => c.completedAt)
      .map((c) => c.completedAt!.slice(0, 10)),
  );
  const missedDays = Math.max(0, daySpan - completedDays.size);

  // Behavioral insight
  const behavioralInsight = generateBehavioralInsight(
    completionRate,
    timePattern,
    missedDays,
    completed.length,
    daySpan,
  );

  return {
    completedCount: completed.length,
    totalCount: total,
    completionRate,
    timePattern,
    missedDays,
    behavioralInsight,
    daySpan,
  };
}

function generateBehavioralInsight(
  rate: number,
  timePattern: string,
  missedDays: number,
  completed: number,
  daySpan: number,
): string {
  if (completed === 0) {
    return "This is a fresh start. Let's find a rhythm that works for you.";
  }

  if (rate >= 0.85 && timePattern !== "mixed") {
    const timeLabel =
      timePattern === "morning"
        ? "Mornings"
        : timePattern === "afternoon"
          ? "Afternoons"
          : "Evenings";
    return `${timeLabel} are your strongest consistency window. You're in a great rhythm.`;
  }

  if (rate >= 0.85) {
    return "You're crushing it — high completion with a flexible schedule.";
  }

  if (missedDays >= daySpan * 0.5) {
    return `You had ${missedDays} inactive days. Shorter, easier challenges might help build momentum.`;
  }

  if (timePattern !== "mixed" && rate >= 0.5) {
    const timeLabel =
      timePattern === "morning"
        ? "mornings"
        : timePattern === "afternoon"
          ? "afternoons"
          : "evenings";
    return `You tend to complete challenges in the ${timeLabel}. Leaning into that could boost consistency.`;
  }

  if (rate < 0.5) {
    return "Completion was lower this cycle. We'll simplify things to help you build momentum.";
  }

  return "Steady progress. Let's keep building on what's working.";
}

/**
 * Determine adaptation based on feeling + completion rate.
 * Returns structured result explaining what/why/what-next.
 */
export function computeAdaptation(
  feeling: RetroFeeling | undefined,
  insight: WeeklyInsight,
): AdaptationResult {
  const rate = insight.completionRate;
  const adjustments: string[] = [];
  let difficultyDelta: -1 | 0 | 1 = 0;
  let targetDurationMinutes = 10;
  let addGuidance = false;
  let addStretchTask = false;
  let reason = "";
  let expectation = "";
  let preferredTimeHint: string | undefined;

  // Time hint
  if (insight.timePattern !== "mixed") {
    preferredTimeHint = insight.timePattern;
  }

  // Feeling-based rules
  if (feeling === "overwhelmed") {
    difficultyDelta = -1;
    targetDurationMinutes = 5;
    adjustments.push("Reducing challenge difficulty");
    adjustments.push("Shortening to ~5 minute tasks");
    reason = `You're feeling overwhelmed with a ${Math.round(rate * 100)}% completion rate.`;
    expectation =
      "Expect lighter, quicker challenges next week to ease the pressure.";
  } else if (feeling === "stuck") {
    addGuidance = true;
    adjustments.push("Adding step-by-step guidance to challenges");
    if (rate < 0.5) {
      difficultyDelta = -1;
      adjustments.push("Lowering difficulty");
    }
    reason = "You're feeling stuck, so we're adding more guidance.";
    expectation =
      "Next challenges will include clearer steps and tips to get unstuck.";
  } else if (feeling === "confident") {
    difficultyDelta = 1;
    adjustments.push("Increasing challenge intensity");
    if (rate > 0.85) {
      addStretchTask = true;
      adjustments.push("Adding a bonus stretch task");
    }
    reason = "You're feeling confident and performing well.";
    expectation = "Expect more ambitious challenges to keep you growing.";
  } else if (feeling === "motivated") {
    if (rate > 0.85) {
      difficultyDelta = 1;
      addStretchTask = true;
      adjustments.push("Stepping up the challenge");
      adjustments.push("Adding a stretch task");
    }
    reason = "You're motivated — let's channel that energy.";
    expectation =
      rate > 0.85
        ? "We're raising the bar to match your momentum."
        : "Keeping the current pace with your strong motivation.";
  }

  // Completion-rate overrides (applied on top of feeling)
  if (rate < 0.5 && feeling !== "overwhelmed") {
    if (difficultyDelta >= 0) difficultyDelta = -1;
    if (!adjustments.some((a) => a.includes("difficulty"))) {
      adjustments.push("Simplifying challenges due to low completion");
    }
    reason =
      reason ||
      `Completion rate was ${Math.round(rate * 100)}%, so we're simplifying.`;
    expectation = expectation || "Expect easier, more approachable challenges.";
  }

  if (rate > 0.85 && !feeling) {
    difficultyDelta = 1;
    addStretchTask = true;
    adjustments.push("Adding stretch tasks for high performers");
    reason = `${Math.round(rate * 100)}% completion — you're ready for more.`;
    expectation = "We're adding a stretch challenge to push your growth.";
  }

  // Defaults if nothing triggered
  if (adjustments.length === 0) {
    adjustments.push("Maintaining current difficulty");
    reason = "Your pace looks balanced.";
    expectation = "Challenges will stay at a similar level next week.";
  }

  return {
    adjustments,
    reason,
    expectation,
    difficultyDelta,
    targetDurationMinutes,
    addGuidance,
    addStretchTask,
    preferredTimeHint,
  };
}
