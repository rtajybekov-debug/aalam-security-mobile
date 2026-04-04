import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { StatusStateCard } from "../../components/state/StatusStateCard";
import { useAppTheme } from "../../theme";

export const ForbiddenScreen = () => {
  const { tokens } = useAppTheme();
  const logout = useAuthStore((state) => state.logout);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.container}>
        <StatusStateCard
          badge="Forbidden"
          badgeColor="#EF4444"
          message="Access denied. Session expired."
          actionLabel="Go to Login"
          onAction={() => void logout()}
          actionTone="danger"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
});
