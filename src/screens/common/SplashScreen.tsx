import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native";
import { useAppTheme } from "../../theme";

export const SplashScreen = () => {
  const { tokens } = useAppTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: tokens.colors.danger }]}>
          <Text style={styles.logoText}>SOS</Text>
        </View>
        <Text style={[styles.appName, { color: tokens.colors.onSurface }]}>Alarm SOS</Text>
        <ActivityIndicator
          style={styles.spinner}
          size="small"
          color={tokens.colors.onSurfaceMuted}
        />
        <Text style={[styles.caption, { color: tokens.colors.onSurfaceMuted }]}>
          Preparing secure emergency services...
        </Text>
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
    gap: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 22,
    letterSpacing: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  spinner: { marginTop: 24 },
  caption: { fontSize: 13 },
});
