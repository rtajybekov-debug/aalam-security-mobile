import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { UserStackParamList } from "../../navigation/types";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { emergencyApi } from "../../api/modules/emergency";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import { AppCard } from "../../components/ui/AppCard";
import { StatusChip } from "../../components/ui/StatusChip";
import { Divider } from "../../components/ui/Divider";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<UserStackParamList, "UserEmergencyDetails">;

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

export const UserEmergencyDetailsScreen = ({ route }: Props) => {
  const { tokens } = useAppTheme();
  const { sessionId } = route.params;
  const query = usePaginatedList({
    queryKey: ["user-history-details"],
    limit: 100,
    fetcher: emergencyApi.getHistory,
  });

  if (query.isLoading) return <LoadingState label="Loading details..." />;
  if (query.isError) {
    return (
      <ErrorState title="Failed to load details" onRetry={() => void query.refetch()} />
    );
  }

  const data = query.data?.pages.flatMap((page) => page.data) ?? [];
  const item = data.find((session) => session.id === sessionId);

  if (!item) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: tokens.colors.onSurfaceMuted }]}>
            Session not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Session Details</Text>
          <StatusChip status={item.status} />
        </View>

        <AppCard>
          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            SESSION INFO
          </Text>
          <InfoRow label="ID" value={`#${item.id.slice(0, 8)}…`} tokens={tokens} />
          <Divider style={styles.divider} />
          <InfoRow
            label="Created"
            value={new Date(item.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            tokens={tokens}
          />
          <Divider style={styles.divider} />
          <InfoRow
            label="Closed"
            value={
              item.closedAt
                ? new Date(item.closedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"
            }
            tokens={tokens}
          />
        </AppCard>

        {item.resolution ? (
          <AppCard>
            <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
              RESOLUTION
            </Text>
            <Text style={[styles.resolutionText, { color: tokens.colors.onSurface }]}>
              {item.resolution}
            </Text>
          </AppCard>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 16 },
  titleWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  infoLabel: { fontSize: 13, fontWeight: "500" },
  infoValue: { fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1, marginLeft: 12 },
  divider: { marginVertical: 6 },
  resolutionText: { fontSize: 14, lineHeight: 22 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { fontSize: 15 },
});
