import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme";
import { ActionButton } from "../ui/ActionButton";

interface Props {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, subtitle, actionLabel, onAction }: Props) => {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: tokens.colors.surfaceVariant }]}>
        <Text style={styles.icon}>📋</Text>
      </View>
      <Text style={[styles.title, { color: tokens.colors.onSurface }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.actionWrap}>
          <ActionButton variant="secondary" label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
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
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  actionWrap: { marginTop: 8, minWidth: 180 },
});
