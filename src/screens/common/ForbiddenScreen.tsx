import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { ActionButton } from "../../components/ui/ActionButton";
import { useAppTheme } from "../../theme";

export const ForbiddenScreen = () => {
  const { tokens } = useAppTheme();
  const logout = useAuthStore((state) => state.logout);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.iconWrap, { backgroundColor: "#FEE2E2" }]}>
          <Text style={styles.icon}>🚫</Text>
        </View>
        <Text style={[styles.title, { color: tokens.colors.danger }]}>Access Denied</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
          Your account role cannot access this section.
        </Text>
        <ActionButton variant="danger" label="Sign Out" onPress={() => void logout()} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 12 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  icon: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
