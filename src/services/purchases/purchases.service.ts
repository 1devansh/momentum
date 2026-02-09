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

// Track initialization state
let isInitialized = false;

/**
 * Initialize RevenueCat SDK
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

    // TODO: Validate API key before configuring
    if (apiKey.includes("YOUR_")) {
      console.warn(
        "[Purchases] Using placeholder API key. " +
          "Replace with your actual RevenueCat API key before testing purchases.",
      );
    }

    await Purchases.configure({
      apiKey,
      // TODO: If you have user authentication, set the appUserID here
      // appUserID: 'your-user-id',
    });

    isInitialized = true;
    console.log("[Purchases] Initialized successfully");
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
    const customerInfo = await Purchases.getCustomerInfo();
    const proEntitlement =
      customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlements.PRO];
    return proEntitlement !== undefined;
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
  return Purchases.getCustomerInfo();
};

/**
 * Get available offerings
 *
 * @returns Promise<PurchasesOffering | null>
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      console.warn("[Purchases] No current offering available");
      return null;
    }

    return offerings.current;
  } catch (error) {
    console.error("[Purchases] Error fetching offerings:", error);
    return null;
  }
};

/**
 * Purchase a package
 *
 * @param pkg - The package to purchase
 * @returns Promise<CustomerInfo>
 */
export const purchasePackage = async (
  pkg: PurchasesPackage,
): Promise<CustomerInfo> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.userCancelled) {
      console.log("[Purchases] User cancelled purchase");
      throw new Error("PURCHASE_CANCELLED");
    }

    console.error("[Purchases] Purchase failed:", error);
    throw error;
  }
};

/**
 * Restore previous purchases
 *
 * @returns Promise<CustomerInfo>
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log("[Purchases] Purchases restored successfully");
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Restore failed:", error);
    throw error;
  }
};

/**
 * Identify user (for user authentication)
 * Call this when user logs in
 *
 * TODO: Implement when user authentication is added
 *
 * @param userId - Unique user identifier
 */
export const identifyUser = async (userId: string): Promise<CustomerInfo> => {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log("[Purchases] User identified:", userId);
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] User identification failed:", error);
    throw error;
  }
};

/**
 * Log out user (reset to anonymous)
 * Call this when user logs out
 *
 * TODO: Implement when user authentication is added
 */
export const logOutUser = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.logOut();
    console.log("[Purchases] User logged out");
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Logout failed:", error);
    throw error;
  }
};

/**
 * Add listener for customer info updates
 * Useful for real-time subscription status updates
 *
 * @param listener - Callback function
 * @returns Unsubscribe function
 */
export const addCustomerInfoUpdateListener = (
  listener: (customerInfo: CustomerInfo) => void,
): (() => void) => {
  Purchases.addCustomerInfoUpdateListener(listener);

  // Return unsubscribe function
  return () => {
    // Note: RevenueCat SDK doesn't provide a direct remove listener method
    // The listener will be cleaned up when the component unmounts
    // TODO: Track listeners manually if needed for cleanup
  };
};
