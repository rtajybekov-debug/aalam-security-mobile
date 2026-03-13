import React from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  ColorValue,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../theme";

export type SosButtonState = "idle" | "sending" | "active" | "disabled";

interface Props {
  state: SosButtonState;
  onTrigger: () => Promise<void> | void;
}

const HOLD_MS = 1500;

export const SosEmergencyButton = ({ state, onTrigger }: Props) => {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.55);
  const glowOpacity = useSharedValue(0.15);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => setReduceMotion(false));
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => sub.remove();
  }, []);

  React.useEffect(() => {
    if (reduceMotion) {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
      glowOpacity.value = 0;
      return;
    }
    pulseScale.value = withRepeat(
      withTiming(1.22, { duration: 1700, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(withTiming(0, { duration: 1700 }), -1, false);
    glowOpacity.value =
      state === "active"
        ? withRepeat(withTiming(0.45, { duration: 700 }), -1, true)
        : withTiming(0.15, { duration: 350 });
  }, [glowOpacity, pulseOpacity, pulseScale, reduceMotion, state]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));
  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const disabled = state === "disabled" || state === "sending";
  const isActive = state === "active";
  const isSending = state === "sending";
  const gradientColors: [ColorValue, ColorValue] = isActive
    ? [theme.tokens.colors.warning, theme.tokens.status.IN_PROGRESS.border]
    : [theme.tokens.colors.danger, theme.tokens.status.NEW.border];
  const contextTitle = isActive ? "SOS already active" : isSending ? "Sending alert..." : "Emergency SOS";
  const contextDescription = isActive
    ? "Help is being notified. Open active session for updates."
    : "Hold the button for 1.5s to send an emergency alert.";

  const fireTrigger = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await onTrigger();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error("SOS trigger failed");
    }
  };

  const onPressIn = async () => {
    if (!reduceMotion) {
      scale.value = withSpring(0.97, { damping: 14, stiffness: 260 });
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const onPressOut = () => {
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 14, stiffness: 260 });
    }
  };

  return (
    <View style={styles.wrapper}>
      {!reduceMotion && (state === "idle" || state === "sending" || state === "active") && (
        <Animated.View
          style={[
            styles.pulse,
            state === "active"
              ? { borderColor: theme.tokens.colors.warning }
              : { borderColor: theme.tokens.colors.danger },
            animatedPulse,
          ]}
        />
      )}

      <Animated.View style={animatedScale}>
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: isActive ? theme.tokens.colors.warning : theme.tokens.colors.danger },
            animatedGlow,
          ]}
        />
        <Pressable
          style={[
            styles.button,
            disabled && styles.disabled,
          ]}
          disabled={disabled}
          onPressIn={() => void onPressIn()}
          onPressOut={onPressOut}
          onLongPress={() => void fireTrigger()}
          delayLongPress={HOLD_MS}
          onPress={() => {
            if (isSending) return;
            if (isActive) {
              void fireTrigger();
              return;
            }
            setIsConfirmVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Emergency SOS button"
          accessibilityHint="Long press for 1.5 seconds or confirm in dialog"
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.gradient}
          >
            {isSending ? (
              <ActivityIndicator color={theme.tokens.colors.onDanger} />
            ) : (
              <Text style={[styles.label, { color: theme.tokens.colors.onDanger }]}>
                {state === "active" ? "SOS ACTIVE" : "SOS"}
              </Text>
            )}
            <Text style={[styles.helper, { color: theme.tokens.colors.onDanger }]}>
              {isActive ? "Tap to open session" : "Hold 1.5s to trigger"}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <View style={styles.infoBlock}>
        <Text style={[styles.infoTitle, { color: theme.tokens.colors.onSurface }]}>{contextTitle}</Text>
        <Text style={[styles.infoText, { color: theme.tokens.colors.onSurfaceMuted }]}>{contextDescription}</Text>
      </View>

      <Modal
        visible={isConfirmVisible}
        transparent
        animationType={reduceMotion ? "none" : "fade"}
        onRequestClose={() => setIsConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.tokens.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.tokens.colors.onSurface }]}>Confirm emergency alert</Text>
            <Text style={[styles.modalBody, { color: theme.tokens.colors.onSurfaceMuted }]}>
              This will immediately notify operators and start live status tracking.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsConfirmVisible(false)}
                style={styles.modalSecondary}
                accessibilityRole="button"
                accessibilityLabel="Cancel emergency confirmation"
              >
                <Text style={[styles.modalSecondaryText, { color: theme.tokens.colors.onSurfaceMuted }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsConfirmVisible(false);
                  void fireTrigger();
                }}
                style={[styles.modalDanger, { backgroundColor: theme.tokens.colors.danger }]}
                accessibilityRole="button"
                accessibilityLabel="Confirm emergency trigger"
                accessibilityHint="Immediately sends SOS alert"
              >
                <Text style={[styles.modalDangerText, { color: theme.tokens.colors.onDanger }]}>Send SOS</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
  },
  pulse: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 999,
    borderWidth: 2,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  button: {
    width: 190,
    height: 190,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontWeight: "800",
    fontSize: 32,
    letterSpacing: 1.2,
  },
  helper: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  infoBlock: {
    marginTop: 14,
    alignItems: "center",
    maxWidth: 280,
    paddingHorizontal: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalSecondaryText: {
    color: "#334155",
    fontWeight: "600",
  },
  modalDanger: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalDangerText: {
    fontWeight: "700",
  },
});
