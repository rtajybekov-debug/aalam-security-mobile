import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { AppCard } from "../../components/ui/AppCard";
import { ActionButton } from "../../components/ui/ActionButton";
import { Avatar } from "../../components/ui/Avatar";
import { Divider } from "../../components/ui/Divider";
import { useNavigation } from "@react-navigation/native";
import { roleToRootScreen, RootStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const ROLE_LABELS: Record<string, string> = {
  USER: "End User",
  OPERATOR: "Operator",
  ADMIN: "Administrator",
};

export const ProfileScreen = () => {
  const { tokens } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const roleRoot = user?.role ? roleToRootScreen[user.role] : null;
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "—";

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        {/* Avatar header */}
        <View style={styles.avatarSection}>
          <Avatar name={user?.email} size={80} />
          <View style={styles.avatarInfo}>
            <Text style={[styles.emailText, { color: tokens.colors.onSurface }]} numberOfLines={1}>
              {user?.email ?? "—"}
            </Text>
            <View
              style={[styles.roleBadge, { backgroundColor: tokens.colors.surfaceVariant, borderColor: tokens.colors.border }]}
            >
              <Text style={[styles.roleText, { color: tokens.colors.onSurfaceMuted }]}>
                {roleLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Info card */}
        <AppCard>
          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            ACCOUNT INFO
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: tokens.colors.onSurfaceMuted }]}>Email</Text>
            <Text style={[styles.infoValue, { color: tokens.colors.onSurface }]} numberOfLines={1}>
              {user?.email ?? "—"}
            </Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: tokens.colors.onSurfaceMuted }]}>Role</Text>
            <Text style={[styles.infoValue, { color: tokens.colors.onSurface }]}>{roleLabel}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: tokens.colors.onSurfaceMuted }]}>Access</Text>
            <Text style={[styles.infoValue, { color: tokens.colors.onSurfaceMuted }]}>
              Managed by backend policy
            </Text>
          </View>
        </AppCard>

        <View style={styles.legalRow}>
          <ActionButton
            variant="secondary"
            size="small"
            label="My Organizations"
            onPress={() => navigation.navigate("Common", { screen: "MyOrganizations" })}
          />
        </View>

        <View style={styles.legalRow}>
          <ActionButton
            variant="ghost"
            size="small"
            label="Terms of Service"
            onPress={() => navigation.navigate("Common", { screen: "Terms" })}
          />
          <ActionButton
            variant="ghost"
            size="small"
            label="Privacy Policy"
            onPress={() => navigation.navigate("Common", { screen: "Privacy" })}
          />
        </View>

        <View style={styles.spacer} />

        {/* Back to workspace */}
        {roleRoot ? (
          <ActionButton
            variant="secondary"
            label="Back to Workspace"
            onPress={() => navigation.navigate(roleRoot)}
            accessibilityLabel="Return to main role workspace"
          />
        ) : null}

        {/* Logout */}
        <ActionButton
          variant="danger"
          label="Sign Out"
          onPress={() => void logout()}
          accessibilityLabel="Sign out from account"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 16 },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 4,
  },
  avatarInfo: { flex: 1, gap: 6 },
  emailText: { fontSize: 16, fontWeight: "700" },
  roleBadge: {
    alignSelf: "flex-start",
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: { fontSize: 12, fontWeight: "600" },
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
  divider: { marginVertical: 8 },
  legalRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  spacer: { flex: 1 },
});
