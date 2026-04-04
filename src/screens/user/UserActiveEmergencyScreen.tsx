import React, { useEffect, useRef, useState } from "react";
import { Linking, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  getBrightnessAsync,
  isBrightnessAvailable,
  requestBrightnessPermissionsAsync,
  setBrightnessAsync,
} from "../../utils/brightness";
import { UserStackParamList } from "../../navigation/types";
import { useEmergencyStore } from "../../stores/emergencyStore";
import { emergencyApi } from "../../api/modules/emergency";
import { ActionButton } from "../../components/ui/ActionButton";
import { StatusChip } from "../../components/ui/StatusChip";
import { AppCard } from "../../components/ui/AppCard";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";

type Props = NativeStackScreenProps<UserStackParamList, "UserActiveEmergency">;

export const UserActiveEmergencyScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const session = useEmergencyStore((state) => state.activeSession);
  const setActiveSession = useEmergencyStore((state) => state.setActiveSession);
  const isSendingLocation = useEmergencyStore((state) => state.isSendingLocation);
  const lastLocationSentAt = useEmergencyStore((state) => state.lastLocationSentAt);

  const [isClosing, setIsClosing] = useState(false);
  const [stealthOn, setStealthOn] = useState(false);
  const originalBrightnessRef = useRef<number>(1);

  const bgProgress = useSharedValue(1);
  const radarScale = useSharedValue(1);
  const radarOpacity = useSharedValue(0.5);

  useEffect(() => {
    bgProgress.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    radarScale.value = withRepeat(
      withTiming(1.4, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    radarOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const handleStealthMode = async () => {
    if (!isBrightnessAvailable()) {
      toastBus.show({
        message: "Stealth Mode requires expo-brightness. Run: npx expo install expo-brightness",
        severity: "info",
      });
      return;
    }
    if (stealthOn) {
      try {
        await setBrightnessAsync(originalBrightnessRef.current);
      } catch {
        // ignore
      }
      setStealthOn(false);
    } else {
      try {
        const { status } = await requestBrightnessPermissionsAsync();
        if (status !== "granted") {
          toastBus.show({ message: "Brightness permission required for Stealth Mode.", severity: "warning" });
          return;
        }
        const current = await getBrightnessAsync();
        originalBrightnessRef.current = current;
        await setBrightnessAsync(0);
        setStealthOn(true);
        toastBus.show({ message: "Stealth mode on. Brightness restored on exit.", severity: "info" });
      } catch {
        toastBus.show({ message: "Could not change brightness.", severity: "warning" });
      }
    }
  };

  const handleCallDispatch = () => {
    Linking.openURL("tel:112");
  };

  const closeSession = async () => {
    if (!session?.id) return;
    setIsClosing(true);
    try {
      await emergencyApi.close(session.id);
      setActiveSession(null);
      toastBus.show({ message: "SOS session closed.", severity: "success" });
      navigation.navigate("UserTabs");
    } catch {
      toastBus.show({ message: "Failed to close session. Try again.", severity: "error" });
    } finally {
      setIsClosing(false);
    }
  };

  const endBg = tokens.colors.background;
  const animatedBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      ["#1A0A0A", endBg],
    ),
  }));

  const animatedRadar = useAnimatedStyle(() => ({
    transform: [{ scale: radarScale.value }],
    opacity: radarOpacity.value,
  }));

  if (!session) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: tokens.colors.onSurfaceMuted }]}>
            No active session found.
          </Text>
          <ActionButton
            variant="secondary"
            label="Go back"
            onPress={() => navigation.navigate("UserTabs")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[styles.root, animatedBg]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.radarWrap}>
          <Animated.View
            style={[
              styles.radarRing,
              { borderColor: tokens.colors.primary },
              animatedRadar,
            ]}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.activeTitle, { color: tokens.colors.onSurface }]}>Active SOS</Text>
            <View style={[styles.progressBadge, { backgroundColor: "rgba(140,63,23,0.85)" }]}>
              <Text style={[styles.progressText, { color: "#FFD2A3" }]}>IN PROGRESS</Text>
            </View>
          </View>
          <Text style={[styles.activeSub, { color: tokens.colors.onSurfaceMuted }]}>Elapsed: 00:03:42</Text>

          <AppCard style={styles.mapCard} flat>
            <View style={styles.mapArea}>
              <View style={[styles.youDot, { backgroundColor: tokens.colors.primary }]} />
              <Text style={[styles.youLabel, { color: tokens.colors.primary }]}>You</Text>
              <View style={styles.route} />
            </View>
          </AppCard>

          <ActionButton label="Call Support" onPress={handleCallDispatch} size="large" />

          <AppCard style={styles.stealthCard} flat>
            <View style={styles.stealthRow}>
              <View style={styles.stealthCopy}>
                <Text style={[styles.stealthTitle, { color: tokens.colors.onSurface }]}>Stealth mode</Text>
                <Text style={[styles.stealthHint, { color: tokens.colors.onSurfaceMuted }]}>
                  {isSendingLocation ? "Sending location, silent mode enabled" : "Screen dark, vibration disabled"}
                </Text>
                {lastLocationSentAt ? (
                  <Text style={[styles.telemetrySub, { color: tokens.colors.onSurfaceMuted }]}>Last ping: {lastLocationSentAt}</Text>
                ) : null}
              </View>
              <ActionButton
                variant="secondary"
                label={stealthOn ? "On" : "Off"}
                onPress={() => void handleStealthMode()}
                size="small"
              />
            </View>
          </AppCard>

          <Text style={[styles.actionsLabel, { color: tokens.colors.onSurface }]}>Actions</Text>
          <View style={styles.actionRow}>
            <ActionButton variant="secondary" label="Send message" onPress={() => {}} size="default" />
            <ActionButton variant="secondary" label="Send photo" onPress={() => {}} size="default" />
          </View>
          <ActionButton variant="secondary" label="Update alert type" onPress={() => {}} />

          <View style={styles.spacer} />

          <ActionButton
            variant="danger"
            label={isClosing ? "Closing..." : "Close session (confirm)"}
            onPress={() => void closeSession()}
            loading={isClosing}
            disabled={isClosing}
            size="large"
          />
          <View style={styles.statusHidden}>
            <StatusChip status={session.status} />
            <Text style={[styles.sessionId, { color: tokens.colors.onSurfaceMuted }]}>#{session.id.slice(0, 8)}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  radarWrap: {
    position: "absolute",
    top: 88,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  radarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md, marginTop: 120 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressBadge: {
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  progressText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 },
  activeTitle: { fontSize: 42, fontWeight: "800", letterSpacing: -0.8 },
  activeSub: { fontSize: 18 },
  mapCard: { padding: 0, overflow: "hidden" },
  mapArea: {
    height: 180,
    borderRadius: 16,
    backgroundColor: "#12254A",
    alignItems: "center",
    justifyContent: "center",
  },
  route: { width: 180, height: 9, borderRadius: 12, backgroundColor: "#89B9FF", marginTop: 30 },
  youDot: { width: 14, height: 14, borderRadius: 99, marginTop: 4 },
  youLabel: { marginTop: 4, fontSize: 14, fontWeight: "700" },
  stealthCard: { borderColor: "rgba(255,255,255,0.08)" },
  stealthRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  stealthCopy: { flex: 1, gap: 3 },
  stealthTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  stealthHint: { fontSize: 13, lineHeight: 19 },
  actionsLabel: { fontSize: 30, fontWeight: "700", letterSpacing: -0.45 },
  sessionId: { fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  telemetrySub: { fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: spacing.sm },
  spacer: { flex: 1 },
  statusHidden: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  emptyText: { fontSize: 15 },
});
