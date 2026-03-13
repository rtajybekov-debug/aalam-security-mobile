import { useEffect } from "react";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { emergencyApi } from "../api/modules/emergency";
import { useEmergencyStore } from "../stores/emergencyStore";
import { useAuthStore } from "../stores/authStore";

/** iOS Simulator default (Cupertino) and Android emulator often use US coords */
function looksLikeSimulatorCoords(lat: number, lon: number): boolean {
  return (lat > 37 && lat < 38 && lon > -123 && lon < -121) || (lat > 40 && lat < 42 && lon > -75 && lon < -73);
}

export const useEmergencyLocationSender = (intervalMs = 5000) => {
  const role = useAuthStore((state) => state.role);
  const activeSession = useEmergencyStore((state) => state.activeSession);
  const setSendingLocation = useEmergencyStore((state) => state.setSendingLocation);
  const markLocationSent = useEmergencyStore((state) => state.markLocationSent);
  const activeSessionId = activeSession?.id;
  const activeSessionStatus = activeSession?.status;

  useEffect(() => {
    if (!activeSessionId || activeSessionStatus === "CLOSED" || role !== "USER") {
      return;
    }

    let cancelled = false;
    let lastErrorTag: string | null = null;
    let permissionGranted = false;

    const logOnce = (tag: string, message: string) => {
      if (lastErrorTag === tag) return;
      lastErrorTag = tag;
      console.warn(`[location-sender:${tag}] ${message}`);
    };

    const ensurePermission = async () => {
      const currentPermission = await Location.getForegroundPermissionsAsync();
      if (currentPermission.status === "granted") {
        permissionGranted = true;
        return true;
      }
      const requestedPermission = await Location.requestForegroundPermissionsAsync();
      permissionGranted = requestedPermission.status === "granted";
      if (!permissionGranted) {
        logOnce("permission_denied", "Foreground location permission denied.");
      }
      return permissionGranted;
    };

    const sendLocation = async () => {
      const latestSession = useEmergencyStore.getState().activeSession;
      if (!latestSession?.id || latestSession.status === "CLOSED" || latestSession.id !== activeSessionId) {
        return;
      }
      try {
        setSendingLocation(true);
        if (!permissionGranted) return;
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });
        const { latitude, longitude } = current.coords;
        if (!Device.isDevice && looksLikeSimulatorCoords(latitude, longitude)) {
          logOnce(
            "simulator_location",
            "You're on a simulator/emulator. GPS shows fake US coordinates. Use a real device in Almaty for real locations.",
          );
        }
        await emergencyApi.sendLocation(activeSessionId, {
          latitude,
          longitude,
          accuracy: current.coords.accuracy || 10,
        });
        lastErrorTag = null;
        markLocationSent();
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        logOnce("send_failed", message);
      } finally {
        setSendingLocation(false);
      }
    };

    const bootstrap = async () => {
      const granted = await ensurePermission();
      if (!granted || cancelled) return;
      await sendLocation();
      if (cancelled) return;
      const id = setInterval(() => {
        void sendLocation();
      }, intervalMs);
      return () => clearInterval(id);
    };

    let cleanupInterval: (() => void) | undefined;
    void bootstrap().then((cleanup) => {
      cleanupInterval = cleanup;
    });

    return () => {
      cancelled = true;
      setSendingLocation(false);
      cleanupInterval?.();
    };
  }, [
    activeSessionId,
    activeSessionStatus,
    intervalMs,
    markLocationSent,
    role,
    setSendingLocation,
  ]);
};
