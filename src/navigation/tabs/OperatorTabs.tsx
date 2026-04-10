import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ClipboardList, Map } from "lucide-react-native";
import { OperatorTabParamList } from "../types";
import { OperatorDashboardScreen } from "../../screens/operator/OperatorDashboardScreen";
import { OperatorHistoryScreen } from "../../screens/operator/OperatorHistoryScreen";
import { useAppTheme } from "../../theme";
import { ru } from "../../locale/ru";

const Tab = createBottomTabNavigator<OperatorTabParamList>();

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
          paddingVertical: 6,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OperatorDashboardScreen}
        options={{
          tabBarLabel: ru.operatorTabs.map,
          tabBarIcon: ({ color, size }) => (
            <Map size={size ?? 22} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: ru.operatorTabs.mapA11y,
        }}
      />
      <Tab.Screen
        name="History"
        component={OperatorHistoryScreen}
        options={{
          tabBarLabel: ru.operatorTabs.history,
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size ?? 22} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: ru.operatorTabs.historyA11y,
        }}
      />
    </Tab.Navigator>
  );
};
