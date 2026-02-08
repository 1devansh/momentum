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
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_key_here
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_key_here
```

### RevenueCat Setup

See [docs/REVENUECAT_SETUP.md](docs/REVENUECAT_SETUP.md) for complete setup instructions.

### Google Play Deployment

See [docs/GOOGLE_PLAY_SETUP.md](docs/GOOGLE_PLAY_SETUP.md) for deployment guide.

## 📱 Screens

| Screen     | Description                    | Status      |
| ---------- | ------------------------------ | ----------- |
| Onboarding | First-time user experience     | ✅ Scaffold |
| Home       | Daily challenge display        | ✅ Scaffold |
| Progress   | Character growth visualization | ✅ Scaffold |
| Settings   | User preferences               | ✅ Scaffold |
| Paywall    | Subscription purchase          | ✅ Scaffold |

## 🏗️ Tech Stack

- **Framework**: Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State**: React Context
- **Subscriptions**: RevenueCat
- **Storage**: AsyncStorage

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
