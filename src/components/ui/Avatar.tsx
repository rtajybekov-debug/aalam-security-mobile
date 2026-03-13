import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../theme";

interface Props {
  name?: string;
  size?: number;
  style?: ViewStyle;
}

const getInitials = (name?: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const Avatar = ({ name, size = 48, style }: Props) => {
  const { tokens } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tokens.colors.primary,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36, color: tokens.colors.onPrimary }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontWeight: "700",
  },
});
