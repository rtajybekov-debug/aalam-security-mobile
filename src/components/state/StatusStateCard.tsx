import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../theme";

type ActionTone = "neutral" | "danger";

interface Props {
  badge: string;
  badgeColor: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTone?: ActionTone;
}

/**
 * Reusable status card for system/error states (offline, forbidden, network).
 * Matches the dark-card language from the Pencil "Status - Error States" board.
 */
export const StatusStateCard = ({
  badge,
  badgeColor,
  message,
  actionLabel,
  onAction,
  actionTone = "neutral",
}: Props) => {
  const { tokens } = useAppTheme();
  const hasAction = !!actionLabel && !!onAction;
  const isDanger = actionTone === "danger";

  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
      <Text style={[styles.badge, { color: badgeColor }]}>{badge}</Text>
      <Text style={[styles.message, { color: tokens.colors.onSurfaceMuted }]}>{message}</Text>
      {hasAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.action, { backgroundColor: isDanger ? "#3F1D1D" : "#27272A" }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, { color: isDanger ? "#FCA5A5" : "#FFFFFF" }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

interface LoadingProps {
  label?: string;
}

export const StatusLoadingPill = ({ label = "Loading..." }: LoadingProps) => (
  <View style={styles.loadingPill}>
    <Text style={styles.loadingText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
  action: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingPill: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
});
