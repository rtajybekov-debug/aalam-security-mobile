import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OperatorStackParamList } from "../types";
import { OperatorTabs } from "../tabs/OperatorTabs";
import { OperatorSessionDetailsScreen } from "../../screens/operator/OperatorSessionDetailsScreen";
import { OperatorLiveMapScreen } from "../../screens/operator/OperatorLiveMapScreen";
import { OperatorResolveModalScreen } from "../../screens/operator/OperatorResolveModalScreen";
import { appStackScreenOptions } from "../ui/AppStackShell";
import { ru } from "../../locale/ru";

const Stack = createNativeStackNavigator<OperatorStackParamList>();

export const OperatorStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="OperatorTabs" component={OperatorTabs} options={{ headerShown: false }} />
    <Stack.Screen
      name="OperatorSessionDetails"
      component={OperatorSessionDetailsScreen}
      options={{ title: ru.nav.sessionDetails }}
    />
    <Stack.Screen
      name="OperatorLiveMap"
      component={OperatorLiveMapScreen}
      options={{ title: ru.nav.liveMap }}
    />
    <Stack.Screen
      name="OperatorResolveModal"
      component={OperatorResolveModalScreen}
      options={{ title: ru.nav.resolveSession, presentation: "modal" }}
    />
  </Stack.Navigator>
);
