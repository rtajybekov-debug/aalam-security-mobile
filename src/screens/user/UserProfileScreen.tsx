import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/authStore";
import { useUserSessionStore } from "../../stores/userSessionStore";
import { AppCard } from "../../components/ui/AppCard";
import { Avatar } from "../../components/ui/Avatar";
import { useUserTabBarBottomInset } from "../../navigation/userTabBarLayout";
import { UserTabParamList, UserStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<UserTabParamList, "Profile">,
  NativeStackNavigationProp<UserStackParamList>
>;

const ROLE_LABELS: Record<string, string> = {
  USER: "End User",
  OPERATOR: "Operator",
  ADMIN: "Administrator",
};

export const UserProfileScreen = () => {
  const { tokens } = useAppTheme();
  const tabBarBottomInset = useUserTabBarBottomInset();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const currentVenueName = useUserSessionStore((s) => s.currentVenueName);
  const userPin = useUserSessionStore((s) => s.userPin);
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "—";

  const stackNav = navigation.getParent<NativeStackNavigationProp<UserStackParamList>>();
  const rootNav = stackNav?.getParent();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.lg,
            gap: 12,
            paddingBottom: spacing.md + tabBarBottomInset,
            paddingTop: Math.max(spacing.lg, insets.top + 8),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: tokens.colors.onSurface }]}>My profile</Text>

        <AppCard style={styles.avatarSection}>
          <Avatar name={user?.email} size={80} />
          <View style={styles.avatarInfo}>
            <Text style={[styles.emailText, { color: tokens.colors.onSurface }]} numberOfLines={1}>
              {user?.email ?? "—"}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: tokens.colors.surfaceVariant, borderColor: tokens.colors.border },
              ]}
            >
              <Text style={[styles.roleText, { color: tokens.colors.onSurfaceMuted }]}>
                {roleLabel}
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.editAction, { borderColor: tokens.colors.border, backgroundColor: tokens.colors.surface }]}
            onPress={() => stackNav?.navigate("UserEditDetails")}
          >
            <Text style={[styles.editText, { color: tokens.colors.primary }]}>Edit</Text>
          </Pressable>
        </AppCard>

        <Text style={[styles.sectionTitle, { color: tokens.colors.onSurface }]}>Security settings</Text>
        <AppCard style={styles.settingGroup}>
          <Pressable style={styles.settingRow} onPress={() => stackNav?.navigate("UserBindVenue")}>
            <Text style={[styles.settingLabel, { color: tokens.colors.onSurface }]}>
              {currentVenueName ? `Venue: ${currentVenueName}` : "Join Venue"}
            </Text>
            <ChevronRight size={18} color={tokens.colors.onSurfaceMuted} strokeWidth={2} />
          </Pressable>
          <View style={[styles.rowDivider, { backgroundColor: tokens.colors.border }]} />
          <Pressable style={styles.settingRow} onPress={() => stackNav?.navigate("UserSetupPin")}>
            <Text style={[styles.settingLabel, { color: tokens.colors.onSurface }]}>
              {userPin ? "PIN set" : "Set PIN"}
            </Text>
            <ChevronRight size={18} color={tokens.colors.onSurfaceMuted} strokeWidth={2} />
          </Pressable>
          <View style={[styles.rowDivider, { backgroundColor: tokens.colors.border }]} />
          <Pressable style={styles.settingRow} onPress={() => stackNav?.navigate("UserBillingPlans")}>
            <Text style={[styles.settingLabel, { color: tokens.colors.onSurface }]}>Billing</Text>
            <ChevronRight size={18} color={tokens.colors.onSurfaceMuted} strokeWidth={2} />
          </Pressable>
          <View style={[styles.rowDivider, { backgroundColor: tokens.colors.border }]} />
          <Pressable
            style={styles.settingRow}
            onPress={() => (rootNav as any)?.navigate("Common", { screen: "RequestNewOrganization" })}
          >
            <Text style={[styles.settingLabel, { color: tokens.colors.onSurface }]}>
              Request organization
            </Text>
            <ChevronRight size={18} color={tokens.colors.onSurfaceMuted} strokeWidth={2} />
          </Pressable>
        </AppCard>

        <View style={styles.linksRow}>
          <Pressable onPress={() => (rootNav as any)?.navigate("Common", { screen: "Terms" })}>
            <Text style={[styles.linkText, { color: tokens.colors.onSurfaceMuted }]}>Terms of Service</Text>
          </Pressable>
          <Text style={[styles.dot, { color: tokens.colors.border }]}>·</Text>
          <Pressable onPress={() => (rootNav as any)?.navigate("Common", { screen: "Privacy" })}>
            <Text style={[styles.linkText, { color: tokens.colors.onSurfaceMuted }]}>Privacy Policy</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.logoutButton, { backgroundColor: "#3F1D1D" }]} onPress={() => void logout()}>
          <Text style={[styles.logoutText, { color: "#FCA5A5" }]}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {},
  pageTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3 },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    justifyContent: "space-between",
  },
  avatarInfo: { flex: 1, gap: 8 },
  emailText: { fontSize: 15, fontWeight: "700" },
  roleBadge: {
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleText: { fontSize: 12, fontWeight: "600" },
  editAction: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  editText: { fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  settingGroup: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  settingLabel: { fontSize: 14, fontWeight: "600" },
  rowDivider: {
    height: 1,
    opacity: 0.8,
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    fontSize: 12,
    fontWeight: "500",
  },
  logoutButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
