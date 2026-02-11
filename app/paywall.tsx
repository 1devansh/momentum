/**
 * Paywall Screen
 *
 * Subscription purchase screen with RevenueCat integration.
 * TODO: Polish UI and add more subscription options
 */

import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { Button, ScreenContainer } from "../src/components";
import { COLORS } from "../src/config";
import { useSubscription } from "../src/state";

export default function PaywallScreen() {
  const {
    currentOffering,
    purchase,
    restore,
    isLoading,
    isPro,
    fetchOfferings,
  } = useSubscription();

  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch offerings on mount
  useEffect(() => {
    fetchOfferings();
  }, [fetchOfferings]);

  // Auto-select first package
  useEffect(() => {
    if (currentOffering?.availablePackages?.length && !selectedPackage) {
      setSelectedPackage(currentOffering.availablePackages[0]);
    }
  }, [currentOffering, selectedPackage]);

  // Redirect if already pro
  useEffect(() => {
    if (isPro) {
      Alert.alert(
        "Already Subscribed",
        "You already have an active subscription!",
        [
          {
            text: "OK",
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(main)/home");
              }
            },
          },
        ],
      );
    }
  }, [isPro]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a subscription plan");
      return;
    }

    setPurchasing(true);
    const success = await purchase(selectedPackage);
    setPurchasing(false);

    if (success) {
      Alert.alert(
        "Welcome to Pro! 🎉",
        "Thank you for subscribing. Enjoy all premium features!",
        [
          {
            text: "Continue",
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(main)/home");
              }
            },
          },
        ],
      );
    }
  };

  const handleRestore = async () => {
    const restored = await restore();
    if (restored) {
      Alert.alert("Restored!", "Your subscription has been restored.", [
        {
          text: "Continue",
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(main)/home");
            }
          },
        },
      ]);
    } else {
      Alert.alert(
        "No Subscription Found",
        "No previous subscription was found.",
      );
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(main)/home");
    }
  };

  return (
    <ScreenContainer scrollable>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>🌳</Text>
        <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
        <Text style={styles.heroSubtitle}>
          Get unlimited access to all features
        </Text>
      </View>

      {/* Features List */}
      <View style={styles.featuresSection}>
        <FeatureItem text="Unlimited daily challenges" />
        <FeatureItem text="Full character evolution path" />
        <FeatureItem text="Advanced progress analytics" />
        <FeatureItem text="Premium challenge packs" />
        <FeatureItem text="AI-powered suggestions" />
        <FeatureItem text="Priority support" />
      </View>

      {/* Subscription Options */}
      <View style={styles.packagesSection}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : currentOffering?.availablePackages?.length ? (
          currentOffering.availablePackages.map((pkg) => (
            <PackageOption
              key={pkg.identifier}
              pkg={pkg}
              selected={selectedPackage?.identifier === pkg.identifier}
              onSelect={() => setSelectedPackage(pkg)}
            />
          ))
        ) : (
          <View style={styles.noPackages}>
            <Text style={styles.noPackagesText}>
              Unable to load subscription options.
            </Text>
            <Text style={styles.noPackagesHint}>
              Please check your internet connection and try again.
            </Text>
            {/* TODO: Add retry button */}
          </View>
        )}
      </View>

      {/* Purchase Button */}
      <Button
        title={purchasing ? "Processing..." : "Subscribe Now"}
        onPress={handlePurchase}
        disabled={!selectedPackage || purchasing || isLoading}
        loading={purchasing}
        size="large"
        style={styles.purchaseButton}
      />

      {/* Restore Link */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={isLoading}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      {/* Legal Text */}
      <Text style={styles.legalText}>
        {/* TODO: Update with actual terms */}
        Subscriptions automatically renew unless cancelled at least 24 hours
        before the end of the current period. You can manage your subscription
        in your device settings.
      </Text>

      {/* TODO: Add links to Privacy Policy and Terms of Service */}
    </ScreenContainer>
  );
}

// Feature item component
interface FeatureItemProps {
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureCheck}>✓</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

// Package option component
interface PackageOptionProps {
  pkg: PurchasesPackage;
  selected: boolean;
  onSelect: () => void;
}

const PackageOption: React.FC<PackageOptionProps> = ({
  pkg,
  selected,
  onSelect,
}) => {
  // TODO: Format price properly based on locale
  const priceString = pkg.product.priceString;
  const periodName = pkg.packageType === "ANNUAL" ? "year" : "month";

  // Calculate savings for annual
  const isAnnual = pkg.packageType === "ANNUAL";

  return (
    <TouchableOpacity
      style={[styles.packageOption, selected && styles.packageOptionSelected]}
      onPress={onSelect}
    >
      {isAnnual && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>Best Value</Text>
        </View>
      )}
      <View style={styles.packageInfo}>
        <Text style={styles.packageTitle}>
          {isAnnual ? "Annual" : "Monthly"}
        </Text>
        <Text style={styles.packagePrice}>
          {priceString}/{periodName}
        </Text>
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 32,
  },
  heroEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureCheck: {
    fontSize: 18,
    color: COLORS.primary,
    marginRight: 12,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
  },
  packagesSection: {
    marginBottom: 24,
  },
  noPackages: {
    alignItems: "center",
    padding: 24,
  },
  noPackagesText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  noPackagesHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  packageOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  packageOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  savingsBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  purchaseButton: {
    marginBottom: 16,
  },
  restoreButton: {
    alignItems: "center",
    padding: 12,
  },
  restoreText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  legalText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 32,
  },
});
