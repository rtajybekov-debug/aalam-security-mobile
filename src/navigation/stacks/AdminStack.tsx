import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdminStackParamList } from "../types";
import { AdminTabs } from "../tabs/AdminTabs";
import { AdminCreateOperatorScreen } from "../../screens/admin/AdminCreateOperatorScreen";
import { AdminCreateOperatorSuccessScreen } from "../../screens/admin/AdminCreateOperatorSuccessScreen";
import { appStackScreenOptions } from "../ui/AppStackShell";
import { ru } from "../../locale/ru";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
    <Stack.Screen
      name="AdminCreateOperator"
      component={AdminCreateOperatorScreen}
      options={{ title: ru.nav.createOperator }}
    />
    <Stack.Screen
      name="AdminCreateOperatorSuccess"
      component={AdminCreateOperatorSuccessScreen}
      options={{ title: ru.admin.successTitle }}
    />
  </Stack.Navigator>
);
