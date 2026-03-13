import React from "react";
import { StyleSheet, Text } from "react-native";
import { useAppTheme } from "../../theme";

interface Props {
  children: React.ReactNode;
}

export const SectionTitle = ({ children }: Props) => {
  const { tokens } = useAppTheme();
  return (
    <Text style={[styles.title, { color: tokens.colors.onSurfaceMuted }]}>{children}</Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
});
