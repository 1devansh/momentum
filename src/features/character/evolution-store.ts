/**
 * Evolution Detection Store (Zustand)
 *
 * Tracks stage transitions and flags pending evolutions for the
 * celebration modal. Persists `lastSeenStageIndex` to AsyncStorage
 * so evolution detection survives app restarts.
 *
 * If AsyncStorage fails to load, falls back to 0 (Seed). The next
 * challenge completion will re-trigger evolution detection if needed.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface PendingEvolution {
  fromStageIndex: number;
  toStageIndex: number;
}

export interface EvolutionStoreState {
  lastSeenStageIndex: number;
  pendingEvolution: PendingEvolution | null;
  checkEvolution: (currentStageIndex: number) => void;
  dismissEvolution: () => void;
}

const STORAGE_KEY = "momentum-evolution-store";

export const useEvolutionStore = create<EvolutionStoreState>()(
  persist(
    (set, get) => ({
      lastSeenStageIndex: 0,
      pendingEvolution: null,

      checkEvolution: (currentStageIndex: number) => {
        const { lastSeenStageIndex } = get();
        if (currentStageIndex <= lastSeenStageIndex) return;

        set({
          pendingEvolution: {
            fromStageIndex: lastSeenStageIndex,
            toStageIndex: currentStageIndex,
          },
        });
      },

      dismissEvolution: () => {
        const { pendingEvolution } = get();
        if (!pendingEvolution) return;

        set({
          lastSeenStageIndex: pendingEvolution.toStageIndex,
          pendingEvolution: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastSeenStageIndex: state.lastSeenStageIndex,
      }),
    },
  ),
);
