import React from "react";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AdminStackParamList, AdminTabParamList, RootStackParamList } from "../../navigation/types";
import { ActionButton } from "../../components/ui/ActionButton";
import { AppCard } from "../../components/ui/AppCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, "Home">,
  NativeStackScreenProps<AdminStackParamList>
>;

export const AdminHomeScreen = ({ navigation }: Props) => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tokens } = useAppTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Admin Panel</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            Manage operator access and system settings.
          </Text>
        </View>

        {/* Quick actions */}
        <AppCard>
          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            OPERATOR MANAGEMENT
          </Text>
          <Text style={[styles.cardBody, { color: tokens.colors.onSurfaceMuted }]}>
            Create operator accounts and manage emergency responder access to the platform.
          </Text>
          <ActionButton
            label="Create Operator"
            onPress={() => navigation.navigate("AdminCreateOperator")}
            style={styles.cardAction}
            accessibilityLabel="Create new operator account"
          />
        </AppCard>

        <View style={styles.spacer} />

        <ActionButton
          variant="ghost"
          label="Profile & Logout"
          onPress={() => rootNavigation.navigate("Common", { screen: "Profile" })}
          accessibilityLabel="Open profile and logout"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 16 },
  header: { gap: 4 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardBody: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  cardAction: {},
  spacer: { flex: 1 },
});
