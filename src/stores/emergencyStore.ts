import { create } from "zustand";
import { EmergencySession } from "../types/emergency";
import type { EmergencyCategory } from "../components/ui/EmergencyCategoryChip";

interface EmergencyState {
  activeSession: EmergencySession | null;
  isSendingLocation: boolean;
  lastLocationSentAt: string | null;
  /** Selected emergency category (for future API support) */
  pendingCategory: EmergencyCategory | null;
  setActiveSession: (session: EmergencySession | null) => void;
  setSendingLocation: (value: boolean) => void;
  markLocationSent: () => void;
  setPendingCategory: (category: EmergencyCategory | null) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  activeSession: null,
  isSendingLocation: false,
  lastLocationSentAt: null,
  pendingCategory: null,
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
}));
