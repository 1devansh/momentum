/**
 * Application-wide constants
 * Centralized configuration for the Momentum app
 */

// TODO: Update these values before production release
export const APP_CONFIG = {
  name: "Momentum",
  version: "1.0.0",
  // TODO: Add your support email
  supportEmail: "support@momentum-app.com",
} as const;

// RevenueCat Configuration
// TODO: Replace with your actual RevenueCat API keys from dashboard
export const REVENUECAT_CONFIG = {
  // Get these from RevenueCat Dashboard > Project Settings > API Keys
  apiKeyAndroid: "YOUR_REVENUECAT_ANDROID_API_KEY",
  apiKeyIOS: "YOUR_REVENUECAT_IOS_API_KEY",

  // TODO: Update these to match your RevenueCat entitlement identifiers
  entitlements: {
    PRO: "Momentum Plus", // Main premium entitlement
    // TODO: Add more entitlements as needed (e.g., 'premium_packs')
  },

  // TODO: Update these to match your RevenueCat offering identifiers
  offerings: {
    DEFAULT: "default",
    // TODO: Add promotional offerings if needed
  },

  // TODO: Update these to match your product identifiers in Play Console / App Store Connect
  products: {
    MONTHLY: "momentum_plus_monthly",
    YEARLY: "momentum_pro_yearly",
    // TODO: Add lifetime purchase if applicable
  },
} as const;

// Navigation Routes
export const ROUTES = {
  ONBOARDING: "/(onboarding)",
  HOME: "/(main)/home",
  PROGRESS: "/(main)/progress",
  PAYWALL: "/paywall",
  SETTINGS: "/(main)/settings",
} as const;

// Storage Keys for AsyncStorage
// TODO: Consider using expo-secure-store for sensitive data
export const STORAGE_KEYS = {
  HAS_ONBOARDED: "@momentum/has_onboarded",
  USER_PREFERENCES: "@momentum/user_preferences",
  USER_PROFILE: "@momentum/user_profile",
  EXTENDED_USER_PROFILE: "@momentum/extended_user_profile",
  ONBOARDING_FOCUS_AREAS: "@momentum/onboarding_focus_areas",
  ONBOARDING_GOAL: "@momentum/onboarding_goal",
  // TODO: Add more storage keys as features are implemented
} as const;

// Theme Colors (placeholder)
// TODO: Implement proper theming system
export const COLORS = {
  primary: "#4CAF50", // Growth green
  secondary: "#8BC34A",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#212121",
  textSecondary: "#757575",
  error: "#F44336",
  success: "#4CAF50",
  warning: "#FF9800",
} as const;
