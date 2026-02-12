/**
 * Creator Program Types
 *
 * Core domain types for the creator-led program system.
 * Completely separate from GoalPlan / AI challenge types.
 *
 * TODO: Add creator profile type when creator publishing is available
 * TODO: Add program rating / review types
 * TODO: Add program purchase receipt type for monetization
 */

export interface ProgramDay {
  day: number; // 1-indexed
  title: string;
  description: string;
  encouragement: string;
}

export interface ProgramReview {
  id: string;
  name: string;
  rating: number; // 1-5
  text: string;
}

export interface ProgramSocialProof {
  enrolledCount: number;
  averageRating: number;
  reviews: ProgramReview[];
}

export interface CreatorProgram {
  id: string;
  title: string;
  creatorName: string;
  creatorBio: string;
  description: string;
  durationDays: number;
  days: ProgramDay[];
  premium: boolean;
  socialProof: ProgramSocialProof;
  // TODO: Add creatorId when creator accounts exist
  // TODO: Add price for individual program purchases
  // TODO: Add category / tags for discovery
  // TODO: Add thumbnailUrl for program artwork
  // TODO: Add creatorAvatarUrl for creator profile image
}

export interface ActiveProgram {
  programId: string;
  currentDay: number; // 1-indexed, next day to complete
  startedAt: string; // ISO date
  completedDays: number[]; // day numbers that have been completed
  // TODO: Add completedAt for finished programs
  // TODO: Add streakCount for consecutive day tracking
}
