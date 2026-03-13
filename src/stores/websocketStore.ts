import { create } from "zustand";

interface WebsocketState {
  connected: boolean;
  reconnecting: boolean;
  lastEventAt: string | null;
  setConnected: (value: boolean) => void;
  setReconnecting: (value: boolean) => void;
  markEvent: () => void;
}

export const useWebsocketStore = create<WebsocketState>((set) => ({
  connected: false,
  reconnecting: false,
  lastEventAt: null,
  setConnected: (connected) => set({ connected }),
  setReconnecting: (reconnecting) => set({ reconnecting }),
  markEvent: () => set({ lastEventAt: new Date().toISOString() }),
}));
