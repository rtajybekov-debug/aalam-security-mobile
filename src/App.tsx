import "react-native-reanimated";
import React from "react";
import { useColorScheme, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
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
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useAuthBootstrap();
  useTokenRefresh();
  useEmergencySocketEvents();
  useEmergencyLocationSender(5000);
  useHeartbeat(15000);
  usePushNotifications();

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#0A0A0A" }} />;
  }

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
