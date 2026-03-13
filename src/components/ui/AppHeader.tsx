import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../theme";

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  style?: ViewStyle;
}

export const AppHeader = ({ title, subtitle, onBack, rightAction, style }: Props) => {
  const { tokens } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.colors.surface,
          borderBottomColor: tokens.colors.border,
        },
        style,
      ]}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Text style={[styles.backArrow, { color: tokens.colors.primary }]}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      <View style={styles.titleWrap}>
        <Text
          style={[styles.title, { color: tokens.colors.onSurface }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightAction ? <View style={styles.right}>{rightAction}</View> : <View style={styles.placeholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 22,
    fontWeight: "700",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  right: {
    width: 36,
    alignItems: "flex-end",
  },
  placeholder: {
    width: 36,
  },
});
