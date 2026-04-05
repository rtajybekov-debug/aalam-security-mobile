import React, { useCallback } from "react";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserTabBarBottomInset } from "../../navigation/userTabBarLayout";
import { UserStackParamList, UserTabParamList } from "../../navigation/types";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { emergencyApi } from "../../api/modules/emergency";
import { SkeletonList } from "../../components/state/SkeletonList";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import { AppCard } from "../../components/ui/AppCard";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";
import type { EmergencySession } from "../../types/emergency";

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, "History">,
  NativeStackScreenProps<UserStackParamList>
>;

const HistoryCard = React.memo(function HistoryCard({
  item,
  tokens,
  onPress,
}: {
  item: EmergencySession;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
  onPress: () => void;
}) {
  const created = new Date(item.createdAt);
  const yyyy = created.getFullYear();
  const mm = String(created.getMonth() + 1).padStart(2, "0");
  const dd = String(created.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const headline =
    item.resolution?.trim() ||
    (item.status === "CLOSED"
      ? "Incident closed"
      : item.status === "IN_PROGRESS"
        ? "SOS triggered and being handled"
        : item.status === "ASSIGNED"
          ? "Operator assigned to emergency"
          : "Manual panic trigger");

  const meta =
    item.status === "CLOSED" && item.closedAt
      ? (() => {
          const closed = new Date(item.closedAt);
          const diffMin = Math.max(1, Math.round((closed.getTime() - created.getTime()) / 60000));
          return `Assigned and closed in ${diffMin}m`;
        })()
      : item.status === "ASSIGNED"
        ? "Operator assigned · follow-up pending"
        : item.status === "IN_PROGRESS"
          ? "Tap to view session timeline"
          : "No responder action recorded";

  return (
    <AppCard compact onPress={onPress} style={styles.historyCard}>
      <Text style={[styles.dateAndStatus, { color: tokens.status[item.status].border }]}>
        {dateStr} · {item.status}
      </Text>
      <Text style={[styles.headline, { color: tokens.colors.onSurface }]} numberOfLines={2}>
        {headline}
      </Text>
      <Text style={[styles.meta, { color: tokens.colors.onSurfaceMuted }]} numberOfLines={1}>
        {meta}
      </Text>
    </AppCard>
  );
});

export const UserEmergencyHistoryScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const tabBarBottomInset = useUserTabBarBottomInset();
  const insets = useSafeAreaInsets();
  const query = usePaginatedList({
    queryKey: ["user-history"],
    limit: 20,
    fetcher: emergencyApi.getHistory,
  });
  const { refetch, isRefetching } = query;

  const renderItem = useCallback<ListRenderItem<EmergencySession>>(
    ({ item }) => (
      <HistoryCard
        item={item}
        tokens={tokens}
        onPress={() => navigation.navigate("UserEmergencyDetails", { sessionId: item.id })}
      />
    ),
    [navigation, tokens],
  );

  const keyExtractor = useCallback((item: EmergencySession) => item.id, []);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const refreshControl = (
    <RefreshControl
      refreshing={isRefetching}
      onRefresh={onRefresh}
      tintColor={tokens.colors.primary}
      colors={[tokens.colors.primary]}
    />
  );

  const rootStyle = [styles.root, { backgroundColor: tokens.colors.background, paddingBottom: tabBarBottomInset }];

  if (query.isLoading) {
    return (
      <SafeAreaView style={rootStyle}>
        <SkeletonList />
      </SafeAreaView>
    );
  }

  if (query.isError) {
    return (
      <SafeAreaView style={rootStyle}>
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
      <SafeAreaView style={rootStyle}>
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <EmptyState
            title="No history yet"
            subtitle="Resolved emergency sessions will appear here after your first incident."
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={[styles.pageHeader, { paddingTop: Math.max(spacing.lg, insets.top + 8) }]}>
        <Text style={[styles.pageTitle, { color: tokens.colors.onSurface }]}>
          Emergency History
        </Text>
        <Text style={[styles.pageSubtitle, { color: tokens.colors.onSurfaceMuted }]}>
          Tap an item to open details
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarBottomInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        renderItem={renderItem}
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
  emptyScroll: { flexGrow: 1 },
  pageHeader: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 2 },
  pageTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 13, fontWeight: "500" },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.lg, gap: 10 },
  historyCard: { borderRadius: 16, padding: 14 },
  dateAndStatus: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.25 },
  headline: { fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 2 },
  meta: { fontSize: 12, fontWeight: "500" },
});
