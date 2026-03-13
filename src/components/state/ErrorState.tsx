import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme";
import { RetryButton } from "./RetryButton";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "Please check your connection and try again.",
  onRetry,
  retryLabel = "Try again",
}: Props) => {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: "#FEE2E2" }]}>
        <Text style={styles.icon}>⚠</Text>
      </View>
      <Text style={[styles.title, { color: tokens.colors.onSurface }]}>{title}</Text>
      <Text style={[styles.message, { color: tokens.colors.onSurfaceMuted }]}>{message}</Text>
      {onRetry ? <RetryButton onPress={onRetry} label={retryLabel} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, alignItems: "center", justifyContent: "center", gap: 10 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: { fontSize: 32 },
  title: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  message: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
