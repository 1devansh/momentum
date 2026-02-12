/**
 * Character feature barrel export
 */
export {
    CHARACTER_STAGES,
    EVOLUTION_STAGES,
    computeCharacterState,
    getNewUnlocks,
    getProgressMessage,
    getReturnMessage,
    getStageMessage,
    getStageUnlocks
} from "./engine";
export type {
    CharacterStage,
    CharacterState,
    EvolutionStage,
    StageIdentity,
    StageUnlock
} from "./engine";

export { useEvolutionStore } from "./evolution-store";
export type { EvolutionStoreState, PendingEvolution } from "./evolution-store";

