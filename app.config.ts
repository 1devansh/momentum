/**
 * Expo App Configuration
 *
 * This file provides dynamic configuration for the Expo app.
 * Use this for environment-specific settings and secrets management.
 *
 * Documentation: https://docs.expo.dev/workflow/configuration/
 */

import { ConfigContext, ExpoConfig } from "expo/config";

// TODO: Replace with your actual package name before building
const ANDROID_PACKAGE = "com.devbuilds.momentum";
// TODO: Replace with your actual bundle identifier before building
const IOS_BUNDLE_ID = "com.devbuilds.momentum";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Momentum",
  slug: "momentum",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "momentum",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  // iOS Configuration
  ios: {
    supportsTablet: true,
    bundleIdentifier: IOS_BUNDLE_ID,
    // TODO: Add iOS-specific config
    // infoPlist: {
    //   NSCameraUsageDescription: 'Used for...',
    // },
  },

  // Android Configuration
  android: {
    package: ANDROID_PACKAGE,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    // TODO: Add permissions as needed
    // permissions: [
    //   'NOTIFICATIONS',
    // ],
  },

  // Web Configuration (optional)
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  // Plugins
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    // RevenueCat plugin (required for native builds)
    // TODO: Uncomment when ready for production builds
    // [
    //   'react-native-purchases',
    //   {
    //     // Android configuration is automatic
    //   },
    // ],
  ],

  // Experiments
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  // Extra configuration
  extra: {
    router: {},
    eas: {
      projectId: "207d38e4-8587-4433-8199-e7293acdc586",
    },
    // Environment-specific configuration
    // TODO: Set these via EAS Secrets for production
    // revenueCatApiKeyAndroid: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    // revenueCatApiKeyIOS: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  },

  owner: "devbuilds",
});
