import React from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../theme";
import { BackNavLink } from "./BackNavLink";

/** Extra space below status bar / notch so the back row is not flush to the top. */
const HEADER_TOP_INSET = 28;

/**
 * Custom stack header: lime Back (Lucide ArrowLeft) + title on OLED background.
 */
export function AppStackHeader({ navigation, options, back }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { tokens } = useAppTheme();

  const topInset =
    Platform.OS === "android"
      ? Math.max(insets.top, StatusBar.currentHeight ?? 0)
      : insets.top;

  const title =
    typeof options.title === "string"
      ? options.title
      : typeof options.headerTitle === "string"
        ? options.headerTitle
        : "";

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: topInset + HEADER_TOP_INSET,
          backgroundColor: tokens.colors.background,
          borderBottomColor: "rgba(255,255,255,0.06)",
        },
      ]}
    >
      <View style={styles.inner}>
        {back ? (
          <BackNavLink color={tokens.colors.primary} onPress={() => navigation.goBack()} />
        ) : (
          <View style={styles.backSpacer} />
        )}
        {title ? (
          <Text style={[styles.title, { color: tokens.colors.onSurface }]} numberOfLines={2}>
            {title}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  backSpacer: {
    height: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
});
