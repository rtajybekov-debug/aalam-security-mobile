import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../theme";

interface Props {
  style?: ViewStyle;
}

export const Divider = ({ style }: Props) => {
  const { tokens } = useAppTheme();
  return (
    <View style={[styles.divider, { backgroundColor: tokens.colors.border }, style]} />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
