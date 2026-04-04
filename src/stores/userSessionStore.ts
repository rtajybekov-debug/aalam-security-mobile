import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const VENUE_ID_KEY = "alarm_sos_current_venue_id";
const VENUE_NAME_KEY = "alarm_sos_current_venue_name";
const USER_PIN_KEY = "alarm_sos_user_pin";
const INDIVIDUAL_SUBSCRIPTION_KEY = "alarm_sos_individual_subscription_active";

interface UserSessionState {
  currentVenueId: string | null;
  currentVenueName: string | null;
  userPin: string | null;
  hasIndividualSubscription: boolean;
  setVenue: (venueId: string, venueName: string) => Promise<void>;
  clearVenue: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  clearPin: () => Promise<void>;
  setIndividualSubscription: (active: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useUserSessionStore = create<UserSessionState>((set, get) => ({
  currentVenueId: null,
  currentVenueName: null,
  userPin: null,
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

  setPin: async (pin: string) => {
    await SecureStore.setItemAsync(USER_PIN_KEY, pin);
    set({ userPin: pin });
  },

  clearPin: async () => {
    await SecureStore.deleteItemAsync(USER_PIN_KEY);
    set({ userPin: null });
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
    const [venueId, venueName, pin, subscription] = await Promise.all([
      AsyncStorage.getItem(VENUE_ID_KEY),
      AsyncStorage.getItem(VENUE_NAME_KEY),
      SecureStore.getItemAsync(USER_PIN_KEY),
      AsyncStorage.getItem(INDIVIDUAL_SUBSCRIPTION_KEY),
    ]);
    set({
      currentVenueId: venueId ?? null,
      currentVenueName: venueName ?? null,
      userPin: pin ?? null,
      hasIndividualSubscription: subscription === "1",
    });
  },

  reset: async () => {
    await Promise.all([
      AsyncStorage.multiRemove([VENUE_ID_KEY, VENUE_NAME_KEY, INDIVIDUAL_SUBSCRIPTION_KEY]),
      SecureStore.deleteItemAsync(USER_PIN_KEY),
    ]);
    set({
      currentVenueId: null,
      currentVenueName: null,
      userPin: null,
      hasIndividualSubscription: false,
    });
  },
}));
