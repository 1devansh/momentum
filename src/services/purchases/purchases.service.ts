/**
 * RevenueCat Purchases Service
 *
 * Centralized service for all RevenueCat operations.
 * This service should be initialized once at app startup.
 *
 * Documentation: https://docs.revenuecat.com/docs/reactnative
 */

import Constants from "expo-constants";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { REVENUECAT_CONFIG } from "../../config/constants";
import { IS_DEV, getRevenueCatApiKey } from "../../config/env";
import { getOrCreateUserProfile } from "../auth";

// Track initialization state
let isInitialized = false;

/**
 * Initialize RevenueCat SDK with user authentication
 * Call this once at app startup (in _layout.tsx or App.tsx)
 *
 * @returns Promise<void>
 */
export const initializePurchases = async (): Promise<void> => {
  if (isInitialized) {
    console.warn("[Purchases] Already initialized");
    return;
  }

  try {
    // Enable debug logs in development
    if (IS_DEV) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    const apiKey = getRevenueCatApiKey();

    // Handle Expo Go / Development environment
    // RevenueCat native SDKs do not work in Expo Go.
    // They require a Development Build (prebuild).
    if (Constants.appOwnership === "expo") {
      console.warn(
        "[Purchases] Running in Expo Go. RevenueCat native module is NOT available. " +
          "Use a Development Build to test actual in-app purchases.",
      );
      isInitialized = true; // Mark as initialized to prevent further errors
      return;
    }

    // Validate API key before configuring
    if (apiKey.includes("YOUR_")) {
      console.warn(
        "[Purchases] Using placeholder API key. " +
          "Replace with your actual RevenueCat API key before testing purchases.",
      );
    }

    // Get or create user profile to get unique user ID
    const userProfile = await getOrCreateUserProfile();
    console.log("[Purchases] Configuring with user ID:", userProfile.userId);

    await Purchases.configure({
      apiKey,
      appUserID: userProfile.userId, // Set unique user ID for RevenueCat
    });

    isInitialized = true;
    console.log(
      "[Purchases] Initialized successfully with API Key:",
      apiKey.substring(0, 8) + "...",
      "and User ID:",
      userProfile.userId,
    );
  } catch (error) {
    console.error("[Purchases] Initialization failed:", error);
    throw error;
  }
};

/**
 * Check if user has active pro entitlement
 *
 * @returns Promise<boolean>
 */
export const checkProEntitlement = async (): Promise<boolean> => {
  try {
    console.log("[Purchases] Checking pro entitlement...");
    const customerInfo = await Purchases.getCustomerInfo();
    const proEntitlement =
      customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlements.PRO];
    const isPro = proEntitlement !== undefined;
    console.log("[Purchases] Is Pro User:", isPro);
    return isPro;
  } catch (error) {
    console.error("[Purchases] Error checking entitlement:", error);
    return false;
  }
};

/**
 * Get current customer info
 *
 * @returns Promise<CustomerInfo>
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  console.log("[Purchases] Fetching customer info...");
  const info = await Purchases.getCustomerInfo();
  console.log(
    "[Purchases] Customer Info received for ID:",
    info.originalAppUserId,
  );
  return info;
};

/**
 * Get available offerings
 *
 * @returns Promise<PurchasesOffering | null>
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    console.log("[Purchases] Fetching offerings...");
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      console.log(
        "[Purchases] Current offering found:",
        offerings.current.identifier,
        "with",
        offerings.current.availablePackages.length,
        "packages",
      );
      return offerings.current;
    }
    console.warn("[Purchases] No current offering found");
    return null;
  } catch (error) {
    console.error("[Purchases] Error fetching offerings:", error);
    return null;
  }
};

/**
 * Purchase a package
 *
 * @param pkg The package to purchase
 * @returns Promise<CustomerInfo>
 */
export const purchasePackage = async (
  pkg: PurchasesPackage,
): Promise<CustomerInfo> => {
  try {
    console.log("[Purchases] Starting purchase for package:", pkg.identifier);
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    console.log("[Purchases] Purchase successful!");
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error("[Purchases] Purchase error:", error);
    } else {
      console.log("[Purchases] User cancelled the purchase");
    }
    throw error;
  }
};

/**
 * Restore purchases
 *
 * @returns Promise<CustomerInfo>
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    console.log("[Purchases] Restoring purchases...");
    const customerInfo = await Purchases.restorePurchases();
    console.log("[Purchases] Restore successful");
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Restore error:", error);
    throw error;
  }
};

/**
 * Add a listener for customer info updates
 *
 * @param listener Callback function
 * @returns Unsubscribe function
 */
export const addCustomerInfoUpdateListener = (
  listener: (customerInfo: CustomerInfo) => void,
) => {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
};
