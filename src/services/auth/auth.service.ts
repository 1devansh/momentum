/**
 * Authentication Service
 *
 * Manages user authentication and identity.
 * For now, this creates and manages anonymous user IDs.
 * Can be extended later to support email/social authentication.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { STORAGE_KEYS } from "../../config/constants";

export interface UserProfile {
  userId: string;
  createdAt: string;
  lastLoginAt: string;
  // Future: Add email, name, etc. when implementing full authentication
  // email?: string;
  // name?: string;
  // avatarUrl?: string;
}

/**
 * Generate a unique anonymous user ID
 * Uses UUID v4 for uniqueness
 */
const generateAnonymousUserId = async (): Promise<string> => {
  const uuid = Crypto.randomUUID();
  return `anon_${uuid}`;
};

/**
 * Get or create user profile
 * This ensures every user has a unique ID for RevenueCat
 */
export const getOrCreateUserProfile = async (): Promise<UserProfile> => {
  try {
    // Try to load existing profile
    const profileStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);

    if (profileStr) {
      const profile: UserProfile = JSON.parse(profileStr);
      // Update last login time
      profile.lastLoginAt = new Date().toISOString();
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile),
      );
      console.log("[Auth] Existing user profile loaded:", profile.userId);
      return profile;
    }

    // Create new profile
    const userId = await generateAnonymousUserId();
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      userId,
      createdAt: now,
      lastLoginAt: now,
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(newProfile),
    );
    console.log("[Auth] New user profile created:", userId);
    return newProfile;
  } catch (error) {
    console.error("[Auth] Error getting/creating user profile:", error);
    throw error;
  }
};

/**
 * Get current user profile
 * Returns null if no profile exists
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const profileStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!profileStr) {
      return null;
    }
    return JSON.parse(profileStr);
  } catch (error) {
    console.error("[Auth] Error getting user profile:", error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  updates: Partial<UserProfile>,
): Promise<UserProfile> => {
  try {
    const currentProfile = await getUserProfile();
    if (!currentProfile) {
      throw new Error("No user profile found");
    }

    const updatedProfile = { ...currentProfile, ...updates };
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(updatedProfile),
    );
    console.log("[Auth] User profile updated");
    return updatedProfile;
  } catch (error) {
    console.error("[Auth] Error updating user profile:", error);
    throw error;
  }
};

/**
 * Clear user profile (for testing/logout)
 * WARNING: This will create a new user ID on next login
 */
export const clearUserProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    console.log("[Auth] User profile cleared");
  } catch (error) {
    console.error("[Auth] Error clearing user profile:", error);
    throw error;
  }
};

/**
 * Check if user is authenticated (has a profile)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const profile = await getUserProfile();
  return profile !== null;
};
