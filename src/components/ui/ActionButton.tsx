import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useAppTheme } from "../../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "default" | "large" | "small";

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
}

export const ActionButton = ({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  size = "default",
  accessibilityLabel,
  accessibilityHint,
  style,
}: Props) => {
  const { tokens } = useAppTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 12,
      minHeight: size === "large" ? 54 : size === "small" ? 38 : 48,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 8,
    };
    if (variant === "primary") {
      return { ...base, backgroundColor: disabled ? tokens.colors.border : tokens.colors.primary };
    }
    if (variant === "danger") {
      return { ...base, backgroundColor: disabled ? tokens.colors.border : tokens.colors.danger };
    }
    if (variant === "secondary") {
      return {
        ...base,
        backgroundColor: tokens.colors.surface,
        borderWidth: 1.5,
        borderColor: tokens.colors.border,
      };
    }
    return { ...base, backgroundColor: "transparent" };
  };

  const getTextColor = () => {
    if (disabled && !loading) return tokens.colors.onSurfaceMuted;
    if (variant === "primary") return tokens.colors.onPrimary;
    if (variant === "danger") return tokens.colors.onDanger;
    if (variant === "secondary") return tokens.colors.onSurface;
    return tokens.colors.primary;
  };

  return (
    <Pressable
      style={({ pressed }) => [getContainerStyle(), { opacity: pressed || disabled ? 0.72 : 1 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
    >
      {loading ? <ActivityIndicator size="small" color={getTextColor()} /> : null}
      <Text style={[styles.label, { color: getTextColor(), fontSize: size === "small" ? 13 : 15 }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});
