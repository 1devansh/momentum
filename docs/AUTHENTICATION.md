# Authentication & User Management

This document explains how user authentication and identity management works in the Momentum app.

## Overview

The app uses an **anonymous authentication** system that creates a unique user ID for each user. This ID is used to:

- Track users in RevenueCat for subscription management
- Store user preferences and progress locally
- Enable future features like cloud sync (if implemented)

## How It Works

### 1. User Profile Creation

When the app first launches, it automatically creates a unique user profile:

```typescript
// Generated user ID format: anon_<uuid>
// Example: anon_123e4567-e89b-12d3-a456-426614174000
```

The profile includes:

- `userId`: Unique identifier
- `createdAt`: Timestamp of profile creation
- `lastLoginAt`: Last time the user opened the app

### 2. RevenueCat Integration

The user ID is automatically passed to RevenueCat during initialization:

```typescript
await Purchases.configure({
  apiKey: revenueCatApiKey,
  appUserID: userProfile.userId, // Unique user ID
});
```

This ensures:

- Each user appears as a separate customer in RevenueCat dashboard
- Purchases are correctly attributed to users
- Subscription status is tracked per user

### 3. Data Storage

User data is stored locally using AsyncStorage:

| Key                          | Data                          | Purpose              |
| ---------------------------- | ----------------------------- | -------------------- |
| `@momentum/user_profile`     | User profile (ID, timestamps) | Identity management  |
| `@momentum/user_preferences` | App preferences               | Settings             |
| `@momentum/has_onboarded`    | Onboarding status             | First-time user flow |

## Why You See Customers in RevenueCat Now

**Before**: RevenueCat was initialized without an `appUserID`, so it generated random IDs that weren't persistent across app restarts.

**After**: Each user gets a stable, unique ID that persists across:

- App restarts
- App updates
- Device reboots

This means:

1. Users will now appear consistently in your RevenueCat dashboard
2. Test purchases will be tracked correctly
3. Subscription status will persist properly

## Testing

### View Current User ID

Add this to any screen to see the current user ID:

```typescript
import { useUser } from "@/state/user";

const { profile } = useUser();
console.log("Current User ID:", profile?.userId);
```

### Reset User (for testing)

To test with a fresh user:

```typescript
import { useUser } from "@/state/user";

const { signOut } = useUser();
await signOut(); // Clears all user data and creates new ID on next launch
```

## Future Enhancements

This anonymous authentication system can be extended to support:

### Email/Password Authentication

```typescript
// Future implementation
interface UserProfile {
  userId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  // ...
}
```

### Social Authentication

- Sign in with Google
- Sign in with Apple
- Sign in with Facebook

### Cloud Sync

- Sync preferences across devices
- Backup progress data
- Multi-device support

## Security Considerations

### Current Implementation

- User IDs are stored locally (not encrypted)
- No sensitive personal data is collected
- Suitable for anonymous users

### For Production with Authentication

If you add email/password authentication:

1. Use `expo-secure-store` for sensitive data
2. Implement proper password hashing
3. Add token-based authentication
4. Consider using Firebase Auth or Supabase

## API Reference

### Auth Service

```typescript
// Get or create user profile
const profile = await getOrCreateUserProfile();

// Get existing profile (returns null if none)
const profile = await getUserProfile();

// Update profile
await updateUserProfile({ lastLoginAt: new Date().toISOString() });

// Clear profile (logout)
await clearUserProfile();

// Check if authenticated
const isAuth = await isAuthenticated();
```

### User Context

```typescript
const {
  profile, // Current user profile
  hasOnboarded, // Onboarding status
  preferences, // User preferences
  isLoading, // Loading state

  refreshProfile, // Reload profile from storage
  signOut, // Clear all user data
  updatePreferences, // Update preferences
  completeOnboarding, // Mark onboarding complete
  resetOnboarding, // Reset onboarding (testing)
} = useUser();
```

## Troubleshooting

### Users not appearing in RevenueCat

- Ensure you're using a development build (not Expo Go)
- Check that RevenueCat API keys are configured correctly
- Verify the user ID is being passed to `Purchases.configure()`

### User ID changes on app restart

- This shouldn't happen with the current implementation
- If it does, check AsyncStorage permissions
- Verify the app isn't being uninstalled between tests

### Multiple test users in RevenueCat

- Each time you call `signOut()`, a new user ID is created
- Use the same device/simulator for consistent testing
- Consider using RevenueCat's sandbox testing features
