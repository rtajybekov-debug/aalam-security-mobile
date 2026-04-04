import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { UserStackParamList } from "../../navigation/types";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { emergencyApi } from "../../api/modules/emergency";
import { LoadingState } from "../../components/state/LoadingState";
import { ErrorState } from "../../components/state/ErrorState";
import { AppCard } from "../../components/ui/AppCard";
import { Divider } from "../../components/ui/Divider";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";

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

  const createdStr = new Date(item.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const closedStr = item.closedAt
    ? new Date(item.closedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: tokens.colors.onSurface }]}>Detail</Text>

        <AppCard style={styles.summaryCard}>
          <Text style={[styles.sectionTitle, { color: tokens.colors.onSurface }]}>Session Summary</Text>
          <InfoRow label="Date" value={createdStr} tokens={tokens} />
          <InfoRow label="Duration" value={item.closedAt ? "Closed" : "Active"} tokens={tokens} />
          <Text style={styles.statusText}>Status: {item.status}</Text>
        </AppCard>

        <AppCard style={styles.mapCard}>
          <View style={styles.mapFakeTrack}>
            <View style={[styles.mapDot, { left: "10%", backgroundColor: "#25D366" }]} />
            <View style={[styles.mapDot, { left: "86%", backgroundColor: "#F84F4F" }]} />
            <View style={styles.mapTrack} />
          </View>
        </AppCard>

        <Text style={[styles.timelineTitle, { color: tokens.colors.onSurface }]}>Event timeline</Text>
        <View style={styles.timelineList}>
          <Text style={[styles.timelineItem, { color: tokens.colors.onSurfaceMuted }]}>• Created - {createdStr}</Text>
          <Text style={[styles.timelineItem, { color: tokens.colors.onSurfaceMuted }]}>• Assigned - dispatch assigned</Text>
          <Text style={[styles.timelineItem, { color: tokens.colors.onSurfaceMuted }]}>• In progress - operator on site</Text>
          <Text style={[styles.timelineItem, { color: tokens.colors.onSurfaceMuted }]}>• Closed - {closedStr}</Text>
        </View>

        <AppCard>
          <Text style={[styles.sectionTitle, { color: tokens.colors.onSurface }]}>Assigned response team</Text>
          <Text style={[styles.resolutionText, { color: tokens.colors.onSurfaceMuted }]}>
            {item.resolution ?? "Response operator handled and completed the incident."}
          </Text>
          <Divider style={styles.divider} />
          <Text style={[styles.contact, { color: tokens.colors.primary }]}>Contact: +1 (555) 010-2281</Text>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: 12, paddingBottom: spacing.xl * 2 },
  pageTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2, marginBottom: 2 },
  summaryCard: { gap: 4 },
  statusText: { marginTop: 6, fontSize: 12, fontWeight: "700", color: "#22C55E" },
  mapCard: { padding: 0, overflow: "hidden" },
  mapFakeTrack: {
    height: 180,
    borderRadius: 16,
    backgroundColor: "#132347",
    position: "relative",
    justifyContent: "center",
  },
  mapTrack: {
    height: 10,
    width: "78%",
    marginLeft: "11%",
    borderRadius: 12,
    backgroundColor: "#7CB2FF",
  },
  mapDot: { position: "absolute", top: 54, width: 10, height: 10, borderRadius: 99 },
  timelineTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2, marginTop: 2 },
  timelineList: { gap: 7, marginBottom: 2 },
  timelineItem: { fontSize: 13, lineHeight: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  infoLabel: { fontSize: 13, fontWeight: "500" },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  divider: { marginVertical: spacing.xs },
  resolutionText: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  contact: { fontSize: 13, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { fontSize: 15 },
});
