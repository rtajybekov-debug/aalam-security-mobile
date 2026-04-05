import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { UserStackParamList } from "../types";
import { UserTabs } from "../tabs/UserTabs";
import { UserActiveEmergencyScreen } from "../../screens/user/UserActiveEmergencyScreen";
import { UserEmergencyDetailsScreen } from "../../screens/user/UserEmergencyDetailsScreen";
import { BindVenueScreen } from "../../screens/user/BindVenueScreen";
import { SetupPinScreen } from "../../screens/user/SetupPinScreen";
import { UserEditDetailsScreen } from "../../screens/user/UserEditDetailsScreen";
import { UserBillingPlansScreen } from "../../screens/user/UserBillingPlansScreen";
import { UserBillingAddonsScreen } from "../../screens/user/UserBillingAddonsScreen";
import { UserOrganizationScreen } from "../../screens/user/UserOrganizationScreen";
import { appStackScreenOptions } from "../ui/AppStackShell";

const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
    <Stack.Screen
      name="UserActiveEmergency"
      component={UserActiveEmergencyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UserEmergencyDetails"
      component={UserEmergencyDetailsScreen}
      options={{ title: "Emergency Details" }}
    />
    <Stack.Screen
      name="UserOrganization"
      component={UserOrganizationScreen}
      options={{ title: "Organization" }}
    />
    <Stack.Screen
      name="UserBindVenue"
      component={BindVenueScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UserSetupPin"
      component={SetupPinScreen}
      options={{ title: "Enable 2FA" }}
    />
    <Stack.Screen
      name="UserEditDetails"
      component={UserEditDetailsScreen}
    />
    <Stack.Screen
      name="UserBillingPlans"
      component={UserBillingPlansScreen}
      options={{ title: "Billing" }}
    />
    <Stack.Screen
      name="UserBillingAddons"
      component={UserBillingAddonsScreen}
      options={{ title: "Billing Add-ons" }}
    />
  </Stack.Navigator>
);
