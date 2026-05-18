import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_QUEUE_KEY = "sos_security_location_queue_v1";

/** Cap to keep storage bounded if the device is offline for hours. */
export const LOCATION_QUEUE_MAX_SIZE = 200;

export interface PendingLocationPoint {
  sessionId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: number;
}

const readJson = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = async (key: string, value: unknown): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const offlineQueueStorage = {
  getLocationQueue: async (): Promise<PendingLocationPoint[]> =>
    (await readJson<PendingLocationPoint[]>(LOCATION_QUEUE_KEY)) ?? [],
  setLocationQueue: (queue: PendingLocationPoint[]) => writeJson(LOCATION_QUEUE_KEY, queue),
  clearLocationQueue: () => AsyncStorage.removeItem(LOCATION_QUEUE_KEY),
};
