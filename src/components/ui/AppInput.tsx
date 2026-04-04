import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useAppTheme } from "../../theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export const AppInput = ({ label, error, style, placeholder, ...rest }: Props) => {
  const { tokens } = useAppTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.wrapper}>
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
        placeholder={label ?? placeholder}
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
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 54,
  },
  error: {
    fontSize: 12,
    marginTop: 2,
  },
});
