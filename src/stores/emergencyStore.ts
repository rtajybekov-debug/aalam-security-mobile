import { create } from "zustand";
import { EmergencySession } from "../types/emergency";
import type { EmergencyCategory } from "../components/ui/EmergencyCategoryChip";
import {
  LOCATION_QUEUE_MAX_SIZE,
  offlineQueueStorage,
  type PendingLocationPoint,
} from "./offlineQueueStorage";

/** Minimum gap between consecutive SOS-start attempts (covers timeout / no-response cases). */
const SOS_START_COOLDOWN_MS = 2000;

interface EmergencyState {
  activeSession: EmergencySession | null;
  isSendingLocation: boolean;
  lastLocationSentAt: string | null;
  /** Selected emergency category (for future API support) */
  pendingCategory: EmergencyCategory | null;
  /** True while a /emergency/start request is in flight; prevents duplicate triggers. */
  isStartingEmergency: boolean;
  /** Wall-clock timestamp of the most recent SOS-start attempt; backs the cooldown. */
  lastSosStartAttemptAt: number;
  /** Coordinates we tried to send while offline. FIFO, bounded by LOCATION_QUEUE_MAX_SIZE. */
  pendingLocationQueue: PendingLocationPoint[];
  /** True after the first AsyncStorage hydration completes. */
  isOfflineQueuesHydrated: boolean;
  setActiveSession: (session: EmergencySession | null) => void;
  setSendingLocation: (value: boolean) => void;
  markLocationSent: () => void;
  setPendingCategory: (category: EmergencyCategory | null) => void;
  /**
   * Atomically attempts to acquire the SOS-start lock.
   * Returns true if acquired (caller MUST call releaseSosStartLock when done),
   * false if a request is already in flight or the cooldown is still active.
   */
  acquireSosStartLock: () => boolean;
  releaseSosStartLock: () => void;
  enqueueLocation: (point: PendingLocationPoint) => Promise<void>;
  dequeueLocations: (count: number) => Promise<void>;
  hydrateOfflineQueues: () => Promise<void>;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  activeSession: null,
  isSendingLocation: false,
  lastLocationSentAt: null,
  pendingCategory: null,
  isStartingEmergency: false,
  lastSosStartAttemptAt: 0,
  pendingLocationQueue: [],
  isOfflineQueuesHydrated: false,
  setActiveSession: (activeSession) =>
    set((state) => {
      if (!activeSession) {
        return { activeSession: null };
      }
      const prev = state.activeSession;
      if (
        prev?.id === activeSession.id &&
        prev.venue &&
        (!activeSession.venue || activeSession.venue == null)
      ) {
        return {
          activeSession: {
            ...activeSession,
            venue: prev.venue,
            venueId: activeSession.venueId ?? prev.venueId,
            emergencyType: activeSession.emergencyType ?? prev.emergencyType,
          },
        };
      }
      return { activeSession };
    }),
  setSendingLocation: (isSendingLocation) => set({ isSendingLocation }),
  markLocationSent: () => set({ lastLocationSentAt: new Date().toISOString() }),
  setPendingCategory: (pendingCategory) => set({ pendingCategory }),
  acquireSosStartLock: () => {
    const state = get();
    const now = Date.now();
    if (state.isStartingEmergency) {
      return false;
    }
    if (now - state.lastSosStartAttemptAt < SOS_START_COOLDOWN_MS) {
      return false;
    }
    set({ isStartingEmergency: true, lastSosStartAttemptAt: now });
    return true;
  },
  releaseSosStartLock: () => set({ isStartingEmergency: false }),
  enqueueLocation: async (point) => {
    const next = [...get().pendingLocationQueue, point];
    // Bound the queue: keep the most recent points (older ones become less useful).
    const trimmed = next.length > LOCATION_QUEUE_MAX_SIZE
      ? next.slice(next.length - LOCATION_QUEUE_MAX_SIZE)
      : next;
    set({ pendingLocationQueue: trimmed });
    await offlineQueueStorage.setLocationQueue(trimmed);
  },
  dequeueLocations: async (count) => {
    if (count <= 0) return;
    const next = get().pendingLocationQueue.slice(count);
    set({ pendingLocationQueue: next });
    if (next.length === 0) {
      await offlineQueueStorage.clearLocationQueue();
    } else {
      await offlineQueueStorage.setLocationQueue(next);
    }
  },
  hydrateOfflineQueues: async () => {
    if (get().isOfflineQueuesHydrated) return;
    const queue = await offlineQueueStorage.getLocationQueue();
    set({
      pendingLocationQueue: queue,
      isOfflineQueuesHydrated: true,
    });
  },
}));
