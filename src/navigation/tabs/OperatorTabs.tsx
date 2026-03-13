import React from "react";
import { Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { OperatorTabParamList } from "../types";
import { OperatorDashboardScreen } from "../../screens/operator/OperatorDashboardScreen";
import { OperatorHistoryScreen } from "../../screens/operator/OperatorHistoryScreen";
import { useAppTheme } from "../../theme";

const Tab = createBottomTabNavigator<OperatorTabParamList>();

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export const OperatorTabs = () => {
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
        name="Dashboard"
        component={OperatorDashboardScreen}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: () => <TabIcon emoji="🗺️" />,
          tabBarAccessibilityLabel: "Dashboard map",
        }}
      />
      <Tab.Screen
        name="History"
        component={OperatorHistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: () => <TabIcon emoji="📋" />,
          tabBarAccessibilityLabel: "Operator history",
        }}
      />
    </Tab.Navigator>
  );
};
