import AsyncStorage from "@react-native-async-storage/async-storage";

const SKIP_KEY = "sos_security_bg_perm_skipped_v1";

/**
 * Tracks whether the user explicitly dismissed our background-location
 * rationale. Once dismissed, we stop auto-prompting on every SOS — the user
 * can still upgrade the permission manually from system Settings.
 */
export const backgroundPermissionStorage = {
  async isSkipped(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(SKIP_KEY)) === "1";
    } catch {
      return false;
    }
  },
  markSkipped: () => AsyncStorage.setItem(SKIP_KEY, "1"),
  reset: () => AsyncStorage.removeItem(SKIP_KEY),
};
