# Implementation Plan: Evolution System Redesign

## Overview

Incrementally transform the character evolution engine from a simple challenge-count mapper into an identity-driven progression system. Work proceeds bottom-up: enrich the data model and engine first, then add the evolution detection store, then update the UI screens, and finally wire in the celebration experience.

## Tasks

- [x] 1. Enrich the Evolution Engine data model and core functions
  - [x] 1.1 Define new interfaces (`StageIdentity`, `StageUnlock`, `EvolutionStage`) and replace `CHARACTER_STAGES` with `EVOLUTION_STAGES` config containing identity labels, psychological descriptions, transformation narratives, unlocks, and message pools per stage as specified in the design data models
    - Update `src/features/character/engine.ts`
    - Export `EVOLUTION_STAGES` and keep `CHARACTER_STAGES` as a deprecated alias for backward compatibility
    - Update `CharacterState` interface to include `unlocks` and `progressMessage`
    - _Requirements: 1.1, 1.3, 2.1, 6.3_

  - [x] 1.2 Extend `computeCharacterState` to return enriched `CharacterState` with full `StageIdentity`, stage unlocks, and identity-based progress message
    - Add `getProgressMessage(totalCompleted)` that returns "N more steps to becoming a [name]" or a completion message for the final stage
    - Clamp negative `totalCompleted` to 0
    - _Requirements: 1.2, 1.4, 4.1, 4.4_

  - [x] 1.3 Implement helper functions: `getStageUnlocks`, `getNewUnlocks`, `getStageMessage`, `getReturnMessage`
    - Each function handles out-of-range inputs gracefully per the error handling design
    - _Requirements: 2.2, 6.1, 6.2_

  - [ ]\* 1.4 Write property tests for the Evolution Engine
    - Install `fast-check` as a devDependency
    - Create `src/features/character/__tests__/engine.property.test.ts`
    - **Property 1: Stage identity completeness** — For any non-negative totalCompleted, returned stage has all required StageIdentity fields with non-empty values
    - **Validates: Requirements 1.1, 1.2**
    - **Property 2: Stage configuration structural validity** — For all stages, unlocks have valid structure and messages array is non-empty
    - **Validates: Requirements 2.1, 6.3**
    - **Property 3: Stage monotonicity** — For any a <= b, computeCharacterState(a).stageIndex <= computeCharacterState(b).stageIndex
    - **Validates: Requirements 1.4**
    - **Property 4: New unlocks on stage transition** — For any valid fromIndex < toIndex, getNewUnlocks returns exactly the unlocks for stages (fromIndex+1) through toIndex
    - **Validates: Requirements 2.2**
    - **Property 5: Pro gating of feature_access unlocks** — All feature_access unlocks have requiresPro === true
    - **Validates: Requirements 2.4**
    - **Property 7: Progress message format** — For non-final stages, message contains remaining count and next stage name; for final stage, no "steps to becoming" phrasing
    - **Validates: Requirements 4.1, 4.4**
    - **Property 8: Stage message from pool** — For any valid stageIndex, getStageMessage returns a member of that stage's messages array
    - **Validates: Requirements 6.1**
    - **Property 9: Return message per stage** — For any valid stageIndex, getReturnMessage returns the defined return message
    - **Validates: Requirements 6.2**

  - [ ]\* 1.5 Write unit tests for the Evolution Engine
    - Create `src/features/character/__tests__/engine.test.ts`
    - Test exact seven-stage progression order and thresholds
    - Test boundary values (0, 3, 7, 15, 30, 50, 100)
    - Test negative input clamping
    - Test final stage completion message
    - Test out-of-range inputs for helper functions
    - _Requirements: 1.3, 1.4, 4.4_

- [x] 2. Checkpoint — Ensure engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create the Evolution Detection Store
  - [x] 3.1 Create `src/features/character/evolution-store.ts` with Zustand store using `persist` middleware (AsyncStorage)
    - Implement `lastSeenStageIndex`, `pendingEvolution`, `checkEvolution`, `dismissEvolution`
    - Handle edge cases: no-op when stageIndex <= lastSeenStageIndex, no-op dismiss when pendingEvolution is null
    - _Requirements: 3.1_

  - [x] 3.2 Export the new store from `src/features/character/index.ts`
    - Export `useEvolutionStore` and related types
    - _Requirements: 3.1_

  - [ ]\* 3.3 Write property and unit tests for the Evolution Detection Store
    - Create `src/features/character/__tests__/evolution-store.test.ts`
    - **Property 6: Evolution detection on stage transition** — For any previousStageIndex < currentStageIndex, checkEvolution sets pendingEvolution correctly; for currentStageIndex <= previousStageIndex, pendingEvolution stays null
    - **Validates: Requirements 3.1**
    - Unit test: dismiss clears pendingEvolution and updates lastSeenStageIndex
    - Unit test: no-op when no transition
    - _Requirements: 3.1_

- [x] 4. Checkpoint — Ensure store tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build the Evolution Celebration Component
  - [x] 5.1 Create `src/components/EvolutionCelebration.tsx` modal component
    - Display new stage emoji with scale-in animation (react-native-reanimated)
    - Show identity label, transformation narrative, and list of new unlocks
    - Trigger expo-haptics notification feedback on mount
    - Fire confetti with distinct color palette
    - Dismiss button calls `useEvolutionStore.dismissEvolution()`
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 5.2 Export the component from `src/components/index.ts`
    - _Requirements: 3.2_

- [x] 6. Update the Progress Screen
  - [x] 6.1 Update character display section in `app/(main)/progress.tsx` to show `identityLabel` and `description` from `StageIdentity`
    - Replace "N more to next evolution" with `getProgressMessage()` output
    - Show completion message for Ancient Grove instead of progress bar
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 6.2 Update evolution path in `app/(main)/progress.tsx` to show identity labels, transformation narratives, and unlock previews per stage
    - Reached stages: show transformation narrative and unlocked items
    - Current stage: highlighted with identity label
    - Locked stages: show name preview and locked unlock icons
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 6.3 Add evolution detail review — tapping a reached stage shows its full identity and unlocks (fulfills fallback for dismissed celebrations)
    - _Requirements: 3.5_

- [x] 7. Update the Home Screen
  - [x] 7.1 Update header in `app/(main)/home.tsx` to show `identityLabel` alongside emoji
    - _Requirements: 4.3_

  - [x] 7.2 Add contextual Identity_Message to the daily challenge card using `getStageMessage()`
    - _Requirements: 6.1_

  - [x] 7.3 Add return-user detection: if last completed challenge was >1 day ago, show `getReturnMessage()` welcoming message
    - _Requirements: 6.2_

  - [x] 7.4 Wire evolution detection: after `completeCurrentChallenge`, call `checkEvolution()` with the new stageIndex, and render `EvolutionCelebration` when `pendingEvolution` is non-null
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 8. Update barrel exports and backward compatibility
  - [x] 8.1 Update `src/features/character/index.ts` to export all new types, functions, and the evolution store
    - Ensure `CHARACTER_STAGES` remains exported as deprecated alias
    - Update any other imports across the app that reference old types
    - _Requirements: 1.1, 1.2_

- [x] 9. Final checkpoint — Ensure all tests pass and screens render correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The engine remains pure and side-effect-free; all new state lives in the evolution Zustand store
