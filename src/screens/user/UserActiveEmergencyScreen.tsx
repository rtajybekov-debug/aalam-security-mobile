import React, { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { UserStackParamList } from "../../navigation/types";
import { useEmergencyStore } from "../../stores/emergencyStore";
import { emergencyApi } from "../../api/modules/emergency";
import { ActionButton } from "../../components/ui/ActionButton";
import { StatusChip } from "../../components/ui/StatusChip";
import { AppCard } from "../../components/ui/AppCard";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<UserStackParamList, "UserActiveEmergency">;

export const UserActiveEmergencyScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const session = useEmergencyStore((state) => state.activeSession);
  const isSendingLocation = useEmergencyStore((state) => state.isSendingLocation);
  const lastLocationSentAt = useEmergencyStore((state) => state.lastLocationSentAt);
  const setActiveSession = useEmergencyStore((state) => state.setActiveSession);
  const [nowMs, setNowMs] = React.useState(Date.now());
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const timerText = useMemo(() => {
    if (!session?.createdAt) return "--:--";
    const elapsed = nowMs - new Date(session.createdAt).getTime();
    const totalSec = Math.max(0, Math.floor(elapsed / 1000));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [nowMs, session?.createdAt]);

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
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      {/* Danger banner */}
      <View style={[styles.banner, { backgroundColor: tokens.colors.danger }]}>
        <Text style={styles.bannerText}>🚨  SOS ACTIVE</Text>
        <Text style={styles.bannerSub}>Help has been notified</Text>
      </View>

      <View style={styles.content}>
        {/* Status */}
        <View style={styles.row}>
          <StatusChip status={session.status} />
          <Text style={[styles.sessionId, { color: tokens.colors.onSurfaceMuted }]}>
            #{session.id.slice(0, 8)}
          </Text>
        </View>

        {/* Timer card */}
        <View
          style={[
            styles.timerCard,
            { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border },
          ]}
        >
          <Text style={[styles.timerLabel, { color: tokens.colors.onSurfaceMuted }]}>
            ELAPSED TIME
          </Text>
          <Text style={[styles.timerValue, { color: tokens.colors.onSurface }]}>{timerText}</Text>
        </View>

        {/* Telemetry */}
        <AppCard>
          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            LIVE TRACKING
          </Text>
          <View style={styles.telemetryRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isSendingLocation ? tokens.colors.success : tokens.colors.border },
              ]}
            />
            <Text style={[styles.telemetryText, { color: tokens.colors.onSurface }]}>
              {isSendingLocation ? "Sending location..." : "Location idle"}
            </Text>
          </View>
          {lastLocationSentAt ? (
            <Text style={[styles.telemetrySub, { color: tokens.colors.onSurfaceMuted }]}>
              Last ping: {lastLocationSentAt}
            </Text>
          ) : null}
        </AppCard>

        <View style={styles.spacer} />

        {/* Close button */}
        <ActionButton
          variant="danger"
          label={isClosing ? "Closing..." : "Close SOS Session"}
          onPress={() => void closeSession()}
          loading={isClosing}
          disabled={isClosing}
          size="large"
          accessibilityLabel="Close active SOS session"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 2,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },
  content: { flex: 1, padding: 20, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sessionId: { fontSize: 12, fontFamily: "monospace" },
  timerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  telemetryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  telemetryText: { fontSize: 14, fontWeight: "600" },
  telemetrySub: { fontSize: 12, marginTop: 4, marginLeft: 16 },
  spacer: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 24 },
  emptyText: { fontSize: 15 },
});
