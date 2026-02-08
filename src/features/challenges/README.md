# Challenges Feature

This folder will contain all challenge-related functionality.

## Planned Structure

```
challenges/
├── components/       # Challenge-specific UI components
│   ├── ChallengeCard.tsx
│   ├── ChallengeList.tsx
│   └── ChallengeTimer.tsx
├── hooks/           # Challenge-specific hooks
│   └── useChallenge.ts
├── services/        # Challenge data services
│   └── challenges.service.ts
├── types/           # TypeScript types
│   └── challenge.types.ts
└── index.ts         # Barrel export
```

## TODO

- [ ] Define challenge data model
- [ ] Create challenge service (local storage first)
- [ ] Build challenge card component
- [ ] Implement daily challenge selection logic
- [ ] Add challenge completion tracking
- [ ] Integrate with character growth system
- [ ] Add AI-powered challenge suggestions (premium)
