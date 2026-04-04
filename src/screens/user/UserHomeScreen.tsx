import React from "react";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserTabBarBottomInset } from "../../navigation/userTabBarLayout";
import { UserStackParamList, UserTabParamList } from "../../navigation/types";
import { useUserSessionStore } from "../../stores/userSessionStore";
import { useEmergencyStore } from "../../stores/emergencyStore";
import { SosEmergencyButton } from "../../components/sos/SosEmergencyButton";
import { emergencyApi } from "../../api/modules/emergency";
import { organizationApi } from "../../api/modules/organization";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

/** Pencil ZVLRX — Home / Dashboard */
const P = {
  bg: "#0A0A0A",
  card: "#18181B",
  border: "#27272A",
  chipLeftBg: "#27272A",
  chipRightBg: "#111827",
  textBlue: "#93C5FD",
  muted: "#A1A1AA",
  caption: "#52525B",
  sessionMuted: "#71717A",
} as const;

const monoFont = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, "Home">,
  NativeStackScreenProps<UserStackParamList>
>;

export const UserHomeScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const tabBarBottomInset = useUserTabBarBottomInset();
  const currentVenueId = useUserSessionStore((state) => state.currentVenueId);
  const currentVenueName = useUserSessionStore((state) => state.currentVenueName);
  const hasIndividualSubscription = useUserSessionStore((state) => state.hasIndividualSubscription);
  const activeSession = useEmergencyStore((state) => state.activeSession);
  const setActiveSession = useEmergencyStore((state) => state.setActiveSession);
  const { data: memberships = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationApi.getMyOrganizations,
  });
  const [buttonState, setButtonState] = React.useState<"idle" | "sending" | "active" | "disabled">(
    activeSession ? "active" : "idle",
  );

  React.useEffect(() => {
    setButtonState(activeSession ? "active" : "idle");
  }, [activeSession]);

  const hasOrganization = memberships.length > 0;
  const assignedVenue = memberships
    .flatMap((member) => member.organization.venues ?? [])
    .find((venue) => venue.id === currentVenueId);
  const hasAssignedVenue = Boolean(currentVenueId);
  const canUseApp = hasIndividualSubscription || hasAssignedVenue;
  const inactiveReason = !hasOrganization && !hasIndividualSubscription ? "no_access" : "needs_assignment";

  const onStartSos = async () => {
    if (activeSession) {
      navigation.navigate("UserActiveEmergency", { sessionId: activeSession.id });
      return;
    }
    if (!canUseApp) {
      toastBus.show({
        message:
          "Activate an individual plan or join your assigned organization venue to use SOS.",
        severity: "warning",
      });
      return;
    }
    setButtonState("sending");
    try {
      const session = await emergencyApi.start(
        currentVenueId ? { venueId: currentVenueId } : undefined,
      );
      setActiveSession(session);
      toastBus.show({ message: "Emergency alert sent.", severity: "success" });
      navigation.navigate("UserActiveEmergency");
    } catch (err: unknown) {
      setButtonState("idle");
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof (err.response.data as { message: unknown }).message === "string"
          ? (err.response.data as { message: string }).message
          : "Failed to trigger SOS. Try again.";
      toastBus.show({ message, severity: "error" });
    }
  };

  const sessionChip =
    activeSession && activeSession.status
      ? `Session: ${activeSession.status}`
      : "Session: hidden";

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: tokens.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: tabBarBottomInset,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.homeTitle}>Home</Text>
        {!canUseApp ? (
          <>
            <View style={[styles.inactiveCard, { borderColor: P.border, backgroundColor: P.card }]}>
              <Text style={styles.inactiveTitle}>
                {inactiveReason === "no_access" ? "Account inactive" : "Branch assignment required"}
              </Text>
              <Text style={[styles.inactiveMessage, { color: P.muted }]}>
                {inactiveReason === "no_access"
                  ? "You need an active subscription or to join an organization to use the app."
                  : "You are in an organization, but SOS can only be triggered from your assigned branch."}
              </Text>
            </View>
            <View style={styles.ctaStack}>
              <Pressable
                onPress={() => navigation.navigate("UserBindVenue")}
                style={styles.primaryCta}
                accessibilityRole="button"
              >
                <Text style={styles.primaryCtaText}>Join an organization</Text>
                <Text style={styles.primaryCtaText}>→</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.getParent()?.navigate("Common", { screen: "RequestNewOrganization" } as never)}
                style={[styles.secondaryCta, { borderColor: P.border }]}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryCtaText}>Create new organization</Text>
                <Text style={styles.secondaryCtaArrow}>→</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("UserBillingPlans")}
                style={[styles.secondaryCta, { borderColor: P.border }]}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryCtaText}>Choose a subscription plan</Text>
                <Text style={styles.secondaryCtaArrow}>→</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.statusCard, { borderColor: P.border, backgroundColor: P.card }]}>
              <View style={styles.statusTopRow}>
                <Text style={[styles.statusLabel, { color: P.muted }]}>Status</Text>
                <View style={styles.readyBadge}>
                  <Text style={styles.readyText}>Ready</Text>
                </View>
              </View>
              <Text style={styles.orgLine}>
                {hasIndividualSubscription && !hasAssignedVenue
                  ? "Organization: Individual plan"
                  : `Organization: ${memberships[0]?.organization.name ?? "—"}`}
              </Text>
              <Text style={[styles.assignedLine, { color: P.muted }]}>
                {hasIndividualSubscription && !hasAssignedVenue
                  ? "Assigned venue: Personal mode"
                  : `Assigned venue: ${currentVenueName ?? "Not assigned"}`}
              </Text>
              {assignedVenue?.address ? (
                <Text style={[styles.locationLine, { color: P.sessionMuted }]}>
                  Location: {assignedVenue.address}
                </Text>
              ) : null}
            </View>

            <View style={styles.sosBlock}>
              <SosEmergencyButton state={buttonState} onTrigger={onStartSos} dashboardStyle />
              <Text style={[styles.hint, { color: P.muted }]}>Long press to trigger emergency</Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate("UserBindVenue")}
              style={[styles.venueDetailsRow, { borderColor: P.border, backgroundColor: P.card }]}
              accessibilityRole="button"
            >
              <View style={styles.venueTextWrap}>
                <Text style={styles.venueTitle}>Venue details</Text>
                <Text style={[styles.venueSub, { color: P.sessionMuted }]}>Tap to see venue info</Text>
              </View>
              <Text style={[styles.venueArrow, { color: "#C4F82A" }]}>→</Text>
            </Pressable>

            <View style={styles.metaRow}>
              <Pressable
                onPress={() => navigation.navigate("History")}
                style={[styles.metaChip, { borderColor: P.border, backgroundColor: P.card }]}
                accessibilityRole="button"
              >
                <Text style={[styles.metaChipText, { color: P.textBlue }]}>History</Text>
              </Pressable>
              <View style={[styles.metaChip, { borderColor: P.border, backgroundColor: P.card }]}>
                <Text style={[styles.metaChipText, { color: P.sessionMuted }]}>{sessionChip}</Text>
              </View>
            </View>

            <Text style={[styles.footerNote, { color: P.caption }]}>
              If emergency starts, session badge appears here.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    gap: 14,
  },
  homeTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  inactiveCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  inactiveTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  inactiveMessage: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
  ctaStack: {
    gap: 10,
  },
  primaryCta: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#C4F82A",
  },
  primaryCtaText: {
    color: "#0A0A0A",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryCta: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#18181B",
  },
  secondaryCtaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryCtaArrow: {
    color: "#71717A",
    fontSize: 14,
    fontWeight: "700",
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  statusTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  readyBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#14532D",
    backgroundColor: "#052E16",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readyText: {
    color: "#86EFAC",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  orgLine: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  assignedLine: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationLine: {
    fontSize: 12,
    fontWeight: "500",
  },
  onDuty: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  roleLine: {
    color: P.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  chip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipLeftLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  chipRightLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sosBlock: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  hint: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  venueDetailsRow: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  venueTextWrap: {
    gap: 2,
  },
  venueTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  venueSub: {
    fontSize: 11,
    fontWeight: "500",
  },
  venueArrow: {
    fontSize: 16,
    fontWeight: "700",
  },
  metaChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  footerNote: {
    fontSize: 12,
    fontWeight: "500",
  },
});
