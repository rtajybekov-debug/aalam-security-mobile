import React from "react";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { UserStackParamList, UserTabParamList } from "../../navigation/types";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { emergencyApi } from "../../api/modules/emergency";
import { SkeletonList } from "../../components/state/SkeletonList";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import { AppCard } from "../../components/ui/AppCard";
import { StatusChip } from "../../components/ui/StatusChip";
import { useAppTheme } from "../../theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, "History">,
  NativeStackScreenProps<UserStackParamList>
>;

export const UserEmergencyHistoryScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const query = usePaginatedList({
    queryKey: ["user-history"],
    limit: 20,
    fetcher: emergencyApi.getHistory,
  });

  if (query.isLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <SkeletonList />
      </SafeAreaView>
    );
  }

  if (query.isError) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <ErrorState
          title="Unable to load history"
          message="We could not fetch your sessions right now."
          retryLabel="Reload history"
          onRetry={() => void query.refetch()}
        />
      </SafeAreaView>
    );
  }

  const data = query.data?.pages.flatMap((page) => page.data) ?? [];

  if (data.length === 0) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <EmptyState
          title="No history yet"
          subtitle="Resolved emergency sessions will appear here after your first incident."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: tokens.colors.onSurface }]}>
          Emergency History
        </Text>
        <Text style={[styles.pageSubtitle, { color: tokens.colors.onSurfaceMuted }]}>
          {data.length} past session{data.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AppCard
            compact
            onPress={() => navigation.navigate("UserEmergencyDetails", { sessionId: item.id })}
          >
            <View style={styles.cardRow}>
              <StatusChip status={item.status} />
              <Text style={[styles.dateText, { color: tokens.colors.onSurfaceMuted }]}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <Text
              style={[styles.resolution, { color: tokens.colors.onSurfaceMuted }]}
              numberOfLines={2}
            >
              {item.resolution ?? "No resolution note."}
            </Text>
          </AppCard>
        )}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  pageHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 2 },
  pageTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 13 },
  list: { padding: 16, gap: 10 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: { fontSize: 12, fontWeight: "500" },
  resolution: { fontSize: 13, lineHeight: 18 },
});
