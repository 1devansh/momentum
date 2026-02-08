# Momentum - Architecture Documentation

## Overview

Momentum is a personal growth app built with Expo (React Native) and TypeScript. This document outlines the architectural decisions and project structure.

## Tech Stack

- **Framework**: Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Subscriptions**: RevenueCat SDK
- **Storage**: AsyncStorage (local persistence)

## Project Structure

```
momentum/
├── app/                      # Expo Router screens (file-based routing)
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Entry point (routing logic)
│   ├── paywall.tsx          # Subscription paywall (modal)
│   ├── (onboarding)/        # Onboarding flow
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   └── (main)/              # Main app (tab navigation)
│       ├── _layout.tsx
│       ├── home.tsx         # Daily challenge screen
│       ├── progress.tsx     # Character growth screen
│       └── settings.tsx     # Settings screen
│
├── src/                      # Source code (non-routing)
│   ├── config/              # App configuration
│   │   ├── constants.ts     # App-wide constants
│   │   ├── env.ts           # Environment configuration
│   │   └── index.ts
│   │
│   ├── state/               # State management (Context)
│   │   ├── subscription/    # Subscription state
│   │   ├── user/            # User state
│   │   └── index.ts
│   │
│   ├── services/            # External services
│   │   ├── purchases/       # RevenueCat integration
│   │   └── index.ts
│   │
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Generic UI components
│   │   └── index.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── index.ts
│   │
│   ├── features/            # Domain-specific features
│   │   ├── challenges/      # Challenge system (TODO)
│   │   ├── character/       # Character growth (TODO)
│   │   └── index.ts
│   │
│   └── index.ts             # Main barrel export
│
├── assets/                   # Static assets
│   └── images/
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── REVENUECAT_SETUP.md
│   └── GOOGLE_PLAY_SETUP.md
│
├── app.config.ts            # Expo configuration
├── app.json                 # Expo static config
└── package.json
```

## Architectural Decisions

### 1. File-Based Routing (Expo Router)

We use Expo Router for navigation because:

- Automatic route generation from file structure
- Type-safe navigation with TypeScript
- Built-in deep linking support
- Familiar to web developers (Next.js-like)

### 2. Domain-Based Organization

Code is organized by domain/feature rather than by type:

- **Pros**: Related code stays together, easier to find and maintain
- **Cons**: Requires discipline to maintain boundaries

### 3. React Context for State Management

We chose Context API over Redux because:

- Simpler setup and less boilerplate
- Sufficient for our current needs
- Easy to understand and maintain
- Can migrate to Zustand/Redux later if needed

State is split into logical domains:

- `UserContext`: User preferences, onboarding status
- `SubscriptionContext`: RevenueCat state, entitlements

### 4. Centralized Service Layer

External integrations (RevenueCat, future APIs) are wrapped in services:

- Single point of initialization
- Easier to mock for testing
- Consistent error handling
- Clear separation from UI

### 5. Barrel Exports

Each folder has an `index.ts` that exports public APIs:

- Cleaner imports
- Encapsulation of internal structure
- Easier refactoring

## Navigation Flow

```
App Launch
    │
    ▼
index.tsx (checks onboarding status)
    │
    ├─── New User ──────► (onboarding)/index.tsx
    │                           │
    │                           ▼
    │                     Complete Onboarding
    │                           │
    └─── Returning User ◄───────┘
            │
            ▼
      (main)/home.tsx
            │
            ├── Tab: Today (home.tsx)
            ├── Tab: Progress (progress.tsx)
            └── Tab: Settings (settings.tsx)
                    │
                    └── Modal: Paywall (paywall.tsx)
```

## State Flow

```
┌─────────────────────────────────────────────────────────┐
│                     RootLayout                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  UserProvider                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │            SubscriptionProvider             │  │  │
│  │  │                                             │  │  │
│  │  │              App Screens                    │  │  │
│  │  │                                             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Adding New Features

### Adding a New Screen

1. Create file in `app/` directory
2. Export default component
3. Route is automatically generated

### Adding a New Feature Domain

1. Create folder in `src/features/`
2. Add components, hooks, services as needed
3. Export from `src/features/index.ts`
4. Create corresponding screens in `app/`

### Adding New State

1. Create context in `src/state/[domain]/`
2. Add provider to `app/_layout.tsx`
3. Export hook from `src/state/index.ts`

## Performance Considerations

- Lazy load heavy screens
- Memoize expensive computations
- Use `React.memo` for pure components
- Avoid unnecessary re-renders in Context

## Security Considerations

- API keys should be in environment variables
- Use EAS Secrets for production builds
- Never commit sensitive data to git
- Validate all user input

## Future Considerations

- [ ] Add analytics service
- [ ] Implement push notifications
- [ ] Add offline support
- [ ] Consider Zustand if Context becomes complex
- [ ] Add E2E testing with Detox
