import "react-native-reanimated";
import React from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "./providers/AppProviders";
import { AppLifecycleManager } from "./lifecycle/AppLifecycleManager";
import { RootNavigator } from "./navigation/RootNavigator";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import { useEmergencySocketEvents } from "./hooks/useEmergencySocketEvents";
import { useEmergencyLocationSender } from "./hooks/useEmergencyLocationSender";
import { useHeartbeat } from "./hooks/useHeartbeat";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { AppErrorBoundary } from "./components/error/AppErrorBoundary";

const AppInner = () => {
  const colorScheme = useColorScheme();
  useAuthBootstrap();
  useTokenRefresh();
  useEmergencySocketEvents();
  useEmergencyLocationSender(5000);
  useHeartbeat(15000);
  usePushNotifications();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </>
  );
};

const App = () => (
  <AppErrorBoundary>
    <AppProviders>
      <AppLifecycleManager>
        <AppInner />
      </AppLifecycleManager>
    </AppProviders>
  </AppErrorBoundary>
);

export default App;
