import React from "react";
import { Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AdminTabParamList } from "../types";
import { AdminHomeScreen } from "../../screens/admin/AdminHomeScreen";
import { useAppTheme } from "../../theme";

const Tab = createBottomTabNavigator<AdminTabParamList>();

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export const AdminTabs = () => {
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
        component={AdminHomeScreen}
        options={{
          tabBarLabel: "Admin",
          tabBarIcon: () => <TabIcon emoji="⚙️" />,
          tabBarAccessibilityLabel: "Admin home",
        }}
      />
    </Tab.Navigator>
  );
};
