# Google Play Internal Testing Setup

This guide walks you through deploying Momentum to Google Play Internal Testing.

## Prerequisites

- Google Play Console access
- EAS CLI installed (`npm install -g eas-cli`)
- Expo account linked to project

## Step 1: Create App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in app details:
   - App name: **Momentum**
   - Default language: English
   - App or game: App
   - Free or paid: Free (subscriptions handled separately)
4. Accept declarations and create

## Step 2: Configure App Identity

### Package Name

The package name is set in `app.config.ts`:

```typescript
android: {
  package: 'com.devbuilds.momentum',
}
```

**Important**: Once published, the package name cannot be changed.

### App Signing

Google Play manages app signing. When you upload your first build:

1. Google generates a signing key
2. You upload builds signed with your upload key
3. Google re-signs with the app signing key

## Step 3: Set Up EAS Build

### Initialize EAS

```bash
eas build:configure
```

This creates `eas.json` with build profiles.

### Configure eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## Step 4: Build for Internal Testing

### Create Production Build

```bash
eas build --platform android --profile production
```

This creates an AAB (Android App Bundle) for Play Store.

### Download the Build

Once complete, download the `.aab` file from the EAS dashboard.

## Step 5: Upload to Play Console

### Manual Upload

1. Go to **Release > Testing > Internal testing**
2. Click **Create new release**
3. Upload your `.aab` file
4. Add release notes
5. Click **Save** then **Review release**
6. Click **Start rollout to Internal testing**

### Automated Upload (EAS Submit)

```bash
eas submit --platform android --profile production
```

Requires service account key configured in `eas.json`.

## Step 6: Add Internal Testers

1. Go to **Release > Testing > Internal testing**
2. Click **Testers** tab
3. Create a new email list or use existing
4. Add tester email addresses
5. Copy the **opt-in URL** and share with testers

## Step 7: Testers Join

1. Testers click the opt-in URL
2. Accept the invitation
3. Download from Play Store (may take a few minutes to appear)

## Store Listing Requirements

Before you can release (even internal testing), you need:

### Required Information

- [ ] App title and description
- [ ] Screenshots (phone, 7-inch tablet, 10-inch tablet)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Privacy policy URL
- [ ] App category

### Content Rating

1. Go to **Policy > App content**
2. Complete the content rating questionnaire
3. Apply the rating

### Data Safety

1. Go to **Policy > App content > Data safety**
2. Declare what data your app collects
3. For Momentum:
   - Purchase history (RevenueCat)
   - App activity (usage data)

## Checklist for Internal Testing

- [ ] App created in Play Console
- [ ] Package name configured correctly
- [ ] EAS build profile set up
- [ ] Production build created
- [ ] Build uploaded to Internal testing
- [ ] Testers added and invited
- [ ] Basic store listing completed
- [ ] Content rating completed
- [ ] Data safety form completed

## Troubleshooting

### "App not available"

- Wait 10-15 minutes after release
- Ensure tester accepted invitation
- Check tester is using correct Google account

### "Version code already used"

- Increment version in `app.config.ts`
- Or use EAS auto-versioning:
  ```json
  "production": {
    "autoIncrement": true
  }
  ```

### Build fails

- Check `eas build` logs
- Ensure all native dependencies are compatible
- Verify `app.config.ts` is valid

## Useful Commands

```bash
# Build for internal testing
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android

# Check build status
eas build:list

# View credentials
eas credentials
```

## Next Steps After Internal Testing

1. **Closed Testing**: Larger group of testers
2. **Open Testing**: Public beta
3. **Production**: Full release

Each stage requires more store listing completeness.

## Useful Links

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Internal Testing Guide](https://support.google.com/googleplay/android-developer/answer/9845334)
