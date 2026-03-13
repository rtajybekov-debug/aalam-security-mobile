import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { OperatorStackParamList } from "../../navigation/types";
import { useOperatorStore } from "../../stores/operatorStore";
import { dispatchApi } from "../../api/modules/dispatch";
import { AppCard } from "../../components/ui/AppCard";
import { StatusChip } from "../../components/ui/StatusChip";
import { ActionButton } from "../../components/ui/ActionButton";
import { Divider } from "../../components/ui/Divider";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<OperatorStackParamList, "OperatorSessionDetails">;

const InfoRow = ({
  label,
  value,
  tokens,
}: {
  label: string;
  value: string;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
}) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: tokens.colors.onSurfaceMuted }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: tokens.colors.onSurface }]}>{value}</Text>
  </View>
);

export const OperatorSessionDetailsScreen = ({ route, navigation }: Props) => {
  const { tokens } = useAppTheme();
  const selected = useOperatorStore((state) => state.selectedSession);
  const setSelected = useOperatorStore((state) => state.setSelectedSession);
  const session = selected?.id === route.params.sessionId ? selected : null;
  const [isMutating, setIsMutating] = React.useState(false);

  const call = async (handler: () => Promise<unknown>) => {
    try {
      setIsMutating(true);
      await handler();
      toastBus.show({ message: "Session updated.", severity: "success" });
    } catch {
      toastBus.show({ message: "Failed to update session.", severity: "error" });
    } finally {
      setIsMutating(false);
    }
  };

  if (!session) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: tokens.colors.onSurfaceMuted }]}>
            No session selected.
          </Text>
          <ActionButton variant="secondary" label="Go back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Session Details</Text>
          <StatusChip status={session.status} />
        </View>

        {/* Session info */}
        <AppCard>
          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            INFO
          </Text>
          <InfoRow label="Session ID" value={`#${session.id.slice(0, 8)}…`} tokens={tokens} />
          <Divider style={styles.divider} />
          <InfoRow label="User" value={session.user?.email ?? "—"} tokens={tokens} />
          <Divider style={styles.divider} />
          <InfoRow
            label="Created"
            value={new Date(session.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            tokens={tokens}
          />
        </AppCard>

        {/* Actions */}
        <AppCard>
          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            ACTIONS
          </Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              label="Start Progress"
              loading={isMutating}
              disabled={isMutating || session.status !== "ASSIGNED"}
              variant="secondary"
              onPress={() =>
                void call(async () => {
                  const updated = await dispatchApi.startProgress(session.id);
                  setSelected(updated);
                })
              }
              accessibilityLabel="Start progress"
            />
            <ActionButton
              variant="secondary"
              label="View Live Map"
              onPress={() => navigation.navigate("OperatorLiveMap", { sessionId: session.id })}
            />
            <ActionButton
              variant="danger"
              label="Resolve Session"
              disabled={isMutating}
              onPress={() => navigation.navigate("OperatorResolveModal", { sessionId: session.id })}
              accessibilityLabel="Resolve emergency session"
            />
          </View>
        </AppCard>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 16 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: { fontSize: 13, fontWeight: "500" },
  infoValue: { fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1, marginLeft: 12 },
  divider: { marginVertical: 6 },
  actionsGrid: { gap: 10 },
  actionRow: { flexDirection: "row", gap: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 24 },
  emptyText: { fontSize: 15 },
});
