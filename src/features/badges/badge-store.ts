/**
 * Badge Celebration Store (Zustand)
 *
 * Tracks which badges the user has already "seen" so we can detect
 * newly unlocked badges and show a celebration modal — the same
 * confetti + scale-in animation used for evolution celebrations.
 *
 * Persists `seenBadgeIds` to AsyncStorage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface PendingBadge {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export interface BadgeStoreState {
  seenBadgeIds: string[];
  pendingBadge: PendingBadge | null;
  /**
   * Call with the full list of currently-earned badge objects.
   * If any earned badge hasn't been seen yet, queue the first one.
   */
  checkBadges: (
    earnedBadges: {
      id: string;
      emoji: string;
      title: string;
      description: string;
    }[],
  ) => void;
  dismissBadge: () => void;
}

const STORAGE_KEY = "momentum-badge-store";

export const useBadgeStore = create<BadgeStoreState>()(
  persist(
    (set, get) => ({
      seenBadgeIds: [],
      pendingBadge: null,

      checkBadges: (earnedBadges) => {
        const { seenBadgeIds, pendingBadge } = get();
        // Don't queue if we're already showing one
        if (pendingBadge) return;

        const unseen = earnedBadges.find((b) => !seenBadgeIds.includes(b.id));
        if (!unseen) return;

        set({
          pendingBadge: {
            id: unseen.id,
            emoji: unseen.emoji,
            title: unseen.title,
            description: unseen.description,
          },
        });
      },

      dismissBadge: () => {
        const { pendingBadge, seenBadgeIds } = get();
        if (!pendingBadge) return;

        set({
          seenBadgeIds: [...seenBadgeIds, pendingBadge.id],
          pendingBadge: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ seenBadgeIds: state.seenBadgeIds }),
    },
  ),
);
