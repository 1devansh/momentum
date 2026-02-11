/**
 * Subscription State Context
 *
 * Manages subscription/entitlement state across the app.
 * Uses React Context for simplicity and scalability.
 */

import Constants from "expo-constants";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
} from "react-native-purchases";
import {
    addCustomerInfoUpdateListener,
    checkProEntitlement,
    getCustomerInfo,
    getOfferings,
    purchasePackage,
    restorePurchases,
} from "../../services/purchases";

// Types
interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  error: string | null;
}

interface SubscriptionContextValue extends SubscriptionState {
  refreshSubscriptionStatus: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  fetchOfferings: () => Promise<void>;
}

// Default state
const defaultState: SubscriptionState = {
  isPro: false,
  isLoading: true,
  customerInfo: null,
  currentOffering: null,
  error: null,
};

// Create context
const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined,
);

// Provider props
interface SubscriptionProviderProps {
  children: ReactNode;
}

/**
 * Subscription Provider Component
 * Wrap your app with this to provide subscription state
 */
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<SubscriptionState>(defaultState);

  // Update state helper
  const updateState = useCallback((updates: Partial<SubscriptionState>) => {
    console.log(
      "[SubscriptionContext] Updating state:",
      Object.keys(updates).join(", "),
    );
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Refresh subscription status
  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      // Skip if running in Expo Go as Purchases won't be initialized
      if (Constants.appOwnership === "expo") {
        console.log("[SubscriptionContext] Skipping refresh in Expo Go");
        updateState({ isLoading: false });
        return;
      }

      console.log("[SubscriptionContext] Refreshing subscription status...");
      updateState({ isLoading: true, error: null });

      const [isPro, customerInfo] = await Promise.all([
        checkProEntitlement(),
        getCustomerInfo(),
      ]);

      console.log("[SubscriptionContext] Refresh complete. Is Pro:", isPro);
      updateState({
        isPro,
        customerInfo,
        isLoading: false,
      });
    } catch (error) {
      console.error("[SubscriptionContext] Error refreshing status:", error);
      updateState({
        isLoading: false,
        error: "Failed to check subscription status",
      });
    }
  }, [updateState]);

  // Fetch offerings
  const fetchOfferings = useCallback(async () => {
    try {
      // Skip if running in Expo Go
      if (Constants.appOwnership === "expo") {
        return;
      }

      console.log("[SubscriptionContext] Fetching offerings...");
      const offering = await getOfferings();
      updateState({ currentOffering: offering });
    } catch (error) {
      console.error("[SubscriptionContext] Error fetching offerings:", error);
    }
  }, [updateState]);

  // Purchase a package
  const purchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        // Skip if running in Expo Go
        if (Constants.appOwnership === "expo") {
          alert(
            "Purchases are not available in Expo Go. Please use a Development Build.",
          );
          return false;
        }

        console.log(
          "[SubscriptionContext] Initiating purchase for:",
          pkg.identifier,
        );
        updateState({ isLoading: true, error: null });

        const customerInfo = await purchasePackage(pkg);
        const isPro = await checkProEntitlement();

        console.log(
          "[SubscriptionContext] Purchase flow complete. New Pro Status:",
          isPro,
        );
        updateState({
          isPro,
          customerInfo,
          isLoading: false,
        });

        return isPro;
      } catch (error: any) {
        console.log(
          "[SubscriptionContext] Purchase error caught. code:",
          error.code,
          "message:",
          error.message,
          "userCancelled:",
          error.userCancelled,
        );
        // Handle ITEM_ALREADY_OWNED — user has an active subscription
        // but the purchase flow threw instead of returning customerInfo.
        // Refresh entitlements so the app reflects the real state.
        // RevenueCat error code "6" = PRODUCT_ALREADY_PURCHASED_ERROR
        if (error.code === "6") {
          console.log(
            "[SubscriptionContext] Product already owned — refreshing entitlements...",
          );
          try {
            const customerInfo = await restorePurchases();
            const isPro = await checkProEntitlement();
            console.log(
              "[SubscriptionContext] Restored after already-owned. Is Pro:",
              isPro,
            );
            updateState({
              isPro,
              customerInfo,
              isLoading: false,
              error: null,
            });
            return isPro;
          } catch (restoreError) {
            console.error(
              "[SubscriptionContext] Restore after already-owned failed:",
              restoreError,
            );
          }
        }

        const errorMessage =
          error.userCancelled || error.message === "PURCHASE_CANCELLED"
            ? "Purchase cancelled"
            : "Purchase failed. Please try again.";

        console.warn("[SubscriptionContext] Purchase failed:", errorMessage);
        updateState({
          isLoading: false,
          error: errorMessage,
        });

        return false;
      }
    },
    [updateState],
  );

  // Restore purchases
  const restore = useCallback(async (): Promise<boolean> => {
    try {
      // Skip if running in Expo Go
      if (Constants.appOwnership === "expo") {
        return false;
      }

      console.log("[SubscriptionContext] Restoring purchases...");
      updateState({ isLoading: true, error: null });

      const customerInfo = await restorePurchases();
      const isPro = await checkProEntitlement();

      console.log(
        "[SubscriptionContext] Restore complete. New Pro Status:",
        isPro,
      );
      updateState({
        isPro,
        customerInfo,
        isLoading: false,
      });

      return isPro;
    } catch (error) {
      console.error("[SubscriptionContext] Restore failed:", error);
      updateState({
        isLoading: false,
        error: "Failed to restore purchases",
      });
      return false;
    }
  }, [updateState]);

  // Initial load
  useEffect(() => {
    refreshSubscriptionStatus();
    fetchOfferings();

    // Listen for customer info updates (e.g., from other devices or web)
    const unsubscribe = addCustomerInfoUpdateListener((info) => {
      console.log("[SubscriptionContext] Customer info updated from listener");
      const isPro = info.entitlements.active["Momentum Plus"] !== undefined;
      updateState({ isPro, customerInfo: info });
    });

    return () => {
      unsubscribe();
    };
  }, [refreshSubscriptionStatus, fetchOfferings, updateState]);

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        refreshSubscriptionStatus,
        purchase,
        restore,
        fetchOfferings,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * Hook to use subscription context
 */
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
};
