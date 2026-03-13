import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toastBus, ToastPayload } from "./toastBus";

const DEFAULT_DURATION = 3000;

const SEVERITY_STYLES: Record<
  NonNullable<ToastPayload["severity"]>,
  { bg: string; text: string; accent: string }
> = {
  success: { bg: "#14532D", text: "#FFFFFF", accent: "#86EFAC" },
  error: { bg: "#7F1D1D", text: "#FFFFFF", accent: "#FCA5A5" },
  warning: { bg: "#78350F", text: "#FFFFFF", accent: "#FCD34D" },
  info: { bg: "#1E3A5F", text: "#FFFFFF", accent: "#93C5FD" },
};

export const AppSnackbarHost = () => {
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = React.useState<ToastPayload | null>(null);
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 120, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setPayload(null));
  }, [opacity, translateY]);

  useEffect(() => {
    return toastBus.subscribe((next) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPayload(next);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 5 }),
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(dismiss, next.duration ?? DEFAULT_DURATION);
    });
  }, [dismiss, opacity, translateY]);

  if (!payload) return null;

  const severity = payload.severity ?? "info";
  const colors = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.info;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.bg, bottom: insets.bottom + 16 },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={3}>
        {payload.message}
      </Text>
      {payload.actionLabel ? (
        <Pressable
          onPress={() => {
            payload.onAction?.();
            dismiss();
          }}
          accessibilityRole="button"
          accessibilityLabel={payload.actionLabel}
          hitSlop={8}
        >
          <Text style={[styles.action, { color: colors.accent }]}>{payload.actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    gap: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },
  action: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 0,
  },
});
