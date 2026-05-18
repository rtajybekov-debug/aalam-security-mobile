import React, { PropsWithChildren } from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../theme";
import { radius, spacing } from "../../theme";

interface Props extends PropsWithChildren {
  onPress?: () => void;
  compact?: boolean;
  /** Left accent border color (e.g. status color) */
  accent?: string;
  style?: ViewStyle;
}

export const AppCard = ({ children, onPress, compact = false, accent, style }: Props) => {
  const { tokens } = useAppTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: compact ? spacing.md : spacing.lg,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    ...(accent && {
      borderLeftWidth: 4,
      borderLeftColor: accent,
    }),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [containerStyle, { minHeight: 44 }, pressed && { opacity: 0.82 }, style]}
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};
