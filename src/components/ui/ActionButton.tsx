import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "../../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "default" | "large" | "small";

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  style,
}: Props) => {
  const { tokens } = useAppTheme();

  const height = size === "large" ? 56 : size === "small" ? 42 : 50;

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 14,
      minHeight: height,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: 24,
      gap: 8,
      minWidth: 44,
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
        borderWidth: 1,
        borderColor: tokens.colors.border,
      };
    }
    if (variant === "outline") {
      return {
        ...base,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: disabled ? tokens.colors.border : tokens.colors.onSurfaceMuted,
      };
    }
    return { ...base, backgroundColor: "transparent" };
  };

  const getTextColor = () => {
    if (disabled && !loading) return tokens.colors.onSurfaceMuted;
    if (variant === "primary") return tokens.colors.onPrimary;
    if (variant === "danger") return tokens.colors.onDanger;
    if (variant === "secondary" || variant === "outline") return tokens.colors.onSurface;
    return tokens.colors.primary;
  };

  const textColor = getTextColor();

  return (
    <Pressable
      style={({ pressed }) => [getContainerStyle(), { opacity: pressed || disabled ? 0.72 : 1 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text style={[styles.label, { color: textColor, fontSize: size === "small" ? 13 : 16 }]}>
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});
