import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import { UserStackParamList } from "../../navigation/types";
import { useEmergencyStore } from "../../stores/emergencyStore";
import { emergencyApi } from "../../api/modules/emergency";
import { toastBus } from "../../ui/feedback/toastBus";
import { fonts } from "../../theme/fonts";
import {
  getBrightnessAsync,
  isBrightnessAvailable,
  requestBrightnessPermissionsAsync,
  setBrightnessAsync,
} from "../../utils/brightness";
import { ru } from "../../locale/ru";

type Props = NativeStackScreenProps<UserStackParamList, "UserActiveEmergency">;

/** Pencil "Emergency - Active Session" — Space Mono approximated */
const mono = Platform.select({ ios: "Menlo", default: "monospace" }) ?? "monospace";

const PEN = {
  bg: "#0A0A0A",
  mapGradStart: "#0F172A",
  mapGradEnd: "#1E293B",
  lime: "#C4F82A",
  lime2: "#84CC16",
  callText: "#0A0A0A",
  chipBg: "#7C2D12",
  chipFg: "#FDBA74",
  muted: "#A1A1AA",
  stealthSurface: "#18181B",
  stealthBorder: "#27272A",
  stealthSub: "#71717A",
  actionFill: "#18181B",
  actionStroke: "#27272A",
  closeFill: "#3F1D1D",
  closeText: "#FCA5A5",
  noteFill: "#111827",
  noteStroke: "#374151",
  noteText: "#93C5FD",
  flow: "#52525B",
  routeBlue: "#93C5FD",
  pillOn: "#22C55E",
  pillOnText: "#052E16",
  pillOffBg: "#27272A",
  pillOffText: "#A1A1AA",
} as const;

function useElapsedTicker(createdAtIso: string | null): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!createdAtIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [createdAtIso]);
  if (!createdAtIso) return "00:00:00";
  const start = new Date(createdAtIso).getTime();
  const sec = Math.max(0, Math.floor((now - start) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const UserActiveEmergencyScreen = ({ navigation }: Props) => {
  const session = useEmergencyStore((state) => state.activeSession);
  const setActiveSession = useEmergencyStore((state) => state.setActiveSession);
  const isSendingLocation = useEmergencyStore((state) => state.isSendingLocation);
  const lastLocationSentAt = useEmergencyStore((state) => state.lastLocationSentAt);

  const [isClosing, setIsClosing] = useState(false);
  const [stealthOn, setStealthOn] = useState(false);
  const originalBrightnessRef = useRef(1);

  const elapsed = useElapsedTicker(session?.createdAt ?? null);

  const handleStealthMode = async () => {
    if (!isBrightnessAvailable()) {
      toastBus.show({
        message: ru.userActiveEmergency.stealthBrightnessDev,
        severity: "info",
      });
      return;
    }
    if (stealthOn) {
      try {
        await setBrightnessAsync(originalBrightnessRef.current);
      } catch {
        /* ignore */
      }
      setStealthOn(false);
    } else {
      try {
        const { status } = await requestBrightnessPermissionsAsync();
        if (status !== "granted") {
          toastBus.show({ message: ru.userActiveEmergency.stealthPermission, severity: "warning" });
          return;
        }
        const current = await getBrightnessAsync();
        originalBrightnessRef.current = current;
        await setBrightnessAsync(0);
        setStealthOn(true);
        toastBus.show({ message: ru.userActiveEmergency.stealthOn, severity: "info" });
      } catch {
        toastBus.show({ message: ru.userActiveEmergency.brightnessFail, severity: "warning" });
      }
    }
  };

  const handleCallDispatch = () => {
    void Linking.openURL("tel:112");
  };

  const closeSession = useCallback(async () => {
    if (!session?.id) return;
    setIsClosing(true);
    try {
      await emergencyApi.close(session.id);
      setActiveSession(null);
      toastBus.show({ message: ru.userActiveEmergency.closedOk, severity: "success" });
      navigation.navigate("UserTabs");
    } catch {
      toastBus.show({ message: ru.userActiveEmergency.closeFail, severity: "error" });
    } finally {
      setIsClosing(false);
    }
  }, [navigation, session?.id, setActiveSession]);

  const confirmClose = () => {
    Alert.alert(
      ru.userActiveEmergency.closeConfirmTitle,
      ru.userActiveEmergency.closeConfirmMsg,
      [
        { text: ru.userActiveEmergency.closeCancel, style: "cancel" },
        {
          text: ru.userActiveEmergency.alertDestructiveClose,
          style: "destructive",
          onPress: () => void closeSession(),
        },
      ],
    );
  };

  if (!session) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: PEN.bg }]} edges={["top", "bottom"]}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { fontFamily: fonts.spaceGroteskBold }]}>
            {ru.userActiveEmergency.noSession}
          </Text>
          <Text style={[styles.emptySub, { fontFamily: fonts.manropeMedium }]}>
            {ru.userActiveEmergency.noSessionSub}
          </Text>
          <Pressable
            onPress={() => navigation.navigate("UserTabs")}
            style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={[styles.emptyBtnText, { fontFamily: fonts.manropeSemiBold }]}>{ru.userOrg.goHome}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: PEN.bg }]} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={ru.userActiveEmergency.goBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <ChevronLeft size={28} color={PEN.muted} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.headerRow}>
          <Text style={[styles.title, { fontFamily: fonts.spaceGroteskBold }]}>{ru.userActiveEmergency.title}</Text>
          <View style={styles.statusChip}>
            <Text style={[styles.statusChipText, { fontFamily: mono }]}>
              {ru.emergencyStatus[session.status as keyof typeof ru.emergencyStatus] ?? session.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.elapsed, { fontFamily: mono }]}>
          {ru.userActiveEmergency.elapsed}
          {elapsed}
        </Text>

        <LinearGradient
          colors={[PEN.mapGradStart, PEN.mapGradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mapCard}
        >
          <View style={styles.mapInner}>
            <View style={[styles.youDot, { backgroundColor: PEN.lime }]} />
            <Text style={[styles.youLabel, { fontFamily: mono, color: PEN.lime }]}>{ru.userActiveEmergency.you}</Text>
            <View style={[styles.routeBar, { backgroundColor: PEN.routeBlue }]} />
          </View>
        </LinearGradient>

        <Pressable
          onPress={handleCallDispatch}
          style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
        >
          <LinearGradient
            colors={[PEN.lime, PEN.lime2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.callSupport}
          >
            <Text style={[styles.callSupportText, { fontFamily: fonts.spaceGroteskBold }]}>
              {ru.userActiveEmergency.callSupport}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={[styles.stealthCard, { borderColor: PEN.stealthBorder }]}>
          <View style={styles.stealthTop}>
            <Text style={[styles.stealthTitle, { fontFamily: fonts.manropeSemiBold }]}>
              {ru.userActiveEmergency.stealth}
            </Text>
            <Pressable
              onPress={() => void handleStealthMode()}
              style={[
                styles.stealthPill,
                { backgroundColor: stealthOn ? PEN.pillOn : PEN.pillOffBg },
              ]}
            >
              <Text
                style={[
                  styles.stealthPillText,
                  { fontFamily: mono, color: stealthOn ? PEN.pillOnText : PEN.pillOffText },
                ]}
              >
                {stealthOn ? ru.userActiveEmergency.pillOn : ru.userActiveEmergency.pillOff}
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.stealthSub, { fontFamily: fonts.manropeMedium }]}>
            {ru.userActiveEmergency.stealthSub}
            {isSendingLocation ? ru.userActiveEmergency.stealthLocationShare : ""}
          </Text>
          {lastLocationSentAt ? (
            <Text style={[styles.lastPing, { fontFamily: mono }]}>
              {ru.userActiveEmergency.lastPingPrefix}
              {lastLocationSentAt}
            </Text>
          ) : null}
        </View>

        <View style={styles.actionsBlock}>
          <Text style={[styles.actionsTitle, { fontFamily: fonts.spaceGroteskBold }]}>
            {ru.userActiveEmergency.actions}
          </Text>
          <View style={styles.actionStack}>
            <Pressable
              onPress={() =>
                toastBus.show({ message: ru.userActiveEmergency.comingMessage, severity: "info" })
              }
              style={({ pressed }) => [styles.actionBtn, { borderColor: PEN.actionStroke }, pressed && { opacity: 0.88 }]}
            >
              <Text style={[styles.actionBtnText, { fontFamily: fonts.manropeSemiBold }]}>
                {ru.userActiveEmergency.sendMessage}
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                toastBus.show({ message: ru.userActiveEmergency.comingPhoto, severity: "info" })
              }
              style={({ pressed }) => [styles.actionBtn, { borderColor: PEN.actionStroke }, pressed && { opacity: 0.88 }]}
            >
              <Text style={[styles.actionBtnText, { fontFamily: fonts.manropeSemiBold }]}>
                {ru.userActiveEmergency.sendPhoto}
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                toastBus.show({ message: ru.userActiveEmergency.comingType, severity: "info" })
              }
              style={({ pressed }) => [styles.actionBtn, { borderColor: PEN.actionStroke }, pressed && { opacity: 0.88 }]}
            >
              <Text style={[styles.actionBtnText, { fontFamily: fonts.manropeSemiBold }]}>
                {ru.userActiveEmergency.updateType}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={confirmClose}
          disabled={isClosing}
          style={({ pressed }) => [
            styles.closeBtn,
            { backgroundColor: PEN.closeFill },
            pressed && { opacity: 0.9 },
            isClosing && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.closeBtnText, { fontFamily: fonts.spaceGroteskBold }]}>
            {isClosing ? ru.userActiveEmergency.closing : ru.userActiveEmergency.closeSessionCta}
          </Text>
        </Pressable>

        <View style={[styles.noteCard, { backgroundColor: PEN.noteFill, borderColor: PEN.noteStroke }]}>
          <Text style={[styles.noteText, { fontFamily: fonts.manropeMedium, color: PEN.noteText }]}>
            {ru.userActiveEmergency.noteConfirm}
          </Text>
        </View>

        <Text style={[styles.flowText, { fontFamily: mono, color: PEN.flow }]}>
          {ru.userActiveEmergency.statusFlowShort}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 4,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: -4,
    paddingVertical: 4,
    marginLeft: -4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  statusChip: {
    backgroundColor: PEN.chipBg,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: PEN.chipFg,
  },
  elapsed: {
    fontSize: 13,
    fontWeight: "600",
    color: PEN.muted,
    marginTop: -4,
  },
  mapCard: {
    borderRadius: 16,
    height: 220,
    width: "100%",
    overflow: "hidden",
    marginTop: 4,
  },
  mapInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  youDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  youLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  routeBar: {
    width: "56%",
    maxWidth: 200,
    height: 10,
    borderRadius: 12,
    marginTop: 14,
    opacity: 0.95,
  },
  callSupport: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  callSupportText: {
    fontSize: 18,
    fontWeight: "700",
    color: PEN.callText,
  },
  stealthCard: {
    backgroundColor: PEN.stealthSurface,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
    width: "100%",
  },
  stealthTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  stealthTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stealthPill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  stealthPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stealthSub: {
    fontSize: 12,
    fontWeight: "500",
    color: PEN.stealthSub,
  },
  lastPing: {
    fontSize: 11,
    fontWeight: "600",
    color: PEN.stealthSub,
    marginTop: 2,
  },
  actionsBlock: {
    gap: 8,
    width: "100%",
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionStack: {
    gap: 8,
    width: "100%",
  },
  actionBtn: {
    backgroundColor: PEN.actionFill,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: PEN.closeText,
  },
  noteCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
  },
  flowText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    color: PEN.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: PEN.stealthSurface,
    borderWidth: 1,
    borderColor: PEN.stealthBorder,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
