import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { UserStackParamList } from "../types";
import { UserTabs } from "../tabs/UserTabs";
import { UserActiveEmergencyScreen } from "../../screens/user/UserActiveEmergencyScreen";
import { UserEmergencyDetailsScreen } from "../../screens/user/UserEmergencyDetailsScreen";
import { BindVenueScreen } from "../../screens/user/BindVenueScreen";
import { UserEditDetailsScreen } from "../../screens/user/UserEditDetailsScreen";
import { UserBillingPlansScreen } from "../../screens/user/UserBillingPlansScreen";
import { UserBillingAddonsScreen } from "../../screens/user/UserBillingAddonsScreen";
import { UserOrganizationScreen } from "../../screens/user/UserOrganizationScreen";
import { appStackScreenOptions } from "../ui/AppStackShell";
import { ru } from "../../locale/ru";

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
      options={{ title: ru.nav.emergencyDetails }}
    />
    <Stack.Screen
      name="UserOrganization"
      component={UserOrganizationScreen}
      options={{ title: ru.nav.organization }}
    />
    <Stack.Screen
      name="UserBindVenue"
      component={BindVenueScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UserEditDetails"
      component={UserEditDetailsScreen}
      options={{ title: ru.editDetails.screenTitle }}
    />
    <Stack.Screen
      name="UserBillingPlans"
      component={UserBillingPlansScreen}
      options={{ title: ru.nav.billing }}
    />
    <Stack.Screen
      name="UserBillingAddons"
      component={UserBillingAddonsScreen}
      options={{ title: ru.nav.billingAddons }}
    />
  </Stack.Navigator>
);
