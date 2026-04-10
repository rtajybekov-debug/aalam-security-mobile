import React, { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../queryClient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppThemeProvider } from "../theme";
import { AppSnackbarHost } from "../ui/feedback/AppSnackbarHost";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <AppSnackbarHost />
        </QueryClientProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
