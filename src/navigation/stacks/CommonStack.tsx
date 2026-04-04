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

const Stack = createNativeStackNavigator<CommonStackParamList>();

export const CommonStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    <Stack.Screen
      name="NetworkOffline"
      component={NetworkOfflineScreen}
      options={{ title: "Offline" }}
    />
    <Stack.Screen name="Forbidden" component={ForbiddenScreen} options={{ title: "Access Denied" }} />
    <Stack.Screen name="Terms" component={TermsScreen} options={{ title: "Terms of Service" }} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: "Privacy Policy" }} />
    <Stack.Screen
      name="MyOrganizations"
      component={MyOrganizationsScreen}
      options={{ title: "My Organizations" }}
    />
    <Stack.Screen
      name="RequestNewOrganization"
      component={RequestNewOrganizationScreen}
      options={{ title: "Request New Organization" }}
    />
    <Stack.Screen
      name="OrganizationRequestSubmitted"
      component={OrganizationRequestSubmittedScreen}
      options={{ title: "Request Submitted" }}
    />
    <Stack.Screen
      name="OrganizationVenues"
      component={OrganizationVenuesScreen}
      options={({ route }) => ({ title: route.params.organizationName })}
    />
    <Stack.Screen
      name="CreateVenue"
      component={CreateVenueScreen}
      options={{ title: "Add Venue" }}
    />
  </Stack.Navigator>
);
