import React, { createContext, PropsWithChildren, useContext } from "react";
import { useColorScheme } from "react-native";
import { darkTokens, lightTokens, ThemeTokens } from "./tokens";

export type AppTheme = {
  tokens: ThemeTokens;
  isDark: boolean;
};

const ThemeContext = createContext<AppTheme>({
  tokens: lightTokens,
  isDark: false,
});

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const tokens = isDark ? darkTokens : lightTokens;

  return <ThemeContext.Provider value={{ tokens, isDark }}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): AppTheme => useContext(ThemeContext);
