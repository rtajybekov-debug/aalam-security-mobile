import React from "react";
import { useEffect } from "react";
import * as Location from "expo-location";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { OperatorStackParamList, OperatorTabParamList, RootStackParamList } from "../../navigation/types";
import { useOperatorStore } from "../../stores/operatorStore";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { dispatchApi } from "../../api/modules/dispatch";
import { OperatorHeartbeatStatusScreen } from "./OperatorHeartbeatStatusScreen";
import { SkeletonList } from "../../components/state/SkeletonList";
import { ErrorState } from "../../components/state/ErrorState";
import { EmptyState } from "../../components/state/EmptyState";
import { StatusChip } from "../../components/ui/StatusChip";
import { ActionButton } from "../../components/ui/ActionButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../theme";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { EmergencySession } from "../../types/emergency";
import { toastBus } from "../../ui/feedback/toastBus";
import { useWebsocketStore } from "../../stores/websocketStore";
import { ENV } from "../../config/env";
import { ru } from "../../locale/ru";

type Props = CompositeScreenProps<
  BottomTabScreenProps<OperatorTabParamList, "Dashboard">,
  NativeStackScreenProps<OperatorStackParamList>
>;
type MarkerItem = { session: EmergencySession; latitude: number; longitude: number };

interface SessionListItemProps {
  item: EmergencySession;
  tokens: ReturnType<typeof useAppTheme>["tokens"];
  highlighted: boolean;
  onFocus: (session: EmergencySession) => void;
  onDetails: (session: EmergencySession) => void;
  onLiveMap: (session: EmergencySession) => void;
}

const SessionListItem = React.memo(
  ({ item, tokens, highlighted, onFocus, onDetails, onLiveMap }: SessionListItemProps) => (
    <Pressable
      onPress={() => onFocus(item)}
      style={[
        styles.sessionCard,
        {
          backgroundColor: highlighted ? tokens.colors.primary + "10" : tokens.colors.surface,
          borderColor: highlighted ? tokens.colors.primary : tokens.colors.border,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <StatusChip status={item.status} />
        <Text style={[styles.cardTime, { color: tokens.colors.onSurfaceMuted }]}>
          {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
      <Text style={[styles.cardEmail, { color: tokens.colors.onSurface }]} numberOfLines={1}>
        {item.user?.email ?? ru.operatorScreens.unknownUser}
      </Text>
      <View style={styles.cardActions}>
        <ActionButton variant="secondary" size="small" label={ru.operatorScreens.details} onPress={() => onDetails(item)} />
        <ActionButton variant="secondary" size="small" label={ru.operatorScreens.liveMapShort} onPress={() => onLiveMap(item)} />
      </View>
    </Pressable>
  ),
);
SessionListItem.displayName = "SessionListItem";

const DEFAULT_REGION = {
  latitude: 42.8746,
  longitude: 74.5698,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export const OperatorDashboardScreen = ({ navigation }: Props) => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tokens } = useAppTheme();
  const mapRef = React.useRef<MapView | null>(null);
  const listRef = React.useRef<FlatList<EmergencySession> | null>(null);
  const prevLastEventAt = React.useRef<string | null>(null);
  const setSelectedSession = useOperatorStore((state) => state.setSelectedSession);
  const selectedSession = useOperatorStore((state) => state.selectedSession);
  const highlightedSessionId = useOperatorStore((state) => state.highlightedSessionId);
  const setHighlightedSessionId = useOperatorStore((state) => state.setHighlightedSessionId);
  const activeSessionsById = useOperatorStore((state) => state.activeSessionsById);
  const liveLocationsBySessionId = useOperatorStore((state) => state.liveLocationsBySessionId);
  const upsertActiveSession = useOperatorStore((state) => state.upsertActiveSession);
  const lastEventAt = useWebsocketStore((state) => state.lastEventAt);
  const query = usePaginatedList({
    queryKey: ["operator-active"],
    limit: 20,
    fetcher: dispatchApi.active,
  });
  const [isPanelExpanded, setIsPanelExpanded] = React.useState(true);
  const [operatorLocation, setOperatorLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const hasMapKey = Platform.OS === "ios" ? Boolean(ENV.mapsApiKeyIos) : Boolean(ENV.mapsApiKeyAndroid);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });
      if (!cancelled) setOperatorLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    })();
    return () => { cancelled = true; };
  }, []);

  const restData = React.useMemo(() => query.data?.pages.flatMap((p) => p.data) ?? [], [query.data]);
  React.useEffect(() => {
    restData.forEach((session) => upsertActiveSession(session));
  }, [restData, upsertActiveSession]);

  const socketData = React.useMemo(() => Object.values(activeSessionsById), [activeSessionsById]);
  const data = React.useMemo(
    () => (socketData.length ? socketData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : restData),
    [restData, socketData],
  );

  const markerItems = React.useMemo<MarkerItem[]>(
    () =>
      data
        .map((session) => {
          const live = liveLocationsBySessionId[session.id];
          const fallback = session.locations?.[session.locations.length - 1];
          const loc = live ?? fallback;
          if (!loc) return null;
          return { session, latitude: loc.latitude, longitude: loc.longitude };
        })
        .filter((item): item is MarkerItem => item !== null),
    [data, liveLocationsBySessionId],
  );

  React.useEffect(() => {
    if (!lastEventAt || lastEventAt === prevLastEventAt.current) return;
    prevLastEventAt.current = lastEventAt;
    toastBus.show({ message: ru.operator.queueUpdated, severity: "info", duration: 1400 });
  }, [lastEventAt]);

  const focusSession = React.useCallback(
    (session: EmergencySession) => {
      setSelectedSession(session);
      setHighlightedSessionId(session.id);
      const idx = data.findIndex((item) => item.id === session.id);
      if (idx >= 0) listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.4 });
      const marker = markerItems.find((m) => m.session.id === session.id);
      if (marker) {
        mapRef.current?.animateToRegion(
          { latitude: marker.latitude, longitude: marker.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
          350,
        );
      }
    },
    [data, markerItems, setHighlightedSessionId, setSelectedSession],
  );

  const fitAll = React.useCallback(() => {
    const coords = markerItems.map((m) => ({ latitude: m.latitude, longitude: m.longitude }));
    if (operatorLocation) coords.push(operatorLocation);
    if (coords.length === 0) return;
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 130, right: 48, bottom: 240, left: 48 },
      animated: true,
    });
  }, [markerItems, operatorLocation]);

  const centerOnMe = React.useCallback(() => {
    if (operatorLocation) {
      mapRef.current?.animateToRegion(
        { ...operatorLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        350,
      );
    }
  }, [operatorLocation]);

  const centerSelected = React.useCallback(() => {
    if (selectedSession) { focusSession(selectedSession); return; }
    if (operatorLocation) { centerOnMe(); return; }
    if (markerItems[0]) {
      mapRef.current?.animateToRegion(
        { latitude: markerItems[0].latitude, longitude: markerItems[0].longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        350,
      );
    }
  }, [focusSession, markerItems, selectedSession, operatorLocation, centerOnMe]);

  const markerColor = React.useCallback(
    (status: EmergencySession["status"]) => {
      if (status === "NEW") return tokens.status.NEW.border;
      if (status === "ASSIGNED") return tokens.status.ASSIGNED.border;
      return tokens.status.IN_PROGRESS.border;
    },
    [tokens.status],
  );

  const onOpenDetails = React.useCallback(
    (session: EmergencySession) => {
      setSelectedSession(session);
      navigation.navigate("OperatorSessionDetails", { sessionId: session.id });
    },
    [navigation, setSelectedSession],
  );

  const onOpenLiveMap = React.useCallback(
    (session: EmergencySession) => {
      setSelectedSession(session);
      navigation.navigate("OperatorLiveMap", { sessionId: session.id });
    },
    [navigation, setSelectedSession],
  );

  const renderSessionItem = React.useCallback(
    ({ item }: ListRenderItemInfo<EmergencySession>) => (
      <SessionListItem
        item={item}
        tokens={tokens}
        highlighted={highlightedSessionId === item.id}
        onFocus={focusSession}
        onDetails={onOpenDetails}
        onLiveMap={onOpenLiveMap}
      />
    ),
    [focusSession, highlightedSessionId, onOpenDetails, onOpenLiveMap, tokens],
  );

  if (query.isLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.fullscreen}>
          <MapView provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFill} initialRegion={DEFAULT_REGION} />
          <View style={styles.loadingOverlay}>
            <SkeletonList count={3} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (query.isError) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.fullscreen}>
          <MapView provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFill} initialRegion={DEFAULT_REGION} />
          <View style={styles.errorOverlay}>
            <ErrorState
              title={ru.operatorScreens.loadSessionsFail}
              message={ru.operatorScreens.loadSessionsMsg}
              retryLabel={ru.operatorScreens.reloadQueue}
              onRetry={() => void query.refetch()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.fullscreen}>
        {/* No-map warning */}
        {!hasMapKey ? (
          <View style={[styles.errorOverlay, { backgroundColor: tokens.colors.background }]}>
            <ErrorState
              title={ru.operatorScreens.mapNotConfigured}
              message={ru.operatorScreens.mapKeyHint}
            />
          </View>
        ) : null}

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          pointerEvents={hasMapKey ? "auto" : "none"}
          showsUserLocation={!!operatorLocation}
          initialRegion={
            markerItems[0]
              ? { latitude: markerItems[0].latitude, longitude: markerItems[0].longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }
              : operatorLocation
                ? { ...operatorLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
                : DEFAULT_REGION
          }
        >
          {markerItems.map((item) => (
            <Marker
              key={item.session.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              pinColor={markerColor(item.session.status)}
              title={item.session.user?.email ?? ru.operatorScreens.markerEmergency}
              description={`${item.session.status} • ${new Date(item.session.createdAt).toLocaleTimeString()}`}
              onPress={() => focusSession(item.session)}
            />
          ))}
        </MapView>

        {/* Top overlay */}
        <View style={styles.topBar}>
          <View
            style={[styles.topCard, { backgroundColor: tokens.colors.surface + "F0", borderColor: tokens.colors.border }]}
          >
            <View style={styles.topCardRow}>
              <Text style={[styles.mapTitle, { color: tokens.colors.onSurface }]}>Operator Map</Text>
              <OperatorHeartbeatStatusScreen />
            </View>
            <View style={styles.topActions}>
              <ActionButton variant="secondary" size="small" label={ru.operatorScreens.me} onPress={centerOnMe} disabled={!operatorLocation} />
              <ActionButton variant="secondary" size="small" label={ru.operatorScreens.center} onPress={centerSelected} />
              <ActionButton variant="secondary" size="small" label={ru.operatorScreens.fitAll} onPress={fitAll} />
              <ActionButton variant="secondary" size="small" label={ru.operatorScreens.history} onPress={() => navigation.navigate("History")} />
              <ActionButton
                variant="ghost"
                size="small"
                label={ru.operatorScreens.profile}
                onPress={() => rootNavigation.navigate("Common", { screen: "Profile" })}
              />
            </View>
          </View>
        </View>

        {/* Bottom panel */}
        <View
          style={[
            styles.bottomPanel,
            { backgroundColor: tokens.colors.surface + "F5", borderColor: tokens.colors.border },
            !isPanelExpanded && styles.bottomPanelCollapsed,
          ]}
        >
          <Pressable
            onPress={() => setIsPanelExpanded((v) => !v)}
            style={styles.panelHandle}
            accessibilityRole="button"
            accessibilityLabel={ru.operatorScreens.togglePanelA11y}
          >
            <View style={[styles.handleBar, { backgroundColor: tokens.colors.border }]} />
            <Text style={[styles.panelTitle, { color: tokens.colors.onSurface }]}>
              Active incidents ({data.length})
            </Text>
            <Text style={[styles.panelToggle, { color: tokens.colors.primary }]}>
              {isPanelExpanded ? ru.operatorScreens.panelHide : ru.operatorScreens.panelShow}
            </Text>
          </Pressable>

          {isPanelExpanded ? (
            data.length > 0 ? (
              <FlatList
                ref={listRef}
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderSessionItem}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                getItemLayout={(_, index) => ({ length: 130, offset: 130 * index, index })}
                removeClippedSubviews
                initialNumToRender={6}
                maxToRenderPerBatch={8}
                windowSize={7}
              />
            ) : (
              <EmptyState
                title={ru.operatorScreens.noActiveTitle}
                subtitle={ru.operatorScreens.noActiveSub}
              />
            )
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  fullscreen: { flex: 1 },
  loadingOverlay: { position: "absolute", top: 100, left: 0, right: 0 },
  errorOverlay: { position: "absolute", top: 100, left: 12, right: 12 },
  topBar: { position: "absolute", top: 10, left: 10, right: 10 },
  topCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  topCardRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  mapTitle: { fontSize: 17, fontWeight: "800" },
  topActions: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  bottomPanel: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    maxHeight: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  bottomPanelCollapsed: { maxHeight: 60, overflow: "hidden" },
  panelHandle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  handleBar: { width: 32, height: 4, borderRadius: 99 },
  panelTitle: { flex: 1, marginLeft: 8, fontSize: 15, fontWeight: "700" },
  panelToggle: { fontSize: 13, fontWeight: "700" },
  list: { marginTop: 4 },
  listContent: { gap: 8, paddingBottom: 8 },
  sessionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTime: { fontSize: 12 },
  cardEmail: { fontSize: 14, fontWeight: "600" },
  cardActions: { flexDirection: "row", gap: 6 },
});
