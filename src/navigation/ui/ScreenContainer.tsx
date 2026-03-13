import React, { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useAppTheme } from "../../theme";

export const ScreenContainer = ({ children }: PropsWithChildren) => {
  const theme = useAppTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.tokens.colors.background }]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
