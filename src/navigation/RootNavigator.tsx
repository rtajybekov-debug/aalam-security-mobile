import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../stores/authStore";
import { RootStackParamList, roleToRootScreen } from "./types";
import { AuthStack } from "./stacks/AuthStack";
import { CommonStack } from "./stacks/CommonStack";
import { UserStack } from "./stacks/UserStack";
import { OperatorStack } from "./stacks/OperatorStack";
import { AdminStack } from "./stacks/AdminStack";
import { AuthGuard } from "./guards/AuthGuard";
import { SplashScreen } from "../screens/common/SplashScreen";
import { AuthLoadingScreen } from "../screens/common/AuthLoadingScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isBootstrapped) {
    return <SplashScreen />;
  }

  const initialRouteName = isAuthenticated && user ? roleToRootScreen[user.role] : "Auth";

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthenticated ? `auth-${user?.role ?? "none"}` : "guest"}
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Common" component={CommonStack} />
            <Stack.Screen
              name="User"
              children={() => (
                <AuthGuard roles={["USER"]}>
                  <UserStack />
                </AuthGuard>
              )}
            />
            <Stack.Screen
              name="Operator"
              children={() => (
                <AuthGuard roles={["OPERATOR"]}>
                  <OperatorStack />
                </AuthGuard>
              )}
            />
            <Stack.Screen
              name="Admin"
              children={() => (
                <AuthGuard roles={["ADMIN"]}>
                  <AdminStack />
                </AuthGuard>
              )}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
