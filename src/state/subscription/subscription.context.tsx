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

      updateState({ isLoading: true, error: null });

      const [isPro, customerInfo] = await Promise.all([
        checkProEntitlement(),
        getCustomerInfo(),
      ]);

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

        updateState({ isLoading: true, error: null });

        const customerInfo = await purchasePackage(pkg);
        const isPro = await checkProEntitlement();

        updateState({
          isPro,
          customerInfo,
          isLoading: false,
        });

        return isPro;
      } catch (error: any) {
        const errorMessage =
          error.message === "PURCHASE_CANCELLED"
            ? "Purchase cancelled"
            : "Purchase failed. Please try again.";

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

      updateState({ isLoading: true, error: null });

      await restorePurchases();
      const isPro = await checkProEntitlement();
      const customerInfo = await getCustomerInfo();

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

  // Initialize on mount
  useEffect(() => {
    refreshSubscriptionStatus();
    fetchOfferings();

    // Listen for customer info updates
    const unsubscribe = addCustomerInfoUpdateListener((customerInfo) => {
      checkProEntitlement().then((isPro) => {
        updateState({ isPro, customerInfo });
      });
    });

    return () => {
      unsubscribe();
    };
  }, [refreshSubscriptionStatus, fetchOfferings, updateState]);

  const value: SubscriptionContextValue = {
    ...state,
    refreshSubscriptionStatus,
    purchase,
    restore,
    fetchOfferings,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * Hook to access subscription state
 * Must be used within SubscriptionProvider
 */
export const useSubscription = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }

  return context;
};
