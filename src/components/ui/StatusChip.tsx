import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmergencyStatus } from "../../types/emergency";
import { useAppTheme } from "../../theme";
import { radius } from "../../theme";

interface Props {
  status: EmergencyStatus;
}

const statusLabel: Record<EmergencyStatus, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
};

export const StatusChip = ({ status }: Props) => {
  const { tokens } = useAppTheme();
  const colors = tokens.status[status];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.fg }]}>{statusLabel[status]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    borderRadius: radius.round,
    borderWidth: 1,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
