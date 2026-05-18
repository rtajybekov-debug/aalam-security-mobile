import React, { createContext, PropsWithChildren, useContext } from "react";
import { oledDarkTokens, ThemeTokens } from "./tokens";

export type AppTheme = {
  tokens: ThemeTokens;
  isDark: boolean;
};

// App is locked to OLED dark UI regardless of the system color scheme.
// See expo.userInterfaceStyle = "dark" in app.json and the navigation theme in RootNavigator.
const darkAppTheme: AppTheme = { tokens: oledDarkTokens, isDark: true };

const ThemeContext = createContext<AppTheme>(darkAppTheme);

export const AppThemeProvider = ({ children }: PropsWithChildren) => (
  <ThemeContext.Provider value={darkAppTheme}>{children}</ThemeContext.Provider>
);

export const useAppTheme = (): AppTheme => useContext(ThemeContext);
