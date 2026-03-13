import { create } from "zustand";
import { EmergencyLocation, EmergencySession } from "../types/emergency";

type SessionMap = Record<string, EmergencySession>;
type LocationMap = Record<string, EmergencyLocation>;

interface OperatorState {
  selectedSession: EmergencySession | null;
  highlightedSessionId: string | null;
  liveLocation: EmergencyLocation | null;
  activeSessionsById: SessionMap;
  liveLocationsBySessionId: LocationMap;
  heartbeatLastSentAt: string | null;
  setSelectedSession: (session: EmergencySession | null) => void;
  setHighlightedSessionId: (sessionId: string | null) => void;
  setLiveLocation: (location: EmergencyLocation | null) => void;
  setLiveLocationForSession: (sessionId: string, location: EmergencyLocation) => void;
  upsertActiveSession: (session: EmergencySession) => void;
  markHeartbeatSent: () => void;
}

export const useOperatorStore = create<OperatorState>((set) => ({
  selectedSession: null,
  highlightedSessionId: null,
  liveLocation: null,
  activeSessionsById: {},
  liveLocationsBySessionId: {},
  heartbeatLastSentAt: null,
  setSelectedSession: (selectedSession) =>
    set({
      selectedSession,
      highlightedSessionId: selectedSession?.id ?? null,
    }),
  setHighlightedSessionId: (highlightedSessionId) => set({ highlightedSessionId }),
  setLiveLocation: (liveLocation) => set({ liveLocation }),
  setLiveLocationForSession: (sessionId, location) =>
    set((state) => ({
      liveLocationsBySessionId: {
        ...state.liveLocationsBySessionId,
        [sessionId]: location,
      },
    })),
  upsertActiveSession: (session) =>
    set((state) => {
      const nextSessions = { ...state.activeSessionsById };
      if (session.status === "CLOSED") {
        delete nextSessions[session.id];
      } else {
        nextSessions[session.id] = session;
      }
      return { activeSessionsById: nextSessions };
    }),
  markHeartbeatSent: () => set({ heartbeatLastSentAt: new Date().toISOString() }),
}));
