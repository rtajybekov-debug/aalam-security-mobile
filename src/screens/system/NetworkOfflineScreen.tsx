import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../../components/ui/ActionButton";
import { useAppTheme } from "../../theme";

export const NetworkOfflineScreen = () => {
  const { tokens } = useAppTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: tokens.colors.surfaceVariant }]}>
          <Text style={styles.icon}>📡</Text>
        </View>
        <Text style={[styles.title, { color: tokens.colors.onSurface }]}>No Connection</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
          You're offline. Reconnect to continue working with live emergency data.
        </Text>
        <ActionButton
          label="Retry Connection"
          onPress={() => {}}
          accessibilityLabel="Retry network connection"
          accessibilityHint="Attempts to reconnect to the internet"
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
    padding: 32,
    gap: 14,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 300 },
});
