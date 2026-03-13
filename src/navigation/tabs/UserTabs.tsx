import React from "react";
import { Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { UserTabParamList } from "../types";
import { UserHomeScreen } from "../../screens/user/UserHomeScreen";
import { UserEmergencyHistoryScreen } from "../../screens/user/UserEmergencyHistoryScreen";
import { UserSafetyScreen } from "../../screens/user/UserSafetyScreen";
import { useAppTheme } from "../../theme";

const Tab = createBottomTabNavigator<UserTabParamList>();

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export const UserTabs = () => {
  const { tokens } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.primary,
        tabBarInactiveTintColor: tokens.colors.onSurfaceMuted,
        tabBarStyle: {
          backgroundColor: tokens.colors.surface,
          borderTopColor: tokens.colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === "ios" ? 4 : 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: () => <TabIcon emoji="🏠" />,
          tabBarAccessibilityLabel: "Home tab",
        }}
      />
      <Tab.Screen
        name="History"
        component={UserEmergencyHistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: () => <TabIcon emoji="📋" />,
          tabBarAccessibilityLabel: "Emergency history",
        }}
      />
      <Tab.Screen
        name="Safety"
        component={UserSafetyScreen}
        options={{
          tabBarLabel: "Safety",
          tabBarIcon: () => <TabIcon emoji="🛡️" />,
          tabBarAccessibilityLabel: "Safety tips",
        }}
      />
    </Tab.Navigator>
  );
};
