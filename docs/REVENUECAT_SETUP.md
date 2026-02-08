# RevenueCat Setup Guide

This guide walks you through setting up RevenueCat for the Momentum app.

## Prerequisites

- RevenueCat account (https://app.revenuecat.com)
- Google Play Console access
- Apple Developer account (for iOS)

## Step 1: Create RevenueCat Project

1. Log in to RevenueCat Dashboard
2. Click "Create New Project"
3. Name it "Momentum" (or your preferred name)
4. Note your **Project ID**

## Step 2: Configure Platforms

### Android (Google Play)

1. In RevenueCat, go to **Project Settings > Apps**
2. Click **+ New App** and select **Google Play**
3. Enter your package name: `com.devbuilds.momentum`
4. Upload your Google Play Service Account JSON key:
   - Go to Google Cloud Console
   - Create a Service Account with "Pub/Sub Admin" role
   - Download JSON key
   - Upload to RevenueCat

### iOS (App Store) - Optional for now

1. Click **+ New App** and select **App Store**
2. Enter your bundle ID: `com.devbuilds.momentum`
3. Upload your App Store Connect API key

## Step 3: Get API Keys

1. Go to **Project Settings > API Keys**
2. Copy the **Public SDK Key** for each platform:
   - Android: `goog_xxxxxxxxxxxxx`
   - iOS: `appl_xxxxxxxxxxxxx`

## Step 4: Configure Products

### In Google Play Console

1. Go to **Monetization > Products > Subscriptions**
2. Create subscriptions:
   - `momentum_pro_monthly` - Monthly subscription
   - `momentum_pro_yearly` - Yearly subscription
3. Set pricing and trial periods
4. Activate the subscriptions

### In RevenueCat

1. Go to **Products** in your project
2. Click **+ New Product**
3. Add your Google Play product IDs:
   - `momentum_pro_monthly`
   - `momentum_pro_yearly`

## Step 5: Create Entitlements

1. Go to **Entitlements** in RevenueCat
2. Click **+ New Entitlement**
3. Create entitlement: `pro`
4. Attach your products to this entitlement

## Step 6: Create Offerings

1. Go to **Offerings** in RevenueCat
2. The "default" offering should exist
3. Add packages to the default offering:
   - Monthly package → `momentum_pro_monthly`
   - Annual package → `momentum_pro_yearly`

## Step 7: Update App Configuration

Update `src/config/constants.ts`:

```typescript
export const REVENUECAT_CONFIG = {
  apiKeyAndroid: "goog_YOUR_ACTUAL_KEY",
  apiKeyIOS: "appl_YOUR_ACTUAL_KEY",

  entitlements: {
    PRO: "pro", // Must match RevenueCat entitlement ID
  },

  offerings: {
    DEFAULT: "default",
  },

  products: {
    MONTHLY: "momentum_pro_monthly",
    YEARLY: "momentum_pro_yearly",
  },
} as const;
```

## Step 8: Test Purchases

### Using License Testers (Android)

1. In Google Play Console, go to **Setup > License testing**
2. Add tester email addresses
3. Testers can make purchases without being charged

### Using Sandbox (iOS)

1. In App Store Connect, create Sandbox testers
2. Sign in with sandbox account on device

## Troubleshooting

### "No offerings available"

- Ensure products are active in Play Console
- Check products are attached to offerings in RevenueCat
- Verify API key is correct

### "Purchase failed"

- Check you're using a license tester account
- Ensure app is signed with correct keystore
- Verify package name matches Play Console

### "Entitlement not active after purchase"

- Check product is attached to entitlement
- Verify entitlement ID matches code
- Check RevenueCat dashboard for purchase events

## Security Best Practices

1. **Never commit API keys** to version control
2. Use environment variables or EAS Secrets:
   ```bash
   eas secret:create --name REVENUECAT_ANDROID_KEY --value goog_xxx
   ```
3. Access in app.config.ts:
   ```typescript
   extra: {
     revenueCatApiKey: process.env.REVENUECAT_ANDROID_KEY,
   }
   ```

## Useful Links

- [RevenueCat React Native Docs](https://docs.revenuecat.com/docs/reactnative)
- [Google Play Billing Setup](https://docs.revenuecat.com/docs/google-play-store)
- [Testing Purchases](https://docs.revenuecat.com/docs/testing-purchases)
- [RevenueCat Dashboard](https://app.revenuecat.com)
