import { create } from "zustand";
import { EmergencySession } from "../types/emergency";

interface EmergencyState {
  activeSession: EmergencySession | null;
  isSendingLocation: boolean;
  lastLocationSentAt: string | null;
  setActiveSession: (session: EmergencySession | null) => void;
  setSendingLocation: (value: boolean) => void;
  markLocationSent: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  activeSession: null,
  isSendingLocation: false,
  lastLocationSentAt: null,
  setActiveSession: (activeSession) => set({ activeSession }),
  setSendingLocation: (isSendingLocation) => set({ isSendingLocation }),
  markLocationSent: () => set({ lastLocationSentAt: new Date().toISOString() }),
}));
