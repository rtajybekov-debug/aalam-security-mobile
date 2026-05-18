import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform } from "react-native";
import * as Location from "expo-location";
import { useEmergencyStore } from "../stores/emergencyStore";
import { backgroundPermissionStorage } from "../stores/backgroundPermissionStorage";

type Status = "undetermined" | "granted" | "denied";

/**
 * iOS-only: when the user starts an active SOS we have foreground permission,
 * but iOS pauses location updates a few seconds after the app is backgrounded
 * unless "Always" is granted. This hook decides whether to surface the
 * rationale modal that asks the user to upgrade to "Always", and tracks the
 * lifecycle of that decision.
 *
 * The OS will only show its own "upgrade to Always" prompt once. After that
 * the user has to use Settings. So we:
 *   - Only auto-show during the first eligible active session
 *   - Honor a persistent "skip" flag to avoid nagging on every SOS
 *   - Expose `openSettings` for the case where the OS prompt is already gone
 *
 * On Android we noop entirely — the foreground service plus FOREGROUND_SERVICE_LOCATION
 * already keeps tracking alive without an "Always" tier.
 */
export const useBackgroundLocationPermission = () => {
  const activeSessionId = useEmergencyStore((state) => state.activeSession?.id);
  const activeSessionStatus = useEmergencyStore((state) => state.activeSession?.status);
  const sessionIsLive = Boolean(activeSessionId && activeSessionStatus !== "CLOSED");

  const [status, setStatus] = useState<Status>("undetermined");
  const [isVisible, setVisible] = useState(false);
  const [isRequesting, setRequesting] = useState(false);
  const hasEvaluatedRef = useRef<string | null>(null);

  // Re-evaluate when a fresh session becomes active. Each session evaluates at
  // most once — the user's choice (or skip flag) is sticky across the session.
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    if (!sessionIsLive || !activeSessionId) return;
    if (hasEvaluatedRef.current === activeSessionId) return;
    hasEvaluatedRef.current = activeSessionId;

    let cancelled = false;
    const evaluate = async () => {
      const fg = await Location.getForegroundPermissionsAsync();
      if (cancelled || fg.status !== "granted") return;

      const bg = await Location.getBackgroundPermissionsAsync();
      const bgStatus: Status = bg.status === "granted"
        ? "granted"
        : bg.status === "denied"
          ? "denied"
          : "undetermined";
      if (cancelled) return;
      setStatus(bgStatus);
      if (bgStatus !== "undetermined") return;

      if (await backgroundPermissionStorage.isSkipped()) return;
      if (!cancelled) setVisible(true);
    };
    void evaluate();
    return () => {
      cancelled = true;
    };
  }, [sessionIsLive, activeSessionId]);

  const request = useCallback(async () => {
    setRequesting(true);
    try {
      const result = await Location.requestBackgroundPermissionsAsync();
      setStatus(
        result.status === "granted"
          ? "granted"
          : result.status === "denied"
            ? "denied"
            : "undetermined",
      );
    } finally {
      setRequesting(false);
      setVisible(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    void backgroundPermissionStorage.markSkipped();
    setVisible(false);
  }, []);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
    setVisible(false);
  }, []);

  return {
    isVisible,
    isRequesting,
    status,
    request,
    dismiss,
    openSettings,
  };
};
