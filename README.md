# Momentum

A personal growth app focused on daily micro-challenges, character-based progress, and positive reinforcement.

## 🌱 Overview

Momentum helps users build positive habits through:

- **Daily Micro-Challenges**: Small, achievable tasks that compound over time
- **Character Growth**: Watch your character evolve from a sapling to a tree
- **Gamification**: Streaks, XP, and achievements to keep you motivated
- **Premium Features**: Advanced challenges and full character evolution (subscription)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

Note: Some features require a development build (not Expo Go). See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for complete setup instructions.

## 📁 Project Structure

```
momentum/
├── app/                 # Screens (Expo Router)
├── src/
│   ├── config/         # App configuration
│   ├── state/          # State management (Context)
│   ├── services/       # External services (RevenueCat)
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   └── features/       # Domain-specific features
├── docs/               # Documentation
└── assets/             # Static assets
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🔧 Configuration

### Environment Variables

Create a `.env` file (not committed to git):

```env
# RevenueCat API Keys
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_key_here
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_key_here

# Feature Flags
EXPO_PUBLIC_ENABLE_DEBUG_SCREEN=true
```

See `.env.example` for all available options.

### RevenueCat Setup

See [docs/REVENUECAT_SETUP.md](docs/REVENUECAT_SETUP.md) for complete setup instructions.

### Google Play Deployment

See [docs/GOOGLE_PLAY_SETUP.md](docs/GOOGLE_PLAY_SETUP.md) for deployment guide.

### User Settings & Profile

See [docs/USER_SETTINGS.md](docs/USER_SETTINGS.md) for user settings and profile features documentation.

### Package Documentation

See [docs/PACKAGES.md](docs/PACKAGES.md) for complete package list and usage guide.

### Setup Guide

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for complete setup instructions including native features.

## 📱 Screens

| Screen     | Description                    | Status      |
| ---------- | ------------------------------ | ----------- |
| Onboarding | First-time user experience     | ✅ Scaffold |
| Home       | Daily challenge display        | ✅ Scaffold |
| Progress   | Character growth visualization | ✅ Scaffold |
| Settings   | User preferences & profile     | ✅ Complete |
| Profile    | User profile management        | ✅ Complete |
| Reminders  | Daily reminder configuration   | ✅ Complete |
| Paywall    | Subscription purchase          | ✅ Scaffold |
| Debug      | Development debugging tools    | ✅ Complete |

## 🏗️ Tech Stack

- **Framework**: Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State**: React Context + Zustand
- **Subscriptions**: RevenueCat
- **Storage**: AsyncStorage + Secure Store
- **Animations**: Reanimated + Lottie
- **Charts**: Victory Native
- **Notifications**: Expo Notifications
- **UI**: React Native + Custom Components

### Key Packages

- **zustand** - Lightweight state management
- **date-fns** - Date utilities and formatting
- **lottie-react-native** - JSON-based animations
- **victory-native** - Charts and data visualization
- **expo-notifications** - Local and push notifications
- **expo-secure-store** - Encrypted storage
- **expo-local-authentication** - Biometric auth
- **expo-linear-gradient** - Gradient backgrounds
- **expo-blur** - Blur effects
- **expo-av** - Audio playback
- **react-native-svg** - SVG rendering

See [docs/PACKAGES.md](docs/PACKAGES.md) for complete package documentation.

## 📋 TODO

### High Priority

- [ ] Replace placeholder RevenueCat API keys
- [ ] Set up Google Play Console app
- [ ] Configure RevenueCat products
- [ ] Complete store listing

### Features

- [ ] Implement daily challenge system
- [ ] Build character growth visualization
- [ ] Add streak tracking
- [ ] Implement XP/leveling system
- [ ] Add push notifications
- [ ] Implement theme UI changes (preference storage complete)
- [ ] Schedule notifications for reminders

### Completed ✅

- [x] User profile management (name, email)
- [x] Multiple daily reminders
- [x] Theme preference selection
- [x] Notification toggle
- [x] Sign out functionality
- [x] RevenueCat user attribute sync
- [x] Debug screen feature flag

### Polish

- [ ] Design proper onboarding flow
- [ ] Add animations and transitions
- [ ] Implement proper theming
- [ ] Add haptic feedback

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📦 Building

```bash
# Development build
eas build --platform android --profile development

# Preview build (APK)
eas build --platform android --profile preview

# Production build (AAB)
eas build --platform android --profile production
```

## 🚢 Deployment

```bash
# Submit to Google Play Internal Testing
eas submit --platform android --profile production
```

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. Contact the maintainers for contribution guidelines.
