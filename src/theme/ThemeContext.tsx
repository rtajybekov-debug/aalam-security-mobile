import React, { createContext, PropsWithChildren, useContext } from "react";
import { useColorScheme } from "react-native";
import { lightTokens, oledDarkTokens, ThemeTokens } from "./tokens";

export type AppTheme = {
  tokens: ThemeTokens;
  isDark: boolean;
};

const ThemeContext = createContext<AppTheme>({
  tokens: oledDarkTokens,
  isDark: true,
});

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  // Prefer OLED dark: iOS often reports null briefly; light mode would show wrong auth styling.
  // App is locked to dark UI via expo.userInterfaceStyle = "dark" in app.json.
  const isDark = colorScheme !== "light";
  const tokens = isDark ? oledDarkTokens : lightTokens;

  return <ThemeContext.Provider value={{ tokens, isDark }}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): AppTheme => useContext(ThemeContext);
