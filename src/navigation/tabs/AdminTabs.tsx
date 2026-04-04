import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Settings } from "lucide-react-native";
import { AdminTabParamList } from "../types";
import { AdminHomeScreen } from "../../screens/admin/AdminHomeScreen";
import { useAppTheme } from "../../theme";

const Tab = createBottomTabNavigator<AdminTabParamList>();

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
          paddingVertical: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={AdminHomeScreen}
        options={{
          tabBarLabel: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size ?? 22} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: "Admin home",
        }}
      />
    </Tab.Navigator>
  );
};
