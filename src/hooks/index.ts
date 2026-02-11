/**
 * Hooks barrel export
 */
export { useAppState } from "./useAppState";
export { useBackToTab } from "./useBackToTab";
export { FOCUS_AREAS, useOnboarding } from "./useOnboarding";
export type { FocusArea } from "./useOnboarding";

// Note: useSubscription and useUser are exported from '../state'
// Import them directly from 'src/state' to avoid duplicate exports

// TODO: Add more custom hooks as needed
// export { useChallenge } from './useChallenge';
// export { useCharacter } from './useCharacter';
// export { useNotifications } from './useNotifications';
