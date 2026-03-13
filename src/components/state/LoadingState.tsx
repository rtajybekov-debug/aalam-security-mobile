import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme";

interface Props {
  label?: string;
  caption?: string;
}

export const LoadingState = ({ label = "Loading...", caption }: Props) => {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={tokens.colors.primary} />
      <Text style={[styles.label, { color: tokens.colors.onSurface }]}>{label}</Text>
      {caption ? (
        <Text style={[styles.caption, { color: tokens.colors.onSurfaceMuted }]}>{caption}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  label: { fontSize: 16, fontWeight: "600" },
  caption: { fontSize: 13, textAlign: "center" },
});
