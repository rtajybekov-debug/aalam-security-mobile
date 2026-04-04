import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { StatusStateCard } from "../../components/state/StatusStateCard";
import { useAppTheme } from "../../theme";

export const NetworkOfflineScreen = () => {
  const { tokens } = useAppTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <StatusStateCard
          badge="Offline"
          badgeColor="#F59E0B"
          message="No internet connection. Showing cached data."
          actionLabel="Retry"
          onAction={() => {}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
