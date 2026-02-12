# Momentum

**From dreaming to doing — one brave step at a time.**

A personal growth app that helps people close the gap between inspiration and action through AI-powered daily micro-challenges, character evolution, and positive reinforcement.

## Overview

Momentum replaces guilt-driven habit tracking with identity-based progress. Instead of asking "Did you stay consistent?", it asks "What is one small, brave action you can take today?" Users receive personalized 5–10 minute micro-challenges, watch a character evolve as they grow, and reflect weekly so the AI adapts to how they're feeling.

## Features

- **AI-Powered Micro-Challenges** — Google Gemini generates personalized daily challenges based on user goals and focus areas, with automatic fallback to static challenges when offline.
- **Adaptive Weekly Retrospectives** — After completing a batch of challenges, users reflect on their progress. The AI analyzes the reflection and regenerates remaining challenges, adjusting difficulty, duration, and guidance.
- **7-Stage Character Evolution** — Seed → Sprout → Sapling → Young Tree → Tree → Mighty Oak → Ancient Grove. Pure milestone-based progression that never regresses.
- **Badge & Achievement System** — Evolution badges unlock at each stage, plus achievement badges for milestones like first challenge, first retro, journaling, and completing goal plans.
- **Goal Plan Management** — Create, edit, and delete goal plans with a horizontal swipe carousel. Track completion status and mark goals as achieved.
- **Creator-Led Programs** — Curated multi-day challenge programs with social proof (ratings, reviews, enrollment counts).
- **Premium Gating (Momentum Plus)** — Free users get core value; subscribers unlock multiple simultaneous goal plans, advanced evolution stages, creator programs, and AI regeneration.
- **Subscription Management** — RevenueCat SDK handles cross-platform purchases, entitlements, and paywall flows.
- **Daily Reminders** — Multiple configurable reminders via Expo Notifications.
- **Anonymous Auth** — Stable per-device user identity synced with RevenueCat for subscription tracking.
- **Debug Tools** — Date offset for time-travel testing, feature flags, and a debug screen behind a feature flag.

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Platform-specific
npm run android
npm run ios
```

> Some features (RevenueCat, notifications, biometrics) require a development build — not Expo Go.

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_your_key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_your_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
EXPO_PUBLIC_GEMINI_MODEL=gemini-2.0-flash
EXPO_PUBLIC_ENABLE_DEBUG_SCREEN=true
```

Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Project Structure

```
momentum/
├── app/                          # Screens (Expo Router file-based routing)
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Entry point (routing logic)
│   ├── paywall.tsx               # Subscription paywall modal
│   ├── (onboarding)/            # Onboarding flow (7 steps)
│   └── (main)/                  # Main app
│       ├── home.tsx              # Daily challenge (goal carousel)
│       ├── progress.tsx          # Character growth & badges
│       ├── settings.tsx          # Preferences
│       ├── new-goal.tsx          # Create goal plan
│       ├── goal-detail.tsx       # Goal detail view
│       ├── programs.tsx          # Creator program catalog
│       ├── program-detail.tsx    # Program detail & enrollment
│       ├── profile.tsx           # User profile
│       ├── reminders.tsx         # Notification settings
│       └── debug.tsx             # Debug tools (feature-flagged)
│
├── src/
│   ├── features/                # Domain logic
│   │   ├── challenges/          # AI generation, Zustand store, types, storage
│   │   ├── character/           # Evolution engine (7 stages, pure functions)
│   │   ├── badges/              # Badge definitions & computation
│   │   ├── programs/            # Creator programs (types, store, data)
│   │   ├── premium/             # Premium gating logic
│   │   └── debug/               # Debug date utilities
│   ├── components/              # Reusable UI (Button, ScreenContainer, goals)
│   ├── state/                   # React Context (user, subscription)
│   ├── services/                # External integrations (RevenueCat, auth)
│   ├── hooks/                   # Custom hooks (useAppState, useOnboarding)
│   └── config/                  # Constants, env config
│
├── assets/                      # Images, icons, splash
├── app.config.ts                # Expo dynamic config
└── eas.json                     # EAS Build profiles
```

## Tech Stack

| Category      | Technology                              |
| ------------- | --------------------------------------- |
| Framework     | Expo 54 (managed workflow)              |
| Language      | TypeScript 5.9                          |
| Navigation    | Expo Router (file-based, typed routes)  |
| State         | Zustand (domain stores) + React Context |
| AI            | Google Gemini (gemini-2.0-flash)        |
| Subscriptions | RevenueCat SDK                          |
| Storage       | AsyncStorage + Expo Secure Store        |
| Animations    | React Native Reanimated + Lottie        |
| Charts        | Victory Native                          |
| Notifications | Expo Notifications                      |
| UI            | React Native + custom components        |

## Architecture

State is split by concern:

- **Zustand** — Goal plans, challenges, retros, AI generation, character evolution, badges, programs
- **React Context** — User profile/preferences, subscription status

Navigation follows Expo Router conventions with route groups for onboarding and main app flows.

## Building & Deployment

```bash
# Development build (requires dev client)
eas build --platform android --profile development

# Preview APK
eas build --platform android --profile preview

# Production AAB
eas build --platform android --profile production

# Submit to Google Play (internal track)
eas submit --platform android --profile production
```

## Linting & Type Checking

```bash
npm run lint
npx tsc --noEmit
```

## License

Private — All rights reserved.
