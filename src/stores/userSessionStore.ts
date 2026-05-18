import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VENUE_ID_KEY = "sos_security_current_venue_id";
const VENUE_NAME_KEY = "sos_security_current_venue_name";
const INDIVIDUAL_SUBSCRIPTION_KEY = "sos_security_individual_subscription_active";

interface UserSessionState {
  currentVenueId: string | null;
  currentVenueName: string | null;
  hasIndividualSubscription: boolean;
  setVenue: (venueId: string, venueName: string) => Promise<void>;
  clearVenue: () => Promise<void>;
  setIndividualSubscription: (active: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useUserSessionStore = create<UserSessionState>((set) => ({
  currentVenueId: null,
  currentVenueName: null,
  hasIndividualSubscription: false,

  setVenue: async (venueId: string, venueName: string) => {
    await Promise.all([
      AsyncStorage.setItem(VENUE_ID_KEY, venueId),
      AsyncStorage.setItem(VENUE_NAME_KEY, venueName),
    ]);
    set({ currentVenueId: venueId, currentVenueName: venueName });
  },

  clearVenue: async () => {
    await Promise.all([
      AsyncStorage.removeItem(VENUE_ID_KEY),
      AsyncStorage.removeItem(VENUE_NAME_KEY),
    ]);
    set({ currentVenueId: null, currentVenueName: null });
  },

  setIndividualSubscription: async (active: boolean) => {
    if (active) {
      await AsyncStorage.setItem(INDIVIDUAL_SUBSCRIPTION_KEY, "1");
    } else {
      await AsyncStorage.removeItem(INDIVIDUAL_SUBSCRIPTION_KEY);
    }
    set({ hasIndividualSubscription: active });
  },

  hydrate: async () => {
    const [venueId, venueName, subscription] = await Promise.all([
      AsyncStorage.getItem(VENUE_ID_KEY),
      AsyncStorage.getItem(VENUE_NAME_KEY),
      AsyncStorage.getItem(INDIVIDUAL_SUBSCRIPTION_KEY),
    ]);
    set({
      currentVenueId: venueId ?? null,
      currentVenueName: venueName ?? null,
      hasIndividualSubscription: subscription === "1",
    });
  },

  reset: async () => {
    await AsyncStorage.multiRemove([VENUE_ID_KEY, VENUE_NAME_KEY, INDIVIDUAL_SUBSCRIPTION_KEY]);
    set({
      currentVenueId: null,
      currentVenueName: null,
      hasIndividualSubscription: false,
    });
  },
}));
