# Character Feature

This folder will contain all character growth and evolution functionality.

## Planned Structure

```
character/
├── components/       # Character-specific UI components
│   ├── CharacterAvatar.tsx
│   ├── EvolutionPath.tsx
│   └── GrowthAnimation.tsx
├── hooks/           # Character-specific hooks
│   └── useCharacter.ts
├── services/        # Character data services
│   └── character.service.ts
├── types/           # TypeScript types
│   └── character.types.ts
├── assets/          # Character images/animations
│   └── stages/
└── index.ts         # Barrel export
```

## Character Evolution Stages

1. **Sapling** 🌱 (Level 1-5)
   - Starting stage for all users
   - Basic appearance

2. **Sprout** 🌿 (Level 6-15)
   - First evolution
   - Requires Pro subscription

3. **Tree** 🌳 (Level 16+)
   - Final evolution
   - Requires Pro subscription

## TODO

- [ ] Design character assets for each stage
- [ ] Define XP/level system
- [ ] Create character state management
- [ ] Build evolution animations
- [ ] Implement level-up celebrations
- [ ] Add character customization (premium)
