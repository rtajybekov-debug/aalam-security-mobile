import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme";
import { StatusLoadingPill } from "./StatusStateCard";

interface Props {
  label?: string;
  caption?: string;
}

export const LoadingState = ({ label = "Loading...", caption }: Props) => {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.container}>
      <StatusLoadingPill label={label} />
      {caption ? <Text style={[styles.caption, { color: tokens.colors.onSurfaceMuted }]}>{caption}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 10 },
  caption: { fontSize: 13, textAlign: "center" },
});
