import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CommonStackParamList } from "../types";
import { ForbiddenScreen } from "../../screens/common/ForbiddenScreen";
import { ProfileScreen } from "../../screens/common/ProfileScreen";
import { NetworkOfflineScreen } from "../../screens/system/NetworkOfflineScreen";
import { TermsScreen } from "../../screens/common/TermsScreen";
import { PrivacyScreen } from "../../screens/common/PrivacyScreen";
import { MyOrganizationsScreen } from "../../screens/common/MyOrganizationsScreen";
import { RequestNewOrganizationScreen } from "../../screens/common/CreateOrganizationScreen";
import { OrganizationRequestSubmittedScreen } from "../../screens/common/OrganizationRequestSubmittedScreen";
import { OrganizationVenuesScreen } from "../../screens/common/OrganizationVenuesScreen";
import { CreateVenueScreen } from "../../screens/common/CreateVenueScreen";
import { appStackScreenOptions } from "../ui/AppStackShell";
import { ru } from "../../locale/ru";

const Stack = createNativeStackNavigator<CommonStackParamList>();

export const CommonStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: ru.nav.profile }} />
    <Stack.Screen
      name="NetworkOffline"
      component={NetworkOfflineScreen}
      options={{ title: ru.nav.offline }}
    />
    <Stack.Screen name="Forbidden" component={ForbiddenScreen} options={{ title: ru.nav.accessDenied }} />
    <Stack.Screen name="Terms" component={TermsScreen} options={{ title: ru.nav.terms }} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: ru.nav.privacy }} />
    <Stack.Screen
      name="MyOrganizations"
      component={MyOrganizationsScreen}
      options={{ title: ru.nav.myOrganizations }}
    />
    <Stack.Screen
      name="RequestNewOrganization"
      component={RequestNewOrganizationScreen}
      options={{ title: ru.nav.requestOrg }}
    />
    <Stack.Screen
      name="OrganizationRequestSubmitted"
      component={OrganizationRequestSubmittedScreen}
      options={{ title: ru.nav.requestSubmitted }}
    />
    <Stack.Screen
      name="OrganizationVenues"
      component={OrganizationVenuesScreen}
      options={({ route }) => ({ title: route.params.organizationName })}
    />
    <Stack.Screen
      name="CreateVenue"
      component={CreateVenueScreen}
      options={{ title: ru.nav.addVenue }}
    />
  </Stack.Navigator>
);
