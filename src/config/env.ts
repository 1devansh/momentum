/**
 * Environment Configuration
 *
 * For production, consider using:
 * - expo-constants for build-time variables
 * - EAS Secrets for sensitive values
 * - react-native-dotenv for local development
 *
 * TODO: Set up proper environment variable handling before production
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// Environment types
type Environment = "development" | "staging" | "production";

// Determine current environment
// TODO: Configure this based on your build profiles in eas.json
const getEnvironment = (): Environment => {
  // In development, expo-constants may not have releaseChannel
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

  if (releaseChannel === "production") return "production";
  if (releaseChannel === "staging") return "staging";
  return "development";
};

export const ENV = getEnvironment();

export const IS_DEV = ENV === "development";
export const IS_STAGING = ENV === "staging";
export const IS_PROD = ENV === "production";

// Platform detection
export const IS_ANDROID = Platform.OS === "android";
export const IS_IOS = Platform.OS === "ios";

/**
 * Environment-specific configuration
 * TODO: Add your environment-specific values here
 */
export const ENV_CONFIG = {
  development: {
    // TODO: Add development-specific config
    debugMode: true,
    logLevel: "debug" as const,
  },
  staging: {
    // TODO: Add staging-specific config
    debugMode: true,
    logLevel: "info" as const,
  },
  production: {
    // TODO: Add production-specific config
    debugMode: false,
    logLevel: "error" as const,
  },
}[ENV];

/**
 * Get the appropriate RevenueCat API key based on platform
 *
 * IMPORTANT: In production, these should come from:
 * - EAS Secrets (recommended)
 * - Environment variables
 * - NOT hardcoded in source code
 *
 * TODO: Move API keys to secure storage before production release
 */
export const getRevenueCatApiKey = (): string => {
  // TODO: Replace with secure key retrieval
  // Example with EAS Secrets:
  // return Constants.expoConfig?.extra?.revenueCatApiKey ?? '';

  if (IS_ANDROID) {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "YOUR_ANDROID_KEY";
  }
  return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "YOUR_IOS_KEY";
};

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  enableDebugScreen:
    process.env.EXPO_PUBLIC_ENABLE_DEBUG_SCREEN === "true" || __DEV__,
  DAILY_CHALLENGES: true,
  CHARACTER_GROWTH: true,
};
