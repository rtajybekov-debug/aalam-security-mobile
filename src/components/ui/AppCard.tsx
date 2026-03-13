import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../theme";

interface Props extends PropsWithChildren {
  onPress?: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

export const AppCard = ({ children, onPress, compact = false, style }: Props) => {
  const { tokens } = useAppTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          containerStyle,
          compact && styles.compact,
          pressed && { opacity: 0.82 },
          style,
        ]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, containerStyle, compact && styles.compact, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compact: {
    padding: 12,
  },
});
