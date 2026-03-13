import React from "react";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { RootStackParamList, UserStackParamList, UserTabParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/authStore";
import { useEmergencyStore } from "../../stores/emergencyStore";
import { emergencyApi } from "../../api/modules/emergency";
import { SosEmergencyButton } from "../../components/sos/SosEmergencyButton";
import { ActionButton } from "../../components/ui/ActionButton";
import { StatusChip } from "../../components/ui/StatusChip";
import { toastBus } from "../../ui/feedback/toastBus";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, "Home">,
  NativeStackScreenProps<UserStackParamList>
>;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const UserHomeScreen = ({ navigation }: Props) => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tokens } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const activeSession = useEmergencyStore((state) => state.activeSession);
  const setActiveSession = useEmergencyStore((state) => state.setActiveSession);
  const [buttonState, setButtonState] = React.useState<"idle" | "sending" | "active" | "disabled">(
    activeSession ? "active" : "idle",
  );
  const isStartingSosRef = React.useRef(false);

  React.useEffect(() => {
    setButtonState(activeSession ? "active" : "idle");
  }, [activeSession]);

  const onStartSos = async () => {
    if (isStartingSosRef.current) return;
    if (activeSession) {
      navigation.navigate("UserActiveEmergency", { sessionId: activeSession.id });
      return;
    }
    isStartingSosRef.current = true;
    try {
      setButtonState("sending");
      const session = await emergencyApi.start();
      setActiveSession(session);
      toastBus.show({ message: "Emergency alert sent.", severity: "success" });
      navigation.navigate("UserActiveEmergency", { sessionId: session.id });
    } catch {
      setButtonState("idle");
      toastBus.show({ message: "Failed to trigger SOS. Try again.", severity: "error" });
    } finally {
      isStartingSosRef.current = false;
    }
  };

  const userLabel = user?.email
    ? user.email.split("@")[0]
    : "there";

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: tokens.colors.onSurfaceMuted }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: tokens.colors.onSurface }]} numberOfLines={1}>
              {userLabel}
            </Text>
          </View>
          <ActionButton
            variant="ghost"
            label="Profile"
            size="small"
            onPress={() => rootNavigation.navigate("Common", { screen: "Profile" })}
            accessibilityLabel="Open profile and logout"
          />
        </View>

        {/* Status card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: tokens.colors.surface,
              borderColor: tokens.colors.border,
            },
          ]}
        >
          <Text style={[styles.statusLabel, { color: tokens.colors.onSurfaceMuted }]}>
            CURRENT STATUS
          </Text>
          {activeSession ? (
            <View style={styles.statusRow}>
              <StatusChip status={activeSession.status} />
              <Text style={[styles.statusNote, { color: tokens.colors.onSurfaceMuted }]}>
                Session active
              </Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: tokens.colors.success }]} />
              <Text style={[styles.statusOk, { color: tokens.colors.onSurface }]}>
                Ready — no active SOS
              </Text>
            </View>
          )}
        </View>

        {/* SOS Hero */}
        <View style={styles.heroWrap}>
          <SosEmergencyButton state={buttonState} onTrigger={onStartSos} />
        </View>

        {/* Secondary actions */}
        <View style={styles.actions}>
          <ActionButton
            variant="secondary"
            label="View Emergency History"
            onPress={() => navigation.navigate("History")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, padding: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { gap: 2 },
  greeting: { fontSize: 13, fontWeight: "500" },
  userName: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusOk: { fontSize: 15, fontWeight: "600" },
  statusNote: { fontSize: 13 },
  heroWrap: {
    flex: 1,
    minHeight: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  actions: { gap: 10, paddingBottom: 8 },
});
