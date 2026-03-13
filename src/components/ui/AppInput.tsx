import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useAppTheme } from "../../theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export const AppInput = ({ label, error, style, ...rest }: Props) => {
  const { tokens } = useAppTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: tokens.colors.onSurface }]}>{label}</Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: tokens.colors.surface,
            borderColor: error
              ? tokens.colors.danger
              : focused
                ? tokens.colors.primary
                : tokens.colors.border,
            color: tokens.colors.onSurface,
          },
          style,
        ]}
        placeholderTextColor={tokens.colors.onSurfaceMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: tokens.colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 48,
  },
  error: {
    fontSize: 12,
    marginTop: 2,
  },
});
