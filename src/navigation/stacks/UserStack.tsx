import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { UserStackParamList } from "../types";
import { UserTabs } from "../tabs/UserTabs";
import { UserActiveEmergencyScreen } from "../../screens/user/UserActiveEmergencyScreen";
import { UserEmergencyDetailsScreen } from "../../screens/user/UserEmergencyDetailsScreen";
import { UserEmergencyContactsScreen } from "../../screens/user/UserEmergencyContactsScreen";
import { UserCreateEmergencyContactScreen } from "../../screens/user/UserCreateEmergencyContactScreen";
import { appStackScreenOptions } from "../ui/AppStackShell";

const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
    <Stack.Screen
      name="UserActiveEmergency"
      component={UserActiveEmergencyScreen}
      options={{ title: "Active SOS" }}
    />
    <Stack.Screen
      name="UserEmergencyDetails"
      component={UserEmergencyDetailsScreen}
      options={{ title: "Emergency Details" }}
    />
    <Stack.Screen
      name="UserEmergencyContacts"
      component={UserEmergencyContactsScreen}
      options={{ title: "Emergency Contacts" }}
    />
    <Stack.Screen
      name="UserCreateEmergencyContact"
      component={UserCreateEmergencyContactScreen}
      options={{ title: "Add Contact" }}
    />
  </Stack.Navigator>
);
