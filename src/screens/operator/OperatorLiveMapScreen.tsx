import React from "react";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useOperatorStore } from "../../stores/operatorStore";
import { ActionButton } from "../../components/ui/ActionButton";
import { StatusChip } from "../../components/ui/StatusChip";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OperatorStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { ENV } from "../../config/env";

type Props = NativeStackScreenProps<OperatorStackParamList, "OperatorLiveMap">;

export const OperatorLiveMapScreen = ({ route }: Props) => {
  const { tokens } = useAppTheme();
  const sessionId = route.params.sessionId;
  const hasMapKey = Platform.OS === "ios" ? Boolean(ENV.mapsApiKeyIos) : Boolean(ENV.mapsApiKeyAndroid);
  const liveLocationsBySessionId = useOperatorStore((state) => state.liveLocationsBySessionId);
  const activeSessionsById = useOperatorStore((state) => state.activeSessionsById);
  const selectedSession = useOperatorStore((state) => state.selectedSession);
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [mapError, setMapError] = React.useState<string | null>(null);
  const mapRef = React.useRef<MapView | null>(null);

  // Use session-specific live location, not global (which can be from another session)
  const sessionLiveLocation = liveLocationsBySessionId[sessionId];
  const session = activeSessionsById[sessionId] ?? (selectedSession?.id === sessionId ? selectedSession : null);
  const fallbackLocation = session?.locations?.at(-1) ?? null;
  const location = sessionLiveLocation ?? fallbackLocation ?? null;
  const isLive = Boolean(sessionLiveLocation);

  const focusMap = React.useCallback(() => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
  }, [location]);

  React.useEffect(() => {
    focusMap();
  }, [focusMap]);

  React.useEffect(() => {
    if (!location) return;
    const timer = setTimeout(() => {
      if (!isMapReady) setMapError("Map provider unavailable. Try again.");
    }, 4000);
    return () => clearTimeout(timer);
  }, [isMapReady, location]);

  if (!hasMapKey) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: tokens.colors.danger }]}>Map not configured</Text>
          <Text style={[styles.errorSub, { color: tokens.colors.onSurfaceMuted }]}>
            Set EXPO_PUBLIC_MAPS_API_KEY_{Platform.OS === "ios" ? "IOS" : "ANDROID"} and rebuild.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.emptyIcon]}>📍</Text>
          <Text style={[styles.errorTitle, { color: tokens.colors.onSurface }]}>No location yet</Text>
          <Text style={[styles.errorSub, { color: tokens.colors.onSurfaceMuted }]}>
            Waiting for the first coordinate from the user device.
          </Text>
          <ActionButton
            variant="secondary"
            label="Retry"
            onPress={focusMap}
            accessibilityLabel="Retry loading live location"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (mapError) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.errorTitle, { color: tokens.colors.danger }]}>{mapError}</Text>
          <ActionButton
            variant="secondary"
            label="Retry Map"
            onPress={() => { setMapError(null); setIsMapReady(false); focusMap(); }}
            accessibilityLabel="Retry map provider"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      {/* Info bar */}
      <View style={[styles.infoBar, { backgroundColor: tokens.colors.surface, borderBottomColor: tokens.colors.border }]}>
        <View style={styles.infoLeft}>
          <Text style={[styles.sessionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            Session #{route.params.sessionId.slice(0, 8)}
          </Text>
          {selectedSession ? <StatusChip status={selectedSession.status} /> : null}
        </View>
        <View style={[styles.liveDot, { backgroundColor: isLive ? tokens.colors.success : tokens.colors.onSurfaceMuted }]} />
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onMapReady={() => {
          setIsMapReady(true);
          setMapError(null);
          focusMap();
        }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="Emergency location"
          pinColor={tokens.status.IN_PROGRESS.border}
        />
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLeft: { gap: 4 },
  sessionLabel: { fontSize: 12 },
  liveDot: { width: 10, height: 10, borderRadius: 5 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 4 },
  errorTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  errorSub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
