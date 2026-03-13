import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOperatorStore } from "../../stores/operatorStore";
import { useWebsocketStore } from "../../stores/websocketStore";
import { useAppTheme } from "../../theme";

export const OperatorHeartbeatStatusScreen = () => {
  const heartbeatLastSentAt = useOperatorStore((state) => state.heartbeatLastSentAt);
  const connected = useWebsocketStore((state) => state.connected);
  const reconnecting = useWebsocketStore((state) => state.reconnecting);
  const { tokens } = useAppTheme();
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const status = reconnecting ? "reconnecting" : connected ? "connected" : "disconnected";
  const statusColor =
    status === "connected"
      ? tokens.colors.success
      : status === "reconnecting"
        ? tokens.colors.warning
        : tokens.colors.danger;

  const toAgeSec = (iso: string | null) => {
    if (!iso) return null;
    const parsed = Date.parse(iso);
    return Number.isNaN(parsed) ? null : Math.max(0, Math.floor((now - parsed) / 1000));
  };

  const heartbeatAge = toAgeSec(heartbeatLastSentAt);
  const freshness = heartbeatAge === null ? "unknown" : heartbeatAge <= 30 ? "fresh" : heartbeatAge <= 90 ? "aging" : "stale";

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.label, { color: tokens.colors.onSurface }]}>WS: {status}</Text>
      {freshness !== "fresh" && freshness !== "unknown" ? (
        <Text style={[styles.label, { color: tokens.colors.warning }]}>HB: {freshness}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 11, fontWeight: "600" },
});
