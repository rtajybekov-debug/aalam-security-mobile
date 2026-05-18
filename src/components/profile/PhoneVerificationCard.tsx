import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CheckCircle2, AlertCircle } from "lucide-react-native";
import { AppCard } from "../ui/AppCard";
import { useAppTheme } from "../../theme";
import { useAuthStore } from "../../stores/authStore";
import { authApi } from "../../api/modules/auth";
import { toastBus } from "../../ui/feedback/toastBus";
import { ru } from "../../locale/ru";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60_000; // matches backend token TTL (10 min) with margin

export const PhoneVerificationCard = () => {
  const { tokens } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);

  const [isStarting, setIsStarting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVerified = Boolean(user?.phoneVerifiedAt);
  const phone = user?.phone ?? null;

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Auto-stop polling once the backend confirms verification.
  useEffect(() => {
    if (isVerified && isPolling) {
      stopPolling();
      toastBus.show({ message: ru.phoneVerification.successToast, severity: "success" });
    }
  }, [isVerified, isPolling, stopPolling]);

  // When user comes back from Telegram, immediately refresh — much snappier
  // than waiting for the next 3s tick.
  useEffect(() => {
    if (!isPolling) return;
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") void refreshMe();
    });
    return () => sub.remove();
  }, [isPolling, refreshMe]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const onVerifyPress = useCallback(async () => {
    if (!phone || isStarting || isPolling) return;
    setIsStarting(true);
    try {
      const { deepLink } = await authApi.startTelegramVerification();
      const canOpen = await Linking.canOpenURL(deepLink);
      if (!canOpen) {
        toastBus.show({
          message: ru.phoneVerification.errorToast,
          severity: "error",
        });
        return;
      }
      await Linking.openURL(deepLink);

      setIsPolling(true);
      pollTimerRef.current = setInterval(() => {
        void refreshMe();
      }, POLL_INTERVAL_MS);
      timeoutRef.current = setTimeout(() => {
        stopPolling();
        toastBus.show({
          message: ru.phoneVerification.timeoutToast,
          severity: "warning",
        });
      }, POLL_TIMEOUT_MS);
    } catch {
      toastBus.show({
        message: ru.phoneVerification.errorToast,
        severity: "error",
      });
    } finally {
      setIsStarting(false);
    }
  }, [phone, isStarting, isPolling, refreshMe, stopPolling]);

  const statusColor = isVerified ? "#10B981" : "#F59E0B";
  const StatusIcon = isVerified ? CheckCircle2 : AlertCircle;

  return (
    <AppCard accent={isVerified ? undefined : statusColor}>
      <Text style={[styles.title, { color: tokens.colors.onSurface }]}>
        {ru.phoneVerification.sectionTitle}
      </Text>

      {!phone ? (
        <Text style={[styles.muted, { color: tokens.colors.onSurfaceMuted }]}>
          {ru.phoneVerification.phoneMissing}
        </Text>
      ) : (
        <>
          <Text style={[styles.phone, { color: tokens.colors.onSurface }]}>{phone}</Text>
          <View style={styles.statusRow}>
            <StatusIcon size={16} color={statusColor} strokeWidth={2.2} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isVerified
                ? ru.phoneVerification.statusVerified
                : ru.phoneVerification.statusPending}
            </Text>
          </View>

          {!isVerified && (
            <Pressable
              onPress={() => void onVerifyPress()}
              disabled={isStarting || isPolling}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: tokens.colors.primary,
                  opacity: pressed || isStarting || isPolling ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
            >
              {isStarting || isPolling ? (
                <View style={styles.buttonInner}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>
                    {isStarting
                      ? ru.phoneVerification.openingTelegram
                      : ru.phoneVerification.verifyingButton}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{ru.phoneVerification.verifyButton}</Text>
              )}
            </Pressable>
          )}
        </>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 14, fontWeight: "700", letterSpacing: -0.2, marginBottom: 8 },
  phone: { fontSize: 16, fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  statusText: { fontSize: 13, fontWeight: "600" },
  muted: { fontSize: 13, fontWeight: "500" },
  button: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
